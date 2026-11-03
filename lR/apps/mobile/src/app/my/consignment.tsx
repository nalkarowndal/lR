import {useRef,useState} from 'react';
import {Text,TextInput,View,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {colors} from '../../theme';
import {apiEnabled} from '../../api/client';
import {useDemoSession} from '../../auth/SessionProvider';
import {createIntakeRequestKey} from '../../auth/experience-orders';
import {Screen,Panel,Heading,Body,Action,DemoNotice,Badge} from '../../components/ui';
import {Back} from '../../components/Back';
export default function Consignment(){
 const router=useRouter(),session=useDemoSession(),online=apiEnabled();
 const [step,setStep]=useState(1),[brand,setBrand]=useState(''),[category,setCategory]=useState('');
 const [condition,setCondition]=useState('A'),[memo,setMemo]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 const pending=useRef(false),intent=useRef<{signature:string;key:string}|null>(null);
 const itemName=(brand.trim()+' '+category.trim()).trim();
 const details=('시연용 위탁 상품 유형: '+category.trim()+' / 선택 등급: '+condition+
  (memo.trim()?' / 상태 설명: '+memo.trim():' / 상태 설명 없음'));
 const valid=itemName.length>=2&&itemName.length<=120&&details.length>=10&&details.length<=1000;
 const submit=async()=>{
  if(!valid||busy||pending.current||session.status!=='signed-in')return;
  const input={kind:'CONSIGNMENT' as const,itemName,details};
  const signature=JSON.stringify(input);
  if(intent.current?.signature!==signature)intent.current={signature,key:createIntakeRequestKey()};
  pending.current=true;setBusy(true);setError(null);
  try{
   const saved=await session.createServiceRequest(input,intent.current.key);
   router.replace({pathname:'/service-request-result',params:{requestId:saved.id}});
  }catch(e){
   pending.current=false;
   setError(e instanceof Error?e.message:'위탁 신청을 접수하지 못했습니다. 내 신청 내역을 확인해 주세요');
  }finally{setBusy(false);}
 };
 return <Screen title="내 상품 판매" subtitle="위탁 판매 신청 · 시연용 접수" right={<Back/>}>
  <DemoNotice/><Panel><Badge label={step+' / 3 단계'} />
   {step===1?<><Heading>브랜드를 알려주세요</Heading>
    <TextInput value={brand} onChangeText={setBrand} maxLength={50}
     placeholder="예: DEMO 브랜드" accessibilityLabel="위탁 판매 브랜드"
     style={{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:13,color:colors.ink,fontSize:16}}/>
    <Action label="다음 · 제품 종류" disabled={!brand.trim()} onPress={()=>setStep(2)}/></>:null}
   {step===2?<><Heading>어떤 종류인가요?</Heading>
    <TextInput value={category} onChangeText={setCategory} maxLength={50}
     placeholder="예: 시연용 숄더백" accessibilityLabel="위탁 판매 품목"
     style={{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:13,color:colors.ink,fontSize:16}}/>
    <Action label="다음 · 제품 상태" disabled={!category.trim()} onPress={()=>setStep(3)}/>
    <Action label="이전 단계" secondary onPress={()=>setStep(1)}/></>:null}
   {step===3?<><Heading>제품 상태를 선택하세요</Heading>
    <View style={{flexDirection:'row',gap:8}}>{['S','A','B'].map(grade=>
     <Pressable key={grade} accessibilityRole="button" accessibilityState={{selected:condition===grade}}
      onPress={()=>{setCondition(grade)}} style={{flex:1,minHeight:48,backgroundColor:condition===grade?colors.ink:colors.surface,
       borderWidth:1,borderColor:colors.border,borderRadius:12,alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:condition===grade?colors.surface:colors.ink,fontWeight:'700'}}>{grade}</Text>
     </Pressable>)}</View>
    <TextInput value={memo} onChangeText={setMemo} maxLength={700}
     placeholder="상태에 대한 설명 (선택 · 테스트 정보만)" accessibilityLabel="물품 상태 설명" multiline
     style={{minHeight:100,borderWidth:1,borderColor:colors.border,borderRadius:12,padding:13,color:colors.ink,fontSize:16}}/>
    <Body muted>실제 제품·연락처·주소·계약 정보는 입력하지 마세요. 등급은 시연 선택값이며 실제 검수나 위탁가 산정은 없습니다.</Body>
    {online&&session.status!=='signed-in'?<Action label="로그인하고 위탁 접수" onPress={()=>router.push('/my/login')}/>:
     <Action label={online?'위탁 신청 접수':'위탁 신청 시연 완료'} disabled={!valid} loading={busy}
      onPress={()=>{if(online){void submit()}else{router.push({pathname:'/demo-result',params:{kind:'consignment'}})}}}/>}
    {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
    <Action label="이전 단계" secondary disabled={busy} onPress={()=>setStep(2)}/></>:null}
  </Panel>
  {online?<Action label="내 수선·위탁 신청 내역" secondary onPress={()=>router.push('/my/service-requests')}/>:null}
 </Screen>;
}
