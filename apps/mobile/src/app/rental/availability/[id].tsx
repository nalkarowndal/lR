import {useState} from 'react';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {findProduct} from '../../../domain/catalog';
import {rentalDays} from '../../../domain/date';
import {useAppState} from '../../../state/AppState';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../../components/ui';
import {Back} from '../../../components/Back';
import {RentalCalendar} from '../../../components/Calendar';
export default function Availability(){
 const router=useRouter();const {id}=useLocalSearchParams<{id:string}>();const product=findProduct(id);
 const [start,setStart]=useState('');const [end,setEnd]=useState('');const{setDraft}=useAppState();
 if(!product)return <Screen title="상품 없음" right={<Back/>}><Action label="렌탈 목록" onPress={()=>router.replace('/(tabs)/rental')}/></Screen>;
 const days=rentalDays(start,end);
 const next=()=>{if(days===null)return;setDraft({productId:product.id,startDate:start,returnDate:end});router.push('/rental/quote')};
 return <Screen title="렌탈 기간" subtitle={product.title} right={<Back/>}>
   <DemoNotice/>
   <RentalCalendar start={start} end={end} onSelect={(a,b)=>{setStart(a);setEnd(b)}}/>
   <Panel><Heading>일정 안내</Heading><Body muted>실제 예약 가능한 날짜·물류/검수 차단일은 Node.js API 연결 후 서버에서 확인됩니다. 이 달력은 날짜 선택 UX만 시연합니다.</Body><Action label={days===null?'대여 시작일과 반납일을 선택해 주세요':days+'일 렌탈 견적 보기'} onPress={next} disabled={days===null}/></Panel>
 </Screen>;
}
