import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { STORAGE_DATA_CLAN_CHANNEL_CACHE, getUpdateOrAddClanChannelCache, save } from '@mezon/mobile-components';
import {
	selectCategoryExpandStateByCategoryId,
	selectCurrentChannelId,
	selectIsUnreadChannelById,
	selectStreamMembersByChannelId,
	selectVoiceChannelMembersByChannelId
} from '@mezon/store';
import { channelsActions, getStoreAsync, useAppSelector } from '@mezon/store-mobile';
import { ChannelThreads, IChannel } from '@mezon/utils';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Linking, Platform, SafeAreaView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonBottomSheet } from '../../../../../../componentUI';
import useTabletLandscape from '../../../../../../hooks/useTabletLandscape';
import { linkGoogleMeet } from '../../../../../../utils/helpers';
import JoinStreamingRoomBS from '../../StreamingRoom/JoinStreamingRoomBS';
import ChannelItem from '../ChannelItem';
import ListChannelThread from '../ChannelListThread';
import UserListVoiceChannel from '../ChannelListUserVoice';

interface IChannelListItemProps {
	data: any;
	image?: string;
	onLongPress: () => void;
	onLongPressThread?: (thread: ChannelThreads) => void;
}

export enum StatusVoiceChannel {
	Active = 1,
	No_Active = 0
}

export enum IThreadActiveType {
	Active = 1
}

export const ChannelListItem = React.memo((props: IChannelListItemProps) => {
	const bottomSheetChannelStreamingRef = useRef<BottomSheetModal>(null);
	const voiceChannelMembers = useSelector(selectVoiceChannelMembersByChannelId(props?.data?.id));
	const streamChannelMembers = useSelector(selectStreamMembersByChannelId(props?.data?.id));
	const isUnRead = useAppSelector((state) => selectIsUnreadChannelById(state, props?.data?.id));
	const currentChanelId = useSelector(selectCurrentChannelId);

	const channelMemberList = useMemo(() => {
		if (props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE) return voiceChannelMembers;
		if (props?.data?.type === ChannelType.CHANNEL_TYPE_STREAMING) return streamChannelMembers;
		return [];
	}, [voiceChannelMembers, streamChannelMembers, props?.data?.type]);
	const isCategoryExpanded = useSelector(selectCategoryExpandStateByCategoryId(props?.data?.clan_id || '', props?.data?.category_id || ''));

	const timeoutRef = useRef<any>();
	const navigation = useNavigation();
	const isTabletLandscape = useTabletLandscape();

	const dataThreads = useMemo(() => {
		return !props?.data?.threads
			? []
			: props?.data?.threads.filter((thread: { active: IThreadActiveType }) => thread?.active === IThreadActiveType.Active);
	}, [props?.data?.threads]);

	const isActive = useMemo(() => {
		return currentChanelId === props?.data?.id;
	}, [currentChanelId, props?.data?.id]);

	useEffect(() => {
		return () => {
			timeoutRef.current && clearTimeout(timeoutRef.current);
		};
	}, []);

	const handleRouteData = useCallback(async (thread?: IChannel) => {
		if (props?.data?.type === ChannelType.CHANNEL_TYPE_STREAMING) {
			bottomSheetChannelStreamingRef.current.present();
			return;
		}
		if (props?.data?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			if (props?.data?.status === StatusVoiceChannel.Active && props?.data?.meeting_code) {
				const urlVoice = `${linkGoogleMeet}${props?.data?.meeting_code}`;
				await Linking.openURL(urlVoice);
			}
		} else {
			if (!isTabletLandscape) {
				navigation.dispatch(DrawerActions.closeDrawer());
			}
			const channelId = thread ? thread?.channel_id : props?.data?.channel_id;
			const clanId = thread ? thread?.clan_id : props?.data?.clan_id;
			const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
			const store = await getStoreAsync();
			timeoutRef.current = setTimeout(
				async () => {
					requestAnimationFrame(async () => {
						store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
					});
				},
				Platform.OS === 'ios' ? 100 : 10
			);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		}
	}, []);

	if (!isCategoryExpanded && !isUnRead && !channelMemberList?.length && !isActive) return;

	return (
		<View>
			<ChannelItem onPress={handleRouteData} onLongPress={props?.onLongPress} data={props?.data} isUnRead={isUnRead} isActive={isActive} />
			{!!dataThreads?.length && <ListChannelThread threads={dataThreads} onPress={handleRouteData} onLongPress={props?.onLongPressThread} />}
			<UserListVoiceChannel channelId={props?.data?.channel_id} isCategoryExpanded={isCategoryExpanded} />
			<MezonBottomSheet ref={bottomSheetChannelStreamingRef} snapPoints={['50%']}>
				<SafeAreaView>
					<JoinStreamingRoomBS channel={props?.data} ref={bottomSheetChannelStreamingRef} />
				</SafeAreaView>
			</MezonBottomSheet>
		</View>
	);
});
