import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserPermission } from '@mezon/core';
import { EOpenSearchChannelFrom, Icons, hasNonEmptyChannels, isEmpty } from '@mezon/mobile-components';
import { Block, baseColor, size, useTheme } from '@mezon/mobile-ui';
import {
	RootState,
	categoriesActions,
	selectAllEventManagement,
	selectCategoryIdSortChannel,
	selectCurrentChannel,
	selectCurrentClan,
	useAppDispatch,
} from '@mezon/store-mobile';
import { ChannelThreads, ICategoryChannel, IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import EventViewer from '../../../../components/Event';
import ChannelListSkeleton from '../../../../components/Skeletons/ChannelListSkeleton';
import { APP_SCREEN, AppStackScreenProps } from '../../../../navigation/ScreenTypes';
import { MezonBottomSheet } from '../../../../temp-ui';
import { ChannelListContext } from '../Reusables';
import { InviteToChannel } from '../components';
import CategoryMenu from '../components/CategoryMenu';
import ChannelListHeader from '../components/ChannelList/ChannelListHeader';
import ChannelListSection from '../components/ChannelList/ChannelListSection';
import ChannelMenu from '../components/ChannelMenu';
import ClanMenu from '../components/ClanMenu/ClanMenu';
import { style } from './styles';

const ChannelList = React.memo(({ data }: { data: any }) => {
	const categorizedChannels = useMemo(() => {
		return !!data && typeof data === 'string' ? JSON.parse(data) : [];
	}, [data]);

	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentClan = useSelector(selectCurrentClan);
	const isLoading = useSelector((state: RootState) => state?.channels?.loadingStatus);
	const { t } = useTranslation(['searchMessageChannel']);
	const allEventManagement = useSelector(selectAllEventManagement);
	const bottomSheetMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetCategoryMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetChannelMenuRef = useRef<BottomSheetModal>(null);
	const bottomSheetEventRef = useRef<BottomSheetModal>(null);
	const bottomSheetInviteRef = useRef(null);
	const [isUnknownChannel, setIsUnKnownChannel] = useState<boolean>(false);

	const [currentPressedCategory, setCurrentPressedCategory] = useState<ICategoryChannel>(null);
	const [currentPressedChannel, setCurrentPressedChannel] = useState<ChannelThreads | null>(null);
	const navigation = useNavigation<AppStackScreenProps['navigation']>();
	const dispatch = useAppDispatch();
	const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);
	const { isCanManageEvent } = useUserPermission();
	const flashListRef = useRef(null);
	const currentChannel = useSelector(selectCurrentChannel);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
	}, []);

	const handleLongPressThread = useCallback((channel: ChannelThreads) => {
		bottomSheetChannelMenuRef.current?.present();
		setCurrentPressedChannel(channel);
	}, []);

	const handleOnPressSortChannel = useCallback(
		(channel: IChannel) => {
			dispatch(
				categoriesActions.setCategoryIdSortChannel({
					isSortChannelByCategoryId: !categoryIdSortChannel[channel?.category_id],
					categoryId: channel?.category_id,
				}),
			);
		},
		[categoryIdSortChannel, dispatch],
	);

	const onContentSizeChange = useCallback((w, h) => {
		if (categorizedChannels?.length && h > 0 && isLoading === 'loaded') {
			timeoutRef.current = setTimeout(() => {
				scrollToItemById(currentChannel?.category_id);
			}, 300);
		}
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const renderItemChannelList = useCallback(
		({ item }) => {
			return (
				<ChannelListSection
					data={item}
					onLongPressCategory={handleLongPressCategory}
					onLongPressChannel={handleLongPressChannel}
					onPressSortChannel={handleOnPressSortChannel}
					onLongPressThread={handleLongPressThread}
				/>
			);
		},
		[handleLongPressCategory, handleLongPressChannel, handleOnPressSortChannel, handleLongPressThread],
	);

	function handlePressEventCreate() {
		bottomSheetEventRef?.current?.dismiss();
		navigation.navigate(APP_SCREEN.MENU_CLAN.STACK, {
			screen: APP_SCREEN.MENU_CLAN.CREATE_EVENT,
			params: {
				onGoBack: () => {
					bottomSheetEventRef?.current?.present();
				},
			},
		});
	}

	if (isEmpty(currentClan)) {
		return <Block height={20} />;
	}

	const navigateToSearchPage = () => {
		navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
			screen: APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL,
			params: {
				openSearchChannelFrom: EOpenSearchChannelFrom.ChannelList,
			},
		});
	};

	const scrollToItemById = (id) => {
		const index = categorizedChannels?.findIndex((item) => item?.category_id === id);
		if (index !== -1 && flashListRef?.current) {
			flashListRef?.current?.scrollToIndex({ index, animated: true });
		}
	};

	return (
		<ChannelListContext.Provider value={{ navigation: navigation }}>
			<View style={styles.mainList}>
				<ChannelListHeader onPress={handlePress} clan={currentClan} />

				<View style={styles.channelListSearch}>
					<TouchableOpacity onPress={() => navigateToSearchPage()} style={styles.searchBox}>
						<Icons.MagnifyingIcon color={themeValue.text} height={20} width={20} />
						<Text style={styles.placeholderSearchBox}>{t('search')}</Text>
					</TouchableOpacity>
					<Pressable
						style={styles.inviteIconWrapper}
						onPress={() => {
							setIsUnKnownChannel(false);
							bottomSheetInviteRef?.current?.present?.();
						}}
					>
						<Icons.UserPlusIcon height={18} width={18} color={themeValue.text} />
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
				<FlashList
					onContentSizeChange={onContentSizeChange}
					ref={flashListRef}
					data={categorizedChannels || []}
					keyExtractor={(item, index) => `${item.id}_${index.toString()}`}
					estimatedItemSize={40}
					renderItem={renderItemChannelList}
				/>
			</View>

			<MezonBottomSheet ref={bottomSheetMenuRef}>
				<ClanMenu inviteRef={bottomSheetInviteRef} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetCategoryMenuRef} heightFitContent>
				<CategoryMenu inviteRef={bottomSheetInviteRef} category={currentPressedCategory} />
			</MezonBottomSheet>

			<MezonBottomSheet ref={bottomSheetChannelMenuRef} heightFitContent onDismiss={() => setCurrentPressedChannel(null)}>
				<ChannelMenu inviteRef={bottomSheetInviteRef} channel={currentPressedChannel} />
			</MezonBottomSheet>

			<MezonBottomSheet
				title={`${allEventManagement?.length} Events`}
				ref={bottomSheetEventRef}
				heightFitContent={allEventManagement?.length === 0}
				headerRight={
					isCanManageEvent && (
						<TouchableOpacity onPress={handlePressEventCreate}>
							<Text style={{ color: baseColor.blurple, fontWeight: 'bold' }}>Create</Text>
						</TouchableOpacity>
					)
				}
			>
				<EventViewer />
			</MezonBottomSheet>
		</ChannelListContext.Provider>
	);
});

export default ChannelList;
