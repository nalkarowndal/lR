import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {inspectSourceMaps, inspectExportDirectory, renderNativeEvidence} from './native-bundle-surface.mjs';

test('passes only when maps contain real entries and none of the tracked Expo build-only dependencies',()=>{
 const result=inspectSourceMaps([{sources:[
  '../../node_modules/react/index.js',
  '../../node_modules/@expo/cli/build/metro-require/require.js',
  '../../src/app/index.tsx',
  '../../src/domain/glob.ts',
  '../../node_modules/my-lib/glob.js'
 ]}]);
 assert.equal(result.blockedPackageHits.length,0);
 assert.equal(result.releaseApproved,false);
 assert.equal(result.mapsInspected,1);
 assert.equal(result.sourceEntriesInspected,5);
 assert.match(renderNativeEvidence(result),/Release approved: \*\*NO\*\*/);
});

test('detects packages from nested npm and Windows paths without leaking arbitrary source paths',()=>{
 const result=inspectSourceMaps([{sources:[
  'file:///app/node_modules/.pnpm/glob@13/node_modules/glob/dist/index.js',
  'C:\\runner\\project\\node_modules\\@expo\\config-plugins\\build\\index.js',
  '/repo/node_modules/@expo/fingerprint/build/foo.js',
  '/repo/node_modules/minimatch/dist/esm/index.js',
  '/repo/node_modules/@expo/cli/build/prebuild.js'
 ]}]);
 assert.deepEqual(result.blockedPackageHits.map(x=>x.name),
   ['@expo/cli','@expo/config-plugins','@expo/fingerprint','glob','minimatch']);
 assert.equal(result.requiresReview,true);
 assert.doesNotMatch(renderNativeEvidence(result),/C:\\runner|file:\/\/\/app/);
});

test('fails closed when source maps are absent, empty or malformed',()=>{
 for(const maps of [[],[{sources:[]}],[{sources:'oops'}],[{}],[{sources:[null]}]])
   assert.throws(()=>inspectSourceMaps(maps),/SOURCE_MAP/);
});

test('real directory scan reads nested .map files, rejects corrupt JSON and empty exports',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lr-native-audit-'));
 try{
  assert.throws(()=>inspectExportDirectory(dir),/NO_NATIVE_SOURCE_MAPS/);
  mkdirSync(join(dir,'bundles'));
  writeFileSync(join(dir,'bundles','ios.js.map'),JSON.stringify({sources:['src/app.tsx']}));
  const got=inspectExportDirectory(dir);
  assert.equal(got.mapsInspected,1);
  writeFileSync(join(dir,'bundles','ios.js.map'),'{broken');
  assert.throws(()=>inspectExportDirectory(dir),/INVALID_NATIVE_SOURCE_MAP/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('handles Metro indexed source maps with embedded sections and refuses unresolved external source-map URLs',()=>{
 const indexed={version:3,sections:[
   {offset:{line:0,column:0},map:{version:3,sources:['src/app.tsx']}},
   {offset:{line:10,column:0},map:{version:3,sections:[
     {offset:{line:0,column:0},map:{version:3,sources:[
       'node_modules/@expo/cli/build/metro-require/require.js',
       'node_modules/glob/dist/index.js'
     ]}}
   ]}}
 ]};
 const result=inspectSourceMaps([indexed]);
 assert.equal(result.mapsInspected,1);
 assert.equal(result.sourceEntriesInspected,3);
 assert.deepEqual(result.blockedPackageHits.map(x=>x.name),['glob']);
 assert.throws(()=>inspectSourceMaps([{sections:[{url:'https://example.com/missing.map'}]}]),
   /INVALID_NATIVE_SOURCE_MAP/);
});

test('separately identifies Android production JavaScript export instead of silently reporting iOS',()=>{
 const map={sources:['/repo/node_modules/react/index.js','/repo/src/app/index.tsx']};
 const result=inspectSourceMaps([map],'android');
 assert.equal(result.target,'android-production-js-export');
 assert.match(renderNativeEvidence(result),/Android JavaScript bundle/);
 assert.equal(result.releaseApproved,false);
});

test('rejects unrecognized platform rather than manufacturing a clean report',()=>{
 assert.throws(()=>inspectSourceMaps([{sources:['src/app.tsx']}],'windows'),/INVALID_PLATFORM/);
 assert.throws(()=>inspectSourceMaps([{sources:['src/app.tsx']}],null),/INVALID_PLATFORM/);
});

test('directory scanner retains explicit platform context for android source-map output',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lr-android-audit-'));
 try {
  writeFileSync(join(dir,'android.entry.js.map'),JSON.stringify({version:3,sources:['node_modules/glob/index.js']}));
  const result=inspectExportDirectory(dir,'android');
  assert.equal(result.target,'android-production-js-export');
  assert.deepEqual(result.blockedPackageHits.map(x=>x.name),['glob']);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
