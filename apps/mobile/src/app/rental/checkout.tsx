import {useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import {useRouter} from 'expo-router';
import {findProduct} from '../../domain/catalog';
import {rentalDays} from '../../domain/date';
import {useAppState} from '../../state/AppState';
import {colors,formatKrw} from '../../theme';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../components/ui';
import {Back} from '../../components/Back';
export default function RentalCheckout(){
 const router=useRouter();const {draft}=useAppState();const product=draft?findProduct(draft.productId):null;const days=draft?rentalDays(draft.startDate,draft.returnDate):null;
 const [accepted,setAccepted]=useState(false);
 if(!product||days===null)return <Screen title="견적 없음" right={<Back/>}><Action label="렌탈 목록" onPress={()=>router.replace('/(tabs)/rental')}/></Screen>;
 const rentalFee=product.dayRateKrw*days;const total=rentalFee+product.depositKrw;
 return <Screen title="렌탈 주문서" subtitle="내용을 확인한 뒤 시연을 완료하세요" right={<Back/>}>
   <DemoNotice/><Panel><Heading>{product.title}</Heading><Body>대여: {draft!.startDate} → {draft!.returnDate}</Body><Body>반납 예정일: {draft!.returnDate}</Body><Body>대여료 {formatKrw(rentalFee)} / 보증금 {formatKrw(product.depositKrw)}</Body><Text style={{fontSize:24,color:colors.ink,fontWeight:'900'}}>예시 합계 {formatKrw(total)}</Text></Panel>
   <Panel><Heading>배송지 정보</Heading><Body muted>실제 개인정보를 수집하지 않습니다. 배송지 입력은 백엔드 인증 및 보안 API 구현 후 제공합니다.</Body>
     <TextInput editable={false} placeholder="배송지 입력 — 서버 연동 전 비활성" accessibilityLabel="배송지 입력은 현재 비활성화됨" style={{borderWidth:1,borderColor:colors.divider,minHeight:54,paddingHorizontal:12,borderRadius:12}}/>
   </Panel>
   <Action secondary label={accepted?'✓ 시연 조건을 확인했습니다':'시연 조건 확인'} onPress={()=>setAccepted(!accepted)} icon="checkmark-circle-outline"/>
   <Action label="시연 완료 화면 보기 (결제 없음)" disabled={!accepted} onPress={()=>router.push({pathname:'/demo-result',params:{kind:'rental'}})}/>
   <Body muted>이 버튼은 실제 예약 신청이나 결제를 전송하지 않습니다.</Body>
 </Screen>;
}
