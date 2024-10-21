import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { hasNonEmptyChannels } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import {
	RootState,
	appActions,
	channelsActions,
	selectAllEventManagement,
	selectCategoryChannelOffsets,
	selectCurrentChannel,
	selectCurrentClanId
} from '@mezon/store-mobile';
import { ChannelThreads, ICategoryChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import NotificationSetting from '../../../../../../../mobile/src/app/components/NotificationSetting';
import { MezonBottomSheet } from '../../../../componentUI';
import { EventViewer } from '../../../../components/Event';
import ChannelListSkeleton from '../../../../components/Skeletons/ChannelListSkeleton';
import useTabletLandscape from '../../../../hooks/useTabletLandscape';
import { APP_SCREEN, AppStackScreenProps } from '../../../../navigation/ScreenTypes';
import { ChannelListContext } from '../Reusables';
import { InviteToChannel } from '../components';
import CategoryMenu from '../components/CategoryMenu';
import ChannelListBackground from '../components/ChannelList/ChannelListBackground';
import ChannelListHeader from '../components/ChannelList/ChannelListHeader';
import ChannelListSection from '../components/ChannelList/ChannelListSection';
import ChannelMenu from '../components/ChannelMenu';
import ClanMenu from '../components/ClanMenu/ClanMenu';
import { style } from './styles';
export type ChannelsPositionRef = {
	current: {
		[key: number]: {
			height: number;
			cateId?: string | number;
		};
	};
};

const ChannelList = React.memo(({ categorizedChannels }: { categorizedChannels: any }) => {
	const { themeValue } = useTheme();
	const isTabletLandscape = useTabletLandscape();
	const styles = style(themeValue, isTabletLandscape);
	const isLoading = useSelector((state: RootState) => state?.channels?.loadingStatus);
	const allEventManagement = useSelector(selectAllEventManagement);
	const bottomSheetMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetCategoryMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetChannelMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetEventRef = useRef<BottomSheetModal>(null);
	const bottomSheetInviteRef = useRef(null);
	const bottomSheetNotifySettingRef = useRef<BottomSheetModal>(null);
	const [isUnknownChannel, setIsUnKnownChannel] = useState<boolean>(false);
	const previousPositionRef = useRef(null);

	const [currentPressedCategory, setCurrentPressedCategory] = useState<ICategoryChannel>(null);
	const [currentPressedChannel, setCurrentPressedChannel] = useState<ChannelThreads | null>(null);
	const navigation = useNavigation<AppStackScreenProps['navigation']>();
	const flashListRef = useRef(null);
	const channelsPositionRef = useRef<ChannelsPositionRef>();
	const currentChannel = useSelector(selectCurrentChannel);
	const dispatch = useDispatch();
	const selectCategoryOffsets = useSelector(selectCategoryChannelOffsets);
	const [isCollapseCategory, setIsCollapseCategory] = useState(false);
	const currentClanId = useSelector(selectCurrentClanId);

	const handlePress = useCallback(() => {
		bottomSheetMenuRef.current?.present();
	}, []);

	const onOpenEvent = useCallback(() => {
		bottomSheetEventRef?.current?.present();
	}, []);

	const onOpenInvite = useCallback(() => {
		setIsUnKnownChannel(false);
		bottomSheetInviteRef?.current?.present?.();
	}, []);

	const handleLongPressCategory = useCallback((category: ICategoryChannel) => {
		bottomSheetCategoryMenuRef.current?.present();
		setCurrentPressedCategory(category);
	}, []);

	const handleLongPressChannel = useCallback((channel: ChannelThreads) => {
		bottomSheetChannelMenuRef.current?.present();
		setCurrentPressedChannel(channel);
		setIsUnKnownChannel(!channel?.channel_id);
		dispatch(channelsActions.setSelectedChannelId(channel?.channel_id));
	}, []);

	const handleLongPressThread = useCallback((channel: ChannelThreads) => {
		bottomSheetChannelMenuRef.current?.present();
		setCurrentPressedChannel(channel);
	}, []);

	const handleCollapseCategory = useCallback((isCollapse: boolean) => {
		setIsCollapseCategory(true);
	}, []);
	useEffect(() => {
		const positionChannel = channelsPositionRef?.current?.[currentChannel?.id];
		const categoryOffset = selectCategoryOffsets?.[positionChannel?.cateId || currentChannel?.category_id];
		const position = (positionChannel?.height || 0) + (categoryOffset || 0);
		const previousPosition = previousPositionRef?.current;

		if (Math.abs(position - previousPosition) > 100 && !isCollapseCategory) {
			flashListRef?.current?.scrollTo({
				x: 0,
				y: position - size.s_150,
				animated: true
			});
			previousPositionRef.current = position;
		}
	}, [selectCategoryOffsets, currentChannel, isCollapseCategory, currentClanId]);

	useEffect(() => {
		setIsCollapseCategory(false);
	}, [currentClanId]);

	const handleLayout = useCallback((event, item) => {
		const { y } = event?.nativeEvent?.layout || {};
		if (item) dispatch(appActions.setCategoryChannelOffsets({ [item?.category_id]: y }));
	}, []);

	const renderItemChannelList = useCallback(
		({ item }) => {
			return (
				<View onLayout={(e) => handleLayout(e, item)} key={item?.category_id}>
					<ChannelListSection
						channelsPositionRef={channelsPositionRef}
						data={item}
						onLongPressCategory={handleLongPressCategory}
						onLongPressChannel={handleLongPressChannel}
						onLongPressThread={handleLongPressThread}
						onPressCollapse={handleCollapseCategory}
					/>
				</View>
			);
		},
		[handleLongPressCategory, handleLongPressChannel, handleLongPressThread]
	);

	const handlePressEventCreate = useCallback(() => {
		bottomSheetEventRef?.current?.dismiss();
		navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
			screen: APP_SCREEN.MENU_CLAN.CREATE_EVENT,
			params: {
				onGoBack: () => {
					bottomSheetEventRef?.current?.present();
				}
			}
		});
	}, []);

	return (
		<ChannelListContext.Provider value={{ navigation: navigation }}>
			<View style={styles.mainList}>
				<ScrollView
					stickyHeaderIndices={[1]}
					showsVerticalScrollIndicator={false}
					ref={flashListRef}
					scrollEventThrottle={16}
					bounces={false}
				>
					<ChannelListBackground onPress={handlePress} />
					<ChannelListHeader onPress={handlePress} onOpenEvent={onOpenEvent} onOpenInvite={onOpenInvite} />

					{isLoading === 'loading' && !hasNonEmptyChannels(categorizedChannels || []) && <ChannelListSkeleton numberSkeleton={6} />}
					{!!categorizedChannels?.length &&
						categorizedChannels?.map((item) => {
							return renderItemChannelList({ item });
						})}
					<Block height={80} />
				</ScrollView>
			</View>

			<MezonBottomSheet ref={bottomSheetMenuRef}>
				<ClanMenu inviteRef={bottomSheetInviteRef} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetCategoryMenuRef} heightFitContent>
				<CategoryMenu inviteRef={bottomSheetInviteRef} category={currentPressedCategory} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetChannelMenuRef} heightFitContent>
				<ChannelMenu inviteRef={bottomSheetInviteRef} notifySettingRef={bottomSheetNotifySettingRef} channel={currentPressedChannel} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetEventRef} heightFitContent={allEventManagement?.length === 0}>
				<EventViewer handlePressEventCreate={handlePressEventCreate} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetNotifySettingRef} snapPoints={['50%']}>
				<NotificationSetting channel={currentPressedChannel} />
			</MezonBottomSheet>
			<InviteToChannel isUnknownChannel={isUnknownChannel} ref={bottomSheetInviteRef} />
		</ChannelListContext.Provider>
	);
});

export default ChannelList;
