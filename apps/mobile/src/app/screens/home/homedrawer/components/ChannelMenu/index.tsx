import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useCategory, useUserPermission } from '@mezon/core';
import {
	ENotificationActive,
	ENotificationChannelId,
	Icons,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	load,
	save
} from '@mezon/mobile-components';
import { Colors, baseColor, useTheme } from '@mezon/mobile-ui';
import {
	channelsActions,
	getStoreAsync,
	notificationSettingActions,
	selectCurrentChannelNotificatonSelected,
	selectCurrentClan,
	threadsActions,
	useAppDispatch
} from '@mezon/store-mobile';
import { ChannelThreads } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN, AppStackScreenProps } from '../../../../../../app/navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonClanAvatar, MezonConfirm, MezonMenu, reserve } from '../../../../../../app/temp-ui';
import { style } from './styles';

interface IChannelMenuProps {
	inviteRef: MutableRefObject<any>;
	channel: ChannelThreads;
	notifySettingRef: MutableRefObject<BottomSheetModal>;
}

type StackMenuClanScreen = typeof APP_SCREEN.MENU_CHANNEL.STACK;
export default function ChannelMenu({ channel, inviteRef, notifySettingRef }: IChannelMenuProps) {
	const { t } = useTranslation(['channelMenu']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	// const { setOpenThreadMessageState } = useReference();
	const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
	const currentClan = useSelector(selectCurrentClan);
	const dispatch = useAppDispatch();
	const { isCanManageThread, isCanManageChannel } = useUserPermission();
	const { categorizedChannels } = useCategory();
	useEffect(() => {
		dispatch(notificationSettingActions.getNotificationSetting({ channelId: channel?.channel_id }));
	}, []);
	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);

	const isChannelUnmute = useMemo(() => {
		return (
			getNotificationChannelSelected?.active === ENotificationActive.ON || getNotificationChannelSelected?.id === ENotificationChannelId.Default
		);
	}, [getNotificationChannelSelected]);
	const isChannel = useMemo(() => {
		return Array.isArray(channel?.threads);
	}, [channel?.threads]);

	const { dismiss } = useBottomSheetModal();

	const navigation = useNavigation<AppStackScreenProps<StackMenuClanScreen>['navigation']>();

	const watchMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.watchMenu.markAsRead'),
			onPress: () => reserve(),
			icon: <Icons.EyeIcon color={themeValue.textStrong} />
		}
	];

	const inviteMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.inviteMenu.invite'),
			onPress: () => {
				inviteRef?.current?.present();
				dismiss();
			},
			icon: <Icons.GroupPlusIcon color={themeValue.textStrong} />
		}
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

	const muteOrUnMuteChannel = (active: ENotificationActive) => {
		const body = {
			channel_id: channel?.channel_id || '',
			notification_type: getNotificationChannelSelected?.notification_setting_type || 0,
			clan_id: currentClan?.clan_id || '',
			active
		};
		dispatch(notificationSettingActions.setMuteNotificationSetting(body));
	};

	const notificationMenu: IMezonMenuItemProps[] = [
		{
			title: isChannel
				? `${isChannelUnmute ? t('menu.notification.muteChannel') : t('menu.notification.unMuteChannel')}`
				: `${isChannelUnmute ? t('menu.notification.muteThread') : t('menu.notification.unMuteThread')}`,
			onPress: () => {
				if (!isChannelUnmute) {
					muteOrUnMuteChannel(ENotificationActive.ON);
				} else {
					navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, {
						screen: APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL,
						params: { currentChannel: channel }
					});
				}
				dismiss();
			},
			icon: isChannelUnmute ? (
				<Icons.BellIcon width={22} height={22} color={themeValue.text} />
			) : (
				<Icons.BellSlashIcon color={themeValue.textStrong} />
			)
		},
		{
			title: t('menu.notification.notification'),
			onPress: () => {
				notifySettingRef?.current?.present();
				dismiss();
			},
			icon: <Icons.ChannelNotificationIcon color={themeValue.textStrong} />
		}
	];

	const threadMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.thread.threads'),
			onPress: () => {
				dismiss();
				dispatch(threadsActions.setOpenThreadMessageState(false));
				navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, {
					screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD,
					params: { channelThreads: channel }
				});
			},
			icon: <Icons.ThreadIcon color={themeValue.textStrong} />
		}
	];

	const organizationMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.organizationMenu.edit'),
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
					screen: APP_SCREEN.MENU_CHANNEL.SETTINGS,
					params: {
						channelId: channel?.channel_id
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
		}
	];

	const manageThreadMenu: IMezonMenuItemProps[] = [
		{
			title: t('menu.manageThreadMenu.leaveThread'),
			icon: <Icons.LeaveGroup color={Colors.textRed} />,
			onPress: () => reserve(),
			textStyle: {
				color: Colors.textRed
			},
			isShow: isCanManageThread
		},
		{
			title: t('menu.manageThreadMenu.closeThread'),
			icon: <Icons.CloseSmallBoldIcon color={themeValue.textStrong} />,
			onPress: () => reserve(),
			isShow: isCanManageThread
		},
		{
			title: t('menu.manageThreadMenu.lockThread'),
			icon: <Icons.LockIcon color={themeValue.textStrong} />,
			onPress: () => reserve(),
			isShow: isCanManageThread
		},
		{
			title: t('menu.manageThreadMenu.editThread'),
			icon: <Icons.PencilIcon color={themeValue.textStrong} />,
			onPress: () => {
				dismiss();
				navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
					screen: APP_SCREEN.MENU_CHANNEL.SETTINGS,
					params: {
						channelId: channel?.channel_id
					}
				});
			},
			isShow: isCanManageThread
		},
		{
			title: t('menu.manageThreadMenu.copyLink'),
			icon: <Icons.LinkIcon color={themeValue.textStrong} />,
			onPress: () => reserve(),
			isShow: isCanManageThread
		}
	];

	const mainChannelMenu: IMezonMenuSectionProps[] = [
		{
			items: watchMenu
		},
		{
			items: inviteMenu
		},
		{
			items: notificationMenu
		},
		{
			items: threadMenu
		},
		{
			items: organizationMenu
		}
	];

	const mainThreadMenu: IMezonMenuSectionProps[] = [
		{
			items: watchMenu
		},
		{
			items: manageThreadMenu
		},
		{
			items: notificationMenu
		}
	];

	const handleFocusDefaultChannel = async () => {
		const firstTextChannel = categorizedChannels[0]?.channels?.filter((channel) => channel?.type === 1)?.[0];
		if (!firstTextChannel) return;
		const { clan_id: clanId, channel_id: channelId, category_id: channelCateId } = firstTextChannel || {};
		const store = await getStoreAsync();
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		await Promise.all([
			store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false })),
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave)
		]);
		const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];
		if (!channelsCache?.includes(channelId)) {
			save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
		}
	};

	const handleConfirmDeleteChannel = async () => {
		await dispatch(channelsActions.deleteChannel({ channelId: channel?.channel_id || '', clanId: channel?.clan_id || '' }));
		setIsShowModalConfirm(false);
		dismiss();
		handleFocusDefaultChannel();
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.avatarWrapper}>
					<MezonClanAvatar alt={currentClan?.clan_name} image={currentClan?.logo} defaultColor={baseColor.blurple} />
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
				title={
					isChannel
						? t('modalConfirm.channel.title', { channelName: channel?.channel_label })
						: t('modalConfirm.thread.title', { threadName: channel?.channel_label })
				}
				confirmText={isChannel ? t('modalConfirm.channel.confirmText') : t('modalConfirm.thread.confirmText')}
				content={isChannel ? t('modalConfirm.channel.content') : t('modalConfirm.thread.content')}
				hasBackdrop={true}
			/>
		</View>
	);
}
