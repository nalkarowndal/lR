import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import type{DemoAdminOrder,DemoAdminDetail} from '../../auth/admin-demo-orders';
import {Screen,Panel,Heading,Body,Action,RowLink,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors,formatKrw} from '../../theme';

export default function AdminDemoOrders(){
 const router=useRouter(),session=useDemoSession();
 const [orders,setOrders]=useState<DemoAdminOrder[]>([]);
 const [selected,setSelected]=useState<DemoAdminDetail|null>(null);
 const [loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null);
 const [detailBusy,setDetailBusy]=useState(false),[refresh,setRefresh]=useState(0);
 const allowed=session.status==='signed-in'&&session.identity?.roles.includes('ADMIN')===true;
 useEffect(()=>{
  if(!allowed){setOrders([]);setSelected(null);setError(null);return;}
  let live=true;
  setLoading(true);setError(null);setSelected(null);
  void session.listAdminDemoOrders().then(items=>{
   if(live)setOrders(items);
  }).catch(err=>{
   if(live){setOrders([]);setError(err instanceof Error?err.message:'테스트 원장을 확인할 수 없습니다');}
  }).finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[allowed,session.listAdminDemoOrders,refresh]);
 const select=async(orderId:string)=>{
  if(!allowed||detailBusy)return;
  setSelected(null);setDetailBusy(true);setError(null);
  try{setSelected(await session.getAdminDemoOrder(orderId));}
  catch(err){setError(err instanceof Error?err.message:'상태 이력 조회 실패');}
  finally{setDetailBusy(false);}
 };
 return <Screen title="테스트 결제 원장 검수" subtitle="관리자 전용 · 조회만 가능" right={<Back/>}>
  <DemoNotice/>
  {!allowed?<Panel>
    <Heading>관리자 로그인이 필요합니다</Heading>
    <Body muted>관리자 권한이 확인된 테스트 API 세션에서만 모의 결제 원장을 볼 수 있습니다. 표시할 가짜 서버 기록을 생성하지 않습니다.</Body>
    <Action label="마이페이지로 돌아가기" onPress={()=>router.replace('/(tabs)/my')}/>
   </Panel>:<>
   <Panel>
    <Heading>관리자 검수 목록</Heading>
    <Body muted>이 목록은 격리된 lr_test 내부 원장의 모의 거래입니다. 앞서 고객 화면에서 선택한 브라우저 세션의 결제 시뮬레이션과 연결되지 않으며 실제 주문·결제·예약이 아닙니다.</Body>
    {loading?<Body>테스트 원장 조회 중…</Body>:null}
    {!loading&&orders.length===0&&!error?<Body>현재 표시할 모의 원장 기록이 없습니다.</Body>:null}
    {orders.map(item=><View key={item.orderId} style={{gap:5}}>
     <RowLink title={item.title} subtitle={item.status+' · '+formatKrw(item.payableKrw)+' · '+item.startDate}
      onPress={()=>{void select(item.orderId)}}/>
    </View>)}
    <Action secondary label="원장 목록 새로고침" disabled={loading} onPress={()=>setRefresh(x=>x+1)}/>
    {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   </Panel>
   {detailBusy?<Panel><Body>상태 이력을 확인하는 중…</Body></Panel>:null}
   {selected?<Panel>
    <Heading>모의 주문 상태 이력</Heading>
    <Body>{selected.title} · {selected.status}</Body>
    <Body>내부 테스트 원장 ID: {selected.orderId}</Body>
    <Body>대여 {selected.startDate} → {selected.returnDate} ({selected.rentalDays}일)</Body>
    <Body>대여료 {formatKrw(selected.rentalFeeKrw)} · 보증금 {formatKrw(selected.depositKrw)}</Body>
    <Text style={{fontWeight:'800',color:colors.ink}}>모의 결제 기준액 {formatKrw(selected.payableKrw)}</Text>
    <Heading>감사 이력</Heading>
    {selected.audit.length===0?<Body muted>감사 이력이 없습니다.</Body>:selected.audit.map((row,i)=>
     <Body key={'a'+i}>{row.action} · {row.createdAt}</Body>)}
    <Heading>결제 이벤트</Heading>
    {selected.events.length===0?<Body muted>결제 이벤트가 없습니다.</Body>:selected.events.map((row,i)=>
     <Body key={'e'+i}>{row.status} → {row.resultStatus} · {formatKrw(row.verifiedAmountKrw)}</Body>)}
    <Body muted>변경·취소·실제 환불 처리 기능은 제공되지 않습니다.</Body>
   </Panel>:null}
  </>}
 </Screen>;
}
