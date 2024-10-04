import { attachmentActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { ChannelType } from 'mezon-js';
import React, { useContext, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MediaChannel from '../../MediaChannel/MediaChannel';
import { MemberListStatus } from '../../MemberStatus';
import PinMessage from '../../PinMessage';
import AssetsHeader from '../AssetsHeader';
import { threadDetailContext } from '../MenuThreadDetail';
import styles from './style';

const TabList = [
	{
		title: 'Members'
	},
	{
		title: 'Media'
	},
	{
		title: 'Pins'
	}
	// "Links",
	// "Files"
];

export const AssetsViewer = React.memo(({ channelId }: { channelId: string }) => {
	const [pageID, setPageID] = useState<number>(0);
	const ref = useRef<ScrollView>();
	const currentChannel = useContext(threadDetailContext);
	const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();

	function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
		const currentOffsetX = event.nativeEvent.contentOffset.x;
		const windowWidth = Dimensions.get('window').width;

		const pageID_ = Math.round(currentOffsetX / windowWidth);
		if (pageID !== pageID_) {
			// Is tab media
			if (pageID_ === 1) dispatch(attachmentActions.fetchChannelAttachments({ clanId: currentClanId, channelId: channelId }));
			setPageID(pageID_);
		}
	}

	function handelHeaderTabChange(index: number) {
		const windowWidth = Dimensions.get('window').width;
		ref && ref.current && ref.current.scrollTo({ x: index * windowWidth, animated: true });
	}

	return (
		<>
			<AssetsHeader pageID={pageID} onChange={handelHeaderTabChange} tabList={TabList} />
			<View style={styles.container}>
				<ScrollView horizontal pagingEnabled onScroll={handleScroll} ref={ref} scrollEventThrottle={100}>
					<MemberListStatus />
					<MediaChannel />
					<PinMessage
						currentChannelId={
							[ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type)
								? currentChannel?.channel_id
								: channelId
						}
					/>
					{/* <Page2 />
					<Page2 /> */}
				</ScrollView>
			</View>
		</>
	);
});

// Just for testing purposes
function Page2() {
	return (
		<View style={{ width: Dimensions.get('screen').width }}>
			<Text style={{ color: 'white' }}>tab content</Text>
		</View>
	);
}
