import {useLocalSearchParams,useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {View,Text} from 'react-native';
import {useAppState} from '../state/AppState';
import {demoRentalStatusLabel} from '../domain/demo-rental';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../components/ui';
import {colors,formatKrw} from '../theme';
const labels:Record<string,string>={rental:'렌탈 예약',store:'명품 구매',care:'수선 신청',consignment:'위탁 판매'};
export default function DemoResult(){
 const router=useRouter();
 const {demoRentals}=useAppState();
 const {kind,reference}=useLocalSearchParams<{kind?:string;reference?:string}>();
 const item=kind==='rental'?demoRentals.find(x=>x.reference===reference):undefined;
 const label=labels[kind||'']||'서비스';
 if(kind==='rental')return <Screen title="모의 결제 결과" subtitle="렌탈 주문서 시뮬레이션">
  <DemoNotice/>
  {item?<Panel style={{alignItems:'center',paddingVertical:28}}>
   <Ionicons name={item.status==='SIMULATED_PAID'?'checkmark-circle-outline':'information-circle-outline'}
    size={64} color={item.status==='SIMULATED_PAID'?colors.success:colors.sub}/>
   <Heading>{demoRentalStatusLabel(item.status)}</Heading>
   <Body>모의 주문 번호: {item.reference}</Body>
   <Body>{item.title}</Body>
   <Body>{item.startDate} → {item.returnDate} ({item.rentalDays}일)</Body>
   <Text style={{fontSize:22,color:colors.ink,fontWeight:'800'}}>{formatKrw(item.payableKrw)} (예시)</Text>
   <Text style={{fontSize:14,color:colors.sub,textAlign:'center',lineHeight:22}}>
    실제 결제·주문·예약은 발생하지 않았습니다. 세션 내역은 새로고침하면 사라집니다.
   </Text>
  </Panel>:<Panel><Heading>모의 주문 기록을 찾지 못했습니다</Heading>
   <Body muted>새로고침 또는 로그아웃하면 세션 기록이 사라집니다.</Body></Panel>}
  <Action label="마이페이지에서 모의 내역 보기" onPress={()=>router.replace('/my/demo-orders')}/>
  <Action secondary label="렌탈 상품 더 보기" onPress={()=>router.replace('/(tabs)/rental')}/>
 </Screen>;
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
