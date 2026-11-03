import {Tabs} from 'expo-router';
import type {ColorValue} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
export default function TabLayout(){
 const insets=useSafeAreaInsets();
 const safeBottom=Math.max(insets.bottom,8);
 const renderIcon=(name:keyof typeof Ionicons.glyphMap)=>
  ({color,size}:{color:ColorValue;size:number})=><Ionicons name={name} size={Math.min(size,23)} color={color as string}/>;
 return <Tabs screenOptions={{
  headerShown:false,tabBarActiveTintColor:colors.ink,tabBarInactiveTintColor:colors.sub,
  tabBarStyle:{backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.divider,height:56+safeBottom,paddingBottom:safeBottom,paddingTop:6},
  tabBarLabelStyle:{fontSize:11,fontWeight:'700',marginTop:4},
  tabBarItemStyle:{minHeight:48}
 }}>
  <Tabs.Screen name="index" options={{title:'홈',tabBarIcon:renderIcon('home-outline')}}/>
  <Tabs.Screen name="rental" options={{title:'렌탈',tabBarIcon:renderIcon('calendar-outline')}}/>
  <Tabs.Screen name="store" options={{title:'스토어',tabBarIcon:renderIcon('bag-outline')}}/>
  <Tabs.Screen name="care" options={{title:'수선',tabBarIcon:renderIcon('construct-outline')}}/>
  <Tabs.Screen name="my" options={{title:'마이',tabBarIcon:renderIcon('person-circle-outline')}}/>
 </Tabs>;
}
