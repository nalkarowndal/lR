import {useLocalSearchParams,useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {View,Text} from 'react-native';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../components/ui';
import {colors} from '../theme';
const labels:Record<string,string>={rental:'렌탈 예약',store:'명품 구매',care:'수선 신청',consignment:'위탁 판매'};
export default function DemoResult(){
 const router=useRouter();const{kind}=useLocalSearchParams<{kind?:string}>();const label=labels[kind||'']||'서비스';
 return <Screen title="시연 완료" subtitle={label+' 화면 미리보기'}>
  <DemoNotice/>
  <Panel style={{alignItems:'center',paddingVertical:28}}><Ionicons name="checkmark-circle-outline" size={68} color={colors.success}/>
   <Heading>{label} 화면 시연을 완료했어요</Heading>
   <Text style={{fontSize:15,color:colors.sub,textAlign:'center',lineHeight:24}}>실제 신청·예약·주문은 생성되지 않았습니다.{ '\n'}금액 청구나 서버 데이터 저장도 발생하지 않습니다.</Text>
  </Panel>
  <Action label="홈으로 돌아가기" onPress={()=>router.replace('/')}/>
  <Body muted>운영용 서비스는 사용자 인증·Node.js API·DB·결제 정책 검증 후 연동됩니다.</Body>
 </Screen>;
}
