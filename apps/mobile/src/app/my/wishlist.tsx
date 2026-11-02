import {products} from '../../domain/catalog';
import {useAppState} from '../../state/AppState';
import {useRouter} from 'expo-router';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
import {ProductGrid} from '../../components/ProductGrid';
export default function Wishlist(){
 const router=useRouter();const {favorites}=useAppState();const items=products.filter(p=>favorites.includes(p.id));
 return <Screen title="찜한 상품" subtitle={items.length+'개 · 현재 기기 메모리에서만 유지'} right={<Back/>}>
   <DemoNotice/>
   {items.length?<ProductGrid items={items}/>:<Panel><Heading>아직 찜한 상품이 없어요</Heading><Body muted>관심 있는 명품을 찾았다면 하트 버튼으로 저장해 보세요.</Body><Action label="상품 둘러보기" onPress={()=>router.replace('/search')}/></Panel>}
 </Screen>;
}
