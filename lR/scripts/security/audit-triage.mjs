import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {analyzeAdvisories,renderTriageMarkdown} from './audit-triage-lib.mjs';
try {
  const [lockfile,production,all,prefix]=process.argv.slice(2);
  if(!lockfile||!production||!all||!prefix)
    throw new Error('USAGE: lockfile production.raw.json all.raw.json output-prefix');
  const read=path=>JSON.parse(readFileSync(path,'utf8'));
  const lock=read(lockfile);
  const results=[
    analyzeAdvisories(lock,read(production),'production'),
    analyzeAdvisories(lock,read(all),'all')
  ];
  const markdown=renderTriageMarkdown(results);
  writeFileSync(prefix+'.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2)+'\n');
  writeFileSync(prefix+'.md',markdown);
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
  console.log('M6-1B triage evidence created. Production findings: '+results[0].packages.length+
    '; all: '+results[1].packages.length+'; releaseApproved=false');
}catch(error){
  console.error(error instanceof Error?error.message:'TRIAGE_UNAVAILABLE');
  process.exitCode=2;
}
