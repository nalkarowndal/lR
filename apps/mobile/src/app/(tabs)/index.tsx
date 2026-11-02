import {Pressable,Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {products} from '../../domain/catalog';
import {colors} from '../../theme';
import {Screen,Panel,Action,Heading,Body,DemoNotice} from '../../components/ui';
import {ProductGrid} from '../../components/ProductGrid';
export default function Home(){
 const router=useRouter();
 const categories=[
  {label:'명품 렌탈',hint:'필요한 순간에 유연하게',bg:colors.rental,icon:'calendar-outline' as const,to:'/(tabs)/rental' as const},
  {label:'프리미엄 스토어',hint:'오래 간직할 선택',bg:colors.store,icon:'bag-handle-outline' as const,to:'/(tabs)/store' as const},
  {label:'내 상품 판매',hint:'위탁 접수 알아보기',bg:colors.sell,icon:'pricetag-outline' as const,to:'/my/consignment' as const},
  {label:'수선 · 복원',hint:'소중한 가치를 오래',bg:colors.care,icon:'construct-outline' as const,to:'/(tabs)/care' as const}
 ];
 return <Screen title="LUXURYRENTAL" subtitle="Premium Rental & Boutique" right={<Pressable accessibilityRole="button" accessibilityLabel="상품 검색" onPress={()=>router.push('/search')} style={{height:48,width:48,alignItems:'center',justifyContent:'center'}}><Ionicons name="search-outline" size={23} color={colors.ink}/></Pressable>}>
   <DemoNotice/>
   <View style={{backgroundColor:colors.ink,borderRadius:22,padding:25,gap:13,minHeight:190,justifyContent:'center'}}>
     <Text style={{color:'#D1D5DB',fontSize:11,fontWeight:'700',letterSpacing:3}}>CURATED FOR YOU</Text>
     <Text style={{color:colors.surface,fontSize:27,fontWeight:'800',lineHeight:38}}>오늘의 스타일,{'\n'}소유보다 자유롭게.</Text>
     <Text style={{color:'#E5E7EB',fontSize:13,lineHeight:21}}>다양한 명품을 둘러보고 나에게 맞는 이용 방식을 찾아보세요.</Text>
   </View>
   <Heading>어떤 서비스를 찾으세요?</Heading>
   <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>
     {categories.map(item=><Pressable key={item.label} accessibilityRole="button" onPress={()=>router.push(item.to)} style={({pressed})=>({backgroundColor:item.bg,width:'48%',minHeight:143,borderRadius:16,padding:16,gap:8,opacity:pressed ? 0.8 : 1})}>
       <Ionicons name={item.icon} size={28} color={colors.ink}/>
       <Text style={{fontWeight:'800',fontSize:17,color:colors.ink}}>{item.label}</Text>
       <Text style={{fontSize:12,lineHeight:18,color:colors.sub}}>{item.hint}</Text>
     </Pressable>)}
   </View>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Heading>이달의 셀렉션</Heading><Pressable accessibilityRole="button" onPress={()=>router.push('/search')} style={{padding:12}}><Text style={{color:colors.accent,fontWeight:'700'}}>전체 보기</Text></Pressable></View>
   <ProductGrid items={products.slice(0,4)}/>
   <Panel><Heading>이용 안내</Heading><Body muted>대여료·보증금·배송 조건은 최종 서버 견적을 기준으로 안내합니다. 현재 화면에서는 결제가 발생하지 않습니다.</Body><Action label="렌탈 이용 방식 보기" onPress={()=>router.push('/(tabs)/rental')} secondary/></Panel>
 </Screen>;
}
