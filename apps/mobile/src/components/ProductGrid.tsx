import {View} from 'react-native';
import type {Channel,Product} from '../domain/catalog';
import {ProductCard} from './ProductCard';
export function ProductGrid({items,channel='RENTAL'}:{items:Product[];channel?:Channel}){
 return <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>{items.map(product=>
   <View style={{width:'48%'}} key={product.id}><ProductCard product={product} channel={channel}/></View>
 )}</View>;
}
