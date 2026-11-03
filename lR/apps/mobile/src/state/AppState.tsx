import React,{createContext,useContext,useMemo,useState} from 'react';
import type{QuoteResult} from '../api/client';
import {makeDemoRentalReceipt,type DemoOutcome,type DemoRentalReceipt} from '../domain/demo-rental';
export interface RentalDraft{productId:string;startDate:string;returnDate:string}
interface State{
  favorites:string[]; cart:string[]; draft:RentalDraft|null; demoRentals:DemoRentalReceipt[];
  toggleFavorite:(id:string)=>void; addToCart:(id:string)=>void; removeCart:(id:string)=>void; clearCart:()=>void;
  setDraft:(value:RentalDraft|null)=>void; resetPrivateState:()=>void;
  recordDemoRental:(quote:QuoteResult,title:string,outcome:DemoOutcome)=>string;
}
const StateContext=createContext<State|null>(null);
export function AppStateProvider({children}:{children:React.ReactNode}){
 const [favorites,setFavorites]=useState<string[]>([]);
 const [cart,setCart]=useState<string[]>([]);
 const [draft,setDraft]=useState<RentalDraft|null>(null);
 const [demoRentals,setDemoRentals]=useState<DemoRentalReceipt[]>([]);
 const value=useMemo<State>(()=>({
  favorites,cart,draft,demoRentals,setDraft,
  toggleFavorite:(id)=>setFavorites(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]),
  addToCart:(id)=>setCart(current=>current.includes(id)?current:[...current,id]),
  removeCart:(id)=>setCart(current=>current.filter(x=>x!==id)),
  clearCart:()=>setCart([]),
  recordDemoRental:(quote,title,outcome)=>{
   // A display-only ID: never a payment provider reference or real booking identifier.
   const reference='DEMO-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
   const receipt=makeDemoRentalReceipt(quote,title,outcome,reference);
   setDemoRentals(current=>[receipt,...current].slice(0,12));
   return reference;
  },
  resetPrivateState:()=>{setFavorites([]);setCart([]);setDraft(null);setDemoRentals([])}
 }),[favorites,cart,draft,demoRentals]);
 return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}
export function useAppState(){const value=useContext(StateContext);if(!value)throw new Error('AppStateProvider is required');return value}
