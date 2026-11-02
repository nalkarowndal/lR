import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {findProduct} from '../../domain/catalog';
import {rentalDays} from '../../domain/date';
import {useAppState} from '../../state/AppState';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice,Badge} from '../../components/ui';
import {Back} from '../../components/Back';
export default function Quote(){
 const router=useRouter();const {draft}=useAppState();
 const product=draft?findProduct(draft.productId):null;
 const days=draft?rentalDays(draft.startDate,draft.returnDate):null;
 if(!product||days===null)return <Screen title="견적을 확인할 수 없어요" right={<Back/>}><Action label="렌탈 목록으로" onPress={()=>router.replace('/(tabs)/rental')}/></Screen>;
 const fee=product.dayRateKrw*days;const total=fee+product.depositKrw;
 return <Screen title="렌탈 견적" subtitle="결제 전 요금을 확인해 주세요" right={<Back/>}>
  <DemoNotice/>
  <Panel><Badge label="합성 견적 · 실제 재고 확보 아님"/><Heading>{product.title}</Heading><Body>{draft!.startDate} 시작 · {draft!.returnDate} 반납 · {days}일</Body>
   {([['1일 렌탈료',formatKrw(product.dayRateKrw)],['대여료',formatKrw(fee)],['배송비','0원 (데모)'],['보증금',formatKrw(product.depositKrw)] ] as const).map(([a,b])=><View key={a} style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><Text style={{color:colors.sub}}>{a}</Text><Text style={{color:colors.ink,fontWeight:'700'}}>{b}</Text></View>)}
   <View style={{height:1,backgroundColor:colors.divider}}/><Text style={{fontSize:15,color:colors.sub,fontWeight:'700'}}>예시 청구 합계</Text><Text style={{fontSize:27,fontWeight:'900',color:colors.ink}}>{formatKrw(total)}</Text>
   <Body muted>보증금 선청구는 시연용 가정이며 실제 정책은 미확정입니다. 실제 결제나 예약이 생성되지 않습니다.</Body>
  </Panel>
  <Action label="렌탈 주문서 미리보기" onPress={()=>router.push('/rental/checkout')}/>
 </Screen>;
}
