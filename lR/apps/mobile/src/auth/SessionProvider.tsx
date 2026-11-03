import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {apiBaseUrl} from '../api/client';
import {createAdminDemoOrdersClient,type DemoAdminOrder,type DemoAdminDetail} from './admin-demo-orders';
import {createExperienceOrdersClient,type ExperienceOrder,type ExperienceOrderInput} from './experience-orders';
import {createDemoAuthClient,AuthError,sessionIsCurrent,type Identity,type TokenSession} from './api';
import {readNativeSession,writeNativeSession,clearNativeSession} from './token-storage';
import {createSavedCollectionsClient,type SavedList} from './saved-collections';
import {createStoreOrdersClient,type StoreOrder,type StoreOrderInput} from './store-orders';

type Status='restoring'|'guest'|'signed-in';
interface Context{
 status:Status;busy:boolean;identity:Identity|null;error:string|null;
 login:(email:string,password:string)=>Promise<void>;
 register:(email:string,password:string)=>Promise<void>;
 logout:()=>Promise<void>;
 refresh:()=>Promise<void>;
 listAdminDemoOrders:()=>Promise<DemoAdminOrder[]>;
 getAdminDemoOrder:(id:string)=>Promise<DemoAdminDetail>;
 createExperienceOrder:(input:ExperienceOrderInput,key:string)=>Promise<ExperienceOrder>;
 listExperienceOrders:()=>Promise<ExperienceOrder[]>;
 getExperienceOrder:(id:string)=>Promise<ExperienceOrder>;
 listAdminExperienceOrders:()=>Promise<ExperienceOrder[]>;
 listSaved:(kind:SavedList)=>Promise<string[]>;
 addSaved:(kind:SavedList,id:string)=>Promise<string[]>;
 removeSaved:(kind:SavedList,id:string)=>Promise<void>;
 createStoreOrder:(input:StoreOrderInput,key:string)=>Promise<StoreOrder>;
 listStoreOrders:()=>Promise<StoreOrder[]>;
 getStoreOrder:(id:string)=>Promise<StoreOrder>;
 listAdminStoreOrders:()=>Promise<StoreOrder[]>;
}
const Ctx=createContext<Context|null>(null);
const client=()=>{
 const base=apiBaseUrl();
 if(!base)throw new AuthError('테스트 API 주소가 없습니다');
 return createDemoAuthClient(base);
};
export function SessionProvider({children}:{children:React.ReactNode}){
 const [status,setStatus]=useState<Status>('restoring');
 const [busy,setBusy]=useState(false);
 const [identity,setIdentity]=useState<Identity|null>(null);
 const [error,setError]=useState<string|null>(null);
 const saved=useRef<TokenSession|null>(null);
 const drop=useCallback(async()=>{
  saved.current=null;setIdentity(null);setStatus('guest');
  await clearNativeSession();
 },[]);
 useEffect(()=>{
  let live=true;
  const restore=async()=>{
   try{
    const stored=await readNativeSession();
    if(!live)return;
    if(stored&&sessionIsCurrent(stored)&&apiBaseUrl()){
     // Server authority: a stored token is NOT sufficient to mark login successful.
     const serverIdentity=await client().me(stored.accessToken);
     if(!live)return;
     saved.current=stored;
     setIdentity(serverIdentity);setStatus('signed-in');
    }else{
     if(stored)await clearNativeSession();
     if(live)setStatus('guest');
    }
   }catch{
    try{await clearNativeSession();}catch{/* no privilege granted if deletion fails */}
    if(live){saved.current=null;setIdentity(null);setStatus('guest');}
   }
  };
  void restore();
  return()=>{live=false};
 },[]);
 const withAction=useCallback(async(action:()=>Promise<void>)=>{
  setBusy(true);setError(null);
  try{await action();}catch(e){
   const message=e instanceof Error?e.message:'계정 요청이 실패했습니다';
   setError(message);throw e;
  }finally{setBusy(false);}
 },[]);
 const login=useCallback(async(email:string,password:string)=>withAction(async()=>{
  const next=await client().login(email,password);
  const verified=await client().me(next.accessToken);
  if(verified.userId!==next.userId)throw new AuthError('세션 사용자 검증 결과가 일치하지 않습니다');
  const token={accessToken:next.accessToken,expiresAt:next.expiresAt};
  // Only native SecureStore persists. Web stores token in this provider's memory.
  await writeNativeSession(token);
  saved.current=token;
  setIdentity(verified);setStatus('signed-in');
 }),[withAction]);
 const register=useCallback(async(email:string,password:string)=>withAction(async()=>{
  await client().register(email,password);
  // Creating a test account does not grant authentication.
  setIdentity(null);setStatus('guest');
 }),[withAction]);
 const logout=useCallback(async()=>withAction(async()=>{
  const token=saved.current?.accessToken;
  // Always clear local access even when network revocation cannot be confirmed.
  let remoteFailed=false;
  if(token){try{await client().logout(token);}catch{remoteFailed=true;}}
  await drop();
  if(remoteFailed)throw new AuthError('로컬 로그아웃은 완료했지만 서버 세션 해제는 확인하지 못했습니다. 데모 서버에서 만료까지 유효할 수 있습니다');
 }),[withAction,drop]);
 const refresh=useCallback(async()=>withAction(async()=>{
  const current=saved.current;
  if(!sessionIsCurrent(current)) {await drop();throw new AuthError('세션이 만료되었습니다. 다시 로그인해 주세요');}
  try{
   const rotated=await client().refresh(current!.accessToken);
   const who=await client().me(rotated.accessToken);
   if(who.userId!==identity?.userId)throw new AuthError('세션 사용자 확인 실패');
   await writeNativeSession(rotated);
   saved.current=rotated;setIdentity(who);setStatus('signed-in');
  }catch(e){await drop();throw e;}
 }),[withAction,drop,identity?.userId]);
 const adminToken=useCallback(()=>{
  const current=saved.current;
  if(status!=='signed-in'||!identity?.roles.includes('ADMIN')||!sessionIsCurrent(current))
   throw new AuthError('관리자 테스트 세션이 필요합니다',403,'FORBIDDEN');
  return current!.accessToken;
 },[status,identity]);
 const listAdminDemoOrders=useCallback(async()=>{
  const token=adminToken(),base=apiBaseUrl();
  if(!base)throw new AuthError('테스트 API 주소가 설정되지 않았습니다');
  return createAdminDemoOrdersClient(base).list(token);
 },[adminToken]);
 const getAdminDemoOrder=useCallback(async(id:string)=>{
  const token=adminToken(),base=apiBaseUrl();
  if(!base)throw new AuthError('테스트 API 주소가 설정되지 않았습니다');
  return createAdminDemoOrdersClient(base).detail(token,id);
 },[adminToken]);
 const experienceToken=useCallback(()=>{
  const current=saved.current;
  if(status!=='signed-in'||!identity||!sessionIsCurrent(current))
   throw new AuthError('주문 접수를 위해 테스트 계정 로그인이 필요합니다',401,'UNAUTHENTICATED');
  return current!.accessToken;
 },[status,identity]);
 const experienceClient=()=>{
  const base=apiBaseUrl();
  if(!base)throw new AuthError('주문 접수 API가 설정되지 않았습니다');
  return createExperienceOrdersClient(base);
 };
 const createExperienceOrder=useCallback(async(input:ExperienceOrderInput,key:string)=>
  experienceClient().create(experienceToken(),key,input),[experienceToken]);
 const listExperienceOrders=useCallback(async()=>experienceClient().list(experienceToken()),[experienceToken]);
 const getExperienceOrder=useCallback(async(id:string)=>
  experienceClient().detail(experienceToken(),id),[experienceToken]);
 const listAdminExperienceOrders=useCallback(async()=>experienceClient().adminList(adminToken()),[adminToken]);
 const savedClient=()=>{
  const base=apiBaseUrl();
  if(!base)throw new AuthError('저장 목록 테스트 API가 설정되지 않았습니다');
  return createSavedCollectionsClient(base);
 };
 const listSaved=useCallback(async(kind:SavedList)=>savedClient().list(experienceToken(),kind),[experienceToken]);
 const addSaved=useCallback(async(kind:SavedList,id:string)=>savedClient().add(experienceToken(),kind,id),[experienceToken]);
 const removeSaved=useCallback(async(kind:SavedList,id:string)=>{
  await savedClient().remove(experienceToken(),kind,id);
 },[experienceToken]);
 const storeClient=()=>{
  const base=apiBaseUrl();
  if(!base)throw new AuthError('테스트 스토어 주문 API가 설정되지 않았습니다');
  return createStoreOrdersClient(base);
 };
 const createStoreOrder=useCallback(async(input:StoreOrderInput,key:string)=>
  storeClient().create(experienceToken(),key,input),[experienceToken]);
 const listStoreOrders=useCallback(async()=>storeClient().list(experienceToken()),[experienceToken]);
 const getStoreOrder=useCallback(async(id:string)=>storeClient().detail(experienceToken(),id),[experienceToken]);
 const listAdminStoreOrders=useCallback(async()=>storeClient().adminList(adminToken()),[adminToken]);
 const value=useMemo<Context>(()=>({status,busy,identity,error,login,register,logout,refresh,
  listAdminDemoOrders,getAdminDemoOrder,createExperienceOrder,listExperienceOrders,getExperienceOrder,listAdminExperienceOrders,
  listSaved,addSaved,removeSaved,createStoreOrder,listStoreOrders,getStoreOrder,listAdminStoreOrders}),
  [status,busy,identity,error,login,register,logout,refresh,listAdminDemoOrders,getAdminDemoOrder,
   createExperienceOrder,listExperienceOrders,getExperienceOrder,listAdminExperienceOrders,listSaved,addSaved,removeSaved,createStoreOrder,listStoreOrders,getStoreOrder,listAdminStoreOrders]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useDemoSession(){const c=useContext(Ctx);if(!c)throw new Error('SessionProvider missing');return c;}
