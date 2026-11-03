import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {useDemoSession} from '../../auth/SessionProvider';
import {nextAdminServiceStatuses,serviceKindLabel,serviceStatusLabel,
 type ServiceRecord,type AdminServiceStatus} from '../../auth/service-requests';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors} from '../../theme';
const buttonLabel:Record<AdminServiceStatus,string>={
 UNDER_REVIEW:'시연 검토 시작',INFO_REQUESTED:'시연 추가 정보 요청',DEMO_CLOSED:'시연 검토 종료'
};
export default function AdminServiceRequests(){
 const router=useRouter(),session=useDemoSession();
 const allowed=session.status==='signed-in'&&session.identity?.roles.includes('ADMIN')===true;
 const [items,setItems]=useState<ServiceRecord[]>([]),[loading,setLoading]=useState(false);
 const [busyId,setBusyId]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(!allowed){setItems([]);setError(null);return;}
  let live=true;setError(null);setLoading(true);setItems([]);
  void session.listAdminServiceRequests().then(rows=>{if(live)setItems(rows)})
   .catch(e=>{if(live){setItems([]);setError(e instanceof Error?e.message:'관리자 신청 목록을 불러오지 못했습니다')}})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[allowed,session.listAdminServiceRequests,refresh]);
 const update=async(row:ServiceRecord,target:AdminServiceStatus)=>{
  if(!allowed||busyId)return;
  setBusyId(row.id);setError(null);
  try{
   const updated=await session.updateAdminServiceStatus(row.id,target);
   setItems(rows=>rows.map(x=>x.id===updated.id?updated:x));
  }catch(e){setError(e instanceof Error?e.message:'상태 변경에 실패했습니다. 목록을 다시 확인해 주세요')}
  finally{setBusyId(null)}
 };
 return <Screen title="서비스 접수 관리자 검수" subtitle="ADMIN 전용 · 테스트 상태 변경" right={<Back/>}>
  <DemoNotice/>
  {!allowed?<Panel><Heading>관리자 권한이 필요합니다</Heading>
   <Action label="마이페이지로 돌아가기" onPress={()=>router.replace('/(tabs)/my')}/></Panel>:null}
  {allowed?<Panel>
   <Heading>수선·위탁 시연 신청 목록</Heading>
   <Body muted>실제 수선 작업, 계약, 고객 연락, 배송, 정산은 진행하지 않습니다. 서버 권한과 상태 전이 규칙으로 검증됩니다.</Body>
   {loading?<Body>관리자 목록 확인 중…</Body>:null}
   {!loading&&!error&&items.length===0?<Body muted>등록된 시연 신청이 없습니다.</Body>:null}
   {items.map(row=><View key={row.id} style={{gap:8,borderBottomWidth:1,borderColor:colors.divider,paddingVertical:10}}>
    <Body>{serviceKindLabel[row.kind]+' · '+row.itemName}</Body>
    <Body muted>{row.id.slice(0,8)+' · '+serviceStatusLabel[row.status]}</Body>
    {nextAdminServiceStatuses(row.status).map(target=>
     <Action key={target} secondary label={buttonLabel[target]+' · '+row.id.slice(0,8)}
      loading={busyId===row.id} disabled={!!busyId} onPress={()=>{void update(row,target)}}/>)}
   </View>)}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   <Action label="관리자 신청 목록 새로고침" secondary disabled={loading||!!busyId} onPress={()=>setRefresh(x=>x+1)}/>
  </Panel>:null}
 </Screen>;
}
