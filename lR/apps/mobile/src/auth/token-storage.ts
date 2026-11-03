/** Only native secure-store persistence. Web sessions intentionally live in React memory only. */
import {Platform} from 'react-native';
import type{TokenSession} from './api';
import {sessionIsCurrent} from './api';
const KEY='lr.demo.session.v1';
export async function readNativeSession():Promise<TokenSession|null>{
 if(Platform.OS==='web')return null;
 const Store=await import('expo-secure-store');
 if(!await Store.isAvailableAsync())throw new Error('이 기기는 안전한 세션 저장소를 지원하지 않습니다');
 const raw=await Store.getItemAsync(KEY);
 if(!raw)return null;
 try{
  const data:unknown=JSON.parse(raw);
  if(data&&typeof data==='object'&&'accessToken' in data&&'expiresAt' in data&&
     typeof data.accessToken==='string'&&typeof data.expiresAt==='string'&&sessionIsCurrent(data as TokenSession))
   return data as TokenSession;
 }catch{/* corrupted or obsolete session must never auto-authorize */}
 await Store.deleteItemAsync(KEY);
 return null;
}
export async function writeNativeSession(value:TokenSession):Promise<void>{
 if(Platform.OS==='web')return;
 const Store=await import('expo-secure-store');
 if(!await Store.isAvailableAsync())throw new Error('안전한 세션 저장소를 사용할 수 없습니다');
 if(!sessionIsCurrent(value))throw new Error('만료된 세션은 저장할 수 없습니다');
 await Store.setItemAsync(KEY,JSON.stringify(value),{keychainAccessible:Store.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
}
export async function clearNativeSession():Promise<void>{
 if(Platform.OS==='web')return;
 const Store=await import('expo-secure-store');
 if(!await Store.isAvailableAsync())throw new Error('안전한 세션 저장소를 사용할 수 없습니다');
 await Store.deleteItemAsync(KEY);
}
