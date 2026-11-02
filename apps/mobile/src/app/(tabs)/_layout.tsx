import {Tabs} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
export default function TabLayout(){
 const renderIcon=(name:keyof typeof Ionicons.glyphMap)=>
  ({color,size}:{color:string;size:number})=><Ionicons name={name} size={Math.min(size,23)} color={color}/>;
 return <Tabs screenOptions={{
  headerShown:false,tabBarActiveTintColor:colors.ink,tabBarInactiveTintColor:colors.sub,
  tabBarStyle:{backgroundColor:colors.surface,borderTopWidth:1,borderTopColor:colors.divider,height:65,paddingBottom:9,paddingTop:6},
  tabBarLabelStyle:{fontSize:11,fontWeight:'700',marginTop:4},
  tabBarItemStyle:{minHeight:52}
 }}>
  <Tabs.Screen name="index" options={{title:'홈',tabBarIcon:renderIcon('home-outline')}}/>
  <Tabs.Screen name="rental" options={{title:'렌탈',tabBarIcon:renderIcon('calendar-outline')}}/>
  <Tabs.Screen name="store" options={{title:'스토어',tabBarIcon:renderIcon('bag-outline')}}/>
  <Tabs.Screen name="care" options={{title:'수선',tabBarIcon:renderIcon('construct-outline')}}/>
  <Tabs.Screen name="my" options={{title:'마이',tabBarIcon:renderIcon('person-circle-outline')}}/>
 </Tabs>;
}
