import {View,Text,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useProductList} from '../../api/hooks';
import {DataSourceNotice,NetworkFeedback,LoadMore} from '../../components/NetworkFeedback';
import {useAppState} from '../../state/AppState';
import {colors} from '../../theme';
import {Screen,DemoNotice,Heading,Body,Action} from '../../components/ui';
import {ProductGrid} from '../../components/ProductGrid';
export default function Store(){
 const router=useRouter();const{cart}=useAppState();
 const catalog=useProductList({channel:'STORE'});
 return <Screen title="스토어" subtitle="소중한 취향을 소유하는 방법" right={<Pressable accessibilityRole="button" accessibilityLabel={'장바구니 '+cart.length+'개'} onPress={()=>router.push('/store/checkout')} style={{height:48,width:48,alignItems:'center',justifyContent:'center'}}><Ionicons name="bag-outline" size={23} color={colors.ink}/>{cart.length>0?<View style={{position:'absolute',right:2,top:0,backgroundColor:colors.accent,borderRadius:8,paddingHorizontal:5}}><Text style={{color:'white',fontSize:10}}>{cart.length}</Text></View>:null}</Pressable>}>
  <DemoNotice/><DataSourceNotice/>
  <View style={{backgroundColor:colors.store,padding:18,borderRadius:16,gap:8}}>
    <Text style={{fontSize:12,color:colors.sub,fontWeight:'700'}}>THE BOUTIQUE</Text><Heading>오래 함께할 컬렉션</Heading><Body>제품의 상태와 가격을 확인한 후 구매를 선택해 보세요.</Body>
  </View>
  <Action label={'장바구니 보기 ('+cart.length+')'} onPress={()=>router.push('/store/checkout')} secondary icon="bag-outline"/>
  <Heading>스토어 상품</Heading><NetworkFeedback status={catalog.status} error={catalog.error} retry={catalog.retry}/>
  {catalog.status==="ready"?(catalog.items.length?<><ProductGrid items={catalog.items} channel="STORE"/><LoadMore hasNext={catalog.hasNext} loading={catalog.loadingMore} onPress={catalog.loadMore}/></>:<Body muted>스토어에 등록된 상품이 없습니다.</Body>):null}
 </Screen>;
}
