import {useState} from 'react';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useProduct,useAvailability} from '../../../api/hooks';
import {apiEnabled} from '../../../api/client';
import {rentalDays} from '../../../domain/date';
import {useAppState} from '../../../state/AppState';
import {Screen,Panel,Heading,Body,Action,DemoNotice} from '../../../components/ui';
import {DataSourceNotice,NetworkFeedback} from '../../../components/NetworkFeedback';
import {Back} from '../../../components/Back';
import {RentalCalendar} from '../../../components/Calendar';
export default function Availability(){
 const router=useRouter();
 const {id}=useLocalSearchParams<{id:string}>();
 const {data:product,status:productStatus,error:productError,retry:productRetry}=useProduct(id||'');
 const [start,setStart]=useState('');const [end,setEnd]=useState('');
 const {setDraft}=useAppState();
 const days=rentalDays(start,end);
 const checking=useAvailability(id||'',start,end);
 const remote=apiEnabled();
 const available=days!==null&&(!remote||(checking.status==='ready'&&checking.data?.available===true));
 const next=()=>{
  if(!available||!product||!product.channels.includes('RENTAL'))return;
  setDraft({productId:product.id,startDate:start,returnDate:end});
  router.push('/rental/quote');
 };
 return <Screen title="렌탈 기간" subtitle={product?.title||'상품 일정 확인'} right={<Back/>}>
  <DemoNotice/><DataSourceNotice/>
  <NetworkFeedback status={productStatus} error={productError} retry={productRetry}/>
  {productStatus==='ready'&&!product?<Panel><Body muted>상품을 찾을 수 없습니다.</Body>
    <Action label="렌탈 목록으로" onPress={()=>router.replace('/(tabs)/rental')}/></Panel>:null}
  {product&&product.channels.includes('RENTAL')?<><RentalCalendar start={start} end={end}
    onSelect={(a,b)=>{setStart(a);setEnd(b);setDraft(null)}}/>
    <Panel><Heading>날짜별 대여 가능 여부</Heading>
     {remote&&days!==null?<><NetworkFeedback status={checking.status} error={checking.error} retry={checking.retry}/>
      {checking.status==='ready'&&checking.data?<Body>
       {checking.data.available?'선택 기간 이용 가능 · 재고 '+checking.data.eligibleUnitCount+'개':
         '선택 기간에 이용 가능한 재고가 없습니다.'}
      </Body>:null}</>:<Body muted>{remote?'날짜를 선택하면 테스트 서버에서 가용성을 조회합니다.':'오프라인 시연에서는 실제 재고를 확인하지 않습니다.'}</Body>}
     <Body muted>이 조회는 예약이 아닙니다. 재고는 이후 달라질 수 있으며, 물류·검수 차단 정책은 아직 확정되지 않았습니다.</Body>
     <Action label={days===null?'시작일과 반납일을 선택하세요':days+'일 렌탈 견적 보기'}
       onPress={next} disabled={!available||!product}/>
    </Panel></>:null}
  {product&&!product.channels.includes('RENTAL')?<Panel><Body muted>이 상품은 렌탈 대상이 아닙니다.</Body></Panel>:null}
 </Screen>;
}
