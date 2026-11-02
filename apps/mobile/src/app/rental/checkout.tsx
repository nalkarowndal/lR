import {useState} from 'react';
import {Text,TextInput} from 'react-native';
import {useRouter} from 'expo-router';
import {useQuote,useProduct} from '../../api/hooks';
import {useAppState} from '../../state/AppState';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
export default function RentalCheckout(){
 const router=useRouter();const {draft}=useAppState();
 const {data:product}=useProduct(draft?.productId||'');
 const resource=useQuote(draft);
 const [accepted,setAccepted]=useState(false);
 const quote=resource.data;
 return <Screen title="렌탈 주문서 미리보기" subtitle="예약·결제 없는 시연 화면" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  {draft===null?<Panel><Heading>선택된 일정이 없습니다.</Heading>
   <Action label="렌탈 목록" onPress={()=>router.replace('/(tabs)/rental')}/></Panel>:null}
  {draft?<NetworkFeedback status={resource.status} error={resource.error} retry={resource.retry}/>:null}
  {quote?<><Panel>
   <Heading>{product?.title||'렌탈 상품'}</Heading>
   <Body>대여: {quote.startDate} → {quote.returnDate}</Body>
   <Body>반납 예정일: {quote.returnDate}</Body>
   <Body>대여료 {formatKrw(quote.rentalFeeKrw)} / 보증금 {formatKrw(quote.depositKrw)}</Body>
   <Text style={{fontSize:24,color:colors.ink,fontWeight:'900'}}>
    예시 합계 {formatKrw(quote.payableNowKrw)}
   </Text>
  </Panel>
  <Panel><Heading>배송지 정보</Heading>
   <Body muted>실제 개인정보를 수집하지 않습니다. 배송지 입력은 운영용 보안 API 이후 제공됩니다.</Body>
   <TextInput editable={false} placeholder="배송지 입력 — 서버 연동 전 비활성"
    accessibilityLabel="배송지 입력은 현재 비활성화됨"
    style={{borderWidth:1,borderColor:colors.divider,minHeight:54,paddingHorizontal:12,borderRadius:12}}/>
  </Panel>
  <Action secondary label={accepted?'✓ 시연 조건을 확인했습니다':'시연 조건 확인'}
   onPress={()=>setAccepted(!accepted)} icon="checkmark-circle-outline"/>
  <Action label="시연 완료 화면 보기 (결제 없음)" disabled={!accepted}
   onPress={()=>router.push({pathname:'/demo-result',params:{kind:'rental'}})}/>
  <Body muted>예약 생성, 재고 홀드, 실제 결제 요청은 전송하지 않습니다.</Body></>:null}
 </Screen>;
}
