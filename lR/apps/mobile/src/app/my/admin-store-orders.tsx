import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import type{StoreOrder} from '../../auth/store-orders';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors,formatKrw} from '../../theme';
export default function AdminStoreOrders(){
 const router=useRouter(),session=useDemoSession();
 const allowed=session.status==='signed-in'&&session.identity?.roles.includes('ADMIN')===true;
 const [orders,setOrders]=useState<StoreOrder[]>([]),[loading,setLoading]=useState(false);
 const [error,setError]=useState<string|null>(null),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(!allowed){setOrders([]);return;}
  let live=true;setError(null);setLoading(true);
  void session.listAdminStoreOrders().then(value=>{if(live)setOrders(value)})
   .catch(e=>{if(live){setOrders([]);setError(e instanceof Error?e.message:'관리자 접수 목록을 읽지 못했습니다')}})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[allowed,session.listAdminStoreOrders,refresh]);
 return <Screen title="스토어 주문 접수 관리" subtitle="테스트 관리자 전용 · 읽기만 가능" right={<Back/>}>
  <DemoNotice/>
  {!allowed?<Panel><Heading>관리자 권한이 필요합니다</Heading>
   <Body muted>테스트 ADMIN 권한의 로그인 계정만 읽을 수 있습니다.</Body>
   <Action label="마이로 돌아가기" onPress={()=>router.replace('/(tabs)/my')}/></Panel>:null}
  {allowed?<Panel>
   <Heading>미결제 스토어 접수 기록</Heading>
   <Body muted>주문 상태 변경·배송·정산·재고 판매처리는 제공하지 않습니다.</Body>
   {loading?<Body muted>접수 목록 확인 중…</Body>:null}
   {orders.map(o=><Body key={o.orderId}>{o.orderId.slice(0,8)} · {o.items.length}개 · {formatKrw(o.totalKrw)} · RECEIVED / NOT_CHARGED</Body>)}
   {!loading&&!error&&orders.length===0?<Body muted>접수 기록이 없습니다.</Body>:null}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   <Action label="관리자 목록 새로고침" secondary disabled={loading} onPress={()=>setRefresh(n=>n+1)}/>
  </Panel>:null}
 </Screen>;
}
