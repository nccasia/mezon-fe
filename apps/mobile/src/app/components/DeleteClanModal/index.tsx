import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { STORAGE_CHANNEL_CURRENT_CACHE, STORAGE_CLAN_ID, remove, save, setDefaultChannelLoader } from '@mezon/mobile-components';
import { channelsActions, clansActions, getStoreAsync, selectAllClans, selectCurrentClan, useAppDispatch } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonConfirm } from '../../temp-ui';

const DeleteClanModal = ({ isVisibleModal, visibleChange }: { isVisibleModal: boolean; visibleChange: (isVisible: boolean) => void }) => {
	const { dismiss } = useBottomSheetModal();
	const currentClan = useSelector(selectCurrentClan);
	const { t } = useTranslation(['deleteClan']);
	const dispatch = useAppDispatch();
	const clans = useSelector(selectAllClans);
	const navigation = useNavigation<any>();

	const onConfirm = async () => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME);
		dismiss();
		visibleChange(false);
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
			content={t('deleteClanModal.description', { currentClan: currentClan?.clan_name })}
			onConfirm={onConfirm}
		/>
	);
};

export default DeleteClanModal;
