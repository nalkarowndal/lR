import {useRef,useState} from 'react';
import {TextInput,View,Text} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
import {apiEnabled} from '../../api/client';
import {useDemoSession} from '../../auth/SessionProvider';
import {createIntakeRequestKey} from '../../auth/experience-orders';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
export default function RepairRequest(){
 const router=useRouter(),session=useDemoSession(),online=apiEnabled();
 const [item,setItem]=useState(''),[description,setDescription]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 const pending=useRef(false),intent=useRef<{signature:string;key:string}|null>(null);
 const valid=item.trim().length>=2&&item.trim().length<=120&&
  description.trim().length>=10&&description.trim().length<=1000;
 const submit=async()=>{
  if(!valid||busy||pending.current||session.status!=='signed-in')return;
  const input={kind:'REPAIR' as const,itemName:item.trim(),details:description.trim()};
  const signature=JSON.stringify(input);
  if(intent.current?.signature!==signature)intent.current={signature,key:createIntakeRequestKey()};
  setBusy(true);setError(null);pending.current=true;
  try{
   const record=await session.createServiceRequest(input,intent.current.key);
   router.replace({pathname:'/service-request-result',params:{requestId:record.id}});
  }catch(e){
   pending.current=false;
   setError(e instanceof Error?e.message:'수선 신청을 접수하지 못했습니다. 내 신청 내역에서 확인해 주세요');
  }finally{setBusy(false);}
 };
 return <Screen title="수선 신청" subtitle="물품과 필요한 케어를 알려주세요" right={<Back/>}>
  <DemoNotice/>
  <Panel><Heading>어떤 물품인가요?</Heading>
   <TextInput accessibilityLabel="수선 대상 물품" value={item} onChangeText={setItem}
    maxLength={120} placeholder="예: 시연용 가죽 숄더백" placeholderTextColor={colors.sub}
    style={{borderColor:colors.border,borderWidth:1,borderRadius:12,minHeight:54,fontSize:16,paddingHorizontal:12,color:colors.ink}}/>
   <Heading>어떤 문제가 있나요?</Heading>
   <TextInput accessibilityLabel="수선이 필요한 내용" value={description} onChangeText={setDescription}
    maxLength={1000} multiline textAlignVertical="top" placeholder="예: 시연용 가방 모서리 가죽 마모를 복원하고 싶습니다."
    placeholderTextColor={colors.sub} style={{borderColor:colors.border,borderWidth:1,borderRadius:12,minHeight:128,fontSize:16,padding:12,color:colors.ink}}/>
   <View style={{borderRadius:12,backgroundColor:colors.care,minHeight:120,alignItems:'center',justifyContent:'center',gap:8}}>
    <Ionicons name="image-outline" size={34} color={colors.sub}/>
    <Text style={{color:colors.ink,fontWeight:'700'}}>사진 첨부 · 사용하지 않음</Text>
    <Body muted>사진 접근 권한을 요청하거나 업로드하지 않습니다.</Body>
   </View>
  </Panel>
  <Panel>
   {online?<Body muted>테스트용 수선 신청 데이터가 서버에 접수됩니다. 실제 물품명·연락처·주소·고객 개인정보를 입력하지 마세요. 실제 수선·견적·배송·계약은 발생하지 않습니다.</Body>:
    <Body muted>오프라인 미리보기에서는 수선 신청서를 저장하거나 전송하지 않습니다.</Body>}
   {online&&session.status!=='signed-in'?<Action label="로그인하고 수선 접수" onPress={()=>router.push('/my/login')}/>:
    <Action label={online?'수선 신청 접수':'수선 신청 화면 시연 완료'}
     disabled={online?!valid:!item.trim()||!description.trim()} loading={busy}
     onPress={()=>{if(online){void submit()}else{router.push({pathname:'/demo-result',params:{kind:'care'}})}}}/>}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   {online?<Action label="내 수선·위탁 신청 내역" secondary onPress={()=>router.push('/my/service-requests')}/>:null}
  </Panel>
 </Screen>;
}
