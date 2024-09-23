import {
	ActionEmitEvent,
	PlusAltIcon,
	remove,
	save,
	setDefaultChannelLoader,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID
} from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { channelsActions, clansActions, getStoreAsync, selectAllClans } from '@mezon/store-mobile';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ClanIcon } from '../ClanIcon';
import CreateClanModal from '../CreateClanModal';
import { style } from './styles';

export const ListClanPopup = React.memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const clans = useSelector(selectAllClans);
	const timerRef = useRef(null);
	const [isVisibleCreateClanModal, setIsVisibleCreateClanModal] = useState<boolean>(false);

	useEffect(() => {
		return () => {
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, []);

	const visibleCreateClanModal = useCallback((value: boolean) => {
		setIsVisibleCreateClanModal(value);
	}, []);

	const handleChangeClan = useCallback(async (clanId: string) => {
		const store = await getStoreAsync();
		await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		save(STORAGE_CLAN_ID, clanId);
		store.dispatch(clansActions.setCurrentClanId(clanId));
		const promises = [];
		promises.push(store.dispatch(clansActions.joinClan({ clanId: clanId })));
		promises.push(store.dispatch(clansActions.changeCurrentClan({ clanId: clanId })));
		promises.push(store.dispatch(channelsActions.fetchChannels({ clanId: clanId, noCache: true })));
		const results = await Promise.all(promises);

		const channelResp = results.find((result) => result.type === 'channels/fetchChannels/fulfilled');
		if (channelResp) {
			await setDefaultChannelLoader(channelResp.payload, clanId);
		}
		timerRef.current = setTimeout(async () => {
			DeviceEventEmitter.emit(ActionEmitEvent.SCROLL_TO_ACTIVE_CHANNEL, { timeout: 100 });
		}, 1000);
	}, []);

	return (
		<View style={styles.clansBox}>
			{clans?.length > 0 ? (
				clans?.map((clan, index) => <ClanIcon data={clan} onPress={handleChangeClan} key={`${index}_${clan?.id}_clan_item`} />)
			) : (
				<View />
			)}

			<Pressable style={styles.createClan} onPress={() => visibleCreateClanModal(!isVisibleCreateClanModal)}>
				<View style={styles.wrapperPlusClan}>
					<PlusAltIcon width={size.s_14} height={size.s_14} />
				</View>
			</Pressable>
			<CreateClanModal visible={isVisibleCreateClanModal} setVisible={visibleCreateClanModal} />
		</View>
	);
});
