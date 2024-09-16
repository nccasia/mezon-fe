import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import {
	channelUsersActions,
	selectAllChannelMembers,
	selectAllRolesClan,
	selectAllUserClans,
	selectCurrentClanId,
	selectEveryoneRole,
	selectRolesByChannelId,
	useAppDispatch,
	useAppSelector
} from '@mezon/store-mobile';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonInput } from '../../../../temp-ui';
import { normalizeString } from '../../../../utils/helpers';
import { IAddMemberOrRoleContentProps } from '../../types/channelPermission.type';
import { MemberItem } from '../MemberItem';
import { RoleItem } from '../RoleItem';

export const AddMemberOrRoleContent = memo(({ channel, onDismiss }: IAddMemberOrRoleContentProps) => {
	const { themeValue } = useTheme();
	const [searchText, setSearchText] = useState('');
	const currentClanId = useSelector(selectCurrentClanId);
	const everyoneRole = useSelector(selectEveryoneRole);
	const dispatch = useAppDispatch();
	const { t } = useTranslation('channelSetting');
	const [selectedMemberIdList, setSelectedMemberIdList] = useState<string[]>([]);
	const [selectedRoleIdList, setSelectedRoleIdList] = useState<string[]>([]);

	const allClanMembers = useSelector(selectAllUserClans);
	const allClanRoles = useSelector(selectAllRolesClan);

	const listOfChannelMember = useAppSelector((state) => selectAllChannelMembers(state, channel.channel_id as string));
	const listOfChannelRole = useSelector(selectRolesByChannelId(channel?.channel_id));

	const listOfMemberCanAdd = useMemo(() => {
		const addedMemberIdList = listOfChannelMember?.filter((member) => member.userChannelId !== '0')?.map((member) => member?.user?.id) || [];
		return allClanMembers?.filter((member) => !addedMemberIdList.includes(member?.user?.id));
	}, [listOfChannelMember, allClanMembers]);

	const listOfRoleCanAdd = useMemo(() => {
		const addedRoleIdList = listOfChannelRole?.map((role) => role?.id) || [];
		return allClanRoles?.filter((role) => !addedRoleIdList.includes(role?.id) && everyoneRole?.id !== role?.id);
	}, [listOfChannelRole, allClanRoles, everyoneRole?.id]);

	const disableAddButton = useMemo(() => {
		return !(selectedMemberIdList.length || selectedRoleIdList.length);
	}, [selectedMemberIdList, selectedRoleIdList]);

	const filteredSearch = useMemo(() => {
		return {
			roles: listOfRoleCanAdd?.filter((role) => normalizeString(role?.title)?.includes(normalizeString(searchText))),
			members: listOfMemberCanAdd?.filter(
				(member) =>
					normalizeString(member?.user?.display_name)?.includes(normalizeString(searchText)) ||
					normalizeString(member?.user?.username).includes(normalizeString(searchText))
			)
		};
	}, [listOfRoleCanAdd, listOfMemberCanAdd, searchText]);

	const onSelectMemberChange = useCallback(
		(value: boolean, memberId: string) => {
			const newMemberIdList = new Set(selectedMemberIdList);
			if (value) {
				newMemberIdList.add(memberId);
				setSelectedMemberIdList([...newMemberIdList]);
				return;
			}
			newMemberIdList.delete(memberId);
			setSelectedMemberIdList([...newMemberIdList]);
		},
		[selectedMemberIdList]
	);

	const onSelectRoleChange = useCallback(
		(value: boolean, roleId: string) => {
			const newRoleIdList = new Set(selectedRoleIdList);
			if (value) {
				newRoleIdList.add(roleId);
				setSelectedRoleIdList([...newRoleIdList]);
				return;
			}
			newRoleIdList.delete(roleId);
			setSelectedRoleIdList([...newRoleIdList]);
		},
		[selectedRoleIdList]
	);

	const addMemberOrRole = async () => {
		if (disableAddButton) return;
		if (selectedMemberIdList?.length > 0) {
			const body = {
				channelId: channel.id,
				channelType: channel.type,
				userIds: selectedMemberIdList,
				clanId: currentClanId || ''
			};
			await dispatch(channelUsersActions.addChannelUsers(body));
		}
		if (selectedRoleIdList?.length > 0) {
			const body = {
				clanId: currentClanId || '',
				channelId: channel.id,
				roleIds: selectedRoleIdList,
				channelType: channel.type
			};
			await dispatch(channelUsersActions.addChannelRoles(body));
		}
		onDismiss && onDismiss();
	};

	return (
		<Block paddingHorizontal={size.s_14} flex={1}>
			<Block flexDirection="row" justifyContent="center">
				<Block alignItems="center">
					<Text h4 bold color={themeValue.white}>
						{t('channelPermission.bottomSheet.addMembersOrRoles')}
					</Text>
					<Text color={themeValue.text}>#{channel?.channel_label}</Text>
				</Block>
				<TouchableOpacity
					onPress={addMemberOrRole}
					style={{
						position: 'absolute',
						top: 0,
						right: 0
					}}
					disabled={disableAddButton}
				>
					<Block padding={size.s_10}>
						<Text bold h4 color={Colors.textViolet}>
							{t('channelPermission.bottomSheet.add')}
						</Text>
					</Block>
				</TouchableOpacity>
			</Block>

			<Block paddingVertical={size.s_16}>
				<MezonInput value={searchText} onTextChange={setSearchText} placeHolder={'Search Roles & Members'} />
			</Block>
			<BottomSheetScrollView>
				<Block gap={size.s_16} marginBottom={size.s_18}>
					{filteredSearch?.roles?.length ? (
						<Block gap={size.s_16}>
							<Text color={themeValue.textDisabled}>{t('channelPermission.bottomSheet.roles')}</Text>
							{filteredSearch?.roles?.map((role) => {
								return (
									<RoleItem
										key={role?.id}
										role={role}
										channel={channel}
										isCheckbox={true}
										isChecked={selectedRoleIdList?.includes(role?.id)}
										onSelectRoleChange={onSelectRoleChange}
									/>
								);
							})}
						</Block>
					) : null}

					{filteredSearch?.members?.length ? (
						<Block gap={size.s_16}>
							<Text color={themeValue.textDisabled}>{t('channelPermission.bottomSheet.members')}</Text>
							{filteredSearch?.members?.map((member) => {
								return (
									<MemberItem
										key={member?.id}
										member={member}
										channelId={channel?.channel_id}
										isCheckbox={true}
										isChecked={selectedMemberIdList?.includes(member?.user?.id)}
										onSelectMemberChange={onSelectMemberChange}
									/>
								);
							})}
						</Block>
					) : null}
				</Block>
			</BottomSheetScrollView>
		</Block>
	);
});
