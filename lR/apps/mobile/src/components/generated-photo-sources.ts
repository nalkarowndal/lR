/** Bundled real JPEG bytes for four fictional AI-generated bags (8 fixed images).
 * Mapping avoids remote image fetches in Expo web and native, and never
 * accepts arbitrary server-supplied URL paths for local require().
 */
import type{ImageSourcePropType} from 'react-native';
import {getGeneratedDemoMedia} from '../domain/generated-media';

const paths:Readonly<Record<string,readonly [ImageSourcePropType,ImageSourcePropType]>>={
 'demo-bag-01':[
  require('../../assets/catalog/demo-bag-01-front.jpg'),
  require('../../assets/catalog/demo-bag-01-detail.jpg')
 ],
 'demo-bag-02':[
  require('../../assets/catalog/demo-bag-02-front.jpg'),
  require('../../assets/catalog/demo-bag-02-detail.jpg')
 ],
 'demo-bag-03':[
  require('../../assets/catalog/demo-bag-03-front.jpg'),
  require('../../assets/catalog/demo-bag-03-detail.jpg')
 ],
 'demo-bag-04':[
  require('../../assets/catalog/demo-bag-04-front.jpg'),
  require('../../assets/catalog/demo-bag-04-detail.jpg')
 ]
};
const sources=new Map<string,ImageSourcePropType>();
for(const [id,images] of Object.entries(paths))
 getGeneratedDemoMedia(id).forEach((m,i)=>sources.set(m.url,images[i]));
export function bundledDemoImageSource(url:string):ImageSourcePropType|null{
 return sources.get(url)??null;
}
