import {View,Text} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useProduct} from '../../api/hooks';
import {formatKrw,colors} from '../../theme';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,Badge,DemoNotice} from '../../components/ui';
import {DataSourceNotice,NetworkFeedback} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
import {useAppState} from '../../state/AppState';
export default function ProductDetail(){
 const {id}=useLocalSearchParams<{id:string}>();
 const router=useRouter();
 const resource=useProduct(id||'');
 const product=resource.data;
 const {addToCart,toggleFavorite,favorites}=useAppState();
 return <Screen title="상품 상세" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  <NetworkFeedback status={resource.status} error={resource.error} retry={resource.retry}/>
  {resource.status==='ready'&&!product?<Panel><Heading>상품을 확인할 수 없어요</Heading>
   <Action label="상품 목록으로" onPress={()=>router.replace('/(tabs)/store')}/></Panel>:null}
  {product?<><ProductVisual background={product.art}/>
   <Panel>
    <Badge label={'상태 등급 '+product.condition+(product.demo?' · 데모 상품':'')}/>
    <Text style={{fontSize:12,color:colors.sub,letterSpacing:2,fontWeight:'700'}}>{product.brand}</Text>
    <Heading>{product.title}</Heading>
    <Body muted>제품 외관 이미지는 시연용 아이콘입니다. 실제 상품 상태는 판매처의 검수 정보가 필요합니다.</Body>
    {product.channels.includes('RENTAL')?<View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}>
     <Text style={{color:colors.sub}}>렌탈</Text><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.dayRateKrw)} / 일</Text></View>:null}
    {product.channels.includes('STORE')?<View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}>
     <Text style={{color:colors.sub}}>구매</Text><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.salePriceKrw)}</Text></View>:null}
    <View style={{height:1,backgroundColor:colors.divider}}/>
    {product.channels.includes('RENTAL')?<Action label="렌탈 기간 선택" onPress={()=>router.push({pathname:'/rental/availability/[id]',params:{id:product.id}})}/>:null}
    {product.channels.includes('STORE')?<Action label="스토어 시연 장바구니에 담기"
      onPress={()=>{addToCart(product.id);router.push('/store/checkout')}} secondary icon="bag-outline"/>:null}
    <Action label={favorites.includes(product.id)?'찜 해제':'찜 추가'} onPress={()=>toggleFavorite(product.id)} secondary icon="heart-outline"/>
   </Panel>
   <Panel><Heading>이용 전 확인</Heading><Body muted>최종 가능 여부·계약·결제는 서버 정책 검증 후에만 확정됩니다. 지금은 실거래가 불가능합니다.</Body></Panel></>:null}
 </Screen>;
}
