import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useDemoSession} from '../auth/SessionProvider';
import type{ExperienceOrder} from '../auth/experience-orders';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../components/ui';
import {colors,formatKrw} from '../theme';

const method:Record<string,string>={CARD:'신용·체크카드',TRANSFER:'계좌이체',EASY_PAY:'간편결제'};
export default function ExperienceOrderResult(){
 const router=useRouter(),session=useDemoSession();
 const {orderId}=useLocalSearchParams<{orderId?:string}>();
 const [order,setOrder]=useState<ExperienceOrder|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'||!orderId){setOrder(null);return;}
  let live=true;setBusy(true);setError(null);setOrder(null);
  void session.getExperienceOrder(orderId).then(value=>{
   if(live)setOrder(value);
  }).catch(e=>{
   if(live)setError(e instanceof Error?e.message:'주문 접수 정보를 확인할 수 없습니다');
  }).finally(()=>{if(live)setBusy(false)});
  return()=>{live=false;};
 },[orderId,session.status,session.getExperienceOrder,refresh]);
 return <Screen title="주문 접수 결과" subtitle="선택한 주문 정보를 확인하세요">
  <DemoNotice/>
  {session.status==='restoring'?<Panel><Body>로그인 상태 확인 중…</Body></Panel>:null}
  {session.status==='guest'?<Panel>
   <Heading>주문 내역 확인을 위해 로그인해 주세요</Heading>
   <Body muted>주문 접수 기록은 서버에 남아 있으며, 동일한 테스트 계정으로 로그인하면 다시 조회할 수 있습니다.</Body>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/>
  </Panel>:null}
  {busy?<Panel><Body>주문 접수 확인 중…</Body></Panel>:null}
  {error?<Panel><Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>
   <Action secondary label="주문 상태 다시 확인" onPress={()=>setRefresh(n=>n+1)}/></Panel>:null}
  {order?<Panel style={{alignItems:'flex-start',paddingVertical:28}}>
   <Heading>주문이 접수되었습니다</Heading>
   <Body>주문번호: {order.orderId}</Body>
   <Body>{order.title}</Body>
   <Body>대여 {order.startDate} → {order.returnDate} · {order.rentalDays}일</Body>
   <Body>결제수단 선택: {method[order.paymentMethod]}</Body>
   <Body>수령방법: {order.deliveryMethod==='COURIER'?'택배 수령 (예시 배송지)':'매장 방문 수령'}</Body>
   <Text style={{fontSize:23,fontWeight:'800',color:colors.ink}}>{formatKrw(order.payableKrw)} (예시)</Text>
   <Body muted>접수 상태: 접수 완료 · 결제 상태: 미결제</Body>
   <Text style={{color:colors.sub,lineHeight:22}}>
    포트폴리오 체험 주문으로 접수됐습니다. 실제 결제·재고 예약 확정·배송은 진행되지 않습니다.
   </Text>
  </Panel>:null}
  <Action label="내 주문 내역 보기" onPress={()=>router.replace('/my/experience-orders')}/>
  <Action secondary label="상품 더 보기" onPress={()=>router.replace('/(tabs)/rental')}/>
 </Screen>;
}
