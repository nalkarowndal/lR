import {useRouter} from 'expo-router';
import {Text} from 'react-native';
import {useAppState} from '../../state/AppState';
import {useDemoSession} from '../../auth/SessionProvider';
import {apiEnabled} from '../../api/client';
import {colors} from '../../theme';
import {Screen,Panel,DemoNotice,Heading,Body,RowLink,Action,Badge} from '../../components/ui';
export default function My(){
 const router=useRouter();
 const {favorites,cart,savedSyncStatus,savedSyncError,retrySavedSync}=useAppState();
 const session=useDemoSession();
 const loggedIn=session.status==='signed-in'&&!!session.identity;
 return <Screen title="마이" subtitle="내 취향과 이용 내역">
  <DemoNotice/>
  <Panel>
   <Heading>방문을 환영합니다</Heading>
   {loggedIn?<><Badge label="개발용 데모 세션 · 실서비스 아님"/>
    <Body>테스트 계정: {session.identity?.email}</Body>
    <Body muted>권한: {session.identity?.roles.join(', ')||'CUSTOMER'} · 세션은 서버가 검증합니다. 실제 구매·예약 서비스는 아직 열리지 않았습니다.</Body>
    <Action label="시연 세션 갱신" secondary loading={session.busy} onPress={()=>{void session.refresh().catch(()=>{})}}/>
    <Action label="테스트 로그아웃" loading={session.busy} onPress={()=>{void session.logout().catch(()=>{})}}/>
   </>:<>
    <Body muted>{session.status==='restoring'?'테스트 세션을 확인하는 중입니다.':
     '계정 로그인은 테스트용 API에서만 지원합니다. 아직 실제 회원·예약·주문 정보는 제공되지 않습니다.'}</Body>
    <Action label="테스트 계정 로그인" disabled={!apiEnabled()||session.status==='restoring'} onPress={()=>router.push('/my/login')}/>
    {!apiEnabled()?<Body muted>현재 오프라인 시연 모드이므로 로그인은 사용할 수 없습니다.</Body>:null}
   </>}
   {session.error?<Text accessibilityRole="alert" style={{color:colors.error}}>{session.error}</Text>:null}
  </Panel>
  <Panel>
   {loggedIn&&savedSyncStatus==='loading'?<Body muted>테스트 계정의 찜·장바구니를 불러오는 중입니다.</Body>:null}
   {savedSyncError?<><Body muted>{savedSyncError}</Body><Action label="저장 목록 다시 불러오기" secondary onPress={retrySavedSync}/></>:null}
   <RowLink title="찜한 상품" subtitle={favorites.length+'개 · '+(loggedIn?'테스트 계정 저장':'이 기기의 임시 목록')} onPress={()=>router.push('/my/wishlist')}/>
   <RowLink title="장바구니" subtitle={cart.length+'개 · '+(loggedIn?'테스트 계정 저장':'임시 시연')} onPress={()=>router.push('/store/checkout')}/>
   <RowLink title="명품 위탁 판매" subtitle={apiEnabled()?"서버 저장형 위탁 신청":"3단계 신청 화면 미리보기"} onPress={()=>router.push('/my/consignment')}/>
   {apiEnabled()?
    <RowLink title="내 주문 내역" subtitle="서버에 접수된 렌탈 주문 확인" onPress={()=>router.push('/my/experience-orders')}/>:null}
   {apiEnabled()?<RowLink title="내 스토어 주문 내역" subtitle="스토어의 서버 저장형 비금전 주문 접수" onPress={()=>router.push('/my/store-orders')}/>:null}
   {apiEnabled()?<RowLink title="내 수선·위탁 신청 내역" subtitle="서버에 접수한 시연 신청·상태 확인" onPress={()=>router.push('/my/service-requests')}/>:null}
   <RowLink title="모의 렌탈 이용 내역" subtitle="현재 세션의 결제 시뮬레이션 기록" onPress={()=>router.push('/my/demo-orders')}/>
   {loggedIn&&session.identity?.roles.includes('ADMIN')&&apiEnabled()?
    <RowLink title="테스트 결제 원장 검수" subtitle="관리자 전용 · lr_test 내부 모의 기록" onPress={()=>router.push('/my/admin-demo-orders')}/>:null}
   {loggedIn&&session.identity?.roles.includes('ADMIN')&&apiEnabled()?
    <RowLink title="스토어 접수 관리자 목록" subtitle="관리자 읽기 전용 · 테스트 DB" onPress={()=>router.push('/my/admin-store-orders')}/>:null}
   {loggedIn&&session.identity?.roles.includes('ADMIN')&&apiEnabled()?
    <RowLink title="서비스 신청 관리자 검수" subtitle="수선·위탁 신청 상태 전이 · 테스트 DB" onPress={()=>router.push('/my/admin-service-requests')}/>:null}
   {loggedIn&&session.identity?.roles.includes('ADMIN')&&apiEnabled()?
    <RowLink title="에디토리얼 관리" subtitle="시연 홈 배너 초안·게시 및 상품 사진 사용권 점검" onPress={()=>router.push('/my/admin-editorial')}/>:null}
   <RowLink title="수선 서비스" onPress={()=>router.push('/(tabs)/care')}/>
  </Panel>
 </Screen>;
}
