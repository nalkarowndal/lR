import {useRouter} from 'expo-router';
import {useAppState} from '../../state/AppState';
import {Screen,Panel,DemoNotice,Heading,Body,RowLink,Action} from '../../components/ui';
export default function My(){
 const router=useRouter();const{favorites,cart}=useAppState();
 return <Screen title="마이" subtitle="내 취향과 이용 내역">
  <DemoNotice/>
  <Panel><Heading>방문을 환영합니다</Heading><Body muted>회원 로그인과 실제 예약·주문 내역은 Node.js 서버 연동 후 제공됩니다. 현재 개인정보는 수집하지 않습니다.</Body><Action label="로그인 서비스 준비 중" onPress={()=>{}} disabled/></Panel>
  <Panel>
    <RowLink title="찜한 상품" subtitle={favorites.length+'개'} onPress={()=>router.push('/my/wishlist')}/>
    <RowLink title="장바구니" subtitle={cart.length+'개'} onPress={()=>router.push('/store/checkout')}/>
    <RowLink title="명품 위탁 판매" subtitle="3단계 신청 화면 미리보기" onPress={()=>router.push('/my/consignment')}/>
    <RowLink title="내 대여 · 구매 내역" subtitle="서버 연동 이후 제공" onPress={()=>{}}/>
    <RowLink title="수선 서비스" onPress={()=>router.push('/(tabs)/care')}/>
  </Panel>
 </Screen>;
}
