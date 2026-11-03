import {useRef,useState} from 'react';
import {Text,TextInput} from 'react-native';
import {useRouter} from 'expo-router';
import {useQuote,useProduct} from '../../api/hooks';
import {apiEnabled} from '../../api/client';
import {useAppState} from '../../state/AppState';
import {useDemoSession} from '../../auth/SessionProvider';
import {createIntakeRequestKey,type PaymentMethod,type DeliveryMethod,type ExperienceOrderInput} from '../../auth/experience-orders';
import type{DemoOutcome} from '../../domain/demo-rental';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';

export default function RentalCheckout(){
 const router=useRouter(),session=useDemoSession(),connected=apiEnabled();
 const {draft,recordDemoRental}=useAppState();
 const {data:product}=useProduct(draft?.productId||'');
 const resource=useQuote(draft);
 const [accepted,setAccepted]=useState(false);
 const [paymentMethod,setPaymentMethod]=useState<PaymentMethod>('CARD');
 const [deliveryMethod,setDeliveryMethod]=useState<DeliveryMethod>('COURIER');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const submitted=useRef(false);
 const intentRef=useRef<{signature:string;key:string}|null>(null);
 const quote=resource.data;
 const submitOffline=(outcome:DemoOutcome)=>{
  if(!accepted||!quote||submitted.current)return;
  try{
   const reference=recordDemoRental(quote,product?.title||'렌탈 상품',outcome);
   submitted.current=true;
   router.replace({pathname:'/demo-result',params:{kind:'rental',reference}});
  }catch(e){setError(e instanceof Error?e.message:'견적을 다시 확인해 주세요.');}
 };
 const submitOrder=async()=>{
  if(!connected||!quote||!accepted||busy||submitted.current||session.status!=='signed-in')return;
  const input:ExperienceOrderInput={
   productId:quote.productId,startDate:quote.startDate,returnDate:quote.returnDate,
   paymentMethod,deliveryMethod,
   deliveryPreset:deliveryMethod==='COURIER'?'SAMPLE_SEOUL':'SHOWROOM'
  };
  const signature=JSON.stringify(input);
  if(intentRef.current?.signature!==signature)
   intentRef.current={signature,key:createIntakeRequestKey()};
  submitted.current=true;setBusy(true);setError(null);
  try{
   const saved=await session.createExperienceOrder(input,intentRef.current.key);
   router.replace({pathname:'/experience-order-result',params:{orderId:saved.orderId}});
  }catch(e){
   submitted.current=false;
   setError(e instanceof Error?e.message:'주문 접수에 실패했습니다. 주문 내역을 확인해 주세요.');
  }finally{setBusy(false);}
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
  {connected?<><Panel>
   <Heading>결제 방법</Heading>
   <Body muted>결제 방법을 선택해 주문을 접수합니다. 실제 승인·이체·청구는 진행하지 않으며 카드정보를 입력하지 않습니다.</Body>
   <Action secondary label={paymentMethod==='CARD'?'✓ 신용·체크카드':'신용·체크카드'} onPress={()=>{setPaymentMethod('CARD');setAccepted(false)}}/>
   <Action secondary label={paymentMethod==='EASY_PAY'?'✓ 간편결제':'간편결제'} onPress={()=>{setPaymentMethod('EASY_PAY');setAccepted(false)}}/>
   <Action secondary label={paymentMethod==='TRANSFER'?'✓ 계좌이체':'계좌이체'} onPress={()=>{setPaymentMethod('TRANSFER');setAccepted(false)}}/>
  </Panel>
  <Panel>
   <Heading>수령 방법</Heading>
   <Action secondary label={deliveryMethod==='COURIER'?'✓ 택배 수령':'택배 수령'} onPress={()=>{setDeliveryMethod('COURIER');setAccepted(false)}}/>
   <Action secondary label={deliveryMethod==='PICKUP'?'✓ 매장 방문 수령':'매장 방문 수령'} onPress={()=>{setDeliveryMethod('PICKUP');setAccepted(false)}}/>
   <Body muted>{deliveryMethod==='COURIER'?'예시 수령지: 서울 샘플 주소 (실제 주소 입력·배송 없음)':'예시 수령지: 쇼룸 방문 (실제 방문 예약 없음)'}</Body>
   <TextInput editable={false} placeholder="실제 개인정보를 입력하지 않습니다"
    accessibilityLabel="예시 수령지 안내 — 개인정보 입력 없음"
    style={{borderWidth:1,borderColor:colors.divider,minHeight:54,paddingHorizontal:12,borderRadius:12}}/>
  </Panel>
  <Panel>
   <Heading>주문 확인</Heading>
   <Body muted>주문을 접수하면 내 주문 내역에 저장됩니다. 다만 포트폴리오 체험 주문이며 실제 결제·재고 예약 확정·배송은 발생하지 않습니다.</Body>
   {session.status!=='signed-in'?<>
    <Body muted>서버에 주문을 저장하려면 테스트 계정으로 로그인해 주세요.</Body>
    <Action label="로그인하고 주문 접수" onPress={()=>router.push('/my/login')}/>
   </>:<>
    <Action secondary label={accepted?'✓ 주문 조건을 확인했습니다':'주문 조건 확인'}
      onPress={()=>setAccepted(!accepted)}/>
    <Action label="주문 접수" disabled={!accepted||resource.status!=='ready'} loading={busy}
      onPress={()=>{void submitOrder()}}/>
   </>}
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
  </Panel></>:<>
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
   <Action label="모의 결제 성공 체험" disabled={!accepted} onPress={()=>submitOffline('SUCCESS')}/>
   <Action secondary label="모의 결제 실패 체험" disabled={!accepted} onPress={()=>submitOffline('FAILURE')}/>
   <Action secondary label="모의 결제 취소 체험" disabled={!accepted} onPress={()=>submitOffline('CANCEL')}/>
   {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
  </Panel>
  <Body muted>실제 주문 생성·결제 승인 API를 호출하거나 재고를 확보하지 않습니다.</Body>
  </>}</>:null}
 </Screen>;
}
