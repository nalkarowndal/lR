import {useEffect,useState} from 'react';
import {Text,TextInput,View,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {apiEnabled} from '../../api/client';
import {useDemoSession} from '../../auth/SessionProvider';
import {AuthError} from '../../auth/api';
import {type EditorialCopy,type EditorialTarget,type AdminEditorial,type MediaRightsRow} from '../../auth/editorial';
import {Screen,Panel,Heading,Body,Action,DemoNotice,Badge} from '../../components/ui';
import {Back} from '../../components/Back';
import {colors} from '../../theme';
const routes:ReadonlyArray<{value:EditorialTarget;label:string}>=[
 {value:'RENTAL',label:'렌탈'},{value:'STORE',label:'스토어'},
 {value:'CARE',label:'수선'},{value:'CONSIGNMENT',label:'위탁'}
];
const fieldStyle={minHeight:50,borderWidth:1,borderColor:colors.border,borderRadius:10,
 paddingHorizontal:12,paddingVertical:9,fontSize:16,color:colors.ink};
export default function AdminEditorial(){
 const router=useRouter(),session=useDemoSession();
 const allowed=apiEnabled()&&session.status==='signed-in'&&session.identity?.roles.includes('ADMIN')===true;
 const [state,setState]=useState<AdminEditorial|null>(null);
 const [draft,setDraft]=useState<EditorialCopy|null>(null);
 const [rights,setRights]=useState<MediaRightsRow[]>([]);
 const [error,setError]=useState<string|null>(null),[message,setMessage]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(!allowed){setState(null);setDraft(null);setRights([]);return;}
  let live=true;setLoading(true);setError(null);
  void Promise.all([session.readAdminEditorial(),session.listAdminMediaRights()])
   .then(([editorial,media])=>{if(live){setState(editorial);setDraft(editorial.draft);setRights(media)}})
   .catch(e=>{if(live){setState(null);setDraft(null);setRights([]);
    setError(e instanceof Error?e.message:'관리자 문구 정보를 불러올 수 없습니다')}})
   .finally(()=>{if(live)setLoading(false)});
  return()=>{live=false};
 },[allowed,session.readAdminEditorial,session.listAdminMediaRights,refresh]);
 const dirty=!!draft&&!!state&&JSON.stringify(draft)!==JSON.stringify(state.draft);
 const handleError=(e:unknown)=>{
  setError(e instanceof Error?e.message:'에디토리얼 요청이 실패했습니다');
  if(e instanceof AuthError&&(e.status===401||e.status===403)){setState(null);setDraft(null);setRights([]);}
 };
 const save=async()=>{
  if(!state||!draft||busy||!dirty||!allowed)return;
  setBusy(true);setError(null);setMessage(null);
  try{
   const updated=await session.saveAdminEditorial(state.revision,draft);
   setState(updated);setDraft(updated.draft);setMessage('초안을 서버에 저장했습니다. 아직 고객 화면에는 게시되지 않았습니다.');
  }catch(e){handleError(e)}finally{setBusy(false)}
 };
 const publish=async()=>{
  if(!state||busy||dirty||!allowed||state.publishedRevision===state.revision)return;
  setBusy(true);setError(null);setMessage(null);
  try{
   const updated=await session.publishAdminEditorial(state.revision);
   setState(updated);setDraft(updated.draft);setMessage('게시된 시연 문구가 서버에 저장됐습니다. 홈을 다시 열면 반영됩니다.');
  }catch(e){handleError(e)}finally{setBusy(false)}
 };
 const field=(label:string,key:'eyebrow'|'headline'|'description'|'ctaLabel',maxLength:number,multiline=false)=>
  <View style={{gap:7}} key={key}><Text style={{fontWeight:'700',color:colors.ink}}>{label}</Text>
   <TextInput accessibilityLabel={'에디토리얼 '+label} value={draft?.[key]||''} maxLength={maxLength}
    multiline={multiline} onChangeText={v=>setDraft(current=>current?{...current,[key]:v}:null)}
    style={[fieldStyle,multiline?{minHeight:92,textAlignVertical:'top'}:null]}/></View>;
 return <Screen title="에디토리얼 관리" subtitle="테스트 관리자 · 문구 초안 및 게시" right={<Back/>}>
  <DemoNotice/>
  {!allowed?<Panel><Heading>관리자 권한이 필요합니다</Heading>
   <Body muted>시연용 ADMIN 계정만 문구를 수정할 수 있습니다. 운영 웹이나 실제 브랜드 사진은 변경되지 않습니다.</Body>
   <Action label="마이로 돌아가기" onPress={()=>router.replace('/(tabs)/my')}/></Panel>:null}
  {allowed&&loading?<Panel><Body muted>시연 문구와 이미지 권리 현황 확인 중…</Body></Panel>:null}
  {allowed&&state&&draft?<Panel>
   <Badge label={'초안 버전 '+state.revision+' · 게시 버전 '+state.publishedRevision}/>
   <Heading>홈 배너 문구</Heading>
   <Body muted>초안 저장만으로 고객에게 보이지 않습니다. 게시 버튼을 누른 후 홈 화면에서 확인하세요. HTML·외부 링크·파일 업로드는 지원하지 않습니다.</Body>
   {field('상단 레이블','eyebrow',60)}
   {field('헤드라인','headline',80)}
   {field('소개 문구','description',180,true)}
   {field('버튼 문구','ctaLabel',32)}
   <Heading>버튼 이동 위치</Heading>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    {routes.map(route=><Pressable key={route.value} accessibilityRole="button"
     accessibilityLabel={'에디토리얼 이동 위치 '+route.label}
     accessibilityState={{selected:draft.ctaTarget===route.value}}
     onPress={()=>setDraft(v=>v?{...v,ctaTarget:route.value}:null)}
     style={{minHeight:44,borderRadius:10,paddingHorizontal:14,justifyContent:'center',
      borderWidth:1,borderColor:colors.border,backgroundColor:draft.ctaTarget===route.value?colors.ink:colors.surface}}>
     <Text style={{fontWeight:'700',color:draft.ctaTarget===route.value?colors.surface:colors.ink}}>{route.label}</Text>
    </Pressable>)}
   </View>
   <Action label="에디토리얼 초안 저장" loading={busy} disabled={!dirty||loading} onPress={()=>{void save()}}/>
   <Action label="에디토리얼 게시" secondary loading={busy}
    disabled={dirty||state.revision===state.publishedRevision||loading} onPress={()=>{void publish()}}/>
   <Action label="서버 최신 문구 새로고침" secondary disabled={busy||loading} onPress={()=>{setMessage(null);setRefresh(n=>n+1)}}/>
  </Panel>:null}
  {message?<Panel><Body>{message}</Body></Panel>:null}
  {error?<Panel><Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>
   <Action label="관리자 데이터 다시 불러오기" secondary onPress={()=>setRefresh(n=>n+1)}/></Panel>:null}
  {allowed&&!loading?<Panel>
   <Heading>상품 이미지 사용권 점검</Heading>
   <Body muted>읽기 전용 검토 현황입니다. 승인되지 않은 상품·브랜드 실사 사진은 공개되지 않으며, 원본 업로드와 무단 URL 등록 기능도 없습니다.</Body>
   {rights.length===0?<Body muted>점검할 상품 정보가 없거나 아직 미디어 등록이 없습니다.</Body>:null}
   {rights.map(r=><View key={r.productId} style={{gap:4,paddingVertical:8,borderBottomWidth:1,borderColor:colors.divider}}>
    <Body>{r.title} · {r.displayReady?'승인 이미지 사용 가능':'사용권 검토 대기'}</Body>
    <Body muted>등록 {r.registeredCount}장 · 권리 승인 {r.rightsApprovedCount}장</Body>
    <Body muted>{r.reason}</Body>
   </View>)}
   <Body muted>권리 증빙, 이미지 출처 및 CDN 승인 없이 사진을 등록할 수 없습니다. 지금은 합성 일러스트를 유지합니다.</Body>
  </Panel>:null}
 </Screen>;
}
