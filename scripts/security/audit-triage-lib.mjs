import { summarizeAudit } from './audit-lib.mjs';

// Evidence-only dependency triage; no assumption of app runtime reachability.
const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const validName = v => typeof v === 'string' && /^(?:@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/.test(v);
const safeRange = v => typeof v === 'string' && /^[a-zA-Z0-9 .^~<>|=*+-]{1,100}$/.test(v) ? v.replaceAll('|', '/') : 'review';
const safeVersion = v => typeof v === 'string' && /^[0-9a-zA-Z.+_-]{1,80}$/.test(v) ? v : 'unknown';
function packageAt(path) {
  const at = path.lastIndexOf('node_modules/');
  const name = at < 0 ? null : path.slice(at + 'node_modules/'.length);
  return validName(name) ? name : null;
}
function ghsa(value) {
  if (typeof value !== 'string') return null;
  const matched = value.match(/(?:^|\/)(GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})(?:$|[?#])/i);
  return matched ? matched[1].toUpperCase() : null;
}
export function analyzeAdvisories(lock, audit, scope = 'production') {
  if (!isRecord(lock) || lock.lockfileVersion !== 3 || !isRecord(lock.packages))
    throw new Error('TRIAGE_INVALID_LOCKFILE');
  const summary = summarizeAudit(audit, scope);
  const packages = [];
  for (const [name, item] of Object.entries(audit.vulnerabilities)) {
    if (!validName(name)) continue;
    const installed = [], declaredBy = [];
    for (const [path, meta] of Object.entries(lock.packages)) {
      if (!isRecord(meta)) continue;
      if (packageAt(path) === name)
        installed.push({path, version: safeVersion(meta.version)});
      for (const kind of ['dependencies', 'optionalDependencies']) {
        if (isRecord(meta[kind]) && Object.hasOwn(meta[kind], name)) {
          const parent = path === '' ? '(root)' :
            (packageAt(path) || (validName(meta.name) ? meta.name : '(workspace)'));
          declaredBy.push({parent, version: safeVersion(meta.version),
            requested: safeRange(meta[kind][name]), kind});
        }
      }
    }
    const via = Array.isArray(item.via) ? item.via : [];
    const ids = [...new Set(via.filter(isRecord).map(v => ghsa(v.url) || ghsa(v.name)).filter(Boolean))].sort();
    const viaPackages = [...new Set(via.filter(v => typeof v === 'string' && validName(v)))].sort();
    installed.sort((a,b) => a.path.localeCompare(b.path));
    declaredBy.sort((a,b) => a.parent.localeCompare(b.parent) || a.requested.localeCompare(b.requested));
    packages.push({name,severity:item.severity,affectedRange:safeRange(item.range),
      installed, declaredBy, advisoryIds:ids,viaPackages,
      fixAvailable:item.fixAvailable === true ? 'yes' : item.fixAvailable === false ? 'no' : 'review',
      runtimeExposure:'NOT_ESTABLISHED'});
  }
  packages.sort((a,b) => a.name.localeCompare(b.name));
  return {scope,counts:summary.counts,lockfileVersion:3,releaseApproved:false,packages};
}
export function renderTriageMarkdown(results) {
  const lines=['# M6-1B dependency triage','','Evidence-only npm audit and lockfile inventory. Not runtime exploitability proof or release approval.',
    'npm audit --omit=dev can include build tools; installed is not equivalent to user-reachable.',''];
  for (const r of results) {
    lines.push('## '+r.scope,'','Critical '+r.counts.critical+', high '+r.counts.high+
      ', moderate '+r.counts.moderate+', low '+r.counts.low+'.','');
    for (const p of r.packages) {
      lines.push('### '+p.name+' ('+p.severity+')');
      lines.push('- Installed: '+(p.installed.length ? p.installed.map(v=>v.version+' at '+v.path).join('; ') : 'NOT FOUND IN LOCKFILE - investigate'));
      lines.push('- Advisory IDs: '+(p.advisoryIds.length ? p.advisoryIds.join(', ') : 'none directly reported; inspect via chain'));
      lines.push('- Via packages: '+(p.viaPackages.length ? p.viaPackages.join(', ') : 'none'));
      lines.push('- Declared by (not resolved runtime proof): '+
        (p.declaredBy.length ? p.declaredBy.map(v=>v.parent+'@'+v.version+' requires '+v.requested).join('; ') : 'none'));
      lines.push('- npm fix available: '+p.fixAvailable+'; Runtime exposure: NOT ESTABLISHED.','');
    }
  }
  lines.push('Release remains blocked pending advisory mitigation, compatibility and native QA, and business approval.','');
  return lines.join('\n');
}
