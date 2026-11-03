import React,{createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import type{QuoteResult} from '../api/client';
import {apiEnabled} from '../api/client';
import {useDemoSession} from '../auth/SessionProvider';
import {makeDemoRentalReceipt,type DemoOutcome,type DemoRentalReceipt} from '../domain/demo-rental';
export interface RentalDraft{productId:string;startDate:string;returnDate:string}
type SyncStatus='loading'|'ready'|'error';
interface State{
 favorites:string[];cart:string[];draft:RentalDraft|null;demoRentals:DemoRentalReceipt[];
 savedSyncStatus:SyncStatus;savedSyncError:string|null;retrySavedSync:()=>void;
 toggleFavorite:(id:string)=>void;addToCart:(id:string)=>void;
 removeCart:(id:string)=>void;clearCart:()=>void;
 setDraft:(value:RentalDraft|null)=>void;resetPrivateState:()=>void;
 recordDemoRental:(quote:QuoteResult,title:string,outcome:DemoOutcome)=>string;
}
const StateContext=createContext<State|null>(null);
export function AppStateProvider({children}:{children:React.ReactNode}){
 const session=useDemoSession();
 const [favorites,setFavorites]=useState<string[]>([]);
 const [cart,setCart]=useState<string[]>([]);
 const [draft,setDraft]=useState<RentalDraft|null>(null);
 const [demoRentals,setDemoRentals]=useState<DemoRentalReceipt[]>([]);
 const [savedSyncStatus,setSavedSyncStatus]=useState<SyncStatus>('loading');
 const [savedSyncError,setSavedSyncError]=useState<string|null>(null);
 const [refreshIndex,setRefreshIndex]=useState(0);
 const favoritesRef=useRef<string[]>([]),cartRef=useRef<string[]>([]);
 const generation=useRef(0),queue=useRef<Promise<void>>(Promise.resolve());
 const accountId=session.status==='signed-in'?session.identity?.userId:null;
 const savedOnline=Boolean(accountId&&apiEnabled());
 const updateList=(kind:'wishlist'|'cart',values:string[])=>{
  if(kind==='wishlist'){favoritesRef.current=values;setFavorites(values);}
  else{cartRef.current=values;setCart(values);}
 };
 useEffect(()=>{
  const id=++generation.current;
  // Never retain an account's collections or transient receipts across identities.
  favoritesRef.current=[];cartRef.current=[];
  setFavorites([]);setCart([]);setDraft(null);setDemoRentals([]);
  setSavedSyncError(null);
  if(session.status==='restoring'){setSavedSyncStatus('loading');return;}
  if(!savedOnline){setSavedSyncStatus('ready');return;}
  let live=true;setSavedSyncStatus('loading');
  void Promise.all([session.listSaved('wishlist'),session.listSaved('cart')]).then(([wish,basket])=>{
   if(!live||id!==generation.current)return;
   favoritesRef.current=wish;cartRef.current=basket;
   setFavorites(wish);setCart(basket);setSavedSyncStatus('ready');
  }).catch(e=>{
   if(!live||id!==generation.current)return;
   setSavedSyncError(e instanceof Error?e.message:'저장 목록을 가져오지 못했습니다.');
   setSavedSyncStatus('error');
  });
  return()=>{live=false};
 },[session.status,accountId,savedOnline,session.listSaved,refreshIndex]);
 const remote=(kind:'wishlist'|'cart',id:string,add:boolean)=>{
  const version=generation.current;
  queue.current=queue.current.catch(()=>{}).then(async()=>{
   if(version!==generation.current)return;
   if(add)await session.addSaved(kind,id);
   else await session.removeSaved(kind,id);
  }).catch(async e=>{
   if(version!==generation.current)return;
   setSavedSyncError(e instanceof Error?e.message:'상품 저장에 실패했습니다.');
   setSavedSyncStatus('error');
   try{
    const authoritative=await session.listSaved(kind);
    if(version===generation.current)updateList(kind,authoritative);
   }catch{/* keep an error visible; retry reload restores account data */}
  });
 };
 const mutate=(kind:'wishlist'|'cart',id:string,add:boolean)=>{
  if(savedOnline&&savedSyncStatus!=='ready')return;
  const before=kind==='wishlist'?favoritesRef.current:cartRef.current;
  const after=add?(before.includes(id)?before:[...before,id]):before.filter(x=>x!==id);
  if(after===before||(!add&&after.length===before.length))return;
  updateList(kind,after);
  if(savedOnline)remote(kind,id,add);
 };
 const resetPrivateState=()=>{
  generation.current+=1;favoritesRef.current=[];cartRef.current=[];
  setFavorites([]);setCart([]);setDraft(null);setDemoRentals([]);
 };
 const value=useMemo<State>(()=>({
  favorites,cart,draft,demoRentals,savedSyncStatus,savedSyncError,
  retrySavedSync:()=>setRefreshIndex(n=>n+1),
  setDraft,resetPrivateState,
  toggleFavorite:(id)=>mutate('wishlist',id,!favoritesRef.current.includes(id)),
  addToCart:(id)=>mutate('cart',id,true),
  removeCart:(id)=>mutate('cart',id,false),
  clearCart:()=>{for(const id of cartRef.current.slice())mutate('cart',id,false);},
  recordDemoRental:(quote,title,outcome)=>{
   const reference='DEMO-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
   const receipt=makeDemoRentalReceipt(quote,title,outcome,reference);
   setDemoRentals(current=>[receipt,...current].slice(0,12));
   return reference;
  }
 }),[favorites,cart,draft,demoRentals,savedSyncStatus,savedSyncError,savedOnline,
      session.addSaved,session.removeSaved,session.listSaved]);
 return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}
export function useAppState(){const value=useContext(StateContext);if(!value)throw new Error('AppStateProvider is required');return value}
