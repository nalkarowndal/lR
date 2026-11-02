import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {summarizeAudit,renderMarkdown} from './audit-lib.mjs';
function read(path,scope){
 let parsed;
 try{parsed=JSON.parse(readFileSync(path,'utf8'))}
 catch{throw new Error('AUDIT_UNAVAILABLE: missing or invalid '+scope+' audit JSON')}
 return summarizeAudit(parsed,scope);
}
try{
 const [productionFile,allFile,outputDir]=process.argv.slice(2);
 if(!productionFile||!allFile||!outputDir)throw new Error('USAGE: production-report all-report output-prefix');
 const reports=[read(productionFile,'production'),read(allFile,'all')];
 const summary=renderMarkdown(reports);
 writeFileSync(outputDir+'.json',JSON.stringify({
  generatedAt:new Date().toISOString(),reports
 },null,2)+'\n');
 writeFileSync(outputDir+'.md',summary);
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
 console.log(reports.map(r=>r.scope+': critical '+r.counts.critical+
  ', high '+r.counts.high+', moderate '+r.counts.moderate+
  ', low '+r.counts.low+'; '+r.releaseDecision).join('\n'));
 // The report job is *inventory only*. Release is BLOCKED until findings are explicitly triaged.
}catch(error){
 console.error(error instanceof Error?error.message:'AUDIT_UNAVAILABLE');
 process.exitCode=2;
}
