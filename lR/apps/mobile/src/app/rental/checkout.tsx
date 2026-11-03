import {useRef,useState} from 'react';
import {Text,TextInput} from 'react-native';
import {useRouter} from 'expo-router';
import {useQuote,useProduct} from '../../api/hooks';
import {useAppState} from '../../state/AppState';
import type{DemoOutcome} from '../../domain/demo-rental';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
export default function RentalCheckout(){
 const router=useRouter();const {draft,recordDemoRental}=useAppState();
 const {data:product}=useProduct(draft?.productId||'');
 const resource=useQuote(draft);
 const [accepted,setAccepted]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const submitted=useRef(false);
 const quote=resource.data;
 const submit=(outcome:DemoOutcome)=>{
  if(!accepted||!quote||submitted.current)return;
  try{
   const reference=recordDemoRental(quote,product?.title||'렌탈 상품',outcome);
   submitted.current=true;
   router.replace({pathname:'/demo-result',params:{kind:'rental',reference}});
  }catch(e){setError(e instanceof Error?e.message:'견적을 다시 확인해 주세요.');}
 };
 return <Screen title="렌탈 주문서 미리보기" subtitle="대여 일정과 금액을 확인해 주세요" right={<Back/>}>
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
  <Panel>
   <Heading>결제 진행 방식 선택</Heading>
   <Body muted>실제 결제·주문·예약은 발생하지 않습니다. 아래 결과는 이 브라우저 화면에서만 보관되며 새로고침하면 사라집니다. 카드번호나 배송지 정보를 입력하지 마세요.</Body>
   <Action secondary label={accepted?'✓ 시연 조건을 확인했습니다':'시연 조건 확인'}
    onPress={()=>setAccepted(!accepted)} icon="checkmark-circle-outline"/>
   <Action label="모의 결제 성공 체험" disabled={!accepted} onPress={()=>submit('SUCCESS')}/>
   <Action secondary label="모의 결제 실패 체험" disabled={!accepted} onPress={()=>submit('FAILURE')}/>
   <Action secondary label="모의 결제 취소 체험" disabled={!accepted} onPress={()=>submit('CANCEL')}/>
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
  </Panel>
  <Body muted>실제 주문 생성·결제 승인 API를 호출하거나 재고를 확보하지 않습니다.</Body></>:null}
 </Screen>;
}
