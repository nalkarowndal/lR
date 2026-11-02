import {View,Text} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {findProduct} from '../../domain/catalog';
import {formatKrw,colors} from '../../theme';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,Badge,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {useAppState} from '../../state/AppState';
export default function ProductDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const router=useRouter();const product=findProduct(id);
 const {addToCart,toggleFavorite,favorites}=useAppState();
 if(!product)return <Screen title="상품을 확인할 수 없어요" right={<Back/>}><Action label="상품 목록으로" onPress={()=>router.replace('/(tabs)/store')}/></Screen>;
 return <Screen title="상품 상세" right={<Back/>}>
  <DemoNotice/><ProductVisual background={product.art}/>
  <Panel>
   <Badge label={'상태 등급 '+product.condition+' · 데모 상품'}/>
   <Text style={{fontSize:12,color:colors.sub,letterSpacing:2,fontWeight:'700'}}>{product.brand}</Text>
   <Heading>{product.title}</Heading><Body muted>실제 정품 감정·상태 확인 정보가 입력되기 전의 시연 제품입니다.</Body>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><Text style={{color:colors.sub}}>렌탈</Text><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.dayRateKrw)} / 일</Text></View>
   <View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><Text style={{color:colors.sub}}>구매</Text><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.salePriceKrw)}</Text></View>
   <View style={{height:1,backgroundColor:colors.divider}}/>
   <Action label="렌탈 기간 선택" onPress={()=>router.push({pathname:'/rental/availability/[id]',params:{id:product.id}})}/>
   <Action label="스토어 장바구니에 담기" onPress={()=>{addToCart(product.id);router.push('/store/checkout')}} secondary icon="bag-outline"/>
   <Action label={favorites.includes(product.id)?'찜 해제':'찜 추가'} onPress={()=>toggleFavorite(product.id)} secondary icon="heart-outline"/>
  </Panel>
  <Panel><Heading>이용 전 확인 사항</Heading><Body muted>최종 대여 가능 여부·견적·계약 조건은 서버 검증 후에만 확정됩니다. 현재는 실거래가 불가능합니다.</Body></Panel>
 </Screen>;
}
