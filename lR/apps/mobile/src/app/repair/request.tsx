import {useState} from 'react';
import {TextInput,View,Text} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
export default function RepairRequest(){
 const router=useRouter();
 const [item,setItem]=useState('');const [description,setDescription]=useState('');
 return <Screen title="수선 신청" subtitle="물품과 필요한 케어를 알려주세요" right={<Back/>}>
  <DemoNotice/>
  <Panel><Heading>어떤 물품인가요?</Heading><TextInput accessibilityLabel="수선 대상 물품" value={item} onChangeText={setItem} placeholder="예: 가죽 숄더백" placeholderTextColor={colors.sub} style={{borderColor:colors.border,borderWidth:1,borderRadius:12,minHeight:54,fontSize:16,paddingHorizontal:12,color:colors.ink}}/>
   <Heading>어떤 문제가 있나요?</Heading>
   <TextInput accessibilityLabel="수선이 필요한 내용" value={description} onChangeText={setDescription} multiline textAlignVertical="top" placeholder="예: 모서리의 가죽 마모" placeholderTextColor={colors.sub} style={{borderColor:colors.border,borderWidth:1,borderRadius:12,minHeight:128,fontSize:16,padding:12,color:colors.ink}}/>
   <View style={{borderRadius:12,backgroundColor:colors.care,minHeight:120,alignItems:'center',justifyContent:'center',gap:8}}><Ionicons name="image-outline" size={34} color={colors.sub}/><Text style={{color:colors.ink,fontWeight:'700'}}>사진 첨부 · 서버 연동 전 준비 중</Text><Body muted>사진 접근 권한을 요청하거나 업로드하지 않습니다.</Body></View>
  </Panel>
  <Panel><Body muted>실제 수선 신청은 회원 인증, 비공개 이미지 저장소, 견적·개인정보 동의 정책 확정 후 연결됩니다.</Body><Action label="수선 신청 화면 시연 완료" disabled={!item.trim()||!description.trim()} onPress={()=>router.push({pathname:'/demo-result',params:{kind:'care'}})}/></Panel>
 </Screen>;
}
