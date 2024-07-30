import { useInvite } from '@mezon/core';
import {
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	remove,
	save,
	setCurrentClanLoader,
	setDefaultChannelLoader,
} from '@mezon/mobile-components';
import { Block, size } from '@mezon/mobile-ui';
import { channelsActions, clansActions, getStoreAsync } from '@mezon/store-mobile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ErrorInput } from '../../../../../components/ErrorInput';
import { MezonInput, MezonModal } from '../../../../../temp-ui';
import { validLinkInviteRegex } from '../../../../../utils/helpers';
import { styles } from './JoinClanModal.styles';

type JoinClanModalProps = {
	visible: boolean;
	setVisible: (value: boolean) => void;
};
const JoinClanModal = ({ visible, setVisible }: JoinClanModalProps) => {
	const [inviteLink, setInviteLink] = useState<string>('');
	const { inviteUser } = useInvite();
	const [isValidInvite, setIsValidInvite] = useState<boolean>(true);
	const { t } = useTranslation(['userEmptyClan']);

	const joinChannel = async () => {
		setIsValidInvite(validLinkInviteRegex.test(inviteLink));
		if (!validLinkInviteRegex.test(inviteLink)) return;
		const store = await getStoreAsync();
		const inviteId = extractIdFromUrl(inviteLink || '');
		inviteUser(inviteId || '').then(async (res) => {
			if (res && res?.clan_id) {
				await remove(STORAGE_CHANNEL_CURRENT_CACHE);
				store.dispatch(clansActions.joinClan({ clanId: res?.clan_id }));
				save(STORAGE_CLAN_ID, res?.clan_id);
				const clanResp = await store.dispatch(clansActions.fetchClans());
				await setCurrentClanLoader(clanResp.payload);
				store.dispatch(clansActions.changeCurrentClan({ clanId: res?.clan_id }));
				const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: res?.clan_id, noCache: true }));
				await setDefaultChannelLoader(respChannel.payload, res?.clan_id);
				setVisible(false);
			}
		});
	};

	const extractIdFromUrl = (url: string): string | null => {
		const match = url?.match(/https:\/\/mezon\.vn\/invite\/([0-9]{19})/);
		return match ? match[1] : null;
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
			<MezonModal
				visible={visible}
				visibleChange={(visible) => {
					setVisible(visible);
				}}
				headerStyles={styles.headerModal}
			>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<Block width={'100%'} height={'100%'} paddingHorizontal={size.s_20} paddingVertical={size.s_10} position={'relative'}>
						<Block marginBottom={size.s_40}>
							<Text style={styles.title}>{t('joinClan.joinExistClan')}</Text>
							<Text style={styles.description}>{t('joinClan.enterInvite')}</Text>
						</Block>
						<Block>
							<MezonInput
								label={t('joinClan.labelInput')}
								onTextChange={setInviteLink}
								placeHolder={`https://mezon.ai/invite/1813407038846046912`}
								value={inviteLink}
							/>
							{!isValidInvite && <ErrorInput errorMessage={t('joinClan.errorMessage')} />}
							<Text style={styles.textExample}>{t('joinClan.linkInviteEx')}</Text>
						</Block>
						<TouchableOpacity onPress={() => joinChannel()} style={styles.btnInvite}>
							<Text style={styles.textInviteBtn}>{t('joinClan.joinInviteLink')}</Text>
						</TouchableOpacity>
					</Block>
				</TouchableWithoutFeedback>
			</MezonModal>
		</KeyboardAvoidingView>
	);
};

export default JoinClanModal;
