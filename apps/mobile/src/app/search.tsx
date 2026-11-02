import {useMemo,useState} from 'react';
import {Text,TextInput,View,Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {products} from '../domain/catalog';
import {colors} from '../theme';
import {Screen,DemoNotice,Heading,Body,Action} from '../components/ui';
import {Back} from '../components/Back';
import {ProductGrid} from '../components/ProductGrid';
export default function Search(){
 const[query,setQuery]=useState('');const[channel,setChannel]=useState<'RENTAL'|'STORE'>('RENTAL');const router=useRouter();
 const filtered=useMemo(()=>products.filter(p=>(p.title+' '+p.brand+' '+p.category).toLowerCase().includes(query.trim().toLowerCase())&&p.channels.includes(channel)),[query,channel]);
 return <Screen title="상품 검색" subtitle="브랜드 · 이름 · 카테고리로 찾아보세요" right={<Back/>}>
  <DemoNotice/>
  <TextInput value={query} onChangeText={setQuery} placeholder="검색어를 입력하세요" accessibilityLabel="상품 검색어" autoFocus={false} clearButtonMode="while-editing" style={{minHeight:54,backgroundColor:colors.surface,borderRadius:12,borderWidth:1,borderColor:colors.border,paddingHorizontal:14,fontSize:16,color:colors.ink}}/>
  <View style={{flexDirection:'row',gap:8}}>{(['RENTAL','STORE'] as const).map(item=><Pressable key={item} accessibilityRole="button" accessibilityState={{selected:channel===item}} onPress={()=>setChannel(item)} style={{paddingVertical:13,paddingHorizontal:22,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:channel===item?colors.ink:colors.surface}}><Text style={{color:channel===item?colors.surface:colors.ink,fontWeight:'700'}}>{item==='RENTAL'?'렌탈':'구매'}</Text></Pressable>)}</View>
  <Heading>상품 {filtered.length}개</Heading>
  {filtered.length?<ProductGrid items={filtered} channel={channel}/>:<View style={{gap:12,backgroundColor:colors.surface,padding:22,borderRadius:16}}><Body muted>검색 결과가 없습니다. 검색어를 다시 확인해 주세요.</Body><Action label="검색어 지우기" onPress={()=>setQuery('')} secondary/></View>}
 </Screen>;
}
