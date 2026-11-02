import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {useQuote,useProduct} from '../../api/hooks';
import {useAppState} from '../../state/AppState';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice,Badge} from '../../components/ui';
import {DataSourceNotice,NetworkFeedback} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
export default function Quote(){
 const router=useRouter();const {draft}=useAppState();
 const productResource=useProduct(draft?.productId||'');
 const quoteResource=useQuote(draft);
 const quote=quoteResource.data;
 return <Screen title="렌탈 견적" subtitle="서버 또는 시연 요금 확인" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  {draft===null?<Panel><Heading>날짜 선택이 필요합니다</Heading>
   <Action label="렌탈 목록" onPress={()=>router.replace('/(tabs)/rental')}/></Panel>:null}
  {draft?<><NetworkFeedback status={productResource.status} error={productResource.error} retry={productResource.retry}/>
   <NetworkFeedback status={quoteResource.status} error={quoteResource.error} retry={quoteResource.retry}
     loadingLabel="서버 견적을 요청하는 중…"/></>:null}
  {quote?<><Panel>
   <Badge label="시연 전용 견적 · 재고 홀드·결제 없음"/>
   <Heading>{productResource.data?.title||'렌탈 상품'}</Heading>
   <Body>{quote.startDate} 시작 · {quote.returnDate} 반납 · {quote.rentalDays}일</Body>
   {([['1일 렌탈료',formatKrw(quote.dayRateKrw)],['대여료',formatKrw(quote.rentalFeeKrw)],
    ['배송비',formatKrw(quote.shippingFeeKrw)+' (시연값)'],
    ['할인',formatKrw(quote.discountKrw)],['보증금',formatKrw(quote.depositKrw)]] as const)
    .map(([a,b])=><View key={a} style={{flexDirection:'row',justifyContent:'space-between',gap:8}}>
     <Text style={{color:colors.sub}}>{a}</Text><Text style={{color:colors.ink,fontWeight:'700'}}>{b}</Text>
    </View>)}
   <View style={{height:1,backgroundColor:colors.divider}}/>
   <Text style={{fontSize:15,color:colors.sub,fontWeight:'700'}}>예시 청구 합계</Text>
   <Text style={{fontSize:27,fontWeight:'900',color:colors.ink}}>{formatKrw(quote.payableNowKrw)}</Text>
   <Body muted>{quote.disclaimer} · 견적 만료: {quote.quoteExpiresAt.slice(0,16)}</Body>
  </Panel>
  <Action label="렌탈 주문서 미리보기 (실제 결제 없음)" onPress={()=>router.push('/rental/checkout')}/></>:null}
 </Screen>;
}
