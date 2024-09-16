import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAuth, useCheckOwnerForUser } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import {
	channelsActions,
	selectAllChannelMembers,
	selectAllUserClans,
	selectEveryoneRole,
	selectRolesByChannelId,
	useAppDispatch,
	useAppSelector
} from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { MezonConfirm, MezonSwitch } from '../../../temp-ui';
import { AddMemberOrRoleBS } from '../components/AddMemberOrRoleBS';
import { MemberItem } from '../components/MemberItem';
import { RoleItem } from '../components/RoleItem';
import { IBasicViewProps } from '../types/channelPermission.type';

export const BasicView = memo(({ channel }: IBasicViewProps) => {
	const { themeValue } = useTheme();
	const { userId } = useAuth();
	const navigation = useNavigation<any>();
	const [checkClanOwner] = useCheckOwnerForUser();
	const dispatch = useAppDispatch();
	const { t } = useTranslation('channelSetting');
	const [visibleModalConfirm, setVisibleModalConfirm] = useState(false);
	const [isPrivateChannel, setIsPrivateChannel] = useState(false);
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const everyoneRole = useSelector(selectEveryoneRole);
	const allClanMembers = useSelector(selectAllUserClans);

	const listOfChannelRole = useSelector(selectRolesByChannelId(channel?.channel_id));
	const listOfChannelMember = useAppSelector((state) => selectAllChannelMembers(state, channel.channel_id as string));

	const clanOwner = useMemo(() => {
		return allClanMembers?.find((member) => checkClanOwner(member?.user?.id));
	}, [allClanMembers, checkClanOwner]);

	const availableMemberList = useMemo(() => {
		if (isPrivateChannel) {
			return listOfChannelMember;
		}
		return [clanOwner];
	}, [listOfChannelMember, isPrivateChannel, clanOwner]);

	const availableRoleList = useMemo(() => {
		if (isPrivateChannel) {
			return listOfChannelRole?.filter((role) => typeof role?.role_channel_active === 'number' && role?.role_channel_active === 1);
		}
		return [everyoneRole];
	}, [listOfChannelRole, isPrivateChannel, everyoneRole]);

	const onPrivateChannelChange = useCallback((value: boolean) => {
		setIsPrivateChannel(value);
		setVisibleModalConfirm(true);
	}, []);

	const openBottomSheet = () => {
		bottomSheetRef.current?.present();
	};

	const updateChannel = async () => {
		await setVisibleModalConfirm(false);
		navigation?.goBack();
		const response = await dispatch(
			channelsActions.updateChannelPrivate({
				channel_id: channel.id,
				channel_private: isPrivateChannel ? 0 : 1,
				user_ids: [userId],
				role_ids: []
			})
		);
		if (response?.type === 'channels/updateChannelPrivate/fulfilled') {
			Toast.show({
				type: 'success',
				props: {
					text2: 'Save Successfully',
					leadingIcon: <Icons.CheckmarkLargeIcon color={Colors.green} />
				}
			});
		} else {
			Toast.show({
				type: 'success',
				props: {
					text2: 'Save Fail',
					leadingIcon: <Icons.ClockXIcon color={Colors.red} />
				}
			});
		}
	};

	const closeModalConfirm = () => {
		setIsPrivateChannel(!isPrivateChannel);
	};

	useEffect(() => {
		if (channel?.channel_private !== undefined) {
			setIsPrivateChannel(Boolean(channel?.channel_private));
		}
	}, [channel?.channel_private]);
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
					marginBottom={size.s_16}
				>
					<Block alignItems="center">
						<Text color={themeValue.text}>{t('channelPermission.privateChannel')}</Text>
					</Block>
					<MezonSwitch value={isPrivateChannel} onValueChange={onPrivateChannelChange} />
				</Block>
			</TouchableOpacity>

			{Boolean(channel?.channel_private) && (
				<Block>
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
				</Block>
			)}

			<Block gap={size.s_10} marginBottom={size.s_10}>
				<Text color={themeValue.textDisabled}>{t('channelPermission.whoCanAccess')}</Text>
				<Block backgroundColor={themeValue.primary} borderRadius={size.s_14}>
					{availableRoleList?.map((role) => {
						return <RoleItem key={role?.id} role={role} channel={channel} />;
					})}
				</Block>

				<Block backgroundColor={themeValue.primary} borderRadius={size.s_14}>
					{availableMemberList?.map((member) => {
						return <MemberItem key={member?.id} member={member} channelId={channel?.channel_id} />;
					})}
				</Block>
			</Block>

			<MezonConfirm
				visible={visibleModalConfirm}
				onVisibleChange={setVisibleModalConfirm}
				onConfirm={updateChannel}
				onCancel={closeModalConfirm}
				title={
					isPrivateChannel
						? t('channelPermission.warningModal.privateChannelTitle')
						: t('channelPermission.warningModal.publicChannelTitle')
				}
				confirmText={t('channelPermission.warningModal.confirm')}
				content={
					isPrivateChannel
						? t('channelPermission.warningModal.privateChannelContent', { channelLabel: channel?.channel_label })
						: t('channelPermission.warningModal.publicChannelContent', { channelLabel: channel?.channel_label })
				}
				hasBackdrop={true}
			/>
			<AddMemberOrRoleBS bottomSheetRef={bottomSheetRef} channel={channel} />
		</ScrollView>
	);
});
