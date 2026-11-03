import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import type{ExperienceOrder} from '../../auth/experience-orders';
import {Screen,Panel,Heading,Body,Action,RowLink,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors,formatKrw} from '../../theme';
export default function ExperienceOrdersHistory(){
 const router=useRouter(),session=useDemoSession();
 const [orders,setOrders]=useState<ExperienceOrder[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'){setOrders([]);return;}
  let live=true;setLoading(true);setError(null);
  void session.listExperienceOrders().then(value=>{if(live)setOrders(value)}).catch(e=>{
   if(live){setOrders([]);setError(e instanceof Error?e.message:'주문 내역을 조회하지 못했습니다');}
  }).finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[session.status,session.listExperienceOrders,refresh]);
 return <Screen title="내 주문 내역" subtitle="서버에 접수된 주문 확인" right={<Back/>}>
  <DemoNotice/>
  {session.status==='restoring'?<Panel><Body>로그인 상태 확인 중…</Body></Panel>:null}
  {session.status==='guest'?<Panel>
   <Heading>주문 내역을 보려면 로그인해 주세요</Heading>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/>
  </Panel>:null}
  {session.status==='signed-in'?<Panel>
   <Heading>접수된 주문</Heading>
   <Body muted>서버에 접수 기록이 저장됩니다. 금전 결제와 실제 배송/예약은 진행되지 않습니다.</Body>
   {loading?<Body>주문 목록을 불러오는 중…</Body>:null}
   {!loading&&!error&&orders.length===0?<Body>아직 접수된 주문이 없습니다.</Body>:null}
   {orders.map(order=><View key={order.orderId}>
    <RowLink title={order.title}
     subtitle={'주문 접수 · '+formatKrw(order.payableKrw)+' · '+order.startDate+'~'+order.returnDate}
     onPress={()=>router.push({pathname:'/experience-order-result',params:{orderId:order.orderId}})}/>
   </View>)}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   <Action secondary label="주문 목록 새로고침" disabled={loading} onPress={()=>setRefresh(x=>x+1)}/>
  </Panel>:null}
  <Action label="렌탈 상품 둘러보기" onPress={()=>router.replace('/(tabs)/rental')}/>
 </Screen>;
}
