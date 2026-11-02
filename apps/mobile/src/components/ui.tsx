import type{ReactNode} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../theme';

export function Screen({title,children,subtitle,right,padBottom=24}:{title:string;children:ReactNode;subtitle?:string;right?:ReactNode;padBottom?:number}){
 const insets=useSafeAreaInsets();
 return <ScrollView keyboardShouldPersistTaps="handled" style={{backgroundColor:colors.bg,flex:1}} contentContainerStyle={{paddingTop:Math.max(20,insets.top+8),paddingBottom:padBottom+insets.bottom,paddingHorizontal:18,gap:18}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
     <View style={{flex:1,gap:5}}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle?<Text style={styles.sub}>{subtitle}</Text>:null}</View>{right}
   </View>
   {children}
 </ScrollView>;
}
export function Panel({children,style}:{children:ReactNode;style?:object}){
 return <View style={[styles.panel,style]}>{children}</View>;
}
export function Heading({children}:{children:ReactNode}){return <Text style={styles.heading}>{children}</Text>}
export function Body({children,muted=false}:{children:ReactNode;muted?:boolean}){return <Text style={[styles.body,muted?{color:colors.sub}:null]}>{children}</Text>}
export function Action({label,onPress,secondary=false,disabled=false,loading=false,icon}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;loading?:boolean;icon?:keyof typeof Ionicons.glyphMap}){
 return <Pressable accessibilityRole="button" accessibilityState={{disabled:disabled||loading,busy:loading}} onPress={onPress} disabled={disabled||loading}
 style={({pressed})=>[styles.action,secondary?styles.secondary:null,(disabled||loading)?{opacity:.5}:null,pressed?{opacity:.78}:null]}>
 {icon?<Ionicons name={icon} size={20} color={secondary?colors.ink:colors.surface}/>:null}
 <Text style={[styles.actionLabel,secondary?{color:colors.ink}:null]}>{loading?'처리 중…':label}</Text></Pressable>
}
export function DemoNotice(){
 return <View style={styles.demo}><Ionicons name="information-circle-outline" color={colors.sub} size={20}/><Text style={{color:colors.sub,flex:1,fontSize:13,lineHeight:19}}>디자인 시연용 상품과 금액입니다. 예약·결제·개인정보는 실제 저장되지 않습니다.</Text></View>;
}
export function Badge({label}:{label:string}){return <Text style={styles.badge}>{label}</Text>}
export function RowLink({title,subtitle,onPress,icon='chevron-forward-outline'}:{title:string;subtitle?:string;onPress:()=>void;icon?:keyof typeof Ionicons.glyphMap}){
 return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.row,pressed?{opacity:.6}:null]}>
 <View style={{flex:1,gap:3}}><Text style={{fontSize:16,color:colors.ink,fontWeight:'600'}}>{title}</Text>{subtitle?<Text style={styles.sub}>{subtitle}</Text>:null}</View><Ionicons name={icon} size={21} color={colors.sub}/>
 </Pressable>
}
const styles=StyleSheet.create({
 title:{fontSize:26,lineHeight:34,fontWeight:'800',color:colors.ink},
 sub:{fontSize:13,lineHeight:20,color:colors.sub},
 panel:{backgroundColor:colors.surface,borderRadius:16,padding:18,gap:13,borderWidth:1,borderColor:colors.divider},
 heading:{fontWeight:'800',fontSize:19,lineHeight:28,color:colors.ink},
 body:{color:colors.ink,fontSize:15,lineHeight:23},
 action:{minHeight:50,borderRadius:12,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,paddingHorizontal:12,paddingVertical:10},
 secondary:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},
 actionLabel:{fontWeight:'700',color:colors.surface,fontSize:15,textAlign:'center'},
 demo:{borderRadius:12,backgroundColor:'#E5E7EB',padding:12,flexDirection:'row',gap:8,alignItems:'flex-start'},
 badge:{color:colors.accent,fontSize:12,fontWeight:'700',backgroundColor:'#EEF2FF',paddingHorizontal:10,paddingVertical:5,borderRadius:99,alignSelf:'flex-start'},
 row:{minHeight:58,paddingVertical:12,borderBottomWidth:1,borderColor:colors.divider,flexDirection:'row',alignItems:'center',gap:12}
});
