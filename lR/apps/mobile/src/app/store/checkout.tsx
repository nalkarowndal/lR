import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useProductIds} from '../../api/hooks';
import {formatKrw,colors} from '../../theme';
import {useAppState} from '../../state/AppState';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
export default function StoreCheckout(){
 const router=useRouter();const{cart,removeCart,savedSyncStatus,savedSyncError,retrySavedSync}=useAppState();
 const loaded=useProductIds(cart);
 const selected=(loaded.data||[]).filter(x=>x.channels.includes('STORE'));
 const total=selected.reduce((sum,item)=>sum+item.salePriceKrw,0);
 return <Screen title="구매 주문서" subtitle="명품 스토어 · 장바구니 시연" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  {savedSyncStatus==='loading'?<Body muted>저장된 장바구니를 확인하는 중입니다.</Body>:null}
  {savedSyncError?<Panel><Body muted>{savedSyncError}</Body><Action label="장바구니 다시 불러오기" onPress={retrySavedSync}/></Panel>:null}
  <NetworkFeedback status={loaded.status} error={loaded.error} retry={loaded.retry}/>
  {loaded.status==='ready'&&!cart.length?<Panel>
   <Ionicons name="bag-handle-outline" size={44} color={colors.sub}/>
   <Heading>장바구니가 비어 있어요</Heading>
   <Body muted>스토어에서 원하는 상품을 선택해 주세요.</Body>
   <Action label="스토어로 가기" onPress={()=>router.replace('/(tabs)/store')}/></Panel>:null}
  {loaded.status==='ready'&&cart.length>0&&selected.length===0?<Panel>
   <Body muted>구매 가능한 상품을 찾지 못했습니다. 스토어 목록을 다시 확인해 주세요.</Body>
   <Action label="스토어로 돌아가기" onPress={()=>router.replace('/(tabs)/store')}/></Panel>:null}
  {loaded.status==='ready'?selected.map(item=><Panel key={item.id}>
    <View style={{flexDirection:'row',gap:14,alignItems:'center'}}>
     <View style={{width:105}}><ProductVisual background={item.art} product={item} small/></View>
     <View style={{flex:1,gap:7}}>
      <Text style={{fontSize:12,color:colors.sub}}>{item.brand}</Text>
      <Text style={{color:colors.ink,fontWeight:'700',fontSize:15}}>{item.title}</Text>
      <Text style={{fontWeight:'800',color:colors.ink}}>{formatKrw(item.salePriceKrw)}</Text>
     </View>
    </View>
    <Action label="장바구니에서 빼기" secondary icon="trash-outline" onPress={()=>removeCart(item.id)}/>
   </Panel>):null}
  {loaded.status==='ready'&&selected.length>0?<Panel>
   <Heading>구매 금액 요약</Heading>
   <View style={{flexDirection:'row',justifyContent:'space-between'}}><Body>상품 합계</Body>
    <Text style={{fontWeight:'700',color:colors.ink}}>{formatKrw(total)}</Text></View>
   <View style={{height:1,backgroundColor:colors.divider}}/>
   <Text style={{fontSize:14,fontWeight:'700',color:colors.sub}}>예시 금액 합계</Text>
   <Text style={{fontSize:28,color:colors.ink,fontWeight:'900'}}>{formatKrw(total)}</Text>
   <Body muted>이 화면은 주문서를 서버에 전송하지 않으며, 재고를 판매 처리하거나 금액을 청구하지 않습니다.</Body>
   <Action label="구매 시연 완료 화면 (결제 없음)"
    onPress={()=>router.push({pathname:'/demo-result',params:{kind:'store'}})}/>
  </Panel>:null}
 </Screen>;
}
