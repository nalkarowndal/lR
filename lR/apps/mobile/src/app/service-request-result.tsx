import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useDemoSession} from '../auth/SessionProvider';
import {canCancelService,serviceKindLabel,serviceStatusLabel,type ServiceRecord} from '../auth/service-requests';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../components/ui';
import {colors} from '../theme';
export default function ServiceRequestResult(){
 const router=useRouter(),session=useDemoSession();
 const {requestId}=useLocalSearchParams<{requestId?:string}>();
 const [record,setRecord]=useState<ServiceRecord|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [loading,setLoading]=useState(false),[actionBusy,setActionBusy]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(session.status!=='signed-in'||!requestId){setRecord(null);return;}
  let live=true;setLoading(true);setError(null);setRecord(null);
  void session.getServiceRequest(requestId).then(r=>{if(live)setRecord(r)})
   .catch(e=>{if(live)setError(e instanceof Error?e.message:'서버 접수 내역을 확인할 수 없습니다')})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[session.status,session.getServiceRequest,requestId,refresh]);
 const cancel=async()=>{
  if(!record||actionBusy||!canCancelService(record.status))return;
  setActionBusy(true);setError(null);
  try{setRecord(await session.cancelServiceRequest(record.id))}
  catch(e){setError(e instanceof Error?e.message:'신청 취소 요청이 실패했습니다. 상태를 새로 조회해 주세요')}
  finally{setActionBusy(false)}
 };
 return <Screen title="서비스 신청 접수 결과" subtitle="서버에서 접수 상태를 확인합니다">
  <DemoNotice/>
  {session.status==='guest'?<Panel><Heading>접수 내역을 보려면 로그인해 주세요</Heading>
   <Action label="테스트 계정 로그인" onPress={()=>router.push('/my/login')}/></Panel>:null}
  {session.status==='restoring'?<Panel><Body muted>로그인 확인 중…</Body></Panel>:null}
  {loading?<Panel><Body>서버에서 신청 기록을 조회하는 중…</Body></Panel>:null}
  {record?<Panel>
   <Heading>{serviceKindLabel[record.kind]} 신청 접수 정보</Heading>
   <Body>접수번호: {record.id}</Body>
   <Body>품목명: {record.itemName}</Body>
   <Body>신청 내용: {record.details}</Body>
   <Body>진행 상태: {serviceStatusLabel[record.status]}</Body>
   <Body muted>서비스 정책: 포트폴리오 시연 전용 · 실제 검수·계약 없음</Body>
   <Body muted>데이터는 테스트 서버에 저장됐습니다. 실제 수선·위탁 계약, 물품 수거, 사진 업로드, 견적 및 정산은 진행하지 않습니다.</Body>
   {canCancelService(record.status)?<Action label="시연 신청 취소" secondary
    loading={actionBusy} onPress={()=>{void cancel()}}/>:null}
   <Action label="신청 상태 새로고침" secondary disabled={loading||actionBusy}
    onPress={()=>setRefresh(n=>n+1)}/>
  </Panel>:null}
  {error?<Panel><Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>
   <Action label="신청 상태 다시 확인" secondary onPress={()=>setRefresh(n=>n+1)}/></Panel>:null}
  <Action label="내 수선·위탁 신청 내역 보기" onPress={()=>router.replace('/my/service-requests')}/>
  <Action label="마이페이지로 돌아가기" secondary onPress={()=>router.replace('/(tabs)/my')}/>
 </Screen>;
}
