import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useReference, useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, Colors, useTheme } from '@mezon/mobile-ui';
import { channelsActions, selectCurrentClan, useAppDispatch } from '@mezon/store-mobile';
import { ChannelThreads } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { MutableRefObject, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN, AppStackScreenProps } from '../../../../../../app/navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonClanAvatar, MezonConfirm, MezonMenu, reserve } from '../../../../../../app/temp-ui';
import { style } from './styles';

interface IChannelMenuProps {
	inviteRef: MutableRefObject<any>;
	channel: ChannelThreads;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CHANNEL.STACK;
export default function ChannelMenu({ channel, inviteRef }: IChannelMenuProps) {
	const { t } = useTranslation(['channelMenu']);
	const { themeValue } = useTheme()
	const styles = style(themeValue);
	const { setOpenThreadMessageState } = useReference();
	const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
	const currentClan = useSelector(selectCurrentClan);
	const dispatch = useAppDispatch();
	const { isCanManageThread, isCanManageChannel } = useUserPermission();

	const isChannel = useMemo(() => {
		return Array.isArray(channel?.threads);
	}, [channel?.threads])

	const { dismiss } = useBottomSheetModal();

	const navigation = useNavigation<AppStackScreenProps<StackMenuClanScreen>['navigation']>();

	const watchMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.watchMenu.markAsRead'),
			onPress: () => reserve(),
			icon: <Icons.EyeIcon color={themeValue.textStrong} />,
		},
	];

	const inviteMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.inviteMenu.invite'),
			onPress: () => {
				inviteRef?.current?.present();
				dismiss();
			},
			icon: <Icons.GroupPlusIcon color={themeValue.textStrong} />,
		},
		//TODO: update later
		// {
		// 	title: t('menu.inviteMenu.favorite'),
		// 	onPress: () => {
		// 		inviteRef?.current?.present();
		// 		dismiss();
		// 	},
		// 	icon: <Icons.StarIcon color={themeValue.textStrong} />,
		// },
		// {
		// 	title: t('menu.inviteMenu.copyLink'),
		// 	onPress: () => {
		// 		inviteRef?.current?.present();
		// 		dismiss();
		// 	},
		// 	icon: <Icons.LinkIcon color={themeValue.textStrong} />,
		// },
	];

	const notificationMenu: IMezonMenuItemProps[] = [
		{
			title: isChannel ? t('menu.notification.muteCategory') : t('menu.notification.muteThread'),
			onPress: () => reserve(),
			icon: <Icons.BellSlashIcon color={themeValue.textStrong} />,
		},
		{
			title: t('menu.notification.notification'),
			onPress: () => reserve(),
			icon: <Icons.ChannelNotificationIcon color={themeValue.textStrong} />,
		},
	];

	const threadMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.thread.threads'),
			onPress: () => {
				dismiss();
				setOpenThreadMessageState(false);
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD });
			},
			icon: <Icons.ThreadIcon color={themeValue.textStrong} />
		}
	]

	const organizationMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.organizationMenu.edit'),
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
					screen: APP_SCREEN.MENU_CHANNEL.SETTINGS,
					params: {
						channelId: channel?.channel_id,
						isChannel: isChannel
					}
				});
			},
			icon: <Icons.SettingsIcon color={themeValue.textStrong} />,
			isShow: isCanManageChannel
		},
		{
			title: t('menu.organizationMenu.duplicateChannel'),
			onPress: () => reserve(),
			icon: <Icons.CopyIcon color={themeValue.textStrong} />,
			isShow: isCanManageChannel
		},
		{
			title: t('menu.organizationMenu.deleteChannel'),
			icon: <Icons.CloseSmallBoldIcon color={Colors.textRed} />,
			onPress: () => {
				setIsShowModalConfirm(true);
			},
			textStyle: {
				color: Colors.textRed
			},
			isShow: isCanManageChannel
		},
	];

	const manageThreadMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.manageThreadMenu.editThread'),
			icon: <Icons.PencilIcon color={themeValue.textStrong} />,
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
					screen: APP_SCREEN.MENU_CHANNEL.SETTINGS,
					params: {
						channelId: channel?.channel_id,
						isChannel: isChannel
					},
				});
			},
			isShow: isCanManageThread
		},
		{
			title: t('menu.manageThreadMenu.deleteThread'),
			icon: <Icons.CloseSmallBoldIcon color={Colors.textRed} />,
			onPress: () => {
				setIsShowModalConfirm(true);
			},
			textStyle: {
				color: Colors.textRed
			},
			isShow: isCanManageThread
		},
	];

	const mainChannelMenu: IMezonMenuSectionProps[] = [
		{
			items: watchMenu,
		},
		{
			items: inviteMenu,
		},
		{
			items: notificationMenu,
		},
		{
			items: threadMenu,
		},
		{
			items: organizationMenu,
		},
	]

	const mainThreadMenu: IMezonMenuSectionProps[] = [
		{
			items: watchMenu,
		},
		{
			items: manageThreadMenu,
		},
		{
			items: notificationMenu
		}
	]

	const handleConfirmDeleteChannel = async () => {
		await dispatch(channelsActions.deleteChannel({ channelId: channel?.channel_id || '', clanId: channel?.clan_id || '' }));
		setIsShowModalConfirm(false);
		dismiss();
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.avatarWrapper}>
					<MezonClanAvatar
						alt={currentClan?.clan_name}
						image={currentClan?.logo}
						defaultColor={baseColor.blurple}
					/>
				</View>
				<Text style={styles.serverName}>{channel?.channel_label}</Text>
			</View>

			<View style={{ flex: 1 }}>
				<MezonMenu menu={isChannel ? mainChannelMenu : mainThreadMenu} />
			</View>

			<MezonConfirm
				visible={isShowModalConfirm}
				onVisibleChange={setIsShowModalConfirm}
				onConfirm={handleConfirmDeleteChannel}
				title={isChannel ?
					t('modalConfirm.channel.title', { channelName: channel?.channel_label }) :
					t('modalConfirm.thread.title', { threadName: channel?.channel_label })
				}
				confirmText={isChannel ? t('modalConfirm.channel.confirmText') : t('modalConfirm.thread.confirmText')}
				content={isChannel ? t('modalConfirm.channel.content') : t('modalConfirm.thread.content')}
				hasBackdrop={true}
			/>
		</View>
	);
}
