import {readConfig} from './config.js';
import {openPool} from './db.js';
import {createApp} from './app.js';
const config=readConfig();
const db=openPool(config);
const app=createApp(db,{demoMode:config.APP_MODE==='demo'});
const server=app.listen(config.API_PORT,config.API_HOST,()=>{
  console.log('luxuryRental API listening at http://'+config.API_HOST+':'+config.API_PORT+' ('+config.APP_MODE+')');
});
const shutdown=async()=>{
  server.close(async()=>{await db.end();process.exit(0);});
};
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
