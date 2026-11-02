import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeAdvisories, renderTriageMarkdown} from './audit-triage-lib.mjs';

const lock={lockfileVersion:3,packages:{
  '':{name:'luxuryrental',version:'0.2.0'},
  'apps/mobile':{name:'@luxuryrental/mobile',version:'0.1.0',dependencies:{expo:'~58.0.22'}},
  'node_modules/expo':{version:'58.0.22',dependencies:{'@expo/cli':'58.1.18'}},
  'node_modules/@expo/cli':{version:'58.1.18',dependencies:{glob:'^13.0.0'}},
  'node_modules/glob':{version:'13.0.6',dependencies:{minimatch:'^10.2.2'}},
  'node_modules/minimatch':{version:'10.2.6'},
  'node_modules/demo/node_modules/minimatch':{version:'9.0.0'}
}};
const audit={metadata:{vulnerabilities:{critical:0,high:0,moderate:2,low:0,info:0}},
  vulnerabilities:{
    glob:{severity:'moderate',range:'>=9.0.0 <=14.0.1',fixAvailable:false,
      via:[{url:'https://github.com/advisories/GHSA-3g3m-2fjr-6pw4'}]},
    minimatch:{severity:'moderate',range:'<11.0.1',fixAvailable:false,
      via:['glob',{url:'https://github.com/advisories/GHSA-g3hv-75wg-m249'}]}
  }};
test('reports exact installed versions, parent declarations and advisory IDs without claiming runtime exposure',()=>{
  const result=analyzeAdvisories(lock,audit);
  const glob=result.packages.find(p=>p.name==='glob');
  const mini=result.packages.find(p=>p.name==='minimatch');
  assert.equal(glob.installed[0].version,'13.0.6');
  assert.deepEqual(glob.advisoryIds,['GHSA-3G3M-2FJR-6PW4']);
  assert.ok(glob.declaredBy.some(p=>p.parent==='@expo/cli'&&p.requested==='^13.0.0'));
  assert.deepEqual(mini.installed.map(v=>v.version),['9.0.0','10.2.6']);
  assert.deepEqual(mini.viaPackages,['glob']);
  assert.equal(glob.runtimeExposure,'NOT_ESTABLISHED');
  assert.equal(result.releaseApproved,false);
  assert.match(renderTriageMarkdown([result]),/Release remains blocked/);
});
test('rejects invalid lockfile or unavailable registry result instead of returning zero findings',()=>{
  for(const bad of [null,{}, {lockfileVersion:2,packages:{}}])
    assert.throws(()=>analyzeAdvisories(bad,audit),/TRIAGE_INVALID_LOCKFILE/);
  assert.throws(()=>analyzeAdvisories(lock,{error:{code:'ENOAUDIT'}}),/AUDIT_UNAVAILABLE/);
});
test('refuses free text injection in malicious package names and dependency ranges',()=>{
  const data=structuredClone(audit);
  data.vulnerabilities['bad|name\n# leaked']={severity:'moderate',via:[],fixAvailable:false};
  data.vulnerabilities.glob.range='^13 | malware';
  const result=analyzeAdvisories(lock,data);
  const out=renderTriageMarkdown([result]);
  assert.ok(!out.includes('bad|name'));
  assert.ok(!out.includes('malware'));
  assert.equal(result.packages.find(p=>p.name==='glob').affectedRange,'review');
});
test('missing lock entry is an explicit investigation gap, not a clean result',()=>{
  const data=structuredClone(audit);
  data.vulnerabilities['missing-package']={severity:'moderate',via:['glob'],fixAvailable:false};
  const out=renderTriageMarkdown([analyzeAdvisories(lock,data)]);
  assert.match(out,/NOT FOUND IN LOCKFILE/);
});
