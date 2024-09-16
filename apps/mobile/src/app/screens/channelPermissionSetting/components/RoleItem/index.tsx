import { Icons } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { channelUsersActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useSelector } from 'react-redux';
import { IRoleItemProps } from '../../types/channelPermission.type';

export const RoleItem = memo(
	({ role, channel, isCheckbox = false, isChecked = false, onSelectRoleChange, isAdvancedSetting = false, onPress }: IRoleItemProps) => {
		const { themeValue } = useTheme();
		const currentClanId = useSelector(selectCurrentClanId);
		const dispatch = useAppDispatch();

		const isEveryoneRole = useMemo(() => {
			return role?.slug === 'everyone';
		}, [role?.slug]);

		const deleteRole = async () => {
			const body = {
				channelId: channel?.channel_id || '',
				clanId: currentClanId || '',
				roleId: role?.id || '',
				channelType: channel?.type
			};
			await dispatch(channelUsersActions.removeChannelRole(body));
		};

		const onPressRoleItem = () => {
			if (isAdvancedSetting) {
				onPress && onPress(role?.id);
				return;
			}
			onSelectRoleChange(!isChecked, role?.id);
		};

		return (
			<TouchableOpacity onPress={onPressRoleItem} disabled={!isCheckbox && !isAdvancedSetting}>
				<Block gap={size.s_10} flexDirection="row" padding={size.s_10} alignItems="center">
					{!isAdvancedSetting && <Icons.BravePermission color={themeValue.text} width={size.s_24} height={size.s_24} />}
					<Block flex={1}>
						<Block flexDirection="row" gap={size.s_4} alignItems="center">
							<Text h4 color={themeValue.white}>
								{role?.title}
							</Text>
						</Block>
						{!isCheckbox && !isAdvancedSetting && <Text color={themeValue.textDisabled}>{'Role'}</Text>}
					</Block>
					{isAdvancedSetting ? (
						<Icons.ChevronSmallRightIcon color={themeValue.white} />
					) : (
						<Block>
							{isCheckbox ? (
								<Block height={size.s_20} width={size.s_20}>
									<BouncyCheckbox
										size={20}
										isChecked={isChecked}
										onPress={(value) => onSelectRoleChange(value, role?.id)}
										fillColor={Colors.bgButton}
										iconStyle={{ borderRadius: 5 }}
										innerIconStyle={{
											borderWidth: 1.5,
											borderColor: isChecked ? Colors.bgButton : Colors.tertiary,
											borderRadius: 5
										}}
									/>
								</Block>
							) : (
								<TouchableOpacity onPress={deleteRole} disabled={isEveryoneRole}>
									<Icons.CircleXIcon color={isEveryoneRole ? themeValue.textDisabled : themeValue.white} />
								</TouchableOpacity>
							)}
						</Block>
					)}
				</Block>
			</TouchableOpacity>
		);
	}
);
