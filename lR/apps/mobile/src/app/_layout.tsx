import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppStateProvider} from '../state/AppState';
import {colors} from '../theme';
import {SessionProvider} from '../auth/SessionProvider';
export default function RootLayout(){
 return <SafeAreaProvider><SessionProvider><AppStateProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.bg}}}/></AppStateProvider></SessionProvider></SafeAreaProvider>;
}
