import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useChannelMembersActions } from '@mezon/core';
import { Block, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity, ChannelsEntity } from '@mezon/store-mobile';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu } from 'apps/mobile/src/app/temp-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { style } from './UserInfoDm.styles';

export default function UserInfoDm({ user, currentChannel }: { user: ChannelMembersEntity; currentChannel: ChannelsEntity }) {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['userProfile']);
	const styles = style(themeValue);
	const { removeMemberChannel } = useChannelMembersActions();
	const { dismiss } = useBottomSheetModal();
	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', options);
	};

	const settingsMenu: IMezonMenuItemProps[] = [
		{
			title: t('userInfoDM.menu.removeFromGroup'),
			onPress: () => {
				handleRemoveMemberChannel();
			},
			styleBtn: { backgroundColor: themeValue.bgInputPrimary }
		}
	];

	const handleRemoveMemberChannel = async () => {
		if (user) {
			dismiss();
			const userIds = [user?.user?.id ?? ''];
			await removeMemberChannel({ channelId: currentChannel?.channel_id || '', userIds });
		}
	};

	const menu: IMezonMenuSectionProps[] = [
		{
			items: settingsMenu
		}
	];

	return (
		<Block>
			<Block>
				{/* <Text style={styles.title}>ABOUT ME</Text>
				<Text style={styles.desc}>{user?.user?.about_me}</Text> */}
			</Block>
			<Block>
				<Text style={styles.title}>{t('userInfoDM.discordMemberSince')}</Text>
				<Text style={styles.desc}>{formatDate(user?.user?.create_time)}</Text>
			</Block>
			<MezonMenu menu={menu} />
		</Block>
	);
}
