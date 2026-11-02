import mysql,{type Pool} from 'mysql2/promise';
import type{readConfig} from './config.js';
export type Database=Pool;
export function openPool(cfg:ReturnType<typeof readConfig>):Database{
  return mysql.createPool({
    host:cfg.DB_HOST,port:cfg.DB_PORT,user:cfg.DB_USER,
    password:cfg.DB_PASSWORD,database:cfg.DB_NAME,
    waitForConnections:true,connectionLimit:8,queueLimit:30,
    supportBigNumbers:true,bigNumberStrings:true,timezone:'Z',dateStrings:true
  });
}
