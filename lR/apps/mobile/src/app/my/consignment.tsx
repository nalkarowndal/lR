import {useState} from 'react';
import {Text,TextInput,View,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {colors} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice,Badge} from '../../components/ui';
import {Back} from '../../components/Back';
export default function Consignment(){
 const router=useRouter();const [step,setStep]=useState(1);const [brand,setBrand]=useState('');const [category,setCategory]=useState('');const [condition,setCondition]=useState('A');const [memo,setMemo]=useState('');
 return <Screen title="내 상품 판매" subtitle="위탁 판매 신청 절차 미리보기" right={<Back/>}>
  <DemoNotice/><Panel><Badge label={step+' / 3 단계'} />
   {step===1?<><Heading>브랜드를 알려주세요</Heading><TextInput value={brand} onChangeText={setBrand} placeholder="예: DEMO 브랜드" accessibilityLabel="위탁 판매 브랜드" style={{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:13,color:colors.ink,fontSize:16}}/><Action label="다음 · 제품 종류" disabled={!brand.trim()} onPress={()=>setStep(2)}/></>:null}
   {step===2?<><Heading>어떤 종류인가요?</Heading><TextInput value={category} onChangeText={setCategory} placeholder="예: 숄더백" accessibilityLabel="위탁 판매 품목" style={{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:13,color:colors.ink,fontSize:16}}/><Action label="다음 · 제품 상태" disabled={!category.trim()} onPress={()=>setStep(3)}/><Action label="이전 단계" secondary onPress={()=>setStep(1)}/></>:null}
   {step===3?<><Heading>제품 상태를 선택하세요</Heading><View style={{flexDirection:'row',gap:8}}>{['S','A','B'].map(grade=><Pressable key={grade} accessibilityRole="button" accessibilityState={{selected:condition===grade}} onPress={()=>setCondition(grade)} style={{flex:1,minHeight:48,backgroundColor:condition===grade?colors.ink:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:12,alignItems:'center',justifyContent:'center'}}><Text style={{color:condition===grade?colors.surface:colors.ink,fontWeight:'700'}}>{grade}</Text></Pressable>)}</View>
   <TextInput value={memo} onChangeText={setMemo} placeholder="상태에 대한 설명 (선택)" accessibilityLabel="물품 상태 설명" multiline style={{minHeight:100,borderWidth:1,borderColor:colors.border,borderRadius:12,padding:13,color:colors.ink,fontSize:16}}/>
   <Body muted>예상 위탁가는 실제 검수·계약 후 정해지며 이 화면은 판매 신청 데이터를 전송하지 않습니다.</Body>
   <Action label="위탁 신청 시연 완료" onPress={()=>router.push({pathname:'/demo-result',params:{kind:'consignment'}})}/><Action label="이전 단계" secondary onPress={()=>setStep(2)}/></>:null}
  </Panel>
 </Screen>;
}
