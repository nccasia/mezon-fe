import { Block, size, Text, useTheme } from '@mezon/mobile-ui';
import { selectRolesByChannelId } from '@mezon/store-mobile';
import { EVERYONE_ROLE_ID, EVERYONE_ROLE_TITLE } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { RoleItem } from '../components/RoleItem';
import { IAdvancedViewProps } from '../types/channelPermission.type';

export const AdvancedView = memo(({ isAdvancedEditMode, channel }: IAdvancedViewProps) => {
	const { themeValue } = useTheme();
	const navigation = useNavigation<any>();
	const { t } = useTranslation('channelSetting');
	const listOfChannelRole = useSelector(selectRolesByChannelId(channel?.channel_id));

	const advancedSettingRoleList = useMemo(() => {
		const isExistingEveryoneRole = listOfChannelRole?.some((role) => role?.id === EVERYONE_ROLE_ID);
		if (!isExistingEveryoneRole) {
			return [{ id: EVERYONE_ROLE_ID, title: EVERYONE_ROLE_TITLE }, ...listOfChannelRole];
		}
		return listOfChannelRole;
	}, [listOfChannelRole]);

	const navigateToPermissionOverridesDetail = useCallback(
		(roleId: string) => {
			navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
				screen: APP_SCREEN.MENU_CHANNEL.ADVANCED_PERMISSION_OVERRIDES,
				params: {
					channelId: channel?.id,
					roleId
				}
			});
		},
		[navigation, channel?.id]
	);
	return (
		<ScrollView>
			<Block>
				<Block gap={size.s_10} marginVertical={size.s_10}>
					<Text color={themeValue.textDisabled}>{t('channelPermission.roles')}</Text>
					<Block backgroundColor={themeValue.primary} borderRadius={size.s_14}>
						{advancedSettingRoleList?.map((role) => {
							return (
								<RoleItem
									key={role?.id}
									role={role}
									channel={channel}
									isAdvancedSetting={true}
									onPress={navigateToPermissionOverridesDetail}
								/>
							);
						})}
					</Block>
				</Block>

				{/* <AdvancedSettingBS bottomSheetRef={bottomSheetRef} channel={channel} currentAdvancedPermissionType={currentAdvancedPermissionType} /> */}
			</Block>
		</ScrollView>
	);
});
