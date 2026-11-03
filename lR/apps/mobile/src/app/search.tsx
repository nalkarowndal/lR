import {useEffect,useMemo,useState} from 'react';
import {Text,TextInput,View,Pressable,ScrollView} from 'react-native';
import type{Channel} from '../domain/catalog';
import {filterVisibleProducts,visibleCategories,type SortMode} from '../domain/discovery';
import {useProductList} from '../api/hooks';
import {colors} from '../theme';
import {Screen,DemoNotice,Heading,Body,Action} from '../components/ui';
import {Back} from '../components/Back';
import {ProductGrid} from '../components/ProductGrid';
import {DataSourceNotice,NetworkFeedback,LoadMore} from '../components/NetworkFeedback';
const Chip=({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void})=>
 <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected}}
  onPress={onPress} style={{minHeight:44,justifyContent:'center',paddingHorizontal:14,borderRadius:11,
   borderWidth:1,borderColor:selected?colors.ink:colors.divider,
   backgroundColor:selected?colors.ink:colors.surface}}>
  <Text style={{fontSize:13,fontWeight:'700',color:selected?colors.surface:colors.ink}}>{label}</Text>
 </Pressable>;
export default function Search(){
 const [query,setQuery]=useState('');
 const [debounced,setDebounced]=useState('');
 const [channel,setChannel]=useState<Channel>('RENTAL');
 const [category,setCategory]=useState('ALL');
 const [grade,setGrade]=useState('ALL');
 const [sort,setSort]=useState<SortMode>('RECOMMENDED');
 useEffect(()=>{const timer=setTimeout(()=>setDebounced(query),300);return()=>clearTimeout(timer)},[query]);
 const catalog=useProductList({q:debounced,channel});
 const categories=useMemo(()=>visibleCategories(catalog.items),[catalog.items]);
 const filtered=useMemo(()=>filterVisibleProducts(catalog.items,{channel,category,condition:grade,sort}),
  [catalog.items,channel,category,grade,sort]);
 const updateChannel=(next:Channel)=>{setChannel(next);setCategory('ALL');setGrade('ALL');setSort('RECOMMENDED');};
 return <Screen title="상품 검색" subtitle="브랜드 · 상품명 · 카테고리를 검색하세요" right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  <TextInput value={query} onChangeText={v=>{setQuery(v);setCategory('ALL');setGrade('ALL')}} placeholder="검색어를 입력하세요"
   accessibilityLabel="상품 검색어" clearButtonMode="while-editing"
   style={{minHeight:54,backgroundColor:colors.surface,borderRadius:12,borderWidth:1,
    borderColor:colors.border,paddingHorizontal:14,fontSize:16,color:colors.ink}}/>
  <View style={{flexDirection:'row',gap:8}}>
   {(['RENTAL','STORE'] as const).map(item=><Chip key={item} label={item==='RENTAL'?'렌탈':'구매'}
    selected={channel===item} onPress={()=>updateChannel(item)}/>)}
  </View>
  <View style={{gap:9}}>
   <Text style={{color:colors.ink,fontWeight:'800'}}>카테고리</Text>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingBottom:2}}>
    <Chip label="전체 카테고리" selected={category==='ALL'} onPress={()=>setCategory('ALL')}/>
    {categories.map(item=><Chip key={item} label={item} selected={category===item} onPress={()=>setCategory(item)}/>)}
   </ScrollView>
   <Text style={{color:colors.ink,fontWeight:'800'}}>상품 상태</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    <Chip label="모든 등급" selected={grade==='ALL'} onPress={()=>setGrade('ALL')}/>
    {['S','A','B'].map(g=><Chip key={g} label={g+'등급'} selected={grade===g} onPress={()=>setGrade(g)}/>)}
   </View>
   <Text style={{color:colors.ink,fontWeight:'800'}}>표시된 상품 정렬</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
    <Chip label="기본 순서" selected={sort==='RECOMMENDED'} onPress={()=>setSort('RECOMMENDED')}/>
    <Chip label="가격 낮은 순" selected={sort==='PRICE_ASC'} onPress={()=>setSort('PRICE_ASC')}/>
    <Chip label="가격 높은 순" selected={sort==='PRICE_DESC'} onPress={()=>setSort('PRICE_DESC')}/>
   </View>
   <Body muted>필터와 가격 정렬은 현재 불러온 상품에만 적용됩니다. 전체 서버 상품을 정렬하는 기능은 아직 제공하지 않습니다.</Body>
  </View>
  <Heading>검색 결과 {catalog.status==='ready'?filtered.length+'개'+(catalog.hasNext?' · 추가 상품 있음':''):'확인 중'}</Heading>
  <NetworkFeedback status={catalog.status} error={catalog.error} retry={catalog.retry}/>
  {catalog.status==='ready'?(filtered.length?<><ProductGrid items={filtered} channel={channel}/>
   <LoadMore hasNext={catalog.hasNext} loading={catalog.loadingMore} onPress={catalog.loadMore}/></>:
   <View style={{gap:12,backgroundColor:colors.surface,padding:22,borderRadius:16}}>
    <Body muted>검색 조건에 맞는 상품이 없습니다. 검색어 또는 필터를 변경해 주세요.</Body>
    <Action label="검색어·필터 초기화" secondary onPress={()=>{
     setQuery('');setDebounced('');setCategory('ALL');setGrade('ALL');setSort('RECOMMENDED');
    }}/>
   </View>):null}
 </Screen>;
}
