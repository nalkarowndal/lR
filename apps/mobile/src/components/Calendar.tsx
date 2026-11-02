import {useState} from 'react';
import {Pressable,Text,TextInput,View,useWindowDimensions} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {dateMs,monthDays,rentalDays} from '../domain/date';
import {colors} from '../theme';
import {Panel,Body,Heading} from './ui';
const days=['월','화','수','목','금','토','일'];
export function RentalCalendar({start,end,onSelect}:{start:string;end:string;onSelect:(start:string,end:string)=>void}){
 const [month,setMonth]=useState(()=>{const d=new Date();return {year:d.getFullYear(),month0:d.getMonth()};});
 const [manualStart,setManualStart]=useState(start);const[manualEnd,setManualEnd]=useState(end);
 const {width}=useWindowDimensions();
 const cells=monthDays(month.year,month.month0);
 const changeMonth=(offset:number)=>{const d=new Date(Date.UTC(month.year,month.month0+offset,1));setMonth({year:d.getUTCFullYear(),month0:d.getUTCMonth()});};
 const choose=(value:string)=>{if(!start||end||value<=start){onSelect(value,'');setManualStart(value);setManualEnd('');}else{onSelect(start,value);setManualStart(start);setManualEnd(value);}};
 const duration=rentalDays(start,end);
 const cellWidth=Math.floor((width-74)/7);
 return <Panel>
   <Heading>대여 기간 선택</Heading>
   <Body muted>시작일 포함 · 반납일 제외. 날짜를 순서대로 선택하세요.</Body>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
     <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={()=>changeMonth(-1)} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Ionicons name="chevron-back" size={22} color={colors.ink}/></Pressable>
     <Text style={{fontWeight:'800',color:colors.ink,fontSize:17}}>{month.year}년 {month.month0+1}월</Text>
     <Pressable accessibilityRole="button" accessibilityLabel="다음 달" onPress={()=>changeMonth(1)} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}><Ionicons name="chevron-forward" size={22} color={colors.ink}/></Pressable>
   </View>
   {width>=384?<View>
     <View style={{flexDirection:'row',justifyContent:'center'}}>{days.map(day=><Text key={day} style={{width:cellWidth,textAlign:'center',fontSize:12,color:colors.sub,paddingVertical:9}}>{day}</Text>)}</View>
     <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
       {cells.map((day,i)=>{
         if(!day)return <View key={'empty-'+i} style={{width:cellWidth,height:48}}/>;
         const active=day===start||day===end;const inRange=!!start&&!!end&&day>start&&day<end;
         return <Pressable key={day} accessibilityRole="button" accessibilityLabel={day+(day===start?' 대여 시작':day===end?' 반납 예정':inRange?' 대여 기간':'')} accessibilityState={{selected:active}}
           onPress={()=>choose(day)} style={{width:cellWidth,height:48,alignItems:'center',justifyContent:'center',backgroundColor:active?colors.ink:inRange?colors.rental:colors.surface,borderRadius:active?12:0}}>
           <Text style={{color:active?colors.surface:colors.ink,fontWeight:active?'800':'500',fontSize:14}}>{Number(day.slice(-2))}</Text>
         </Pressable>
       })}
     </View>
   </View>:<Body muted>작은 화면에서는 아래 날짜 입력을 사용합니다.</Body>}
   <View style={{flexDirection:'row',gap:10}}>
     <View style={{flex:1,gap:6}}><Text style={{color:colors.sub,fontSize:13}}>대여 시작일</Text><TextInput accessibilityLabel="대여 시작일 YYYY-MM-DD" value={manualStart} onChangeText={setManualStart} placeholder="YYYY-MM-DD" autoCapitalize="none" style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,minHeight:48,color:colors.ink}}/></View>
     <View style={{flex:1,gap:6}}><Text style={{color:colors.sub,fontSize:13}}>반납 예정일</Text><TextInput accessibilityLabel="반납 예정일 YYYY-MM-DD" value={manualEnd} onChangeText={setManualEnd} placeholder="YYYY-MM-DD" autoCapitalize="none" style={{borderWidth:1,borderColor:colors.border,borderRadius:10,padding:12,minHeight:48,color:colors.ink}}/></View>
   </View>
   <Pressable accessibilityRole="button" onPress={()=>{if(dateMs(manualStart)!==null&&rentalDays(manualStart,manualEnd)!==null)onSelect(manualStart,manualEnd)}} style={{minHeight:48,backgroundColor:colors.rental,borderRadius:12,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:14,fontWeight:'700',color:colors.ink}}>입력한 날짜 적용</Text></Pressable>
   <Text style={{color:duration!==null?colors.success:colors.sub,fontSize:14,fontWeight:'700'}}>{duration!==null?start+' 시작 · '+end+' 반납 · '+duration+'일':'시작일과 반납일을 선택하면 대여 일수가 표시됩니다.'}</Text>
 </Panel>;
}
