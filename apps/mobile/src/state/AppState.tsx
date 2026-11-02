import React,{createContext,useContext,useMemo,useState} from 'react';
export interface RentalDraft{productId:string;startDate:string;returnDate:string}
interface State{
  favorites:string[]; cart:string[]; draft:RentalDraft|null;
  toggleFavorite:(id:string)=>void; addToCart:(id:string)=>void; removeCart:(id:string)=>void; clearCart:()=>void;
  setDraft:(value:RentalDraft|null)=>void;
}
const StateContext=createContext<State|null>(null);
export function AppStateProvider({children}:{children:React.ReactNode}){
 const [favorites,setFavorites]=useState<string[]>([]);
 const [cart,setCart]=useState<string[]>([]);
 const [draft,setDraft]=useState<RentalDraft|null>(null);
 const value=useMemo<State>(()=>({
  favorites,cart,draft,setDraft,
  toggleFavorite:(id)=>setFavorites(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]),
  addToCart:(id)=>setCart(current=>current.includes(id)?current:[...current,id]),
  removeCart:(id)=>setCart(current=>current.filter(x=>x!==id)),
  clearCart:()=>setCart([])
 }),[favorites,cart,draft]);
 return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}
export function useAppState(){const value=useContext(StateContext);if(!value)throw new Error('AppStateProvider is required');return value}
