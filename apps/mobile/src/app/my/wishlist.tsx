import {useProductIds} from '../../api/hooks';
import {useAppState} from '../../state/AppState';
import {useRouter} from 'expo-router';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
import {ProductGrid} from '../../components/ProductGrid';
export default function Wishlist(){
 const router=useRouter();const {favorites}=useAppState();
 const resource=useProductIds(favorites);
 const items=resource.data||[];
 return <Screen title="찜한 상품" subtitle={favorites.length+'개 · 현재 앱 화면에서만 유지'} right={<Back/>}>
   <DemoNotice/><DataSourceNotice/>
   <Body muted>찜은 시연용으로 현재 실행 중인 앱에서만 유지되며 새로고침 또는 재시작 시 초기화됩니다. 실제 회원 계정에는 저장되지 않습니다.</Body>
   <NetworkFeedback status={resource.status} error={resource.error} retry={resource.retry}/>
   {resource.status==='ready'?(items.length?<ProductGrid items={items}/>:<Panel>
    <Heading>아직 찜한 상품이 없어요</Heading>
    <Body muted>관심 있는 명품의 하트 버튼을 눌러보세요.</Body>
    <Action label="상품 둘러보기" onPress={()=>router.replace('/search')}/>
   </Panel>):null}
 </Screen>;
}
