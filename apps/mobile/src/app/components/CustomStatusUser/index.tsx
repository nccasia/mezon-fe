import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { DisturbStatusIcon, Icons, IdleStatusIcon, OfflineStatus, OnlineStatus } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { Ref, forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { ETypeCustomUserStatus } from '../../screens/profile/ProfileScreen';
import { IMezonMenuSectionProps, IMezonOptionData, MezonBottomSheet, MezonMenu, MezonOption } from '../../temp-ui';

interface ICustomStatusUserProps {
	onPressSetCustomStatus?: () => void;
	userCustomStatus?: string;
	handleCustomUserStatus?: (customStatus: string, type: ETypeCustomUserStatus) => void;
}
const CustomStatusUser = forwardRef(function CustomStatusUser(props: ICustomStatusUserProps, ref: Ref<BottomSheetModalMethods>) {
	const { onPressSetCustomStatus, userCustomStatus, handleCustomUserStatus } = props;
	const { t } = useTranslation(['customUserStatus']);

	const { themeValue } = useTheme();
	const [userStatusOption, setUserStatusOption] = useState<number>(0);

	function handleStatusChange(value: number) {
		setUserStatusOption(value);
	}

	const statusOptions = useMemo(() => ([
		{
			title: t('userStatus.online'),
			value: 0,
			icon: <OnlineStatus />,
		},
		{
			title: t('userStatus.idle'),
			value: 1,
			icon: <IdleStatusIcon />,
		},
		{
			title: t('userStatus.doNotDisturb'),
			value: 2,
			icon: <DisturbStatusIcon />,
		},
		{
			title: t('userStatus.invisible'),
			value: 3,
			icon: <OfflineStatus />
		},
	]) as IMezonOptionData, [])

	const statusMenu = useMemo(() => ([
		{
			items: [
				{
					title: userCustomStatus ? userCustomStatus : t('setCustomStatus'),
					icon: <Icons.ReactionIcon height={20} width={20} color={themeValue.textDisabled} />,
					onPress: () => onPressSetCustomStatus(),
					component: userCustomStatus ? (
						<Pressable onPress={() => handleCustomUserStatus('', ETypeCustomUserStatus.Close)}>
							<Icons.CloseIcon color={themeValue.textStrong} />
						</Pressable>
					) : null
				}
			]
		}
	]) as IMezonMenuSectionProps[], [userCustomStatus])

	return (
		<MezonBottomSheet ref={ref} title={t('changeOnlineStatus')} heightFitContent>
			<Block paddingHorizontal={size.s_20} paddingVertical={size.s_10}>
				<MezonOption
					title={t('onlineStatus')}
					data={statusOptions}
					value={userStatusOption}
					onChange={handleStatusChange}
				/>

				<MezonMenu menu={statusMenu} />
			</Block>
		</MezonBottomSheet>
	);
});

export default CustomStatusUser;
