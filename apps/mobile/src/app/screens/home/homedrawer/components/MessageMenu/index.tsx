import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectCurrentUserId, useAppSelector } from '@mezon/store';
import { DirectEntity, deleteChannel, directActions, fetchDirectMessage, removeMemberChannel, useAppDispatch } from '@mezon/store-mobile';
import { ChannelType } from 'mezon-js';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonConfirm, MezonMenu, reserve } from '../../../../../componentUI';
import { style } from './styles';

interface IServerMenuProps {
	// inviteRef: MutableRefObject<any>;
	messageInfo: DirectEntity;
}

function MessageMenu({ messageInfo }: IServerMenuProps) {
	const { t } = useTranslation(['dmMessage']);
	const { themeValue } = useTheme();
	const [isVisibleLeaveGroupModal, setIsVisibleLeaveGroupModal] = useState<boolean>(false);
	const styles = style(themeValue);
	const dispatch = useAppDispatch();

	const { dismiss } = useBottomSheetModal();

	const isGroup = useMemo(() => {
		return Number(messageInfo?.type) === ChannelType.CHANNEL_TYPE_GROUP;
	}, [messageInfo?.channel_avatar]);

	const lastOne = useMemo(() => {
		return !messageInfo?.user_id.length;
	}, [messageInfo?.user_id]);

	const leaveGroupMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => {
				setIsVisibleLeaveGroupModal(true);
			},
			isShow: isGroup,
			title: lastOne ? t('delete.leaveGroup') : t('menu.leaveGroup'),
			textStyle: { color: 'red' }
		}
	];

	const profileMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.profile'),
			isShow: !isGroup
		},
		{
			onPress: async () => {
				await dispatch(directActions.closeDirectMessage({ channel_id: messageInfo?.channel_id }));
				dismiss();
			},
			title: t('menu.closeDm'),
			isShow: !isGroup
		}
	];

	const markAsReadMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.markAsRead')
		}
	];

	const favoriteMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.favorite')
		}
	];

	const optionsMenu: IMezonMenuItemProps[] = [
		{
			onPress: () => reserve(),
			title: t('menu.muteConversation')
		},
		{
			onPress: () => reserve(),
			title: t('menu.notificationSettings')
		}
	];

	const menu: IMezonMenuSectionProps[] = [
		{
			items: leaveGroupMenu
		},
		{
			items: profileMenu
		},
		{
			items: markAsReadMenu
		},
		{
			items: favoriteMenu
		},
		{
			items: optionsMenu
		}
	];
	const currentUserId = useAppSelector(selectCurrentUserId);

	const handleLeaveGroupConfirm = async () => {
		const isLeaveOrDeleteGroup = lastOne
			? await dispatch(deleteChannel({ clanId: '', channelId: messageInfo?.channel_id ?? '', isDmGroup: true }))
			: await dispatch(removeMemberChannel({ channelId: messageInfo?.channel_id || '', userIds: [currentUserId], kickMember: false }));
		if (!isLeaveOrDeleteGroup) {
			return;
		}

		await dispatch(fetchDirectMessage({ noCache: true }));
		setIsVisibleLeaveGroupModal(false);
		dismiss();
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{isGroup ? (
					<View style={styles.groupAvatar}>
						<Icons.GroupIcon />
					</View>
				) : (
					<View style={styles.avatarWrapper}>
						{messageInfo?.channel_avatar?.[0] ? (
							<Image source={{ uri: messageInfo?.channel_avatar?.[0] }} style={styles.friendAvatar} />
						) : (
							<View style={styles.wrapperTextAvatar}>
								<Text style={styles.textAvatar}>{(messageInfo?.channel_label || messageInfo?.usernames)?.charAt?.(0)}</Text>
							</View>
						)}
					</View>
				)}
				<View style={styles.titleWrapper}>
					<Text style={styles.serverName} numberOfLines={2}>
						{messageInfo?.channel_label || messageInfo?.usernames}
					</Text>
					{isGroup && <Text style={styles.memberText}>{messageInfo?.user_id.length + 1} members</Text>}
				</View>
			</View>

			<View>
				<MezonMenu menu={menu} />
			</View>

			<MezonConfirm
				visible={isVisibleLeaveGroupModal}
				onConfirm={handleLeaveGroupConfirm}
				onVisibleChange={setIsVisibleLeaveGroupModal}
				title={t('confirm.title', {
					groupName: messageInfo?.channel_label
				})}
				content={t('confirm.content', {
					groupName: messageInfo?.channel_label
				})}
				confirmText={t('confirm.confirmText')}
			/>
		</View>
	);
}

export default memo(MessageMenu);
