import { useInvite } from '@mezon/core';
import {
	ActionEmitEvent,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_CLAN_ID,
	inviteLinkRegex,
	remove,
	save,
	setDefaultChannelLoader
} from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { appActions, channelsActions, clansActions, getStoreAsync, inviteActions, useAppDispatch } from '@mezon/store-mobile';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';
import { MezonAvatar } from '../../../../../../componentUI';
import { APP_SCREEN } from '../../../../../../navigation/ScreenTypes';
import { style } from '../RenderMessageInvite.styles';

export const extractInviteIdFromUrl = (url: string): string | null => {
	const match = url?.match(inviteLinkRegex);
	return match ? match[1] : null;
};

interface IResInvite {
	id: string;
	channel_id?: string;
	channel_label?: string;
	clan_id?: string;
	clan_name?: string;
	user_joined?: boolean;
	expiry_time?: string;
}
function LinkInvite({ content, part }: { content: string; part: string }) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { inviteUser } = useInvite();
	const navigation = useNavigation<any>();
	const inviteID = useMemo(() => extractInviteIdFromUrl(content), [content]);
	const dispatch = useAppDispatch();
	const [clanInvite, setClanInvite] = useState(null);
	const { t } = useTranslation('linkMessageInvite');

	useEffect(() => {
		if (inviteID) {
			dispatch(inviteActions.getLinkInvite({ inviteId: inviteID }))
				.then((res) => {
					const payloadInvite = res?.payload as IResInvite;
					if (payloadInvite) setClanInvite(payloadInvite);
				})
				.catch((error) => {});
		}
	}, [dispatch, inviteID]);

	const handleJoinClanInvite = async () => {
		const store = await getStoreAsync();
		store.dispatch(appActions.setLoadingMainMobile(true));
		inviteUser(inviteID || '')
			.then(async (res) => {
				if (res && res?.clan_id) {
					requestAnimationFrame(async () => {
						navigation.navigate(APP_SCREEN.HOME);
						navigation.dispatch(DrawerActions.openDrawer());
						DeviceEventEmitter.emit(ActionEmitEvent.FETCH_MEMBER_CHANNEL_DM, {
							isFetchMemberChannelDM: true
						});
						await remove(STORAGE_CHANNEL_CURRENT_CACHE);
						store.dispatch(clansActions.joinClan({ clanId: res?.clan_id }));
						save(STORAGE_CLAN_ID, res?.clan_id);
						await store.dispatch(clansActions.fetchClans());
						store.dispatch(clansActions.changeCurrentClan({ clanId: res?.clan_id }));
						const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: res?.clan_id, noCache: true }));
						await setDefaultChannelLoader(respChannel?.payload, res?.clan_id);
						store.dispatch(appActions.setLoadingMainMobile(false));
					});
				}
			})
			.catch((error) => {
				store.dispatch(appActions.setLoadingMainMobile(false));
			});
	};

	return (
		<View>
			<Text style={styles.textLink}>{part}</Text>
			<View style={styles.boxLink}>
				<Text style={styles.title}>{t('title')}</Text>
				<View style={styles.container}>
					<MezonAvatar username={clanInvite?.clan_name} avatarUrl={clanInvite?.clan_avatar}></MezonAvatar>
					<View>
						<Text style={styles.clanName}>{clanInvite?.clan_name}</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.inviteClanBtn} onPress={handleJoinClanInvite}>
					<Text style={styles.inviteClanBtnText}>{t('join')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

export default React.memo(LinkInvite);
