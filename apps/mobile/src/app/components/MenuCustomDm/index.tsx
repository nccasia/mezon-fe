import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons, LinkIcon } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { DirectEntity, directActions, useAppDispatch } from '@mezon/store-mobile';
import { IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonBottomSheet, MezonMenu, reserve } from '../../componentUI';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import CustomGroupDm from './CustomGroupDm';
import style from './MenuCustomDm.styles';

const MenuCustomDm = ({ currentChannel, channelLabel }: { currentChannel: IChannel | DirectEntity; channelLabel: string }) => {
	const { t } = useTranslation(['menuCustomDM']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const bottomSheetCustomGroup = useRef<BottomSheetModal>(null);
	const { dismiss } = useBottomSheetModal();
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();

	const menuSetting: IMezonMenuItemProps[] = [
		{
			title: t('customiseGroup'),
			expandable: false,
			icon: <Icons.PencilIcon width={size.s_18} height={size.s_18} color={themeValue.text}></Icons.PencilIcon>,
			textStyle: styles.label,
			onPress: () => {
				bottomSheetCustomGroup.current?.present();
				dismiss();
			}
		},
		{
			title: t('inviteLinks'),
			expandable: false,
			icon: <LinkIcon color={themeValue.text}></LinkIcon>,
			textStyle: styles.label,
			onPress: () => reserve()
		},
		{
			title: t('leaveGroup'),
			expandable: false,
			icon: <Icons.CircleXIcon width={size.s_22} height={size.s_22} color={themeValue.text}></Icons.CircleXIcon>,
			textStyle: styles.label,
			onPress: () => reserve()
		}
	];
	const generalMenu: IMezonMenuSectionProps[] = [
		{
			items: menuSetting
		}
	];

	const closeDm: IMezonMenuSectionProps[] = [
		{
			items: [
				{
					title: t('closeDM'),
					expandable: false,
					icon: <Icons.CircleXIcon width={size.s_18} height={size.s_18} color={themeValue.text}></Icons.CircleXIcon>,
					textStyle: styles.label,
					onPress: async () => {
						dismiss();
						await dispatch(directActions.closeDirectMessage({ channel_id: currentChannel?.channel_id }));
						navigation.navigate(APP_SCREEN.MESSAGES.HOME);
					}
				}
			]
		}
	];

	return (
		<Block paddingVertical={size.s_10} paddingHorizontal={size.s_20}>
			{[ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel.type) ? <MezonMenu menu={generalMenu} /> : <MezonMenu menu={closeDm} />}
			<MezonBottomSheet snapPoints={['70%']} ref={bottomSheetCustomGroup}>
				<CustomGroupDm dmGroupId={currentChannel?.id} channelLabel={channelLabel} />
			</MezonBottomSheet>
		</Block>
	);
};
export default MenuCustomDm;
