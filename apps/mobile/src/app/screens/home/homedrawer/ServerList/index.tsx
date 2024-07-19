import { useFriends } from '@mezon/core';
import { Icons, STORAGE_CHANNEL_CURRENT_CACHE, STORAGE_CLAN_ID, remove, save, setDefaultChannelLoader } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { RootState, channelsActions, clansActions, getStoreAsync, selectAllClans, selectCurrentClan } from '@mezon/store-mobile';
import Images from '../../../../../assets/Images';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useSelector } from 'react-redux';
import LogoMezon from '../../../../../assets/svg/logoMezon.svg';
import { SeparatorWithLine } from '../../../../components/Common';
import { APP_SCREEN } from '../../../../navigation/ScreenTypes';
import { ClanIcon } from '../components/ClanIcon';
import ListClanPopupProps from '../components/ListClanPopup';
import { UnreadDMBadgeList } from '../components/UnreadDMBadgeList';
import { style } from './styles';

const ServerList = React.memo((props: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const timeoutRef = useRef<any>();
	const { quantityPendingRequest } = useFriends();
	const [isEmptyClan, setIsEmptyClan] = useState<boolean>(false);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);

	const handleChangeClan = async (clanId: string) => {
		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
		}, 200);
		const store = await getStoreAsync();
		await remove(STORAGE_CHANNEL_CURRENT_CACHE);
		store.dispatch(clansActions.joinClan({ clanId: clanId }));
		save(STORAGE_CLAN_ID, clanId);
		store.dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
		const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: clanId, noCache: true }));
		await setDefaultChannelLoader(respChannel.payload, clanId);
	};

	useEffect(() => {
		return () => {
			timeoutRef?.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		setIsEmptyClan(clansLoadingStatus === 'loaded' && !clans?.length);
	}, [clansLoadingStatus, clans]);

	const navigateToDM = () => {
		props.navigation.navigate(APP_SCREEN.MESSAGES.HOME);
	};

	return (
		<View style={styles.wrapperServerList}>
			<TouchableOpacity onPress={() => navigateToDM()}>
				<LogoMezon width={50} height={50} />
				{quantityPendingRequest ? (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{quantityPendingRequest}</Text>
					</View>
				) : null}
			</TouchableOpacity>

			<SeparatorWithLine style={{ width: '60%' }} />

			<UnreadDMBadgeList />
			{!isEmptyClan ? <ClanIcon data={currentClan} onPress={handleChangeClan} isActive={true} /> : null}

			<Tooltip
				isVisible={isVisible}
				closeOnBackgroundInteraction={true}
				disableShadow={true}
				closeOnContentInteraction={true}
				content={<ListClanPopupProps handleChangeClan={handleChangeClan} clans={clans} />}
				contentStyle={{ backgroundColor: themeValue.primary }}
				placement="bottom"
				onClose={() => setIsVisible(false)}
			>
				<Pressable
					style={styles.wrapperPlusClan}
					onPress={() => {
						setIsVisible(!isVisible);
					}}
				>
					<Icons.PlusLargeIcon color={baseColor.green} />
				</Pressable>
			</Tooltip>
		</View>
	);
});

export default ServerList;
