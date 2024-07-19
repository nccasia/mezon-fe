import { Icons } from '@mezon/mobile-components';
import { Block, Text, size, useTheme } from '@mezon/mobile-ui';
import { RolesClanEntity, selectAllRolesClan } from '@mezon/store-mobile';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { SeparatorWithLine } from '../../components/Common';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';

type ClanSettingsScreen = typeof APP_SCREEN.MENU_CLAN.ROLE_SETTING;
export const ServerRoles = ({ navigation }: MenuClanScreenProps<ClanSettingsScreen>) => {
	const { t } = useTranslation('clanRoles');
	const RolesClan = useSelector(selectAllRolesClan);
	const { themeValue } = useTheme();

	navigation.setOptions({
		headerRight: () => (
			<Pressable style={{ padding: 20 }} onPress={() => navigation.navigate(APP_SCREEN.MENU_CLAN.CREATE_NEW_ROLE)}>
				<Icons.PlusLargeIcon height={20} width={20} color={themeValue.textStrong} />
			</Pressable>
		),
	});

	const navigateToRoleEveryone = () => {
		//Todo: update later
		Toast.show({ type: 'info', text1: 'Updating...' });
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

			<TouchableOpacity onPress={() => navigateToRoleEveryone()}>
				<Block
					flexDirection="row"
					alignItems="center"
					justifyContent="space-between"
					backgroundColor={themeValue.secondary}
					padding={size.s_12}
					borderRadius={size.s_12}
				>
					<Block flexDirection="row" alignContent="center" flex={1} gap={10}>
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
					{t('roles')} - {RolesClan?.length || '0'}
				</Text>
				{RolesClan.length ? (
					<Block marginVertical={size.s_10} flex={1}>
						<Block borderRadius={size.s_10} overflow="hidden">
							<FlatList
								data={RolesClan}
								scrollEnabled
								showsVerticalScrollIndicator={false}
								keyExtractor={(item) => item.id}
								ItemSeparatorComponent={SeparatorWithLine}
								renderItem={({ item }) => {
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
													<Text color={themeValue.white}>{item.title}</Text>
													<Text color={themeValue.text}>
														{item?.role_user_list?.role_users?.length || '0'} - {t('members')}
													</Text>
												</Block>
												<Icons.ChevronSmallRightIcon color={themeValue.text} />
											</Block>
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
