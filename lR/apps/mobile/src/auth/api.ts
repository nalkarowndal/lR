/** Demo-only authentication transport. Do not use with production accounts. */
export type AuthRole='CUSTOMER'|'ADMIN';
export interface Identity{userId:string;email:string;roles:AuthRole[]}
export interface TokenSession{accessToken:string;expiresAt:string}
export interface AuthLoginResult extends TokenSession{userId:string;email:string;tokenType:'Bearer';demo:true}
export interface AuthRequestError extends Error{status?:number;code?:string}
export type HttpFetch=(url:string,init?:RequestInit)=>Promise<Response>;

export class AuthError extends Error{
 readonly status?:number;readonly code?:string;
 constructor(message:string,status?:number,code?:string){super(message);this.name='AuthError';this.status=status;this.code=code;}
}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const string=(v:unknown,key:string)=>{if(typeof v!=='string'||!v.trim())throw new AuthError('서버 인증 응답 오류: '+key);return v;};
export function requireSecureDemoBaseUrl(raw:string):string{
 let url:URL;
 try{url=new URL(raw);}catch{throw new AuthError('API 주소가 잘못되었습니다');}
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||
 !['https:','http:'].includes(url.protocol))throw new AuthError('안전하지 않은 API 주소입니다');
 // Native device HTTP over LAN would leak demo passwords and bearer tokens.
 if(url.protocol!=='https:'&&!(url.hostname==='localhost'||url.hostname==='127.0.0.1'))
  throw new AuthError('로그인은 HTTPS 또는 동일 기기 localhost 테스트 서버에서만 가능합니다');
 return url.origin;
}
export function sessionIsCurrent(value:TokenSession|null,now=Date.now()):boolean{
 if(!value||!/^[-_A-Za-z0-9]{40,128}$/.test(value.accessToken))return false;
 const t=Date.parse(value.expiresAt);
 return Number.isFinite(t)&&t>now+5_000;
}
export function parseLogin(raw:unknown):AuthLoginResult{
 if(!object(raw)||!object(raw.data))throw new AuthError('로그인 응답이 올바르지 않습니다');
 const d=raw.data;
 if(d.demo!==true||d.tokenType!=='Bearer')throw new AuthError('테스트용 세션이 아닙니다');
 const result:AuthLoginResult={userId:string(d.userId,'userId'),email:string(d.email,'email'),
  accessToken:string(d.accessToken,'accessToken'),expiresAt:string(d.expiresAt,'expiresAt'),
  tokenType:'Bearer',demo:true};
 if(!sessionIsCurrent(result))throw new AuthError('이미 만료된 로그인 세션입니다',401,'UNAUTHENTICATED');
 return result;
}
export function parseIdentity(raw:unknown):Identity{
 if(!object(raw)||!object(raw.data))throw new AuthError('프로필 응답이 올바르지 않습니다');
 const d=raw.data;
 if(!Array.isArray(d.roles)||!d.roles.every(x=>x==='ADMIN'||x==='CUSTOMER'))throw new AuthError('권한 응답이 올바르지 않습니다');
 return {userId:string(d.userId,'userId'),email:string(d.email,'email'),roles:d.roles};
}
export function parseRefresh(raw:unknown):TokenSession{
 if(!object(raw)||!object(raw.data)||raw.data.demo!==true||
 typeof raw.data.accessToken!=='string'||typeof raw.data.expiresAt!=='string')throw new AuthError('갱신 응답이 올바르지 않습니다');
 const result={accessToken:raw.data.accessToken,expiresAt:raw.data.expiresAt};
 if(!sessionIsCurrent(result))throw new AuthError('갱신된 토큰이 만료됐습니다',401,'UNAUTHENTICATED');
 return result;
}
export function createDemoAuthClient(base:string,fetcher:HttpFetch=fetch){
 const origin=requireSecureDemoBaseUrl(base);
 const request=async(path:string,{method='GET',payload,token}:{method?:string;payload?:unknown;token?:string}={})=>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10_000);
  try{
   let response:Response;
   try{response=await fetcher(origin+path,{
    method,headers:{'Accept':'application/json',...(payload?{'Content-Type':'application/json'}:{}),
      ...(token?{'Authorization':'Bearer '+token}:{})},
    body:payload?JSON.stringify(payload):undefined,signal:controller.signal,cache:'no-store'
   });}catch{throw new AuthError('인증 서버에 연결하지 못했습니다. 네트워크를 확인해 주세요');}
   if(response.status===204)return null;
   const raw:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const obj=object(raw)?raw:{};
    throw new AuthError(response.status===401?'아이디 또는 세션이 유효하지 않습니다':
      typeof obj.title==='string'?obj.title:'인증 요청이 실패했습니다',
      response.status,typeof obj.code==='string'?obj.code:undefined);
   }
   return raw;
  }finally{clearTimeout(timeout);}
 };
 return {
  register:async(email:string,password:string)=>{
   if(!email.trim()||password.length<12||password.length>128)throw new AuthError('이메일과 12~128자 테스트 비밀번호를 입력해 주세요');
   const data=await request('/api/v1/auth/register',{method:'POST',payload:{email:email.trim(),password}});
   if(!object(data)||!object(data.data)||data.data.demo!==true)throw new AuthError('시연용 가입 확인이 없습니다');
   return {userId:string(data.data.userId,'userId'),email:string(data.data.email,'email')};
  },
  login:async(email:string,password:string)=>parseLogin(await request('/api/v1/auth/login',{method:'POST',payload:{email:email.trim(),password}})),
  me:async(token:string)=>parseIdentity(await request('/api/v1/me',{token})),
  refresh:async(token:string)=>parseRefresh(await request('/api/v1/auth/refresh',{method:'POST',token})),
  logout:async(token:string)=>{await request('/api/v1/auth/logout',{method:'POST',token});}
 };
}
