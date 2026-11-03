import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import type{StoreOrder} from '../../auth/store-orders';
import {Screen,Panel,Heading,Body,Action,RowLink,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors,formatKrw} from '../../theme';
export default function StoreOrderHistory(){
 const router=useRouter(),session=useDemoSession();
 const [orders,setOrders]=useState<StoreOrder[]>([]),[error,setError]=useState<string|null>(null);
 const [loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'){setOrders([]);return;}
  let live=true;setLoading(true);setError(null);
  void session.listStoreOrders().then(value=>{if(live)setOrders(value)})
   .catch(e=>{if(live){setOrders([]);setError(e instanceof Error?e.message:'접수 내역을 확인할 수 없습니다')}})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[session.status,session.listStoreOrders,refresh]);
 return <Screen title="내 스토어 주문 내역" subtitle="서버에 접수된 비금전 주문 기록" right={<Back/>}>
  <DemoNotice/>
  {session.status==='guest'?<Panel><Heading>로그인이 필요합니다</Heading>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/></Panel>:null}
  {session.status==='restoring'?<Body muted>로그인 확인 중…</Body>:null}
  {session.status==='signed-in'?<Panel>
   <Heading>접수된 스토어 주문</Heading>
   <Body muted>접수 기록만 저장됐으며 실제 결제·판매 확정·배송은 없습니다.</Body>
   {loading?<Body>스토어 접수 내역 확인 중…</Body>:null}
   {!loading&&!error&&orders.length===0?<Body muted>아직 접수된 스토어 주문이 없습니다.</Body>:null}
   {orders.map(order=><RowLink key={order.orderId}
    title={order.items.map(item=>item.title).join(', ')}
    subtitle={'접수 완료 · 미결제 · '+formatKrw(order.totalKrw)+' · '+order.items.length+'개'}
    onPress={()=>router.push({pathname:'/store-order-result',params:{orderId:order.orderId}})}/>)}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   <Action label="스토어 내역 새로고침" secondary disabled={loading} onPress={()=>setRefresh(n=>n+1)}/>
  </Panel>:null}
  <Action label="스토어 상품 둘러보기" onPress={()=>router.replace('/(tabs)/store')}/>
 </Screen>;
}
