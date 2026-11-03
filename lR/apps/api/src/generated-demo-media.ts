/** Eight original Adobe Firefly fictional DEMO product visuals, never real inventory evidence.
 * Provenance: lR/docs/M5_2C4D2_AI_IMAGE_PROVENANCE.md.
 * Exact raw GitHub paths are read-only; no arbitrary URL or uploads are accepted.
 */
import type{PublishedMedia} from './media-rights.js';
const base='https://raw.githubusercontent.com/nalkarowndal/lR/main/lR/apps/mobile/assets/catalog/';
const names:Readonly<Record<string,{title:string;front:string;detail:string}>>={
 'demo-bag-01':{title:'The Sera Top Handle',front:'분홍색 가죽 토트백 앞면 사선',detail:'분홍색 가죽 토트백 소재와 잠금장치 확대'},
 'demo-bag-02':{title:'The Lune Shoulder Bag',front:'연하늘색 초승달형 숄더백 정면',detail:'연하늘색 숄더백 가죽과 스트랩 연결부 확대'},
 'demo-bag-03':{title:'The Marais Mini',front:'세이지색 미니 크로스백 앞면',detail:'세이지색 크로스백 플랩과 금속 단추 확대'},
 'demo-bag-04':{title:'The Atelier Bucket',front:'토프색 버킷백 앞면 사선',detail:'토프색 버킷백 입구와 봉제선 확대'}
};
const manifest=new Map<string,PublishedMedia[]>(Object.entries(names).map(([id,details])=>[
 id,(['front','detail'] as const).map(view=>({
  url:base+id+'-'+view+'.jpg',
  alt:'AI 생성 시연 이미지 · '+details[view]+' · 실물 사진 아님'
 }))
]));
export function generatedDemoMedia(id:string,demo:boolean):PublishedMedia[]{
 if(!demo||process.env.NODE_ENV!=='test'||process.env.DB_NAME!=='lr_test')return [];
 return [...(manifest.get(id)||[])];
}
export const generatedDemoAssetCount=(id:string)=>manifest.get(id)?.length??0;
