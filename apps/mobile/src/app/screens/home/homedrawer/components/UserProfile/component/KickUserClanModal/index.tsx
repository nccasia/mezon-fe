import { UserMinus } from '@mezon/mobile-components';
import { Block, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity, selectCurrentClan } from '@mezon/store-mobile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonInput } from '../../../../../../../componentUI';
import MezonButton, { EMezonButtonSize, EMezonButtonTheme } from '../../../../../../../componentUI/MezonButton2';
import { style } from './KickUserClanModal.style';

const KickUserClanModal = ({ user, onRemoveUserClan }: { user: ChannelMembersEntity; onRemoveUserClan: () => void }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['userProfile']);
	const [reason, setReason] = useState<string>('');
	const currentClan = useSelector(selectCurrentClan);

	return (
		<Block height={'100%'} overflow="hidden">
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} style={{ flex: 1 }}>
				<Block style={styles.container}>
					<Block style={styles.userMinusIcon}>
						<UserMinus width={60} height={60} />
					</Block>
					<Text style={styles.clanName}>{currentClan?.clan_name}</Text>
					<Text style={styles.textError}>
						{t('kickUserClanModal.kickFromServer', { userName: user?.user?.username || user?.['username'] })}
					</Text>
					<Text style={styles.description}>
						{t('kickUserClanModal.description', { userName: user?.user?.username || user?.['username'] })}
					</Text>
					<Block style={styles.textAreaBox}>
						<MezonInput
							label={t('kickUserClanModal.reasonKick', { userName: user?.user?.username || user?.['username'] })}
							titleUppercase
							textarea
							onTextChange={setReason}
							value={reason}
							showBorderOnFocus
						/>
					</Block>
				</Block>

				<MezonButton
					onPress={onRemoveUserClan}
					title={t('kickUserClanModal.buttonName', { userName: user?.user?.username || user?.['username'] })}
					type={EMezonButtonTheme.THEME}
					size={EMezonButtonSize.LG}
					titleStyle={styles.textButton}
				/>
			</KeyboardAvoidingView>
		</Block>
	);
};

export default KickUserClanModal;
