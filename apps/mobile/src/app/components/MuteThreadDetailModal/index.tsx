import { View , Text} from "react-native";
import { styles } from "./MuteThreadDetailModal.styles";
import { AngleRight, MuteIcon } from "@mezon/mobile-components";
import { TouchableOpacity } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Colors } from "@mezon/mobile-ui";
import NotificationSetting from "../NotificationSetting";
import { useState } from "react";
import { useSelector } from "react-redux";
import { notificationSettingActions, selectCurrentChannel, selectCurrentChannelId, selectCurrentClanId, selectnotificatonSelected, useAppDispatch } from "@mezon/store-mobile";
import { useNavigation } from "@react-navigation/native";
import { APP_SCREEN } from "../../navigation/ScreenTypes";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const MuteThreadDetailModal = () => {
  const { t } = useTranslation(['notificationSetting']);
  const listMuteDuration = [
    {
      id: 1,
      label: t('notifySettingThreadModal.muteDuration.forFifteenMinutes'),
      action: ()=>{
        handleScheduleMute(15 * 60 * 1000)
      }
    },
    {
      id: 2,
      label: t('notifySettingThreadModal.muteDuration.forOneHour'),
      action: ()=>{ handleScheduleMute(60 * 60 * 1000)}
    },
    {
      id: 3,
      label: t('notifySettingThreadModal.muteDuration.forThreeHours'),
      action: ()=>{handleScheduleMute(3 * 60 * 60 * 1000)}
    },
    {
      id: 4,
      label: t('notifySettingThreadModal.muteDuration.forEightHours'),
      action: ()=>{handleScheduleMute(8 * 60 * 60 * 1000)}
    },
    {
      id: 5,
      label: t('notifySettingThreadModal.muteDuration.forTwentyFourHours'),
      action: ()=>{handleScheduleMute(24 * 60 * 60 * 1000)}
    },
    {
      id: 6,
      label: t('notifySettingThreadModal.muteDuration.untilTurnItBackOn'),
      action: ()=>{handleScheduleMute(Infinity)}
    },
  ]
  const navigation = useNavigation();
	const [mutedUntil, setMutedUntil] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentChannelId = useSelector(selectCurrentChannelId);
  const currentChannel = useSelector(selectCurrentChannel);
  const [isShowNotifySettingBottomSheet, setIsShowNotifySettingBottomSheet ] = useState<boolean>(false);
  const getNotificationChannelSelected = useSelector(selectnotificatonSelected);
	const currentClanId = useSelector(selectCurrentClanId);
  const snapPoints = useMemo(() => ["15%", "45%"], []);
	const dispatch = useAppDispatch();

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
    setIsShowNotifySettingBottomSheet(!isShowNotifySettingBottomSheet)
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setIsShowNotifySettingBottomSheet(false)
  };
	useEffect(() => {
    let idTimeOut;
		if (getNotificationChannelSelected?.active === 1) {
			setMutedUntil('');
		} else if (getNotificationChannelSelected?.active !== 1) {
			if (getNotificationChannelSelected?.time_mute) {
				const timeMute = new Date(getNotificationChannelSelected.time_mute);
				const currentTime = new Date();
				if (timeMute > currentTime) {
					const timeDifference = timeMute.getTime() - currentTime.getTime();
					const formattedDate = format(timeMute, 'dd/MM, HH:mm');
					setMutedUntil(`Muted until ${formattedDate}`);
          idTimeOut =	setTimeout(() => {
						const body = {
							channel_id: currentChannelId || '',
							notification_type: getNotificationChannelSelected?.notification_setting_type || '',
							clan_id: currentClanId || '',
							active: 1,
						};
						dispatch(notificationSettingActions.setMuteNotificationSetting(body));
					}, timeDifference);
				}
			}
		}
    return () =>{
      clearTimeout(idTimeOut)
    }
	}, [getNotificationChannelSelected,
    dispatch,
    currentChannelId,
    currentClanId]);

  const muteOrUnMuteChannel = (active: number) => {
		const body = {
			channel_id: currentChannelId || '',
			notification_type: getNotificationChannelSelected?.notification_setting_type || '',
			clan_id: currentClanId || '',
			active: active,
		};
		dispatch(notificationSettingActions.setMuteNotificationSetting(body));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
	};

  const handleScheduleMute = (duration: number) => {
		if (duration !== Infinity) {
			const now = new Date();
			const unmuteTime = new Date(now.getTime() + duration);
			const unmuteTimeISO = unmuteTime.toISOString();

			const body = {
				channel_id: currentChannelId || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || '',
				clan_id: currentClanId || '',
				time_mute: unmuteTimeISO,
			};
			dispatch(notificationSettingActions.setNotificationSetting(body));
		} else {
			const body = {
				channel_id: currentChannelId || '',
				notification_type: getNotificationChannelSelected?.notification_setting_type || '',
				clan_id: currentClanId || '',
				active: 0,
			};
			dispatch(notificationSettingActions.setMuteNotificationSetting(body));
		}
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.BOTTOM_SHEET });
	};
  const renderBackdrop = useCallback((props) => (
    <BottomSheetBackdrop
      {...props}
      opacity={0.5}
      onPress={closeBottomSheet}
      appearsOnIndex={1}
    />
  ), []);
  return (
    <View style={styles.wrapper}>
      <View style={styles.optionsBox}>
        {
        getNotificationChannelSelected?.active === 1 ? listMuteDuration.map(item => (
          <TouchableOpacity onPress={item.action} style={styles.wrapperItem} key={item.id}>
            <Text style={styles.option}>{item.label}</Text>
          </TouchableOpacity>
        )) :
        (
          <TouchableOpacity onPress={()=>{muteOrUnMuteChannel(1)}} style={styles.wrapperUnmuteBox}>
          <MuteIcon width={20} height={20} style={{ marginRight: 20 }} />
          <Text style={styles.option}>{`Unmute #${currentChannel?.channel_label}`}</Text>
          </TouchableOpacity>
        )
        }
      </View>
      <Text style={styles.InfoTitle}>{mutedUntil}</Text>
      <TouchableOpacity onPress={()=> openBottomSheet()} style={styles.wrapperItemNotification}>
        <Text style={styles.option}>Notification Settings</Text>
        <AngleRight width={20} height={20} />
      </TouchableOpacity>
      <Text style={styles.InfoTitle}>
        {t("notifySettingThreadModal.description")}
      </Text>
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle ={{backgroundColor:  Colors.secondary}}
      >
      <BottomSheetView >
        {isShowNotifySettingBottomSheet && <NotificationSetting />}
      </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

export default MuteThreadDetailModal ;
