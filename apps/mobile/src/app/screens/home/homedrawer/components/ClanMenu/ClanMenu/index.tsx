import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClan } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { EProfileTab } from 'apps/mobile/src/app/screens/settings/ProfileSetting';
import { MutableRefObject, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonClanAvatar, MezonMenu, reserve } from '../../../../../../../app/temp-ui';
import DeleteClanModal from '../../../../../../components/DeleteClanModal';
import { APP_SCREEN, AppStackScreenProps } from '../../../../../../navigation/ScreenTypes';
import MezonButtonIcon from '../../../../../../temp-ui/MezonButtonIcon';
import ClanMenuInfo from '../ClanMenuInfo';
import { style } from './styles';

interface IServerMenuProps {
	inviteRef: MutableRefObject<any>;
}

export default function ClanMenu({ inviteRef }: IServerMenuProps) {
	const currentClan = useSelector(selectCurrentClan);
	const { t } = useTranslation(['clanMenu']);
	const { themeValue } = useTheme();
	const [isVisibleDeleteModal, setIsVisibleDeleteModal] = useState<boolean>(false);
	const styles = style(themeValue);

	const navigation = useNavigation<AppStackScreenProps['navigation']>();
	const { dismiss } = useBottomSheetModal();

	const handleOpenInvite = () => {
		inviteRef?.current.present();
		dismiss();
	};
	const { isClanOwner } = useUserPermission();

	const handleOpenSettings = () => {
		navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.SETTINGS });
		dismiss();
	};

  const handelOpenNotifications = useCallback(() => {
    navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.NOTIFICATION_SETTING });
		dismiss();
  },[])
	const watchMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.watchMenu.markAsRead'),
		},
		{
			onPress: () => reserve(),
			title: t('menu.watchMenu.browseChannels'),
		},
	];

	const organizationMenu: IMezonMenuItemProps[] = [
		// {
		// 	onPress: () => reserve(),
		// 	title: t('menu.organizationMenu.createChannel'),
		// },
		{
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.CREATE_CATEGORY });
			},
			title: t('menu.organizationMenu.createCategory'),
		},
		{
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, { screen: APP_SCREEN.MENU_CLAN.CREATE_EVENT });
			},
			title: t('menu.organizationMenu.createEvent'),
		},
	];

	const optionsMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.SETTINGS.STACK, { 
										screen: APP_SCREEN.SETTINGS.PROFILE, 
										params: { profileTab: EProfileTab.ClanProfile } 
									});
			},
			title: t('menu.optionsMenu.editServerProfile'),
		},
		// {
		// 	title: t('menu.optionsMenu.showAllChannels'),
		// 	component: <MezonSwitch />,
		// },
		// {
		// 	title: t('menu.optionsMenu.hideMutedChannels'),
		// 	component: <MezonSwitch />,
		// },
		// {
		// 	title: t('menu.optionsMenu.allowDirectMessage'),
		// 	component: <MezonSwitch />,
		// },
		// {
		// 	title: t('menu.optionsMenu.allowMessageRequest'),

		// 	component: <MezonSwitch />,
		// },
		// {
		// 	onPress: () => reserve(),
		// 	title: t('menu.optionsMenu.reportServer'),
		// },
		// {
		// 	onPress: () => reserve(),
		// 	isShow: !isClanOwner,
		// 	title: t('menu.optionsMenu.leaveServer'),
		// 	textStyle: { color: 'red' },
		// },
		{
			onPress: () => {
				setIsVisibleDeleteModal(true);
			},
			isShow: isClanOwner,
			title: t('menu.optionsMenu.deleteClan'),
			textStyle: { color: 'red' },
		},
	];

	const menu: IMezonMenuSectionProps[] = [
		// {
		// 	items: watchMenu,
		// },
		{
			items: organizationMenu,
		},
		{
			items: optionsMenu,
		},
	];

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.avatarWrapper}>
					<MezonClanAvatar image={currentClan?.logo} alt={currentClan?.clan_name} />
				</View>
				<Text style={styles.serverName}>{currentClan?.clan_name}</Text>
				<ClanMenuInfo clan={currentClan} />

				<ScrollView contentContainerStyle={styles.actionWrapper} horizontal>
					<MezonButtonIcon
						title={`18 ${t('actions.boot')}`}
						icon={<Icons.BoostTier2Icon color={baseColor.purple} />}
						onPress={() => reserve()}
					/>
					<MezonButtonIcon
						title={t('actions.invite')}
						icon={<Icons.GroupPlusIcon color={themeValue.textStrong} />}
						onPress={handleOpenInvite}
					/>
					<MezonButtonIcon
						title={t('actions.notifications')}
						icon={<Icons.BellIcon color={themeValue.textStrong} />}
						onPress={handelOpenNotifications}
					/>

					<MezonButtonIcon
						title={t('actions.settings')}
						icon={<Icons.SettingsIcon color={themeValue.textStrong} />}
						onPress={handleOpenSettings}
					/>
				</ScrollView>
				<View>
					<MezonMenu menu={menu} />
				</View>
			</View>
			<DeleteClanModal
				isVisibleModal={isVisibleDeleteModal}
				visibleChange={(isVisible) => {
					setIsVisibleDeleteModal(isVisible);
				}}
			></DeleteClanModal>
		</View>
	);
}
