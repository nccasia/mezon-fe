import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { STORAGE_CHANNEL_CURRENT_CACHE, STORAGE_CLAN_ID, remove, save, setDefaultChannelLoader } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { channelsActions, clansActions, getStoreAsync, selectAllClans, selectCurrentClan, useAppDispatch } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonConfirm } from '../../temp-ui';
import { styles } from './DeleteClanModal.styles';

const DeleteClanModal = ({ isVisibleModal, visibleChange }: { isVisibleModal: boolean; visibleChange: (isVisible: boolean) => void }) => {
	const { dismiss } = useBottomSheetModal();
	const currentClan = useSelector(selectCurrentClan);
	const { t } = useTranslation(['deleteClan']);
	const dispatch = useAppDispatch();
	const clans = useSelector(selectAllClans);
	const navigation = useNavigation<any>();
	const { themeValue } = useTheme();

	const currentClanName = useMemo(() => {
		return currentClan?.clan_name;
	}, [currentClan?.clan_name]);

	const onConfirm = async () => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME);
		dismiss();
		await dispatch(clansActions.deleteClan({ clanId: currentClan?.clan_id || '' }));
		await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		const indexClanJoin = currentClan?.clan_id === clans[0]?.clan_id ? 1 : 0;
		if (clans?.[indexClanJoin]) {
			store.dispatch(clansActions.joinClan({ clanId: clans?.[indexClanJoin]?.clan_id }));
			save(STORAGE_CLAN_ID, clans?.[indexClanJoin]?.clan_id);
			store.dispatch(clansActions.changeCurrentClan({ clanId: clans[indexClanJoin]?.clan_id }));
			const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: clans[indexClanJoin]?.clan_id, noCache: true }));
			await setDefaultChannelLoader(respChannel.payload, clans[indexClanJoin]?.clan_id);
		}
	};

	return (
		<MezonConfirm
			visible={isVisibleModal}
			onVisibleChange={visibleChange}
			confirmText={t('deleteClanModal.confirm')}
			title={t('deleteClanModal.title')}
			children={
				<Text style={[styles.contentText, { color: themeValue.text }]}>
					{t('deleteClanModal.description', { currentClan: currentClanName })
						.split(currentClanName)
						.reduce((acc, part, index) => {
							if (index === 0) {
								return [part];
							}
							return [
								...acc,
								<Text key={index} style={{ fontWeight: 'bold' }}>
									{currentClanName}
								</Text>,
								part
							];
						}, [])}
				</Text>
			}
			onConfirm={onConfirm}
		/>
	);
};

export default DeleteClanModal;
