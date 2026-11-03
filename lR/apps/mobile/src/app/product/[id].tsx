import {useEffect,useState} from 'react';
import {View,Text,Pressable,useWindowDimensions} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useProduct} from '../../api/hooks';
import {formatKrw,colors} from '../../theme';
import {ProductVisual} from '../../components/ProductCard';
import {Screen,Panel,Heading,Body,Action,Badge,DemoNotice} from '../../components/ui';
import {DataSourceNotice,NetworkFeedback} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
import {useAppState} from '../../state/AppState';
export default function ProductDetail(){
 const {id,channel}=useLocalSearchParams<{id:string;channel?:string}>();
 const router=useRouter();const {width}=useWindowDimensions();
 const resource=useProduct(id||'');const product=resource.data;
 const [mediaIndex,setMediaIndex]=useState(0);
 useEffect(()=>setMediaIndex(0),[id]);
 const {addToCart,toggleFavorite,favorites}=useAppState();
 const storeFirst=channel==='STORE';
 const rental=()=>product&&router.push({pathname:'/rental/availability/[id]',params:{id:product.id}});
 const store=()=>{if(product){addToCart(product.id);router.push('/store/checkout');}};
 return <Screen title="상품 상세" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  <NetworkFeedback status={resource.status} error={resource.error} retry={resource.retry}/>
  {resource.status==='ready'&&!product?<Panel><Heading>상품을 확인할 수 없어요</Heading>
   <Body muted>상품이 삭제되었거나 주소의 상품 ID가 올바르지 않을 수 있습니다.</Body>
   <Action label="상품 목록으로" onPress={()=>router.replace('/(tabs)/store')}/></Panel>:null}
  {product?<View style={{flexDirection:width>=768?'row':'column',gap:16,alignItems:'stretch'}}>
   <View style={{width:width>=768?'48%':'100%',gap:9}}>
    <ProductVisual background={product.art} product={product} mediaIndex={mediaIndex}/>
    {product.media&&product.media.length>1?<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
      {product.media.map((m,i)=><Pressable key={m.url} accessibilityRole="button"
       accessibilityLabel={'상품 이미지 '+(i+1)+': '+m.alt}
       accessibilityState={{selected:i===mediaIndex}}
       onPress={()=>setMediaIndex(i)}
       style={{minHeight:44,paddingHorizontal:12,paddingVertical:9,borderWidth:1,borderColor:i===mediaIndex?colors.ink:colors.divider,borderRadius:10,backgroundColor:colors.surface}}>
       <Text style={{fontSize:12,fontWeight:'700',color:colors.ink}}>이미지 {i+1}</Text>
      </Pressable>)}
     </View>:null}
    <Body muted>{product.demo&&product.media?.some(m=>m.alt.includes('AI 생성'))?
     'AI로 만든 가상 상품 이미지입니다. 실제 브랜드·제품·정품 사진이 아니며 상품 상태도 시연 데이터입니다.':
     product.media?.length?'제공된 이미지 · 실제 상품 상태는 별도 검수로 확인해야 합니다.':
     '현재 상품은 시연용 일러스트로 표시됩니다. 실제 상품 사진을 제공하지 않습니다.'}</Body>
   </View>
   <View style={{flex:1,gap:13}}>
    <Panel>
     <Badge label={'상태 '+product.condition+'등급'+(product.demo?' · 데모 상품':'')}/>
     <Text style={{fontSize:12,color:colors.sub,letterSpacing:1.2,fontWeight:'700'}}>{product.brand} · {product.category}</Text>
     <Heading>{product.title}</Heading>
     {product.channels.includes('RENTAL')?<View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}>
      <Body muted>렌탈 1일 요금</Body><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.dayRateKrw)}</Text>
     </View>:null}
     {product.channels.includes('STORE')?<View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}>
      <Body muted>스토어 예시 판매가</Body><Text style={{color:colors.ink,fontWeight:'800'}}>{formatKrw(product.salePriceKrw)}</Text>
     </View>:null}
     <View style={{height:1,backgroundColor:colors.divider}}/>
     <Body muted>상품 상태등급은 시연 데이터입니다. 구성품, 검수 사진과 실물 인증은 운영 검수 절차 확정 후 제공됩니다.</Body>
     {storeFirst&&product.channels.includes('STORE')?<Action label="스토어 시연 장바구니에 담기" onPress={store} icon="bag-outline"/>:null}
     {product.channels.includes('RENTAL')?<Action label="렌탈 기간 선택" onPress={rental} secondary={storeFirst}/>:null}
     {!storeFirst&&product.channels.includes('STORE')?<Action label="스토어 시연 장바구니에 담기" onPress={store} secondary icon="bag-outline"/>:null}
     <Action label={favorites.includes(product.id)?'찜 해제':'찜 추가'} onPress={()=>toggleFavorite(product.id)} secondary icon="heart-outline"/>
    </Panel>
    <Panel><Heading>이용 전 확인</Heading>
     <Body muted>현재 상품은 시연용입니다. 실제 재고 홀드, 예약·구매·결제 요청은 이 화면에서 발생하지 않습니다.</Body>
    </Panel>
   </View>
  </View>:null}
 </Screen>;
}
