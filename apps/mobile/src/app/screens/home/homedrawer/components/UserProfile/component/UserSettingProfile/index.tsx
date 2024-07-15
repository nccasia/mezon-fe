import { useChannelMembers } from '@mezon/core';
import { ActionEmitEvent, ClockWarning, HammerIcon, SettingIcon, UserMinus } from '@mezon/mobile-components';
import { Block, Colors, Text, size } from '@mezon/mobile-ui';
import { ChannelMembersEntity, ChannelsEntity, ClansEntity, selectCurrentClanId } from '@mezon/store-mobile';
import { ApiAccount } from 'mezon-js/api.gen';
import React, { useMemo, useState } from 'react';
import { DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonModal } from '../../../../../../../../app/temp-ui/MezonModal';
import KickUserClanModal from '../KickUserClanModal';
import { styles } from './UserSettingProfile.style';

enum EActionSettingUserProfile {
	Manage = 'Manage',
	TimeOut = 'Timeout',
	Kick = 'Kick',
	Ban = 'Ban',
}

const UserSettingProfile = ({
	user,
	clan,
	currentChannel,
	userProfile,
}: {
	user: ChannelMembersEntity;
	clan: ClansEntity;
	currentChannel: ChannelsEntity;
	userProfile: ApiAccount;
}) => {
	const [visibleModal, setVisibleModal] = useState<boolean>(false);
	const { removeMemberClan } = useChannelMembers();
	const checkCreateUser = useMemo(() => userProfile?.user?.id === currentChannel?.creator_id, [currentChannel?.creator_id, userProfile?.user?.id]);
	const checkUser = useMemo(() => userProfile?.user?.id === user?.user?.id, [user?.user?.id, userProfile?.user?.id]);

	const currentClanId = useSelector(selectCurrentClanId);
	const handleSettingUserProfile = (action?: EActionSettingUserProfile) => {
		switch (action) {
			case EActionSettingUserProfile.Manage:
				break;
			case EActionSettingUserProfile.TimeOut:
				break;
			case EActionSettingUserProfile.Kick:
				setVisibleModal(true);
				break;
			case EActionSettingUserProfile.Ban:
				break;
			default:
				break;
		}
	};
	const profileSetting = [
		{
			label: EActionSettingUserProfile.Manage,
			value: EActionSettingUserProfile.Manage,
			icon: <SettingIcon color={Colors.textGray} width={20} height={20} />,
			action: handleSettingUserProfile,
			isShow: true,
		},
		{
			label: `${EActionSettingUserProfile.TimeOut}`,
			value: EActionSettingUserProfile.TimeOut,
			icon: <ClockWarning width={20} height={20} />,
			action: handleSettingUserProfile,
			isShow: checkCreateUser && !checkUser,
		},
		{
			label: `${EActionSettingUserProfile.Kick}`,
			value: EActionSettingUserProfile.Kick,
			icon: <UserMinus width={20} height={20} />,
			action: handleSettingUserProfile,
			isShow: checkCreateUser && !checkUser,
		},
		{
			label: `${EActionSettingUserProfile.Ban}`,
			value: EActionSettingUserProfile.Ban,
			icon: <HammerIcon width={20} height={20} />,
			action: handleSettingUserProfile,
			isShow: checkCreateUser && !checkUser,
		},
	];

	const handleRemoveUserClans = async (value: string) => {
		if (user) {
			setVisibleModal(false);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_INFO_USER_BOTTOM_SHEET, { isHiddenBottomSheet: true });
			const userIds = [user.user?.id ?? ''];
			await removeMemberClan({ clanId: currentClanId as string, channelId: user.channelId as string, userIds });
		}
	};

	return (
		<Block style={styles.wrapper}>
			{profileSetting?.map((item, index) => (
				<TouchableOpacity onPress={() => item.action(item.value)}>
					{item?.isShow ? (
						<Block key={index} style={styles.option}>
							{item?.icon}
							<Text
								style={styles.textOption}
							>
								{item?.label}
							</Text>
						</Block>
					) : null}
				</TouchableOpacity>
			))}
			<MezonModal
				visible={visibleModal}
				visibleChange={(visible) => {
					setVisibleModal(visible);
				}}
			>
				<KickUserClanModal onRemoveUserClan={(value) => handleRemoveUserClans(value)} user={user} clan={clan} />
			</MezonModal>
		</Block>
	);
};

export default UserSettingProfile;
