import { useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, Text, size, useTheme } from '@mezon/mobile-ui';
import { RolesClanEntity, selectAllRolesClan, selectEveryoneRole } from '@mezon/store-mobile';
import { EPermission } from '@mezon/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { SeparatorWithLine } from '../../components/Common';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { checkCanEditPermission } from './helper';

type ClanSettingsScreen = typeof APP_SCREEN.MENU_CLAN.ROLE_SETTING;
export const ServerRoles = ({ navigation }: MenuClanScreenProps<ClanSettingsScreen>) => {
	const { t } = useTranslation('clanRoles');
	const rolesClan = useSelector(selectAllRolesClan);
	const { themeValue } = useTheme();
	const { userPermissionsStatus, isClanOwner } = useUserPermission();
	const everyoneRole = useSelector(selectEveryoneRole);

	const allClanRole = useMemo(() => {
		if (!rolesClan || rolesClan?.length === 0) return [];
		return rolesClan.map(role => ({ ...role, isView: !checkCanEditPermission({ isClanOwner, role, userPermissionsStatus }) }))
	}, [rolesClan, isClanOwner, userPermissionsStatus]);

	navigation.setOptions({
		headerRight: () => (
			<Pressable style={{ padding: 20 }} onPress={() => navigation.navigate(APP_SCREEN.MENU_CLAN.CREATE_NEW_ROLE)}>
				<Icons.PlusLargeIcon height={20} width={20} color={themeValue.textStrong} />
			</Pressable>
		),
	});

	const navigateToEveryoneRole = () => {
		navigation.navigate(APP_SCREEN.MENU_CLAN.SETUP_PERMISSIONS, { roleId: everyoneRole?.id })
	};

	const navigateToRoleDetail = (clanRole: RolesClanEntity) => {
		navigation.navigate(APP_SCREEN.MENU_CLAN.ROLE_DETAIL, { roleId: clanRole?.id });
	};
	return (
		<Block backgroundColor={themeValue.primary} flex={1} paddingHorizontal={size.s_14}>
			<Block paddingVertical={size.s_14}>
				<Text center color={themeValue.text}>
					{t('roleDescription')}
				</Text>
			</Block>

			<TouchableOpacity onPress={navigateToEveryoneRole}>
				<Block
					flexDirection="row"
					alignItems="center"
					justifyContent="space-between"
					backgroundColor={themeValue.secondary}
					padding={size.s_12}
					borderRadius={size.s_12}
				>
					<Block flexDirection="row" flex={1} gap={10}>
						<Block backgroundColor={themeValue.tertiary} borderRadius={50} padding={size.s_8}>
							<Icons.GroupIcon color={themeValue.text} />
						</Block>
						<Block flex={1}>
							<Text color={themeValue.white}>@everyone</Text>
							<Text color={themeValue.text} numberOfLines={1}>
								{t('defaultRole')}
							</Text>
						</Block>
					</Block>
					<Icons.ChevronSmallRightIcon color={themeValue.text} />
				</Block>
			</TouchableOpacity>

			<Block marginTop={size.s_10} flex={1}>
				<Text color={themeValue.text}>
					{t('roles')} - {allClanRole?.length - 1 || '0'}
				</Text>
				{allClanRole.length ? (
					<Block marginVertical={size.s_10} flex={1}>
						<Block borderRadius={size.s_10} overflow="hidden">
							<FlatList
								data={allClanRole}
								scrollEnabled
								showsVerticalScrollIndicator={false}
								keyExtractor={(item) => item.id}
								renderItem={({ item, index }) => {
									if (item?.slug === EPermission.everyone) {
										return null;
									}
									return (
										<TouchableOpacity onPress={() => navigateToRoleDetail(item)}>
											<Block
												flexDirection="row"
												alignItems="center"
												justifyContent="space-between"
												backgroundColor={themeValue.secondary}
												padding={size.s_12}
												gap={size.s_10}
											>
												<Icons.ShieldUserIcon color={'gray'} height={size.s_32} width={size.s_32} />
												<Block flex={1}>
													<Block flexDirection='row' gap={size.s_6}>
														<Text color={themeValue.white}>{item.title}</Text>
														{item?.isView && (
															<Icons.LockIcon color={themeValue.textDisabled} height={size.s_16} width={size.s_16} />
														)}
													</Block>
													<Text color={themeValue.text}>
														{item?.role_user_list?.role_users?.length || '0'} - {t('members')}
													</Text>

												</Block>
												<Block>
													<Icons.ChevronSmallRightIcon color={themeValue.text} />
												</Block>
											</Block>
											{index !== allClanRole.length - 1 && (
												<SeparatorWithLine />
											)}
										</TouchableOpacity>
									);
								}}
							/>
						</Block>
					</Block>
				) : (
					<Block marginTop={size.s_20}>
						<Text color={themeValue.text} center>
							{t('noRole')}
						</Text>
					</Block>
				)}
			</Block>
		</Block>
	);
};
