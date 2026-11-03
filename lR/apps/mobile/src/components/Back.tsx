import {Pressable,Text} from 'react-native';
import {useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../theme';
export function Back(){
 const router=useRouter();
 return <Pressable accessibilityRole="button" accessibilityLabel="이전 화면으로 돌아가기" onPress={()=>router.canGoBack()?router.back():router.replace('/')} style={{minWidth:48,minHeight:48,flexDirection:'row',gap:3,alignItems:'center',justifyContent:'center'}}>
  <Ionicons name="arrow-back-outline" size={19} color={colors.ink}/><Text style={{fontSize:13,fontWeight:'700',color:colors.ink}}>뒤로</Text>
 </Pressable>;
}
