import { useAuth, useChannelMembersActions, useUserPermission } from '@mezon/core';
import { ActionEmitEvent, Icons } from '@mezon/mobile-components';
import { baseColor, Block, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity, selectCurrentClanId } from '@mezon/store-mobile';
import React, { useMemo, useState } from 'react';
import { DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonModal } from '../../../../../../../../app/temp-ui/MezonModal';
import KickUserClanModal from '../KickUserClanModal';
import { ManageUserModal } from '../ManageUserModal';
import { style } from './UserSettingProfile.style';

export enum EActionSettingUserProfile {
	Manage = 'Manage',
	TimeOut = 'Timeout',
	Kick = 'Kick',
	Ban = 'Ban',
}

interface IUserSettingProfileProps {
	user: ChannelMembersEntity;
}

export interface IProfileSetting {
	label: string;
	value: EActionSettingUserProfile;
	icon: React.JSX.Element;
	action: (action?: EActionSettingUserProfile) => void;
	isShow: boolean;
}

const UserSettingProfile = ({
	user,
}: IUserSettingProfileProps) => {
	const { themeValue } = useTheme();
	const { userProfile } = useAuth();
	const styles = style(themeValue);
	const [visibleKickUserModal, setVisibleKickUserModal] = useState<boolean>(false);
	const [visibleManageUserModal, setVisibleManageUserModal] = useState<boolean>(false);
	const { removeMemberClan } = useChannelMembersActions();
	const isItMe = useMemo(() => userProfile?.user?.id === user?.user?.id, [user?.user?.id, userProfile?.user?.id]);
	const currentClanId = useSelector(selectCurrentClanId);
	const { isClanOwner, userPermissionsStatus } = useUserPermission();
	const handleSettingUserProfile = (action?: EActionSettingUserProfile) => {
		switch (action) {
			case EActionSettingUserProfile.Manage:
				setVisibleManageUserModal(true);
				break;
			case EActionSettingUserProfile.TimeOut:
				break;
			case EActionSettingUserProfile.Kick:
				setVisibleKickUserModal(true);
				break;
			case EActionSettingUserProfile.Ban:
				break;
			default:
				break;
		}
	};
	const profileSetting: IProfileSetting[] = useMemo(() => {
		const settingList = [
			{
				label: `${EActionSettingUserProfile.Manage}`,
				value: EActionSettingUserProfile.Manage,
				icon: <Icons.SettingsIcon color={themeValue.text} width={20} height={20} />,
				action: handleSettingUserProfile,
				isShow: isClanOwner || userPermissionsStatus.administrator || userPermissionsStatus['manage-clan'],
			},
			{
				label: `${EActionSettingUserProfile.TimeOut}`,
				value: EActionSettingUserProfile.TimeOut,
				icon: <Icons.ClockWarningIcon color={themeValue.text} width={20} height={20} />,
				action: handleSettingUserProfile,
				isShow: isClanOwner && !isItMe,
			},
			{
				label: `${EActionSettingUserProfile.Kick}`,
				value: EActionSettingUserProfile.Kick,
				icon: <Icons.UserMinusIcon width={20} height={20} color={baseColor.red} />,
				action: handleSettingUserProfile,
				isShow: isClanOwner && !isItMe,
			},
			{
				label: `${EActionSettingUserProfile.Ban}`,
				value: EActionSettingUserProfile.Ban,
				icon: <Icons.HammerIcon width={20} height={20} color={baseColor.red} />,
				action: handleSettingUserProfile,
				isShow: isClanOwner && !isItMe,
			},
		]
		return settingList
	}, [isItMe, isClanOwner, themeValue, userPermissionsStatus]);

	const handleRemoveUserClans = async (value: string) => {
		if (user) {
			setVisibleKickUserModal(false);
			DeviceEventEmitter.emit(ActionEmitEvent.SHOW_INFO_USER_BOTTOM_SHEET, { isHiddenBottomSheet: true });
			const userIds = [user.user?.id ?? ''];
			await removeMemberClan({ clanId: currentClanId as string, channelId: user.channelId as string, userIds });
		}
	};

	return (
		<Block>
			{profileSetting.some(action => action.isShow) && (
				<Block style={styles.wrapper}>
					{profileSetting?.map((item, index) => {
						if (!item?.isShow) return <Block />;
						return (
							<TouchableOpacity onPress={() => item.action(item.value)} key={index}>
								<Block style={styles.option}>
									{item?.icon}
									<Text style={styles.textOption}>
										{item?.label}
									</Text>
								</Block>
							</TouchableOpacity>
						)
					})}
				</Block>
			)}

			<MezonModal
				visible={visibleKickUserModal}
				visibleChange={(visible) => {
					setVisibleKickUserModal(visible);
				}}
			>
				<KickUserClanModal onRemoveUserClan={(value) => handleRemoveUserClans(value)} user={user} />
			</MezonModal>

			<ManageUserModal
				visible={visibleManageUserModal}
				user={user}
				onclose={() => setVisibleManageUserModal(false)}
				profileSetting={profileSetting}
			/>
		</Block>
	);
};

export default UserSettingProfile;
