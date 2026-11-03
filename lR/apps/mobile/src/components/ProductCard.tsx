import {useEffect,useState} from 'react';
import {Image,Pressable,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router';
import type {Product} from '../domain/catalog';
import {formatKrw,colors} from '../theme';
import {useAppState} from '../state/AppState';
type IconName=keyof typeof Ionicons.glyphMap;
const categoryIcon=(category?:string):IconName=>{
 if(category?.includes('버킷'))return 'cube-outline';
 if(category?.includes('크로스'))return 'briefcase-outline';
 if(category?.includes('숄더'))return 'bag-outline';
 return 'bag-handle-outline';
};
export function ProductVisual({background,small=false,product,mediaIndex=0}:{
 background:Product['art'];small?:boolean;product?:Product;mediaIndex?:number
}){
 const media=product?.media?.[mediaIndex];
 const [broken,setBroken]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{setBroken(false);setLoaded(false)},[media?.url]);
 const height=small?146:280;
 if(media&&!broken)return <View style={{backgroundColor:background,height,borderRadius:14,overflow:'hidden'}}>
  {!loaded?<View style={{position:'absolute',left:0,right:0,top:0,bottom:0,
   alignItems:'center',justifyContent:'center'}}>
   <Ionicons name="image-outline" size={32} color={colors.sub}/>
   <Text style={{color:colors.sub,fontSize:12,marginTop:8}}>승인된 이미지 불러오는 중…</Text>
  </View>:null}
  <Image source={{uri:media.url}} onLoad={()=>setLoaded(true)} onError={()=>setBroken(true)}
   accessible accessibilityRole="image" accessibilityLabel={media.alt}
   resizeMode="contain" style={{width:'100%',height:'100%'}}/>
 </View>;
 return <View accessible accessibilityRole="image"
  accessibilityLabel={product?'시연용 일러스트, '+product.title:'상품 이미지 준비 중'}
  style={{backgroundColor:background,height,borderRadius:14,overflow:'hidden',
   alignItems:'center',justifyContent:'center',gap:7}}>
  <View style={{position:'absolute',width:small?112:210,height:small?112:210,borderRadius:120,
   borderColor:'#C8CDD5',borderWidth:1,transform:[{rotate:'-16deg'}]}}/>
  <View style={{position:'absolute',top:small?14:23,left:small?12:20,width:65,height:1,
   backgroundColor:colors.sub,opacity:.38}}/>
  <Ionicons name={categoryIcon(product?.category)} size={small?67:110} color="#485363"/>
  <Text style={{fontSize:small?8:11,letterSpacing:small?1:2,color:colors.sub,fontWeight:'800'}}>
   {product?.category||'LUXURY RENTAL'}
  </Text>
  <Text style={{fontSize:small?9:11,color:colors.sub}}>시연용 일러스트 · 실물 사진 아님</Text>
 </View>;
}
export function ProductCard({product,channel='RENTAL'}:{product:Product;channel?:'RENTAL'|'STORE'}){
 const router=useRouter();const{favorites,toggleFavorite}=useAppState();const saved=favorites.includes(product.id);
 return <View style={{backgroundColor:colors.surface,borderRadius:16,padding:10,width:'100%',borderWidth:1,borderColor:colors.divider}}>
  <Pressable accessibilityRole="button" accessibilityLabel={product.title+' 상세 보기'}
    onPress={()=>router.push({pathname:'/product/[id]',params:{id:product.id,channel}})}>
    <ProductVisual background={product.art} product={product} small/>
    <Text numberOfLines={1} style={{fontSize:11,color:colors.sub,fontWeight:'700',marginTop:10}}>{product.brand} · {product.category}</Text>
    <Text numberOfLines={2} style={{fontSize:14,fontWeight:'700',color:colors.ink,marginTop:4,minHeight:39}}>{product.title}</Text>
    <Text style={{fontSize:12,color:colors.sub,marginBottom:3}}>상태 {product.condition}등급 · {product.demo?'데모':'상품 정보'}</Text>
    <Text style={{fontSize:14,fontWeight:'800',color:colors.ink}}>
     {product.channels.includes(channel)?(channel==='RENTAL'?formatKrw(product.dayRateKrw)+' / 일':formatKrw(product.salePriceKrw)):'이용 불가'}
    </Text>
  </Pressable>
  <Pressable accessibilityRole="button" accessibilityLabel={saved?'찜 해제':'찜 추가'}
   accessibilityState={{selected:saved}} onPress={()=>toggleFavorite(product.id)}
   style={{position:'absolute',top:17,right:17,width:44,height:44,alignItems:'center',justifyContent:'center',
    backgroundColor:colors.surface,borderRadius:22,borderWidth:1,borderColor:colors.divider}}>
   <Ionicons name={saved?'heart':'heart-outline'} color={saved?'#B91C1C':colors.ink} size={22}/>
  </Pressable>
 </View>;
}
