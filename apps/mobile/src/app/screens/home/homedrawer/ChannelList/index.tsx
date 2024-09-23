import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ActionEmitEvent, EOpenSearchChannelFrom, hasNonEmptyChannels, Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { channelsActions, RootState, selectAllEventManagement, selectCurrentChannel, selectCurrentClanId } from '@mezon/store-mobile';
import { ChannelThreads, ICategoryChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import NotificationSetting from '../../../../../../../mobile/src/app/components/NotificationSetting';
import EventViewer from '../../../../components/Event';
import ChannelListSkeleton from '../../../../components/Skeletons/ChannelListSkeleton';
import { APP_SCREEN, AppStackScreenProps } from '../../../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../../../temp-ui';
import { InviteToChannel } from '../components';
import CategoryMenu from '../components/CategoryMenu';
import ChannelListHeader from '../components/ChannelList/ChannelListHeader';
import ChannelListSection from '../components/ChannelList/ChannelListSection';
import ChannelMenu from '../components/ChannelMenu';
import ClanMenu from '../components/ClanMenu/ClanMenu';
import { ChannelListContext } from '../Reusables';
import { style } from './styles';

export type ChannelsPositionRef = {
	current: {
		[key: number]: number;
	};
};

const ChannelList = React.memo(({ categorizedChannels }: { categorizedChannels: any }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const isLoading = useSelector((state: RootState) => state?.channels?.loadingStatus);
	const { t } = useTranslation(['searchMessageChannel']);
	const allEventManagement = useSelector(selectAllEventManagement);
	const bottomSheetMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetCategoryMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetChannelMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetEventRef = useRef<BottomSheetModal>(null);
	const bottomSheetInviteRef = useRef(null);
	const bottomSheetNotifySettingRef = useRef<BottomSheetModal>(null);
	const [isUnknownChannel, setIsUnKnownChannel] = useState<boolean>(false);

	const [currentPressedCategory, setCurrentPressedCategory] = useState<ICategoryChannel>(null);
	const [currentPressedChannel, setCurrentPressedChannel] = useState<ChannelThreads | null>(null);
	const navigation = useNavigation<AppStackScreenProps['navigation']>();
	const flashListRef = useRef(null);
	const channelsPositionRef = useRef<ChannelsPositionRef>();
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const categoryOffsetsRef = useRef({});
	const dispatch = useDispatch();

	const handlePress = useCallback(() => {
		bottomSheetMenuRef.current?.present();
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

	useEffect(() => {
		let timer: NodeJS.Timeout;
		const activeChannel = DeviceEventEmitter.addListener(ActionEmitEvent.SCROLL_TO_ACTIVE_CHANNEL, (props) => {
			const { channelId = '', categoryId = '', timeout = 2000 } = props || {};
			timer = setTimeout(() => {
				const positionChannel = channelsPositionRef?.current?.[channelId || currentChannel?.id];
				const categoryOffset = categoryOffsetsRef?.current?.[categoryId || currentChannel?.category_id];
				const position = (positionChannel || 0) + (categoryOffset?.y || 100);
				if (position) {
					flashListRef?.current?.scrollTo({
						x: 0,
						y: position,
						animated: true
					});
				}
			}, timeout);
		});
		return () => {
			activeChannel.remove();
			timer && clearTimeout(timer);
		};
	}, [currentChannel, currentClanId, categorizedChannels.length]);

	const renderItemChannelList = useCallback(
		({ item }) => {
			return (
				<View
					onLayout={(event) => {
						const { y, height } = event.nativeEvent.layout;
						categoryOffsetsRef.current[item?.category_id] = { y, height, item };
					}}
					key={item?.category_id}
				>
					<ChannelListSection
						channelsPositionRef={channelsPositionRef}
						data={item}
						onLongPressCategory={handleLongPressCategory}
						onLongPressChannel={handleLongPressChannel}
						onLongPressThread={handleLongPressThread}
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

	const navigateToSearchPage = () => {
		navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
			screen: APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL,
			params: {
				openSearchChannelFrom: EOpenSearchChannelFrom.ChannelList,
				currentChannel
			}
		});
	};

	return (
		<ChannelListContext.Provider value={{ navigation: navigation }}>
			<View style={styles.mainList}>
				<ChannelListHeader onPress={handlePress} />

				<View style={styles.channelListSearch}>
					<TouchableOpacity onPress={() => navigateToSearchPage()} style={styles.searchBox}>
						<Icons.MagnifyingIcon color={themeValue.text} height={size.s_20} width={size.s_20} />
						<Text style={styles.placeholderSearchBox}>{t('search')}</Text>
					</TouchableOpacity>
					<Pressable
						style={styles.inviteIconWrapper}
						onPress={() => {
							setIsUnKnownChannel(false);
							bottomSheetInviteRef?.current?.present?.();
						}}
					>
						<Icons.UserPlusIcon height={size.s_18} width={size.s_18} color={themeValue.text} />
					</Pressable>
					<InviteToChannel isUnknownChannel={isUnknownChannel} ref={bottomSheetInviteRef} />
				</View>

				<View style={{ paddingHorizontal: size.s_12, marginBottom: size.s_18 }}>
					<TouchableOpacity
						style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
						onPress={() => bottomSheetEventRef?.current?.present()}
					>
						<Icons.CalendarIcon height={size.s_20} width={size.s_20} color={themeValue.text} />
						<Text style={styles.titleEvent}>{allEventManagement?.length > 0 ? `${allEventManagement?.length} Events` : 'Events'}</Text>
					</TouchableOpacity>
				</View>
				{isLoading === 'loading' && !hasNonEmptyChannels(categorizedChannels || []) && <ChannelListSkeleton numberSkeleton={6} />}
				<ScrollView ref={flashListRef} scrollEventThrottle={16} bounces={false}>
					{!!categorizedChannels?.length &&
						categorizedChannels?.map((item) => {
							return renderItemChannelList({ item });
						})}
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
		</ChannelListContext.Provider>
	);
});

export default ChannelList;
