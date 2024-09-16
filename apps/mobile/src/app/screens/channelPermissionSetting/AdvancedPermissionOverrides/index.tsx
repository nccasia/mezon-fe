import { Icons, isEqual } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { permissionRoleChannelActions, selectAllPermissionRoleChannel, selectPermissionChannel, useAppDispatch } from '@mezon/store-mobile';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuChannelScreenProps } from '../../../navigation/ScreenTypes';
import { MezonConfirm } from '../../../temp-ui';
import { PermissionItem } from '../components/PermissionItem';
import { EPermissionStatus } from '../types/channelPermission.enum';
import { IPermissionSetting } from '../types/channelPermission.type';

type AdvancedPermissionOverrides = typeof APP_SCREEN.MENU_CHANNEL.ADVANCED_PERMISSION_OVERRIDES;
export const AdvancedPermissionOverrides = ({ navigation, route }: MenuChannelScreenProps<AdvancedPermissionOverrides>) => {
	const { channelId, roleId } = route.params;
	const dispatch = useAppDispatch();
	const { themeValue } = useTheme();
	const { t } = useTranslation(['channelSetting']);
	const channelPermissionList = useSelector(selectPermissionChannel);
	const changedChannelPermissionList = useSelector(selectAllPermissionRoleChannel);
	const [originChannelPermissionValues, setOriginChannelPermissionValues] = useState<IPermissionSetting>();
	const [currentChannelPermissionValues, setCurrentChannelPermissionValues] = useState<IPermissionSetting>();
	const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);

	const isSettingNotChange = useMemo(() => {
		return isEqual(originChannelPermissionValues, currentChannelPermissionValues);
	}, [originChannelPermissionValues, currentChannelPermissionValues]);

	const saveChannelPermission = async () => {
		const changedPermissionValueList = Object.keys(currentChannelPermissionValues).reduce((acc, permissionId) => {
			if (originChannelPermissionValues[permissionId] !== currentChannelPermissionValues[permissionId]) {
				acc.push({ permission_id: permissionId, type: currentChannelPermissionValues[permissionId] });
			}
			return acc;
		}, []);

		await dispatch(
			permissionRoleChannelActions.setPermissionRoleChannel({
				channelId: channelId,
				roleId: roleId || '',
				permission: changedPermissionValueList
			})
		);
		if (visibleConfirmModal) {
			navigation.goBack();
		}
	};

	const handleBack = useCallback(() => {
		if (isSettingNotChange) {
			navigation.goBack();
			return;
		}
		setVisibleConfirmModal(true);
	}, [navigation, isSettingNotChange]);

	navigation.setOptions({
		headerTitle: () => (
			<Block>
				<Text bold h3 color={themeValue?.white}>
					{t('channelPermission.permissionOverrides')}
				</Text>
			</Block>
		),
		headerRight: () => {
			if (isSettingNotChange) return null;
			return (
				<TouchableOpacity onPress={saveChannelPermission}>
					<Block marginRight={size.s_20} paddingVertical={size.s_10}>
						<Text h4 color={Colors.textViolet}>
							{t('channelPermission.save')}
						</Text>
					</Block>
				</TouchableOpacity>
			);
		},
		headerLeft: () => {
			return (
				<TouchableOpacity onPress={handleBack}>
					<Block marginLeft={size.s_16}>
						<Icons.ArrowLargeLeftIcon color={themeValue.white} height={size.s_22} width={size.s_22} />
					</Block>
				</TouchableOpacity>
			);
		}
	});

	const onPermissionStatusChange = useCallback(
		(permissionId: string, status: EPermissionStatus) => {
			if (currentChannelPermissionValues?.[permissionId] === status) return;
			const newChannelPermissionValues = { ...currentChannelPermissionValues, [permissionId]: status };
			setCurrentChannelPermissionValues(newChannelPermissionValues);
		},
		[currentChannelPermissionValues]
	);

	const setInitialPermissionSetting = () => {
		const changedValues = changedChannelPermissionList.reduce((acc, curr) => {
			return { ...acc, [curr.permission_id]: curr?.active ? EPermissionStatus.Allow : EPermissionStatus.Deny };
		}, {});
		const initialPermissionValue = channelPermissionList?.reduce((acc, curr) => {
			if (changedValues[curr?.id]) {
				return { ...acc, [curr?.id]: changedValues[curr?.id] };
			}
			return { ...acc, [curr?.id]: EPermissionStatus.None };
		}, {});
		setOriginChannelPermissionValues(initialPermissionValue);
		setCurrentChannelPermissionValues(initialPermissionValue);
	};

	const setDefaultPermissionSetting = () => {
		const defaultPermissionValue = channelPermissionList?.reduce((acc, curr) => {
			return { ...acc, [curr?.id]: EPermissionStatus.None };
		}, {});
		setOriginChannelPermissionValues(defaultPermissionValue);
		setCurrentChannelPermissionValues(defaultPermissionValue);
	};

	useEffect(() => {
		if (changedChannelPermissionList.length) {
			setInitialPermissionSetting();
		} else {
			setDefaultPermissionSetting();
		}
	}, [changedChannelPermissionList, channelPermissionList]);

	useEffect(() => {
		if (channelId && roleId) {
			dispatch(permissionRoleChannelActions.fetchPermissionRoleChannel({ channelId, roleId }));
		}
	}, [channelId, dispatch, roleId]);

	return (
		<Block flex={1} backgroundColor={themeValue.secondary} paddingHorizontal={size.s_18} gap={size.s_18}>
			<Text color={themeValue.textDisabled}>{t('channelPermission.generalChannelPermission')}</Text>

			<ScrollView>
				<Block gap={size.s_28}>
					{channelPermissionList?.map((permission) => {
						return (
							<PermissionItem
								key={permission?.id}
								permission={permission}
								status={currentChannelPermissionValues?.[permission?.id]}
								onPermissionStatusChange={onPermissionStatusChange}
							/>
						);
					})}
				</Block>
			</ScrollView>

			<MezonConfirm
				visible={visibleConfirmModal}
				onVisibleChange={setVisibleConfirmModal}
				onConfirm={saveChannelPermission}
				onCancel={() => navigation?.goBack()}
				title={t('channelPermission.warningChangeSettingModal.title')}
				confirmText={t('channelPermission.warningChangeSettingModal.confirm')}
				content={t('channelPermission.warningChangeSettingModal.content')}
				hasBackdrop={true}
			/>
		</Block>
	);
};
