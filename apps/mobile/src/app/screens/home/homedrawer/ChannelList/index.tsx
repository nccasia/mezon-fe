import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCategory, useUserPermission } from '@mezon/core';
import {
	EOpenSearchChannelFrom,
	Icons,
	STORAGE_CHANNEL_CURRENT_CACHE,
	STORAGE_DATA_CATEGORY_CHANNEL,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	hasNonEmptyChannels,
	load,
	save
} from '@mezon/mobile-components';
import { Block, baseColor, size, useTheme } from '@mezon/mobile-ui';
import {
	RootState,
	categoriesActions,
	channelsActions,
	getStoreAsync,
	selectAllEventManagement,
	selectCategoryIdSortChannel,
	selectCurrentChannel,
	selectCurrentClan,
	useAppDispatch,
} from '@mezon/store-mobile';
import { ChannelThreads, ICategoryChannel, IChannel } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
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
import { ChannelListSection } from '../components/ChannelList/ChannelListSection';
import ChannelMenu from '../components/ChannelMenu';
import ClanMenu from '../components/ClanMenu/ClanMenu';
import { style } from './styles';

const ChannelList = React.memo((props: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentClan = useSelector(selectCurrentClan);
	const { categorizedChannels } = useCategory();
	const [dataCategoryChannel, setDataCategoryChannel] = useState<ICategoryChannel[]>(categorizedChannels || []);
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
	const currentChannel = useSelector(selectCurrentChannel);

	useEffect(() => {
		if (!currentChannel) {
			handleFocusDefaultChannel()
		}
	}, [currentChannel])

	useEffect(() => {
		try {
			const categoryChannel = categorizedChannels || JSON.parse(load(STORAGE_DATA_CATEGORY_CHANNEL) || '[]');
			setDataCategoryChannel(categoryChannel);
			if (categorizedChannels) {
				save(STORAGE_DATA_CATEGORY_CHANNEL, JSON.stringify(categorizedChannels));
			}
		} catch (error) {
			console.error('Error loading category channels:', error);
		}
	}, [categorizedChannels]);

	const [collapseChannelItems, setCollapseChannelItems] = useState([]);

	const toggleCollapseChannel = (index: string) => {
		if (collapseChannelItems.includes(index)) {
			setCollapseChannelItems(collapseChannelItems.filter((item) => item !== index)); // Collapse if already Collapse
		} else {
			setCollapseChannelItems([...collapseChannelItems, index]); // Expand if not Collapse
		}
	};

	function handlePress() {
		bottomSheetMenuRef.current?.present();
	}

	function handleLongPressCategory(category: ICategoryChannel) {
		bottomSheetCategoryMenuRef.current?.present();
		setCurrentPressedCategory(category);
	}

	function handleLongPressChannel(channel: ChannelThreads) {
		bottomSheetChannelMenuRef.current?.present();
		setCurrentPressedChannel(channel);
		setIsUnKnownChannel(!channel?.channel_id);
	}

	function handleLongPressThread(channel: ChannelThreads) {
		bottomSheetChannelMenuRef.current?.present();
		setCurrentPressedChannel(channel);
	}

	function handleOnPressSortChannel(channel: IChannel) {
		dispatch(
			categoriesActions.setCategoryIdSortChannel({
				isSortChannelByCategoryId: !categoryIdSortChannel[channel?.category_id],
				categoryId: channel?.category_id,
			}),
		);
	}

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

	const handleFocusDefaultChannel = async () => {
		const firstTextChannel = categorizedChannels[0]?.channels?.filter(channel => channel?.type === 1)?.[0];
		if (!firstTextChannel) return;
		const { clan_id: clanId, channel_id: channelId } = firstTextChannel;
		const store = await getStoreAsync();
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		await Promise.all([
			store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false })),
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave)
		]);

		const channelsCache = load(STORAGE_CHANNEL_CURRENT_CACHE) || [];
		if (!channelsCache?.includes(channelId)) {
			save(STORAGE_CHANNEL_CURRENT_CACHE, [...channelsCache, channelId]);
		}
	}

	if (isEmpty(currentClan)) {
		return <Block height={20} />;
	}

	const navigateToSearchPage = () => {
		navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
			screen: APP_SCREEN.MENU_CHANNEL.SEARCH_MESSAGE_CHANNEL,
			params: {
				openSearchChannelFrom: EOpenSearchChannelFrom.ChannelList
			}
		});
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
						<Icons.CalendarIcon height={20} width={20} color={themeValue.text} />
						<Text style={{ color: themeValue.textStrong }}>
							{allEventManagement?.length > 0 ? `${allEventManagement?.length} Events` : 'Events'}
						</Text>
					</TouchableOpacity>
				</View>
				{isLoading === 'loading' && !hasNonEmptyChannels(dataCategoryChannel || []) && <ChannelListSkeleton numberSkeleton={6} />}
				<FlashList
					data={dataCategoryChannel || []}
					keyExtractor={(_, index) => index.toString()}
					estimatedItemSize={40}
					renderItem={({ item, index }) => (
						<ChannelListSection
							data={item}
							index={index}
							onPressHeader={toggleCollapseChannel}
							onLongPressCategory={(category) => handleLongPressCategory(category)}
							onLongPressChannel={(channel) => handleLongPressChannel(channel)}
							onPressSortChannel={(channel) => handleOnPressSortChannel(channel)}
							collapseItems={collapseChannelItems}
							onLongPressThread={(channel) => handleLongPressThread(channel)}
						/>
					)}
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
