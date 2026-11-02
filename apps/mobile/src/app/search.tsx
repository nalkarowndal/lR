import {useEffect,useState} from 'react';
import {Text,TextInput,View,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import type{Channel} from '../domain/catalog';
import {useProductList} from '../api/hooks';
import {colors} from '../theme';
import {Screen,DemoNotice,Heading,Body,Action} from '../components/ui';
import {Back} from '../components/Back';
import {ProductGrid} from '../components/ProductGrid';
import {DataSourceNotice,NetworkFeedback,LoadMore} from '../components/NetworkFeedback';
export default function Search(){
 const [query,setQuery]=useState('');
 const [debounced,setDebounced]=useState('');
 const [channel,setChannel]=useState<Channel>('RENTAL');
 const router=useRouter();
 useEffect(()=>{const timer=setTimeout(()=>setDebounced(query),300);return()=>clearTimeout(timer)},[query]);
 const catalog=useProductList({q:debounced,channel});
 return <Screen title="상품 검색" subtitle="브랜드 · 이름 · 카테고리로 찾아보세요" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  <TextInput value={query} onChangeText={setQuery} placeholder="검색어를 입력하세요"
   accessibilityLabel="상품 검색어" autoFocus={false} clearButtonMode="while-editing"
   style={{minHeight:54,backgroundColor:colors.surface,borderRadius:12,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,fontSize:16,color:colors.ink}}/>
  <View style={{flexDirection:'row',gap:8}}>{(['RENTAL','STORE'] as const).map(item=>
   <Pressable key={item} accessibilityRole="button" accessibilityState={{selected:channel===item}} onPress={()=>setChannel(item)}
    style={{paddingVertical:13,paddingHorizontal:22,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:channel===item?colors.ink:colors.surface}}>
    <Text style={{color:channel===item?colors.surface:colors.ink,fontWeight:'700'}}>{item==='RENTAL'?'렌탈':'구매'}</Text>
   </Pressable>)}</View>
  <Heading>검색 결과 {catalog.status==='ready'?catalog.items.length+'개'+(catalog.hasNext?' 이상':''):'확인 중'}</Heading>
  <NetworkFeedback status={catalog.status} error={catalog.error} retry={catalog.retry}/>
  {catalog.status==='ready'?(catalog.items.length?<><ProductGrid items={catalog.items} channel={channel}/>
   <LoadMore hasNext={catalog.hasNext} loading={catalog.loadingMore} onPress={catalog.loadMore}/></>:
   <View style={{gap:12,backgroundColor:colors.surface,padding:22,borderRadius:16}}>
    <Body muted>검색 결과가 없습니다. 검색어를 다시 확인해 주세요.</Body>
    <Action label="검색어 지우기" onPress={()=>{setQuery('');setDebounced('')}} secondary/>
   </View>):null}
 </Screen>;
}
