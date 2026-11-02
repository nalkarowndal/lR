import {ActivityIndicator,Text,View} from 'react-native';
import {apiEnabled} from '../api/client';
import {colors} from '../theme';
import {Action,Body,Panel} from './ui';

export function DataSourceNotice(){
 return <View style={{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.divider,
  borderRadius:12,padding:12}}>
  <Text style={{color:colors.sub,fontSize:12,lineHeight:19}}>
   {apiEnabled()?'테스트 Node.js API 연결 모드 · 서버 상품/재고 조회 · 실제 결제 불가':
    '오프라인 디자인 시연 모드 · 앱 내 합성 상품 데이터 · 실제 재고 조회 불가'}
  </Text>
 </View>;
}
export function NetworkFeedback({status,error,retry,loadingLabel='서버 정보를 불러오는 중…'}:{
 status:'loading'|'ready'|'error';error:string|null;retry:()=>void;loadingLabel?:string}){
 if(status==='loading')return <Panel style={{alignItems:'center',paddingVertical:24}}>
   <ActivityIndicator size="small" color={colors.ink}/><Body muted>{loadingLabel}</Body>
  </Panel>;
 if(status==='error')return <Panel><Text style={{color:colors.error,fontWeight:'700'}}>연결 오류</Text>
   <Body muted>{error||'정보를 불러오지 못했습니다.'}</Body>
   <Action label="다시 시도" onPress={retry} secondary icon="refresh-outline"/>
  </Panel>;
 return null;
}
export function LoadMore({hasNext,loading,onPress}:{hasNext:boolean;loading:boolean;onPress:()=>void}){
 if(!hasNext)return null;
 return <Action secondary label={loading?'추가 상품을 불러오는 중…':'상품 더 보기'} onPress={onPress}
   disabled={loading} loading={loading} icon="chevron-down-outline"/>;
}
