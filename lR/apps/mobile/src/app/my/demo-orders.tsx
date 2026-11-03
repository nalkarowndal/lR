import {useRouter} from 'expo-router';
import {View,Text} from 'react-native';
import {useAppState} from '../../state/AppState';
import {demoRentalStatusLabel} from '../../domain/demo-rental';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {colors,formatKrw} from '../../theme';
import {Back} from '../../components/Back';
export default function DemoRentalHistory(){
 const router=useRouter();
 const {demoRentals}=useAppState();
 return <Screen title="모의 렌탈 이용 내역" subtitle="현재 브라우저 세션에서만 확인" right={<Back/>}>
  <DemoNotice/>
  <Panel>
   <Heading>렌탈 내역</Heading>
   <Body muted>실제 결제·주문·예약은 발생하지 않았습니다. 테스트 데이터는 새로고침하거나 로그아웃하면 삭제됩니다.</Body>
   {demoRentals.length===0?<Body>모의 내역이 없습니다</Body>:demoRentals.map(item=>
    <View key={item.reference} style={{gap:5,paddingVertical:12,borderBottomWidth:1,borderColor:colors.divider}}>
     <Text style={{fontWeight:'800',color:colors.ink}}>{item.title}</Text>
     <Text style={{color:colors.sub}}>{demoRentalStatusLabel(item.status)}</Text>
     <Text style={{color:colors.sub}}>모의 주문 번호: {item.reference}</Text>
     <Text style={{color:colors.sub}}>{item.startDate} ~ {item.returnDate} · {item.rentalDays}일</Text>
     <Text style={{fontWeight:'700',color:colors.ink}}>{formatKrw(item.payableKrw)} (예시)</Text>
    </View>)}
  </Panel>
  <Action label="렌탈 상품 둘러보기" onPress={()=>router.push('/(tabs)/rental')}/>
 </Screen>;
}
