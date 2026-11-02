import {Pressable,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useRouter} from 'expo-router';
import type {Product} from '../domain/catalog';
import {formatKrw,colors} from '../theme';
import {useAppState} from '../state/AppState';
export function ProductVisual({background,small=false}:{background:Product['art'];small?:boolean}){
 return <View style={{backgroundColor:background,height:small?134:194,borderRadius:14,alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
   <View style={{height:small?88:144,width:small?88:144,borderWidth:1,borderColor:'#D1D5DB',borderRadius:100,position:'absolute',opacity:.7}}/>
   <Ionicons name="bag-handle-outline" size={small?64:92} color="#6B7280"/>
   <Text style={{fontSize:9,letterSpacing:3,color:colors.sub,fontWeight:'700',marginTop:2}}>LUXURYRENTAL</Text>
 </View>;
}
export function ProductCard({product,channel='RENTAL'}:{product:Product;channel?:'RENTAL'|'STORE'}){
 const router=useRouter();const{favorites,toggleFavorite}=useAppState();const saved=favorites.includes(product.id);
 return <View style={{backgroundColor:colors.surface,borderRadius:16,padding:11,width:'100%',borderWidth:1,borderColor:colors.divider}}>
  <Pressable accessibilityRole="button" accessibilityLabel={product.title+' 상세 보기'} onPress={()=>router.push({pathname:'/product/[id]',params:{id:product.id,channel}})}>
    <ProductVisual background={product.art} small/>
    <Text numberOfLines={1} style={{fontSize:11,color:colors.sub,letterSpacing:1,fontWeight:'700',marginTop:11}}>{product.brand}</Text>
    <Text numberOfLines={2} style={{fontSize:14,fontWeight:'700',color:colors.ink,marginTop:4,minHeight:39}}>{product.title}</Text>
    <Text style={{fontSize:13,fontWeight:'700',color:colors.ink}}>{channel==='RENTAL'?formatKrw(product.dayRateKrw)+' / 일':formatKrw(product.salePriceKrw)}</Text>
  </Pressable>
  <Pressable accessibilityRole="button" accessibilityLabel={saved?'찜 해제':'찜 추가'} onPress={()=>toggleFavorite(product.id)}
   style={{position:'absolute',top:17,right:17,width:44,height:44,alignItems:'center',justifyContent:'center',backgroundColor:colors.surface,borderRadius:22}}>
   <Ionicons name={saved?'heart':'heart-outline'} color={saved?'#B91C1C':colors.ink} size={22}/>
  </Pressable>
 </View>;
}
