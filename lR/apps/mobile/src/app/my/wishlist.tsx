import {useProductIds} from '../../api/hooks';
import {useAppState} from '../../state/AppState';
import {useRouter} from 'expo-router';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {NetworkFeedback,DataSourceNotice} from '../../components/NetworkFeedback';
import {Back} from '../../components/Back';
import {ProductGrid} from '../../components/ProductGrid';
export default function Wishlist(){
 const router=useRouter();const {favorites,savedSyncStatus,savedSyncError,retrySavedSync}=useAppState();
 const resource=useProductIds(favorites);
 const items=resource.data||[];
 return <Screen title="찜한 상품" subtitle={favorites.length+'개 · '+(savedSyncStatus==='loading'?'계정 목록 확인 중':'관심 상품')} right={<Back/>}>
   <DemoNotice/><DataSourceNotice/>
   <Body muted>로그인된 테스트 계정에서는 찜 목록을 서버에 저장하고 다시 조회합니다. 로그인하지 않은 경우 현재 화면에만 유지되며 실제 구매·결제는 없습니다.</Body>
   {savedSyncStatus==='loading'?<Body muted>저장된 관심 상품을 확인하는 중입니다.</Body>:null}
   {savedSyncError?<Panel><Body muted>{savedSyncError}</Body><Action label="저장 목록 다시 불러오기" onPress={retrySavedSync}/></Panel>:null}
   <NetworkFeedback status={resource.status} error={resource.error} retry={resource.retry}/>
   {resource.status==='ready'?(items.length?<ProductGrid items={items}/>:<Panel>
    <Heading>아직 찜한 상품이 없어요</Heading>
    <Body muted>관심 있는 명품의 하트 버튼을 눌러보세요.</Body>
    <Action label="상품 둘러보기" onPress={()=>router.replace('/search')}/>
   </Panel>):null}
 </Screen>;
}
