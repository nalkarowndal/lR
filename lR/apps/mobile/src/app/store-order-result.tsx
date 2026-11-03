import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useDemoSession} from '../auth/SessionProvider';
import type{StoreOrder} from '../auth/store-orders';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../components/ui';
import {colors,formatKrw} from '../theme';
const method:Record<string,string>={CARD:'신용·체크카드',EASY_PAY:'간편결제',TRANSFER:'계좌이체'};
export default function StoreOrderResult(){
 const router=useRouter(),session=useDemoSession();
 const {orderId}=useLocalSearchParams<{orderId?:string}>();
 const [order,setOrder]=useState<StoreOrder|null>(null),[error,setError]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'||!orderId){setOrder(null);return;}
  let live=true;setBusy(true);setOrder(null);setError(null);
  void session.getStoreOrder(orderId).then(value=>{if(live)setOrder(value)})
   .catch(e=>{if(live)setError(e instanceof Error?e.message:'스토어 접수 내역을 확인할 수 없습니다')})
   .finally(()=>{if(live)setBusy(false)});
  return()=>{live=false};
 },[orderId,session.status,session.getStoreOrder,refresh]);
 return <Screen title="스토어 주문 접수 결과" subtitle="서버에 기록된 접수 내용">
  <DemoNotice/>
  {session.status==='guest'?<Panel>
   <Heading>스토어 접수 내역을 보려면 로그인해 주세요</Heading>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/>
  </Panel>:null}
  {session.status==='restoring'?<Panel><Body>로그인 확인 중…</Body></Panel>:null}
  {busy?<Panel><Body>스토어 주문 접수 정보 확인 중…</Body></Panel>:null}
  {error?<Panel><Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>
   <Action label="접수 상태 다시 조회" secondary onPress={()=>setRefresh(n=>n+1)}/></Panel>:null}
  {order?<Panel>
   <Heading>스토어 주문이 접수되었습니다</Heading>
   <Body>주문번호: {order.orderId}</Body>
   {order.items.map(item=><Body key={item.productId}>{item.title} · {formatKrw(item.unitPriceKrw)}</Body>)}
   <Text style={{fontSize:24,fontWeight:'900',color:colors.ink}}>{formatKrw(order.totalKrw)} (예시)</Text>
   <Body>결제방법 선택: {method[order.paymentMethod]}</Body>
   <Body>수령방법: {order.deliveryMethod==='COURIER'?'가상 택배 배송지':'가상 쇼룸 방문'}</Body>
   <Body muted>접수 상태: 접수 완료 · 결제 상태: 미결제</Body>
   <Body muted>서버에 체험 접수 기록만 저장됐습니다. 실제 결제·판매 확정·재고 홀드·배송은 진행하지 않습니다.</Body>
  </Panel>:null}
  <Action label="내 스토어 주문 내역 보기" onPress={()=>router.replace('/my/store-orders')}/>
  <Action label="스토어 상품 더 보기" secondary onPress={()=>router.replace('/(tabs)/store')}/>
 </Screen>;
}
