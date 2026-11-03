/** Approved media only. Rights evidence is reviewed offline; never accept untrusted image uploads here. */
import type{RowDataPacket} from 'mysql2';
import type{Database} from './db.js';
export interface PublishedMedia {url:string;alt:string}
interface MediaRow extends RowDataPacket{
 product_id:string;asset_url:string;alt:string;rights_status:'PENDING'|'APPROVED'|'REVOKED';
 rights_evidence_ref:string|null;rights_reviewed_by:string|null;rights_reviewed_at:string|null;
 sort_order:number;
}
const isolated=()=>process.env.NODE_ENV==='test'&&process.env.DB_NAME==='lr_test';
function hosts(){
 return new Set((process.env.APPROVED_MEDIA_HOSTS||'').split(',')
  .map(x=>x.trim().toLowerCase()).filter(x=>/^[a-z0-9][a-z0-9.-]{1,252}$/.test(x)));
}
function safeApprovedUrl(raw:string,allowed:Set<string>):boolean{
 if(!allowed.size||raw.length>2048)return false;
 try{
  const parsed=new URL(raw);
  // Exact DNS allowlist only; never accept redirects, credentials, ports, tokens, SVG or data URIs.
  return parsed.protocol==='https:'&&allowed.has(parsed.hostname.toLowerCase())&&
   !parsed.username&&!parsed.password&&!parsed.port&&!parsed.search&&!parsed.hash&&
   /\.(?:webp|avif|png|jpe?g)$/i.test(parsed.pathname);
 }catch{return false;}
}
export async function approvedProductMedia(db:Database,ids:string[]):Promise<Map<string,PublishedMedia[]>>{
 const output=new Map<string,PublishedMedia[]>(),allow=hosts();
 if(!isolated()||!allow.size||!ids.length)return output;
 const placeholders=ids.map(()=>'?').join(',');
 const [rows]=await db.execute<MediaRow[]>(`SELECT product_id,asset_url,alt,rights_status,rights_evidence_ref,
  rights_reviewed_by,rights_reviewed_at,sort_order
  FROM lr_demo_product_media WHERE product_id IN (${placeholders})
  AND rights_status='APPROVED' AND rights_evidence_ref IS NOT NULL
  AND rights_reviewed_by IS NOT NULL AND rights_reviewed_at IS NOT NULL
  ORDER BY product_id,sort_order,id`,ids);
 for(const row of rows){
  if(!safeApprovedUrl(row.asset_url,allow)||row.alt.length<2||row.alt.length>160||
   /[<>\u0000-\u001f\u007f]/.test(row.alt))continue;
  const existing=output.get(row.product_id)||[];
  if(existing.length>=8)continue;
  existing.push({url:row.asset_url,alt:row.alt});
  output.set(row.product_id,existing);
 }
 return output;
}
interface RightsReportRow extends RowDataPacket{
 id:string;title:string;registered_count:string|number;rights_approved_count:string|number;
}
export interface MediaRightsReport{
 productId:string;title:string;registeredCount:number;rightsApprovedCount:number;
 displayReady:boolean;reason:string;
}
export async function listMediaRights(db:Database):Promise<MediaRightsReport[]>{
 if(!isolated())throw new Error('TEST_ONLY: lr_test required');
 const [rows]=await db.query<RightsReportRow[]>(`SELECT p.id,p.title,
  COUNT(m.id) AS registered_count,
  SUM(CASE WHEN m.rights_status='APPROVED' AND m.rights_evidence_ref IS NOT NULL
   AND m.rights_reviewed_by IS NOT NULL AND m.rights_reviewed_at IS NOT NULL
   THEN 1 ELSE 0 END) AS rights_approved_count
  FROM lr_products p LEFT JOIN lr_demo_product_media m ON m.product_id=p.id
  WHERE p.is_demo=1 AND p.published=1
  GROUP BY p.id,p.title ORDER BY p.id LIMIT 50`);
 const visible=await approvedProductMedia(db,rows.map(x=>x.id));
 return rows.map(row=>({
  productId:row.id,title:row.title,registeredCount:Number(row.registered_count),
  rightsApprovedCount:Number(row.rights_approved_count),displayReady:(visible.get(row.id)?.length||0)>0,
  reason:(visible.get(row.id)?.length||0)>0?'검수된 데모 미디어 사용 가능':
   '사용권 증빙 및 승인된 이미지 호스트가 확인되지 않아 일러스트를 표시합니다'
 }));
}
