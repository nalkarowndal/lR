import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import {serviceKindLabel,serviceStatusLabel,type ServiceRecord} from '../../auth/service-requests';
import {Screen,Panel,Heading,Body,Action,RowLink,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors} from '../../theme';
export default function MyServiceRequests(){
 const router=useRouter(),session=useDemoSession();
 const [items,setItems]=useState<ServiceRecord[]>([]),[error,setError]=useState<string|null>(null);
 const [loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'){setItems([]);return;}
  let live=true;setLoading(true);setItems([]);setError(null);
  void session.listServiceRequests().then(rows=>{if(live)setItems(rows)})
   .catch(e=>{if(live){setItems([]);setError(e instanceof Error?e.message:'내 신청 내역을 확인할 수 없습니다')}})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[session.status,session.listServiceRequests,refresh]);
 return <Screen title="내 수선·위탁 신청 내역" subtitle="서버에 접수된 테스트 서비스 신청" right={<Back/>}>
  <DemoNotice/>
  {session.status==='guest'?<Panel><Heading>시연 계정 로그인이 필요합니다</Heading>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/></Panel>:null}
  {session.status==='restoring'?<Panel><Body muted>로그인 확인 중…</Body></Panel>:null}
  {session.status==='signed-in'?<Panel>
   <Heading>접수한 신청</Heading>
   <Body muted>이 테스트 계정으로 접수한 수선·위탁 신청만 보입니다. 실제 계약이나 진행 중인 실물 케어가 아닙니다.</Body>
   {loading?<Body>신청 기록을 불러오는 중…</Body>:null}
   {!loading&&!error&&items.length===0?<Body muted>아직 접수한 시연 신청이 없습니다.</Body>:null}
   {items.map(item=><RowLink key={item.id} title={serviceKindLabel[item.kind]+' · '+item.itemName}
    subtitle={serviceStatusLabel[item.status]+' · '+item.id.slice(0,8)}
    onPress={()=>router.push({pathname:'/service-request-result',params:{requestId:item.id}})}/>)}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   <Action label="신청 목록 새로고침" secondary disabled={loading} onPress={()=>setRefresh(x=>x+1)}/>
  </Panel>:null}
  <Action label="수선 신청서 작성하기" secondary onPress={()=>router.push('/repair/request')}/>
  <Action label="위탁 신청서 작성하기" secondary onPress={()=>router.push('/my/consignment')}/>
 </Screen>;
}
