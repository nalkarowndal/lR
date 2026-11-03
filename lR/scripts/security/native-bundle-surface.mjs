import {readdirSync, readFileSync, writeFileSync, appendFileSync} from 'node:fs';
import {join, basename} from 'node:path';

const RISK_PACKAGES = new Set([
  'glob', 'minimatch', '@expo/cli', '@expo/config', '@expo/config-plugins',
  '@expo/fingerprint', '@expo/metro-config', '@expo/prebuild-config',
  '@expo/inline-modules', '@expo/local-build-cache-provider'
]);

function packageFromSource(source) {
  const parts = source.replaceAll('\\', '/').split('/');
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] !== 'node_modules') continue;
    const first = parts[i + 1];
    const name = first?.startsWith('@') ? first + '/' + (parts[i + 2] || '') : first;
    if (RISK_PACKAGES.has(name)) {
      const rest = parts.slice(i + (first?.startsWith('@') ? 3 : 2)).join('/');
      if (name === '@expo/cli' && rest === 'build/metro-require/require.js')
        return null; // Known Metro module-system runtime file, not CLI build tools.
      return name;
    }
  }
  return null;
}

function sourcesFromMap(map, depth = 0) {
  if (!map || typeof map !== 'object' || depth > 30)
    throw new Error('INVALID_NATIVE_SOURCE_MAP');
  if (Array.isArray(map.sources)) {
    if (map.sources.some(source => typeof source !== 'string'))
      throw new Error('INVALID_NATIVE_SOURCE_MAP');
    return map.sources;
  }
  // Metro SDK 58 produces indexed source maps with embedded sections.
  if (!Array.isArray(map.sections) || map.sections.length === 0)
    throw new Error('INVALID_NATIVE_SOURCE_MAP');
  return map.sections.flatMap(section => {
    if (!section || typeof section !== 'object' || !section.map || section.url)
      throw new Error('INVALID_NATIVE_SOURCE_MAP');
    return sourcesFromMap(section.map, depth + 1);
  });
}

export function inspectSourceMaps(maps, platform = 'ios') {
  if (platform !== 'ios' && platform !== 'android') throw new Error('INVALID_PLATFORM');
  if (!Array.isArray(maps) || maps.length === 0) throw new Error('NO_NATIVE_SOURCE_MAPS');
  const counts = new Map();
  let sourceCount = 0;
  for (const map of maps) {
    const sources=sourcesFromMap(map);
    sourceCount += sources.length;
    for (const source of sources) {
      const name = packageFromSource(source);
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
  if (sourceCount === 0) throw new Error('EMPTY_NATIVE_SOURCE_MAPS');
  const packages = [...counts.entries()].sort(([a],[b])=>a.localeCompare(b))
    .map(([name,sourceEntries])=>({name,sourceEntries}));
  return {
    target:platform+'-production-js-export', mapsInspected:maps.length, sourceEntriesInspected:sourceCount,
    blockedPackageHits:packages, requiresReview:packages.length !== 0,
    releaseApproved:false,
    limitations:'Only the inspected iOS JS source maps are covered; no native binary, OTA, web, input reachability, or actual device security claim.'
  };
}

function findSourceMaps(dir) {
  let found=[];
  for (const entry of readdirSync(dir, {withFileTypes:true})) {
    const path=join(dir,entry.name);
    if (entry.isDirectory()) found=found.concat(findSourceMaps(path));
    else if (entry.isFile() && entry.name.endsWith('.map')) found.push(path);
  }
  return found;
}

export function inspectExportDirectory(directory, platform = 'ios') {
  if (platform !== 'ios' && platform !== 'android') throw new Error('INVALID_PLATFORM');
  const paths=findSourceMaps(directory);
  if (paths.length===0) throw new Error('NO_NATIVE_SOURCE_MAPS');
  const maps=paths.map(path=>{
    const raw=readFileSync(path,'utf8');
    let map;
    try { map=JSON.parse(raw); }
    catch {
      console.error('SOURCEMAP_FORMAT',JSON.stringify({
        file:basename(path), bytes:Buffer.byteLength(raw),
        firstBytesHex:Buffer.from(raw.slice(0,24)).toString('hex')
      }));
      throw new Error('INVALID_NATIVE_SOURCE_MAP');
    }
    try { sourcesFromMap(map); }
    catch {
      console.error('SOURCEMAP_STRUCTURE',JSON.stringify({
        file:basename(path), keys:Object.keys(map).slice(0,20),
        sectionsCount:Array.isArray(map.sections)?map.sections.length:null
      }));
      throw new Error('INVALID_NATIVE_SOURCE_MAP');
    }
    return map;
  });
  return inspectSourceMaps(maps, platform);
}

export function renderNativeEvidence(report) {
  const status=report.requiresReview?'REVIEW_REQUIRED':'NO_RISK_PACKAGES_IN_INSPECTED_MAPS';
  const platform=report.target === 'android-production-js-export' ? 'Android' : 'iOS';
  return '# M6 native '+platform+' JavaScript bundle source-map evidence\n\n'
    + '- Status: '+status+'\n'
    + '- Source maps inspected: '+report.mapsInspected+'\n'
    + '- Source entries: '+report.sourceEntriesInspected+'\n'
    + '- Risk package hits: '+(report.blockedPackageHits.length
        ?report.blockedPackageHits.map(p=>p.name+' ('+p.sourceEntries+')').join(', ') :'none')+'\n'
    + '- Release approved: **NO**\n'
    + '- Limitations: '+report.limitations+'\n';
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  try {
    const [directory,outputPrefix,platform='ios']=process.argv.slice(2);
    if (!directory || !outputPrefix) throw new Error('USAGE: export-directory output-prefix');
    const evidence=inspectExportDirectory(directory,platform);
    const markdown=renderNativeEvidence(evidence);
    writeFileSync(outputPrefix+'.json',JSON.stringify(evidence,null,2)+'\n');
    writeFileSync(outputPrefix+'.md',markdown);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown+'\n');
    console.log('M6 native '+platform+' source-map scan: '+evidence.mapsInspected+' maps, '+
      evidence.sourceEntriesInspected+' source entries, '+evidence.blockedPackageHits.length+' risk package names');
    if(evidence.requiresReview) process.exitCode=2;
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'NATIVE_SURFACE_UNAVAILABLE');
    process.exitCode=2;
  }
}
