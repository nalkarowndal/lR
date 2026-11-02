import {View,useWindowDimensions} from 'react-native';
import type {Channel,Product} from '../domain/catalog';
import {ProductCard} from './ProductCard';
export function ProductGrid({items,channel='RENTAL'}:{items:Product[];channel?:Channel}){
 const {width}=useWindowDimensions();
 const columns=width>=960?4:width>=640?3:2;
 // Width percentages leave room for 12px gaps; no horizontal scroll/overflow.
 const itemWidth=columns===4?'23.5%':columns===3?'31.6%':'48%';
 return <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>
  {items.map(product=><View testID="product-grid-item" style={{width:itemWidth}} key={product.id}>
   <ProductCard product={product} channel={channel}/>
  </View>)}
 </View>;
}
