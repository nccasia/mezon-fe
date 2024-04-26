import React from 'react'
import {Text, View} from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeDefault from './homedrawer/HomeDefault';
import LeftDrawerContent from './homedrawer/DrawerContent';
import HashSignIcon from '../../../assets/svg/loading.svg';
import SearchLogo from '../../../assets/svg/discoverySearch.svg'
import UsersLogo from '../../../assets/svg/users.svg'
import BarsLogo from '../../../assets/svg/bars.svg'
import {styles} from "./styles";

const Drawer = createDrawerNavigator();

const DrawerScreen = React.memo(({navigation}: {navigation: any}) => {

  return (
    <Drawer.Navigator
        screenOptions={{
            drawerPosition: 'left',
            drawerStyle: {
                width: '85%'
            }
        }}
        screenListeners={{
          state: (e) => {
            console.log("e current", e.data.state.history);
            // TODO
            if (e.data.state.history.length > 1) {
              // dispatch(setHideBottomTab(false))
            }else{
              // dispatch(setHideBottomTab(true))
            }
          }
        }}
        drawerContent={(props) => <LeftDrawerContent dProps={props} />}>

      <Drawer.Screen
        name="HomeDefault"
        component={HomeDefault}
        options={{
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'grey'
          },
          headerShown: false,
          headerLeft(vals) {
            return <View style={styles.drawerHeaderLeft} {...vals} onTouchEnd={() => navigation.openDrawer()}>
              <BarsLogo width={20} height={20} />
            </View>
          },
          headerTitle(props) {
              return <View style={styles.drawerHeaderTitle}>
                <HashSignIcon width={18} height={18} />
                <Text style={styles.drawerHeaderTitleTxt}>welcome-and-rules</Text>
              </View>
          },
          headerRight(props) {
              return <View style={styles.drawerHeaderRight}>
                <SearchLogo width={22} height={22} />
                <UsersLogo width={22} height={22} />
              </View>
          },
        }}
      />

    </Drawer.Navigator>
  );
});

const HomeScreen = React.memo((props: any) => {
  return (
    <DrawerScreen navigation={props.navigation} />
  )
})

export default HomeScreen;
