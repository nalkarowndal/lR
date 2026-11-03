import {useRef,useState} from 'react';
import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useProductIds} from '../../api/hooks';
import {apiEnabled} from '../../api/client';
import {formatKrw,colors} from '../../theme';
import {useAppState} from '../../state/AppState';
import {useDemoSession} from '../../auth/SessionProvider';
import {createIntakeRequestKey} from '../../auth/experience-orders';
import type{StoreOrderInput,StorePaymentMethod,StoreDeliveryMethod} from '../../auth/store-orders';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';

export default function StoreCheckout(){
 const router=useRouter(),session=useDemoSession(),online=apiEnabled();
 const {cart,removeCart,savedSyncStatus,savedSyncError,retrySavedSync}=useAppState();
 const loaded=useProductIds(cart);
 const selected=(loaded.data||[]).filter(x=>x.channels.includes('STORE'));
 const total=selected.reduce((sum,item)=>sum+item.salePriceKrw,0);
 const [paymentMethod,setPaymentMethod]=useState<StorePaymentMethod>('CARD');
 const [deliveryMethod,setDeliveryMethod]=useState<StoreDeliveryMethod>('COURIER');
 const [accepted,setAccepted]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const submitting=useRef(false),intent=useRef<{signature:string;key:string}|null>(null);
 const available=loaded.status==='ready'&&savedSyncStatus==='ready'&&
  selected.length>0&&selected.length===cart.length&&selected.length<=10;
 const submit=async()=>{
  if(!online||session.status!=='signed-in'||!accepted||!available||busy||submitting.current)return;
  const payload:StoreOrderInput={
   productIds:selected.map(p=>p.id),
   paymentMethod,deliveryMethod,
   deliveryPreset:deliveryMethod==='COURIER'?'SAMPLE_SEOUL':'SHOWROOM'
  };
  const signature=JSON.stringify(payload);
  if(intent.current?.signature!==signature)
   intent.current={signature,key:createIntakeRequestKey()};
  submitting.current=true;setBusy(true);setError(null);
  try{
   const saved=await session.createStoreOrder(payload,intent.current.key);
   router.replace({pathname:'/store-order-result',params:{orderId:saved.orderId}});
  }catch(e){
   submitting.current=false;
   setError(e instanceof Error?e.message:'주문이 접수되지 않았습니다. 내역을 확인해 주세요.');
  }finally{setBusy(false);}
 };
 return <Screen title="구매 주문서" subtitle="명품 스토어 · 주문 정보 확인" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  {savedSyncStatus==='loading'?<Body muted>저장된 장바구니를 확인하는 중입니다.</Body>:null}
  {savedSyncError?<Panel><Body muted>{savedSyncError}</Body>
   <Action label="장바구니 다시 불러오기" onPress={retrySavedSync}/></Panel>:null}
  <NetworkFeedback status={loaded.status} error={loaded.error} retry={loaded.retry}/>
  {loaded.status==='ready'&&!cart.length?<Panel>
   <Ionicons name="bag-handle-outline" size={44} color={colors.sub}/>
   <Heading>장바구니가 비어 있어요</Heading>
   <Body muted>스토어에서 원하는 상품을 선택해 주세요.</Body>
   <Action label="스토어로 가기" onPress={()=>router.replace('/(tabs)/store')}/>
  </Panel>:null}
  {loaded.status==='ready'&&cart.length>0&&selected.length===0?<Panel>
   <Body muted>구매 가능한 상품을 찾지 못했습니다. 스토어 목록을 다시 확인해 주세요.</Body>
   <Action label="스토어로 돌아가기" onPress={()=>router.replace('/(tabs)/store')}/>
  </Panel>:null}
  {loaded.status==='ready'?selected.map(item=><Panel key={item.id}>
   <View style={{flexDirection:'row',gap:14,alignItems:'center'}}>
    <View style={{width:105}}><ProductVisual background={item.art} product={item} small/></View>
    <View style={{flex:1,gap:7}}>
     <Text style={{fontSize:12,color:colors.sub}}>{item.brand}</Text>
     <Text style={{color:colors.ink,fontWeight:'700',fontSize:15}}>{item.title}</Text>
     <Text style={{fontWeight:'800',color:colors.ink}}>{formatKrw(item.salePriceKrw)}</Text>
    </View>
   </View>
   <Action label="장바구니에서 빼기" secondary icon="trash-outline"
    disabled={busy} onPress={()=>{setAccepted(false);removeCart(item.id);}}/>
  </Panel>):null}
  {loaded.status==='ready'&&selected.length>0?<Panel>
   <Heading>구매 금액 요약</Heading>
   <View style={{flexDirection:'row',justifyContent:'space-between'}}>
    <Body>상품 합계 ({selected.length}개)</Body>
    <Text style={{fontWeight:'700',color:colors.ink}}>{formatKrw(total)}</Text>
   </View>
   <View style={{height:1,backgroundColor:colors.divider}}/>
   <Text style={{fontSize:14,fontWeight:'700',color:colors.sub}}>예시 금액 합계</Text>
   <Text style={{fontSize:28,color:colors.ink,fontWeight:'900'}}>{formatKrw(total)}</Text>
   {online?<Body muted>서버 접수 시 상품별 가격과 가용 여부를 다시 검증합니다. 품절되거나 선택할 수 없는 상품이 하나라도 있으면 전체 접수를 중단합니다. 최대 10개 상품까지 접수할 수 있습니다.</Body>:
    <Body muted>이 화면은 주문서를 서버에 전송하지 않으며, 재고를 판매 처리하거나 금액을 청구하지 않습니다.</Body>}
   {online?<>
    <Heading>결제 방법 선택</Heading>
    <Body muted>결제 방법만 선택합니다. 카드·계좌번호는 입력하지 않으며 승인·청구·이체는 일어나지 않습니다.</Body>
    <Action secondary label={paymentMethod==='CARD'?'✓ 신용·체크카드':'신용·체크카드'}
     onPress={()=>{setPaymentMethod('CARD');setAccepted(false)}}/>
    <Action secondary label={paymentMethod==='EASY_PAY'?'✓ 간편결제':'간편결제'}
     onPress={()=>{setPaymentMethod('EASY_PAY');setAccepted(false)}}/>
    <Action secondary label={paymentMethod==='TRANSFER'?'✓ 계좌이체':'계좌이체'}
     onPress={()=>{setPaymentMethod('TRANSFER');setAccepted(false)}}/>
    <Heading>수령 방법 선택</Heading>
    <Action secondary label={deliveryMethod==='COURIER'?'✓ 택배 수령':'택배 수령'}
     onPress={()=>{setDeliveryMethod('COURIER');setAccepted(false)}}/>
    <Action secondary label={deliveryMethod==='PICKUP'?'✓ 매장 방문 수령':'매장 방문 수령'}
     onPress={()=>{setDeliveryMethod('PICKUP');setAccepted(false)}}/>
    <Body muted>{deliveryMethod==='COURIER'?'가상 샘플 배송지 선택 (실제 주소 입력 없음)':'가상 쇼룸 방문 선택 (실제 예약 없음)'}</Body>
    <Body muted>주문 접수 후 내 스토어 주문 내역에 서버 기록이 남습니다. 실제 결제·재고 판매 확정·배송은 일어나지 않습니다.</Body>
    {session.status==='signed-in'?<>
     <Action secondary label={accepted?'✓ 접수 조건 확인됨':'접수 조건 확인'}
      onPress={()=>setAccepted(!accepted)}/>
     <Action label="스토어 주문 접수" loading={busy} disabled={!accepted||!available}
      onPress={()=>{void submit()}}/>
    </>:<Action label="로그인하고 주문 접수" onPress={()=>router.push('/my/login')}/>}
    {selected.length>10?<Body muted>주문당 10개 상품을 초과했습니다. 장바구니에서 상품을 줄여 주세요.</Body>:null}
    {error?<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>:null}
   </>:<Action label="구매 시연 완료 화면 (결제 없음)"
    onPress={()=>router.push({pathname:'/demo-result',params:{kind:'store'}})}/>}
  </Panel>:null}
 </Screen>;
}
