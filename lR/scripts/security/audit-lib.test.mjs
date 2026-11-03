import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeAudit,renderMarkdown} from './audit-lib.mjs';
const counts=(critical=0,high=0,moderate=0,low=0)=>({critical,high,moderate,low,info:0,total:critical+high+moderate+low});
const report=(vulns={},summary=counts())=>({metadata:{vulnerabilities:summary},vulnerabilities:vulns});
test('clean audit inventory reports no high/critical but never asserts release approved',()=>{
 const x=summarizeAudit(report(),'production');
 assert.equal(x.highOrCritical,0);
 assert.equal(x.releaseDecision,'NO_HIGH_CRITICAL_REPORTED');
 assert.match(renderMarkdown([x]),/not a complete security approval/);
});
test('production high and critical are release-blocking even though report itself is inventory',()=>{
 const x=summarizeAudit(report({'fake-package':{severity:'high',isDirect:false,fixAvailable:true},
 '@demo/critical':{severity:'critical',isDirect:true,fixAvailable:false}},counts(1,1)),'production');
 assert.equal(x.highOrCritical,2);
 assert.equal(x.releaseDecision,'BLOCKED_REVIEW_REQUIRED');
 assert.match(renderMarkdown([x]),/fake-package/);
});
test('registry or parsing errors are never mistaken for zero advisories',()=>{
 for(const input of [{error:{code:'ENOAUDIT'}},{metadata:{}},null,{},[]]){
  assert.throws(()=>summarizeAudit(input,'production'),/AUDIT_UNAVAILABLE/);
 }
 assert.throws(()=>summarizeAudit(report({},counts(-1)),'production'),/AUDIT_INVALID_COUNTS/);
});
test('untrusted package names cannot inject markdown or summaries',()=>{
 const x=summarizeAudit(report({'safe-package':{severity:'low',isDirect:true,fixAvailable:false},
 'malicious|\n# injection':{severity:'high',isDirect:true,fixAvailable:false}},counts(0,1,0,1)),'all');
 const out=renderMarkdown([x]);
 assert.ok(out.includes('safe-package'));
 assert.ok(!out.includes('malicious|'));
 assert.equal(x.releaseDecision,'BLOCKED_REVIEW_REQUIRED');
});
