import { useRoles, useUserPermission } from '@mezon/core';
import { CheckIcon, CloseIcon, Icons } from '@mezon/mobile-components';
import { Block, Colors, Text, baseColor, size, useTheme, verticalScale } from '@mezon/mobile-ui';
import {
	ChannelMembersEntity,
	selectAllRolesClan,
	selectCurrentChannelId,
	selectCurrentClan,
	useAppDispatch,
	usersClanActions
} from '@mezon/store-mobile';
import { EVERYONE_ROLE_ID } from '@mezon/utils';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { toastConfig } from '../../../../../../../configs/toastConfig';
import { IMezonMenuSectionProps, MezonAvatar, MezonMenu, MezonModal } from '../../../../../../../temp-ui';
import KickUserClanModal from '../KickUserClanModal';
import { EActionSettingUserProfile, IProfileSetting } from '../UserSettingProfile';

interface IManageUserModalProp {
	user: ChannelMembersEntity;
	visible: boolean;
	onclose: () => void;
	profileSetting: IProfileSetting[];
	setVisibleKickUserModal: any;
	visibleKickUserModal: any;
	handleRemoveUserClans: () => void;
}

export const ManageUserModal = memo(
	({ user, visible, onclose, profileSetting, visibleKickUserModal, setVisibleKickUserModal, handleRemoveUserClans }: IManageUserModalProp) => {
		const { themeValue } = useTheme();
		const [editMode, setEditMode] = useState(false);
		const rolesClan = useSelector(selectAllRolesClan);
		const currentClan = useSelector(selectCurrentClan);
		const { updateRole } = useRoles();
		const [selectedRole, setSelectedRole] = useState<string[]>([]);
		const [isLoading, setIsLoading] = useState(false);
		const { t } = useTranslation('message');
		const { maxPermissionLevel } = useUserPermission();
		const dispatch = useAppDispatch();
		const currentChannelId = useSelector(selectCurrentChannelId);

		const activeRoleOfUser = useMemo(() => {
			return rolesClan?.filter((role) => user?.role_id?.includes(role?.id)) || [];
		}, [rolesClan, user?.role_id]);

		const editableRoleList = useMemo(() => {
			return rolesClan?.filter((role) => role?.id !== EVERYONE_ROLE_ID);
		}, [rolesClan]);

		const handleAfterUpdate = (isSuccess: boolean) => {
			if (isSuccess) {
				Toast.show({
					type: 'success',
					props: {
						text2: 'Changes Saved',
						leadingIcon: <CheckIcon color={Colors.green} width={20} height={20} />
					}
				});
			} else {
				Toast.show({
					type: 'success',
					props: {
						text2: 'Failed',
						leadingIcon: <CloseIcon color={Colors.red} width={20} height={20} />
					}
				});
			}
		};

		const addRole = async (roleId: string) => {
			const activeRole = rolesClan?.find((role) => role.id === roleId);
			const response = await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [user?.user?.id] || [], [], [], []);
			handleAfterUpdate(Boolean(response));
			setIsLoading(false);
			if (response) {
				dispatch(
					usersClanActions.addRoleIdUser({
						id: roleId,
						channelId: currentChannelId,
						userId: user?.user?.id
					})
				);
			}
		};

		const deleteRole = async (roleId: string) => {
			const activeRole = rolesClan?.find((role) => role.id === roleId);
			const response = await updateRole(currentClan?.clan_id || '', roleId, activeRole?.title ?? '', [], [], [user?.user?.id] || [], []);
			handleAfterUpdate(Boolean(response));
			setIsLoading(false);
			if (response) {
				dispatch(
					usersClanActions.removeRoleIdUser({
						id: roleId,
						channelId: currentChannelId,
						userId: user?.user?.id
					})
				);
			}
		};

		const onSelectedRoleChange = async (value: boolean, roleId) => {
			setIsLoading(true);
			const uniqueSelectedRole = new Set(selectedRole);
			if (value) {
				uniqueSelectedRole.add(roleId);
				setSelectedRole([...uniqueSelectedRole]);
				addRole(roleId);
			} else {
				uniqueSelectedRole.delete(roleId);
				setSelectedRole([...uniqueSelectedRole]);
				deleteRole(roleId);
			}
		};

		useEffect(() => {
			if (user?.role_id) {
				setIsLoading(false);
				setSelectedRole(user?.role_id);
			}
		}, [user?.role_id]);

		const roleList = useMemo(() => {
			return !editMode
				? activeRoleOfUser?.map((role) => ({ ...role, disabled: false }))
				: editableRoleList?.map((role) => ({ ...role, disabled: maxPermissionLevel >= role?.max_level_permission }));
		}, [editMode, activeRoleOfUser, editableRoleList, maxPermissionLevel]);

		const menuActions = useMemo(
			() =>
				profileSetting
					.filter((item) => item.value !== EActionSettingUserProfile.Manage)
					.map((item) => ({
						items: [
							{
								title: `${item.label} '${user?.user?.username}'`,
								disabled: !item.isShow,
								textStyle: { color: baseColor.redStrong, fontSize: verticalScale(14) },
								onPress: () => item?.action(item?.value)
							}
						]
					})) satisfies IMezonMenuSectionProps[],
			[profileSetting, user]
		);

		return (
			<Modal visible={visible} animationType={'slide'} statusBarTranslucent={true}>
				<Block flex={1} backgroundColor={themeValue?.charcoal} paddingTop={size.s_40}>
					<Block flexDirection="row" alignItems="center" justifyContent="space-between" height={size.s_40} paddingHorizontal={size.s_14}>
						<Block>
							{!isLoading && (
								<TouchableOpacity
									onPress={() => {
										onclose();
										setEditMode(false);
									}}
									disabled={isLoading}
								>
									<Icons.CloseIcon height={size.s_30} width={size.s_30} color={themeValue.white} />
								</TouchableOpacity>
							)}
						</Block>
						<Block flex={1}>
							<Text center color={themeValue.white} h3>
								{t('manage.edit')} {user?.user?.username}
							</Text>
						</Block>
					</Block>

					<ScrollView>
						<Block
							flexDirection="row"
							alignItems="center"
							justifyContent="space-between"
							backgroundColor={themeValue.secondary}
							padding={size.s_12}
							gap={size.s_10}
							marginTop={size.s_18}
							marginHorizontal={size.s_14}
							borderRadius={size.s_14}
						>
							<Block flex={1} flexDirection="row" gap={size.s_10} alignItems="center">
								<MezonAvatar avatarUrl={user?.user?.avatar_url} username={user?.user?.username} />
								<Block>
									{user?.user?.display_name ? <Text color={themeValue.white}>{user?.user?.display_name}</Text> : null}
									<Text color={themeValue.text}>{user?.user?.username}</Text>
								</Block>
							</Block>
						</Block>

						<Block marginHorizontal={size.s_14} marginTop={size.s_20}>
							<Text color={themeValue.text} h5>
								{t('manage.roles')}
							</Text>
							<Block borderRadius={size.s_10} overflow="hidden" marginTop={size.s_8}>
								{roleList.map((role) => {
									const isDisable = isLoading || role?.disabled;
									if (editMode) {
										return (
											<TouchableOpacity
												key={role?.id}
												onPress={() => onSelectedRoleChange(!selectedRole?.includes(role?.id), role?.id)}
												disabled={isDisable}
											>
												<Block
													backgroundColor={themeValue.secondary}
													padding={size.s_14}
													borderBottomWidth={1}
													borderBottomColor={themeValue.tertiary}
													flexDirection="row"
													gap={size.s_10}
												>
													<Block height={size.s_20} width={size.s_20}>
														<BouncyCheckbox
															disabled={isDisable}
															size={20}
															isChecked={selectedRole?.includes(role?.id)}
															onPress={(value) => onSelectedRoleChange(value, role?.id)}
															fillColor={isDisable ? Colors.bgGrayDark : Colors.bgButton}
															iconStyle={{ borderRadius: 5 }}
															innerIconStyle={{
																borderWidth: 1.5,
																borderColor: selectedRole?.includes(role?.id) ? Colors.bgButton : Colors.tertiary,
																borderRadius: 5
															}}
															textStyle={{ fontFamily: 'JosefinSans-Regular' }}
														/>
													</Block>
													<Text color={isDisable ? themeValue.textDisabled : themeValue.white} h4>
														{role?.title}
													</Text>
												</Block>
											</TouchableOpacity>
										);
									}
									return (
										<Block
											key={role?.id}
											backgroundColor={themeValue.secondary}
											padding={size.s_14}
											borderBottomWidth={1}
											borderBottomColor={themeValue.tertiary}
										>
											<Text color={themeValue.white} h4>
												{role?.title}
											</Text>
										</Block>
									);
								})}

								{!editMode ? (
									<TouchableOpacity onPress={() => setEditMode(true)} disabled={isLoading}>
										<Block backgroundColor={themeValue.secondary} padding={size.s_14}>
											<Text color={isLoading ? Colors.textGray : baseColor.blurple} h4>
												{t('manage.editRoles')}
											</Text>
										</Block>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => setEditMode(false)} disabled={isLoading}>
										<Block backgroundColor={themeValue.secondary} padding={size.s_14}>
											<Text color={isLoading ? Colors.textGray : baseColor.blurple} h4>
												{t('manage.cancel')}
											</Text>
										</Block>
									</TouchableOpacity>
								)}
							</Block>
						</Block>

						<View style={{ padding: 15 }}>
							<MezonMenu menu={menuActions} />
						</View>
					</ScrollView>
				</Block>
				<Toast config={toastConfig} />
				<MezonModal
					visible={visibleKickUserModal}
					visibleChange={(visible) => {
						setVisibleKickUserModal(visible);
					}}
				>
					<KickUserClanModal onRemoveUserClan={handleRemoveUserClans} user={user} />
				</MezonModal>
			</Modal>
		);
	}
);
