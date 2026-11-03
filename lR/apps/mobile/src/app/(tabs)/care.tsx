import {View,Text} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router';
import {Screen,DemoNotice,Panel,Heading,Body,Action} from '../../components/ui';
import {colors} from '../../theme';
export default function Care(){
 const router=useRouter();
 return <Screen title="수선 · 복원" subtitle="오래 간직할 수 있도록, 세심한 케어">
  <DemoNotice/>
  <View style={{backgroundColor:colors.care,minHeight:160,borderRadius:20,alignItems:'center',justifyContent:'center',gap:12}}>
   <Ionicons name="construct-outline" size={65} color={colors.ink}/>
   <Text style={{color:colors.ink,fontWeight:'800',fontSize:19}}>LUXURY CARE</Text>
  </View>
  <Panel><Heading>수선 접수 절차</Heading><Body>1. 수선할 물품과 상태를 알려주세요.</Body><Body>2. 사진을 첨부하고 예상 처리 과정을 확인하세요.</Body><Body>3. 접수·견적·작업 진행 상태를 확인하세요.</Body></Panel>
  <Action label="수선 신청서 작성하기" onPress={()=>router.push('/repair/request')}/>
  <Body muted>실제 견적과 작업 일정은 운영 정책 및 담당자 확인 이후 제공됩니다. 현재 신청서는 시연용입니다.</Body>
 </Screen>;
}
