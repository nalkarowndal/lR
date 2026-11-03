import {useEffect,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useProductList} from '../../api/hooks';
import {DataSourceNotice,NetworkFeedback,LoadMore} from '../../components/NetworkFeedback';
import {colors} from '../../theme';
import {Screen,Panel,Action,Heading,Body,DemoNotice} from '../../components/ui';
import {ProductGrid} from '../../components/ProductGrid';
import {apiBaseUrl,apiEnabled} from '../../api/client';
import {createEditorialClient,defaultHomeEditorial,type EditorialCopy,type EditorialTarget} from '../../auth/editorial';
export default function Home(){
 const router=useRouter();
 const catalog=useProductList({channel:'RENTAL'});
 const [hero,setHero]=useState<EditorialCopy>(defaultHomeEditorial);
 const [editorialError,setEditorialError]=useState(false);
 useEffect(()=>{
  if(!apiEnabled()){setHero(defaultHomeEditorial);setEditorialError(false);return;}
  let live=true;
  const read=async()=>{
   try{
    const result=await createEditorialClient(apiBaseUrl()!).published();
    if(live){setHero(result.copy);setEditorialError(false);}
   }catch{
    if(live){setHero(defaultHomeEditorial);setEditorialError(true);}
   }
  };
  void read();
  return()=>{live=false};
 },[]);
 const heroTarget=(target:EditorialTarget)=>{
  switch(target){
   case 'RENTAL':return '/(tabs)/rental';
   case 'STORE':return '/(tabs)/store';
   case 'CARE':return '/(tabs)/care';
   case 'CONSIGNMENT':return '/my/consignment';
  }
 };
 const categories=[
  {label:'명품 렌탈',hint:'필요한 순간에 유연하게',bg:colors.rental,icon:'calendar-outline' as const,to:'/(tabs)/rental' as const},
  {label:'프리미엄 스토어',hint:'오래 간직할 선택',bg:colors.store,icon:'bag-handle-outline' as const,to:'/(tabs)/store' as const},
  {label:'내 상품 판매',hint:'위탁 접수 알아보기',bg:colors.sell,icon:'pricetag-outline' as const,to:'/my/consignment' as const},
  {label:'수선 · 복원',hint:'소중한 가치를 오래',bg:colors.care,icon:'construct-outline' as const,to:'/(tabs)/care' as const}
 ];
 return <Screen title="LUXURYRENTAL" subtitle="Premium Rental & Boutique" right={<Pressable accessibilityRole="button" accessibilityLabel="상품 검색" onPress={()=>router.push('/search')} style={{height:48,width:48,alignItems:'center',justifyContent:'center'}}><Ionicons name="search-outline" size={23} color={colors.ink}/></Pressable>}>
   <DemoNotice/><DataSourceNotice/>
   <View style={{backgroundColor:colors.ink,borderRadius:22,padding:25,gap:13,minHeight:190,justifyContent:'center'}}>
     <Text style={{color:'#D1D5DB',fontSize:11,fontWeight:'700',letterSpacing:3}}>{hero.eyebrow}</Text>
     <Text testID="home-editorial-headline" style={{color:colors.surface,fontSize:27,fontWeight:'800',lineHeight:38}}>{hero.headline}</Text>
     <Text style={{color:'#E5E7EB',fontSize:13,lineHeight:21}}>{hero.description}</Text>
     <Pressable accessibilityRole="button" accessibilityLabel={hero.ctaLabel}
      onPress={()=>router.push(heroTarget(hero.ctaTarget))}
      style={{alignSelf:'flex-start',backgroundColor:colors.surface,borderRadius:10,minHeight:44,
       paddingHorizontal:18,paddingVertical:12,justifyContent:'center'}}>
      <Text style={{color:colors.ink,fontWeight:'800',fontSize:13}}>{hero.ctaLabel}</Text>
     </Pressable>
   </View>
   {editorialError?<Text accessibilityRole="alert" style={{color:colors.sub,fontSize:12}}>에디토리얼 서버에 연결할 수 없어 기본 시연 문구를 표시합니다.</Text>:null}
   <Heading>어떤 서비스를 찾으세요?</Heading>
   <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>
     {categories.map(item=><Pressable key={item.label} accessibilityRole="button" onPress={()=>router.push(item.to)} style={({pressed})=>({backgroundColor:item.bg,width:'48%',minHeight:143,borderRadius:16,padding:16,gap:8,opacity:pressed ? 0.8 : 1})}>
       <Ionicons name={item.icon} size={28} color={colors.ink}/>
       <Text style={{fontWeight:'800',fontSize:17,color:colors.ink}}>{item.label}</Text>
       <Text style={{fontSize:12,lineHeight:18,color:colors.sub}}>{item.hint}</Text>
     </Pressable>)}
   </View>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Heading>이달의 셀렉션</Heading><Pressable accessibilityRole="button" onPress={()=>router.push('/search')} style={{padding:12}}><Text style={{color:colors.accent,fontWeight:'700'}}>전체 보기</Text></Pressable></View>
   <NetworkFeedback status={catalog.status} error={catalog.error} retry={catalog.retry}/>
   {catalog.status==='ready'?(catalog.items.length?<><ProductGrid items={catalog.items}/><LoadMore hasNext={catalog.hasNext} loading={catalog.loadingMore} onPress={catalog.loadMore}/></>:<Panel><Body muted>등록된 상품이 없습니다.</Body></Panel>):null}
   <Panel><Heading>이용 안내</Heading><Body muted>대여료·보증금·배송 조건은 최종 서버 견적을 기준으로 안내합니다. 현재 화면에서는 결제가 발생하지 않습니다.</Body><Action label="렌탈 이용 방식 보기" onPress={()=>router.push('/(tabs)/rental')} secondary/></Panel>
 </Screen>;
}
