import {FlatList, Pressable, Text, View} from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { styles } from './Notifications.styles'
import Feather from 'react-native-vector-icons/Feather'
import { useChannels, useNotification } from '@mezon/core'
import NotificationItem from './NotificationItem'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '@mezon/mobile-ui'
import NotificationOption from './NotificationOption'
import NotificationIndividualItem from './NotificationIndividualItem'
import { EActionDataNotify } from './types'
import moment from 'moment';
import { useTranslation } from 'react-i18next'


const Notifications = () => {
	const { notification } = useNotification();
  const { t } = useTranslation(['notification']);
  const [notifications, setNotifications] = useState([]);
	const { channels } = useChannels();
  const handleFilterNotify = (tabNotify) =>{
    switch (tabNotify) {
      case EActionDataNotify.Individual :
        setNotifications(notification.filter(
          (item) => item.code !== -9 && channels.some((channel) => channel.channel_id === item.content.channel_id),
        ))
        break;
      case EActionDataNotify.Mention :
        setNotifications(notification.filter(
          (item) => item.code === -9 && channels.some((channel) => channel.channel_id === item.content.channel_id),
        ))
        break;
        case EActionDataNotify.All :
          setNotifications(notification)
          break;
      default:
        setNotifications([])
        break;
    }


  }
	const sortedNotifications = notifications.sort((a, b) => moment(b.create_time).valueOf() - moment(a.create_time).valueOf());



  const bottomSheetRef = useRef<BottomSheet>(null);


  const snapPoints = ['25%', '50%'];
  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

   const renderBackdrop = useCallback((props) => (
    <BottomSheetBackdrop
      {...props}
      opacity={0.5}
      onPress={closeBottomSheet}
    />
  ), []);

    return (
       <View style={styles.notifications}>
        <View style={styles.notificationsHeader}>
          <Text style={styles.notificationHeaderTitle}>{t('headerTitle')}</Text>
          <Pressable onPress={()=>openBottomSheet()}>
            <View style={styles.notificationHeaderIcon}>
                <Feather name="more-horizontal" size={20} color={'white'} />
            </View>
          </Pressable>
        </View>
        <View style={styles.notificationsList}>
            <FlatList
                  data={sortedNotifications}
                  renderItem={({item}) =>{
                    return (
                      item.code === -9 ?
                      <NotificationItem  notify={item} />:
                      <NotificationIndividualItem notify={item} />
                    )
                  }}
                  keyExtractor={item => item.id}
                />
        </View>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle ={{backgroundColor:  Colors.secondary}}
      >
        <BottomSheetView style={styles.contentContainer}>
          <NotificationOption onChange={(value) => {handleFilterNotify(value)
          }} />
        </BottomSheetView>
      </BottomSheet>
       </View>
    )
}

export default Notifications
