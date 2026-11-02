import {Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {products} from '../../domain/catalog';
import {formatKrw,colors} from '../../theme';
import {useAppState} from '../../state/AppState';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
export default function StoreCheckout(){
 const router=useRouter();const{cart,removeCart}=useAppState();const selected=products.filter(x=>cart.includes(x.id));const total=selected.reduce((sum,item)=>sum+item.salePriceKrw,0);
 return <Screen title="구매 주문서" subtitle="명품 스토어 · 장바구니 시연" right={<Back/>}>
   <DemoNotice/>
   {selected.length? selected.map(item=><Panel key={item.id}>
     <View style={{flexDirection:'row',gap:14,alignItems:'center'}}>
       <View style={{width:105}}><ProductVisual background={item.art} small/></View>
       <View style={{flex:1,gap:7}}><Text style={{fontSize:12,color:colors.sub}}>{item.brand}</Text><Text style={{color:colors.ink,fontWeight:'700',fontSize:15}}>{item.title}</Text><Text style={{fontWeight:'800',color:colors.ink}}>{formatKrw(item.salePriceKrw)}</Text></View>
     </View>
     <Action label="장바구니에서 빼기" secondary icon="trash-outline" onPress={()=>removeCart(item.id)}/>
   </Panel>):<Panel><Ionicons name="bag-handle-outline" size={44} color={colors.sub}/><Heading>장바구니가 비어 있어요</Heading><Body muted>스토어에서 원하는 상품을 선택해 주세요.</Body><Action label="스토어로 가기" onPress={()=>router.replace('/(tabs)/store')}/></Panel>}
   {selected.length?<Panel>
     <Heading>주문 금액 요약</Heading>
     <View style={{flexDirection:'row',justifyContent:'space-between'}}><Body>상품 합계</Body><Text style={{fontWeight:'700',color:colors.ink}}>{formatKrw(total)}</Text></View>
     <View style={{height:1,backgroundColor:colors.divider}}/>
     <Text style={{fontSize:14,fontWeight:'700',color:colors.sub}}>예시 결제 합계</Text>
     <Text style={{fontSize:28,color:colors.ink,fontWeight:'900'}}>{formatKrw(total)}</Text>
     <Body muted>결제 실패 시 이 주문서와 장바구니로 복귀하도록 설계했습니다. 실제 배송지·결제는 수집하거나 전송하지 않습니다.</Body>
     <Action label="구매 시연 결과 보기 (결제 없음)" onPress={()=>router.push({pathname:'/demo-result',params:{kind:'store'}})}/>
   </Panel>:null}
 </Screen>;
}
