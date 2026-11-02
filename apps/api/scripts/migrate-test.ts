import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {openPool} from '../src/db.js';
import {readConfig} from '../src/config.js';
const config=readConfig();
if(config.DB_NAME!=='lr_test'||config.NODE_ENV==='production'){
 throw new Error('Refusing migration outside dedicated lr_test DB');
}
const pool=openPool(config);
try{
 const sql=await readFile(fileURLToPath(new URL('../sql/001_test_schema.sql',import.meta.url)),'utf8');
 const statements=sql.split(';').map(s=>s.trim()).filter(Boolean);
 for(const statement of statements)await pool.query(statement);
 console.log('Installed '+statements.length+' additive test-schema statements in lr_test');
}finally{await pool.end();}
