import {View,Text,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {products} from '../../domain/catalog';
import {colors} from '../../theme';
import {Screen,DemoNotice,Heading,Body} from '../../components/ui';
import {ProductGrid} from '../../components/ProductGrid';
export default function Rental(){
 const router=useRouter();
 return <Screen title="렌탈" subtitle="필요한 기간만, 나에게 맞는 명품을">
   <DemoNotice/>
   <View style={{backgroundColor:colors.rental,padding:18,borderRadius:16,gap:8}}>
    <Text style={{fontSize:12,fontWeight:'700',color:colors.sub}}>LUXURY RENTAL</Text><Heading>렌탈 컬렉션</Heading><Body>상품을 선택하고 반납 예정일까지 지정해 견적을 확인해 보세요.</Body>
   </View>
   <Pressable accessibilityRole="button" onPress={()=>router.push('/search')} style={{backgroundColor:colors.surface,borderRadius:12,padding:16,borderWidth:1,borderColor:colors.divider}}>
     <Text style={{color:colors.sub}}>⌕  브랜드·상품 검색하기</Text>
   </Pressable>
   <Heading>추천 렌탈</Heading>
   <ProductGrid items={products} channel="RENTAL"/>
 </Screen>;
}
