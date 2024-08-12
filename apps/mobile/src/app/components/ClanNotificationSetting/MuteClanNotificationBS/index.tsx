import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { IMezonMenuSectionProps, MezonMenu, reserve } from '../../../temp-ui';
import MezonBottomSheet from '../../../temp-ui/MezonBottomSheet';
import { style } from './MuteClanNotificationBS.styles';
import { useState } from 'react';

type MuteClanNotificationBSProps = {
	onChangeScheduleMute?: (duration: number) => void;
	description?: string;
	currentChannel?: any;
};
const MuteClanNotificationBS = ({ onChangeScheduleMute, currentChannel, description = '' }: MuteClanNotificationBSProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const bottomSheetDetail = useRef<BottomSheetModal>(null);
	const { t } = useTranslation(['notificationSetting','clanNotificationsSetting']);
  const [isMute, setIsMute] = useState<boolean>(false);

	const menu = useMemo(
		() =>
			[
				{
					items: [
						{
							title: t('notifySettingThreadModal.muteDuration.forFifteenMinutes'),
							onPress: () => {
								onChangeScheduleMute(15 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forOneHour'),
							onPress: () => {
								onChangeScheduleMute(60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forThreeHours'),
							onPress: () => {
								onChangeScheduleMute(3 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forEightHours'),
							onPress: () => {
								onChangeScheduleMute(8 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.forTwentyFourHours'),
							onPress: () => {
								onChangeScheduleMute(24 * 60 * 60 * 1000);
							},
						},
						{
							title: t('notifySettingThreadModal.muteDuration.untilTurnItBackOn'),
							onPress: () => {
								onChangeScheduleMute(Infinity);
							},
						},
					],
				},
			] as IMezonMenuSectionProps[],
		[],
	);

	const handleMuteChannel = () => {
		// bottomSheetDetail.current?.present();
		reserve();
	};

	return (
		<Block>
			<Block style={styles.optionsBox}>
				<TouchableOpacity onPress={handleMuteChannel} style={styles.wrapperUnmuteBox}>
					<Icons.BellSlashIcon width={20} height={20} style={{ marginRight: 20 }} color={themeValue.text} />
					<Text style={styles.option}>
						{`${ isMute ? 'Mute' : 'Unmute'} #${currentChannel?.channel_category_label || currentChannel?.label || ''}`}
					</Text>
				</TouchableOpacity>
			</Block>
			<Text style={styles.subTitle}>{description}</Text>
			<MezonBottomSheet snapPoints={['55%']} ref={bottomSheetDetail}>
				<Block paddingHorizontal={size.s_20}>
					<Text style={styles.headerBS}>{t('clanNotificationBS.title', { ns: 'clanNotificationsSetting' })}</Text>
					<MezonMenu menu={menu} />
				</Block>
			</MezonBottomSheet>
		</Block>
	);
};

export default MuteClanNotificationBS;
