import { UserMinus } from '@mezon/mobile-components';
import { Block, Colors, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity, ClansEntity } from '@mezon/store-mobile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { styles } from './KickUserClanModal.style';

const KickUserClanModal = ({
	user,
	clan,
	onRemoveUserClan,
}: {
	user: ChannelMembersEntity;
	clan: ClansEntity;
	onRemoveUserClan: (value: string) => void;
}) => {
	const { t } = useTranslation(['userProfile']);
	const { themeBasic } = useTheme();
	const [reason, setReason] = useState<string>('');
	const [isFocusInput, setIsFocusInput] = useState<boolean>(false);

	return (
		<Block height={'100%'} overflow="hidden">
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} style={{ flex: 1 }}>
				<Block style={styles.container}>
					<Block style={styles.userMinusIcon}>
						<UserMinus width={60} height={60} />
					</Block>
					<Text style={styles.clanName}>{clan?.clan_name}</Text>
					<Text style={styles.textError}>
						{t('kickUserClanModal.kickFromServer', { userName: user?.user?.username || user?.['username'] })}
					</Text>
					<Text style={styles.description}>
						{t('kickUserClanModal.description', { userName: user?.user?.username || user?.['username'] })}
					</Text>
					<Block style={styles.textAreaBox}>
						<Text style={styles.textReason}>
							{t('kickUserClanModal.reasonKick', { userName: user?.user?.username || user?.['username'] })}
						</Text>
						<TextInput
							multiline={true}
							numberOfLines={5}
							onChangeText={(text) => setReason(text)}
							value={reason}
							onFocus={() => setIsFocusInput(true)}
							onBlur={() => setIsFocusInput(false)}
							keyboardAppearance={themeBasic === "dark" ? "dark" : "light"}
							style={[styles.input, !isFocusInput && { borderBottomColor: Colors.textGray, borderBottomWidth: 1.5 }]}
						></TextInput>
					</Block>
				</Block>
				<TouchableOpacity style={styles.button} onPress={() => onRemoveUserClan(reason)}>
					<Text style={styles.textButton}>
						{t('kickUserClanModal.buttonName', { userName: user?.user?.username || user?.['username'] })}
					</Text>
				</TouchableOpacity>
			</KeyboardAvoidingView>
		</Block>
	);
};

export default KickUserClanModal;
