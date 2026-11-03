import {useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import {useRouter} from 'expo-router';
import {apiEnabled} from '../../api/client';
import {useDemoSession} from '../../auth/SessionProvider';
import {colors} from '../../theme';
import {Screen,Panel,Heading,Body,Action,Badge} from '../../components/ui';
import {Back} from '../../components/Back';

export default function DemoLogin(){
 const router=useRouter();
 const session=useDemoSession();
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [mode,setMode]=useState<'login'|'register'>('login');
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const enabled=apiEnabled()&&session.status!=='restoring';
 const submit=async()=>{
  setMessage('');setError('');
  try{
   if(mode==='register'){
    await session.register(email,password);
    setMode('login');setPassword('');
    setMessage('시연 계정을 생성했습니다. 비밀번호를 입력하여 로그인해 주세요.');
   }else{
    await session.login(email,password);
    setPassword('');router.replace('/(tabs)/my');
   }
  }catch(e){setError(e instanceof Error?e.message:'요청에 실패했습니다');}
 };
 return <Screen title="테스트 계정" subtitle="개발용 Node.js 로그인 · 상용 서비스 아님" right={<Back/>}>
  <Panel><Badge label="TEST ONLY · 운영 회원가입 아님"/>
   <Heading>{mode==='login'?'시연 로그인':'시연 계정 생성'}</Heading>
   <Body muted>실제 이메일·개인 비밀번호를 입력하지 마세요. example.invalid 같은 가짜 이메일과 별도의 테스트 비밀번호만 사용하세요.</Body>
   <Body muted>웹에서는 새로고침하면 세션이 사라지고, iOS/Android에서는 기기의 안전한 저장소를 사용합니다. 인증 연결에는 HTTPS 또는 같은 기기 localhost가 필요합니다.</Body>
   {!apiEnabled()?<Text style={{color:colors.error,fontWeight:'700'}}>API 주소가 설정되지 않았습니다. 오프라인 시연에서는 계정을 생성하거나 로그인할 수 없습니다.</Text>:null}
   <View style={{gap:8}}>
    <Text style={{fontSize:14,color:colors.ink,fontWeight:'700'}}>테스트 이메일</Text>
    <TextInput value={email} onChangeText={setEmail} accessibilityLabel="테스트 이메일"
     placeholder="tester@example.invalid" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
     autoComplete="off" textContentType="none"
     style={{minHeight:52,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:14,fontSize:16,color:colors.ink}}/>
   </View>
   <View style={{gap:8}}>
    <Text style={{fontSize:14,color:colors.ink,fontWeight:'700'}}>테스트 비밀번호</Text>
    <TextInput value={password} onChangeText={setPassword} accessibilityLabel="테스트 비밀번호"
     placeholder="12자 이상의 테스트 비밀번호" secureTextEntry autoCapitalize="none" autoCorrect={false}
     autoComplete="off" textContentType="password"
     style={{minHeight:52,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:14,fontSize:16,color:colors.ink}}/>
   </View>
   {message?<Body>{message}</Body>:null}
   {error?<Text accessibilityRole="alert" style={{color:colors.error,fontWeight:'700'}}>{error}</Text>:null}
   <Action label={mode==='login'?'테스트 계정 로그인':'테스트 계정 생성하기'}
    disabled={!enabled||!email.trim()||password.length<12} loading={session.busy} onPress={()=>{void submit()}}/>
   <Action label={mode==='login'?'테스트 계정 새로 만들기':'이미 계정이 있어요 · 로그인'}
    secondary onPress={()=>{setMode(mode==='login'?'register':'login');setPassword('');setError('');setMessage('');}}/>
  </Panel>
  <Panel><Heading>서비스 출시 전 필수 항목</Heading>
   <Body muted>이메일 인증·비밀번호 복구·다중기기 세션·개인정보 동의·봇 방어 및 보안 심사 완료 전 실제 고객 계정을 받지 않습니다.</Body>
   <Body muted>테스트 계정으로 체험 주문 접수 내역을 서버에 저장할 수 있지만, 실제 결제·예약 확정·배송은 진행되지 않습니다.</Body>
  </Panel>
 </Screen>;
}
