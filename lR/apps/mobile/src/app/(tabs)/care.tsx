import {View,Text} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router';
import {Screen,DemoNotice,Panel,Heading,Body,Action} from '../../components/ui';
import {colors} from '../../theme';
import {apiEnabled} from '../../api/client';
export default function Care(){
 const router=useRouter();
 return <Screen title="수선 · 복원" subtitle="오래 간직할 수 있도록, 세심한 케어">
  <DemoNotice/>
  <View style={{backgroundColor:colors.care,minHeight:160,borderRadius:20,alignItems:'center',justifyContent:'center',gap:12}}>
   <Ionicons name="construct-outline" size={65} color={colors.ink}/>
   <Text style={{color:colors.ink,fontWeight:'800',fontSize:19}}>LUXURY CARE</Text>
  </View>
  <Panel><Heading>수선 접수 절차</Heading><Body>1. 수선할 물품과 상태를 알려주세요.</Body><Body>2. 시연용 상품 상태를 텍스트로 접수하세요 (사진 업로드 없음).</Body><Body>3. 서버 접수번호 및 시연 진행 상태를 확인하세요 (실제 견적 없음).</Body></Panel>
  <Action label="수선 신청서 작성하기" onPress={()=>router.push('/repair/request')}/>
  {apiEnabled()?<Action label="내 수선·위탁 신청 내역" secondary onPress={()=>router.push('/my/service-requests')}/>:null}
  <Body muted>실제 견적과 작업 일정은 운영 정책 및 담당자 확인 이후 제공됩니다. 현재 신청서는 시연용입니다.</Body>
 </Screen>;
}
