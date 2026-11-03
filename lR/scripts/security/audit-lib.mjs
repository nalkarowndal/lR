/**
 * M6-1 npm audit inventory (not a production readiness assertion).
 * The result of a failed advisory request must NEVER be reported as zero vulnerabilities.
 */
const severities=['critical','high','moderate','low','info'];
const isObject=v=>typeof v==='object'&&v!==null&&!Array.isArray(v);
export function summarizeAudit(input,scope){
 if(!isObject(input)||isObject(input.error)||!isObject(input.metadata)||
   !isObject(input.metadata.vulnerabilities)||!isObject(input.vulnerabilities)){
  throw new Error('AUDIT_UNAVAILABLE: npm registry did not return an auditable vulnerability report');
 }
 const counts={};
 for(const level of severities){
  const n=input.metadata.vulnerabilities[level]??0;
  if(!Number.isSafeInteger(n)||n<0)throw new Error('AUDIT_INVALID_COUNTS');
  counts[level]=n;
 }
 const packages=[];
 for(const [name,info] of Object.entries(input.vulnerabilities)){
  if(!isObject(info)||!severities.includes(info.severity))throw new Error('AUDIT_INVALID_VULNERABILITY');
  // Do not display arbitrary free-form advisory text, credentials or local paths.
  if(!/^(?:@[-a-zA-Z0-9_.]+\/)?[-a-zA-Z0-9_.]+$/.test(name))continue;
  packages.push({name,severity:info.severity,isDirect:info.isDirect===true,
   fixAvailable:info.fixAvailable===true?'yes':
    info.fixAvailable===false?'no':'review'});
 }
 packages.sort((a,b)=>severities.indexOf(a.severity)-severities.indexOf(b.severity)
  ||a.name.localeCompare(b.name));
 return {scope,counts,packages,highOrCritical:counts.high+counts.critical,
  auditAvailable:true,releaseDecision:counts.high+counts.critical>0?'BLOCKED_REVIEW_REQUIRED':'NO_HIGH_CRITICAL_REPORTED'};
}
export function renderMarkdown(reports){
 const lines=['## M6-1 npm security advisory inventory',''];
 for(const r of reports){
  lines.push('### '+(r.scope==='production'?'Production dependencies':'All dependencies'));
  lines.push('Critical **'+r.counts.critical+'**, high **'+r.counts.high+
   '**, moderate **'+r.counts.moderate+'**, low **'+r.counts.low+'**.');
  lines.push('Release review: **'+r.releaseDecision+'**. This is an advisory snapshot, not a complete security approval.');
  if(r.packages.length){
   lines.push('| Package | Severity | Direct | Fix |','|---|---|---|---|');
   for(const p of r.packages.slice(0,35))lines.push('| `'+p.name+'` | '+p.severity+
      ' | '+(p.isDirect?'yes':'transitive')+' | '+p.fixAvailable+' |');
  }
  lines.push('');
 }
 lines.push('A clean npm audit does **not** cover application logic, native security, licensing, or unreported advisories.');
 return lines.join('\n')+'\n';
}
