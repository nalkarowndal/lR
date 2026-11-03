/** Original AI-generated fictional DEMO images from our own repository.
 * Keep in sync with API src/generated-demo-media.ts.
 * These are not photographs of actual goods, and do not establish genuine luxury inventory.
 */
import type{ProductMedia} from './catalog';
const base='https://raw.githubusercontent.com/nalkarowndal/lR/main/lR/apps/mobile/assets/catalog/';
const notes:Readonly<Record<string,{front:string;detail:string}>>={
 'demo-bag-01':{front:'분홍색 가죽 토트백 앞면 사선',detail:'분홍색 가죽 토트백 소재와 잠금장치 확대'},
 'demo-bag-02':{front:'연하늘색 초승달형 숄더백 정면',detail:'연하늘색 숄더백 가죽과 스트랩 연결부 확대'},
 'demo-bag-03':{front:'세이지색 미니 크로스백 앞면',detail:'세이지색 크로스백 플랩과 금속 단추 확대'},
 'demo-bag-04':{front:'토프색 버킷백 앞면 사선',detail:'토프색 버킷백 입구와 봉제선 확대'}
};
const manifest:Readonly<Record<string,ProductMedia[]>>=Object.fromEntries(
 Object.entries(notes).map(([id,n])=>[id,(['front','detail'] as const).map(view=>({
  url:base+id+'-'+view+'.jpg',
  alt:'AI 생성 시연 이미지 · '+n[view]+' · 실물 사진 아님'
 }))])
);
const known=new Set(Object.values(manifest).flat().map(x=>x.url));
export function getGeneratedDemoMedia(id:string):ProductMedia[]{
 return [...(manifest[id]||[])];
}
export function isGeneratedDemoMediaUrl(url:string):boolean{
 return known.has(url);
}
