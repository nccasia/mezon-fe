import { Icons } from '@mezon/mobile-components';
import { Block, size, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity, selectAllRolesClan, selectMembersByChannelId, selectRolesByChannelId, useAppDispatch } from '@mezon/store-mobile';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { MezonConfirm, MezonSwitch } from '../../../temp-ui';
import { MemberItem } from '../components/MemberItem';

interface IBasicViewProps {
	channel: ChannelsEntity;
}

export const BasicView = memo(({ channel }: IBasicViewProps) => {
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();
	const { t } = useTranslation('channelSetting');
	const [visibleModalConfirm, setVisibleModalConfirm] = useState(false);
	const rolesChannel = useSelector(selectRolesByChannelId(channel?.channel_id));
	const rawMembers = useSelector(selectMembersByChannelId(channel?.channel_id));
	const rolesClan = useSelector(selectAllRolesClan);

	const availableAccessMemberList = useMemo(() => {
		if (!rawMembers) return [];
		return rawMembers.filter((member) => member?.userChannelId !== '0');
	}, [rawMembers]);

	const listRolesInChannel = useMemo(() => {
		if (channel?.channel_private === 0 || channel?.channel_private === undefined) {
			return [];
		}
		return rolesChannel?.filter((role) => typeof role?.role_channel_active === 'number' && role?.role_channel_active === 1);
	}, [rolesChannel, channel?.channel_private]);

	const isPrivateChannel = useMemo(() => {
		return Boolean(channel?.channel_private);
	}, [channel?.channel_private]);

	const onPrivateChannelChange = useCallback((value: boolean) => {
		setVisibleModalConfirm(true);
	}, []);

	const openBottomSheet = () => {
		//TODO
	};

	const updateChannel = async () => {
		//TODO
	};

	const closeModalConfirm = () => {
		//TODO
	};
	return (
		<ScrollView>
			<TouchableOpacity onPress={() => onPrivateChannelChange(!isPrivateChannel)}>
				<Block
					flexDirection="row"
					justifyContent="space-between"
					padding={size.s_14}
					alignItems="center"
					borderRadius={size.s_14}
					backgroundColor={themeValue.primary}
					marginVertical={size.s_16}
				>
					<Block alignItems="center">
						<Text color={themeValue.text}>{t('channelPermission.privateChannel')}</Text>
					</Block>
					<MezonSwitch value={isPrivateChannel} onValueChange={onPrivateChannelChange} />
				</Block>
			</TouchableOpacity>

			<Text color={themeValue.textDisabled}>{t('channelPermission.basicViewDescription')}</Text>

			<TouchableOpacity onPress={() => openBottomSheet()}>
				<Block
					flexDirection="row"
					justifyContent="space-between"
					padding={size.s_14}
					alignItems="center"
					borderRadius={size.s_14}
					backgroundColor={themeValue.primary}
					marginVertical={size.s_16}
				>
					<Block flexDirection="row" gap={size.s_14} alignItems="center">
						<Icons.CirclePlusPrimaryIcon />
						<Text color={themeValue.text}>{t('channelPermission.addMemberAndRoles')}</Text>
					</Block>
					<Icons.ChevronSmallRightIcon />
				</Block>
			</TouchableOpacity>

			<Block gap={size.s_10}>
				<Text color={themeValue.textDisabled}>{t('channelPermission.whoCanAccess')}</Text>
				{/* TODO: list of role */}
				{/* {listRolesInChannel.map((role) => {
					return (
						<Block key={role?.user?.id}>
							<Text>{member?.user?.display_name}</Text>
							<Text>{member?.user?.username}</Text>
						</Block>
					);
				})} */}

				<Block backgroundColor={themeValue.primary} borderRadius={size.s_14}>
					{availableAccessMemberList?.map((member) => {
						return <MemberItem key={member?.id} member={member} channelId={channel?.channel_id} />;
					})}
				</Block>
			</Block>

			<MezonConfirm
				visible={visibleModalConfirm}
				onVisibleChange={setVisibleModalConfirm}
				onConfirm={updateChannel}
				onCancel={closeModalConfirm}
				title={isPrivateChannel ? 'Make this channel private?' : 'Make this channel open to everyone?'}
				confirmText={'Yes'}
				content={
					isPrivateChannel
						? `${channel?.channel_label} will become available to all members`
						: `${channel?.channel_label} will become private and visible to select members and roles`
				}
				hasBackdrop={true}
			/>
		</ScrollView>
	);
});
