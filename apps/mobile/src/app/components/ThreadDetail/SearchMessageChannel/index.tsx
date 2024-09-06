import { useAuth, useChannels, useFriends } from '@mezon/core';
import { EOpenSearchChannelFrom, debounce } from '@mezon/mobile-components';
import { Block, useTheme } from '@mezon/mobile-ui';
import { selectAllDirectMessages, selectAllUsesClan } from '@mezon/store-mobile';
import { removeDuplicatesById } from '@mezon/utils';
import { RouteProp } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import ChannelsSearchTab from '../../ChannelsSearchTab';
import MembersSearchTab from '../../MembersSearchTab';
import AssetsHeader from '../AssetsHeader';
import InputSearchMessageChannel from './InputSearchMessageChannel';

type RootStackParamList = {
	SearchMessageChannel: {
		openSearchChannelFrom: EOpenSearchChannelFrom;
	};
};

type MuteThreadDetailRouteProp = RouteProp<RootStackParamList, 'SearchMessageChannel'>;

type SearchMessageChannelProps = {
	route: MuteThreadDetailRouteProp;
};

const SearchMessageChannel = ({ route }: SearchMessageChannelProps) => {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['searchMessageChannel']);
	const { openSearchChannelFrom } = route?.params || {};

	const { listChannels } = useChannels();
	const [searchText, setSearchText] = useState<string>('');
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3 && groupChat.channel_avatar);
	const { friends } = useFriends();
	const usersClan = useSelector(selectAllUsesClan);
	const { userProfile } = useAuth();
	const accountId = userProfile?.user?.id ?? '';
	const [pageID, setPageID] = useState<number>(0);
	const ref = useRef<ScrollView>();

	const handleSearchText = useCallback(
		debounce((text) => setSearchText(text), 300),
		[]
	);

	function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
		const currentOffsetX = event.nativeEvent.contentOffset.x;
		const windowWidth = Dimensions.get('window').width;

		const pageID_ = Math.round(currentOffsetX / windowWidth);
		if (pageID !== pageID_) {
			setPageID(pageID_);
		}
	}

	function handelHeaderTabChange(index: number) {
		const windowWidth = Dimensions.get('window').width;
		ref && ref.current && ref.current.scrollTo({ x: index * windowWidth, animated: true });
	}

	const listChannelSearch = useMemo(() => {
		if (!searchText?.length) return listChannels;
		return listChannels
			.filter((item) => item?.channel_label?.toUpperCase()?.indexOf(searchText?.toUpperCase()) > -1)
			.sort((a: any, b: any) => {
				const indexA = a?.channel_label?.toUpperCase().indexOf(searchText?.toUpperCase());
				const indexB = b?.channel_label?.toUpperCase().indexOf(searchText?.toUpperCase());
				if (indexA === -1) return 1;
				if (indexB === -1) return -1;
				return indexA - indexB;
			});
	}, [listChannels, searchText]);

	const listMember = useMemo(() => {
		const listDMSearch = listDM?.length
			? listDM.map((itemDM: any) => {
					return {
						id: itemDM?.user_id?.[0] ?? '',
						name: itemDM?.usernames ?? '',
						avatarUser: itemDM?.channel_avatar?.[0] ?? '',
						idDM: itemDM?.id ?? '',
						displayName: '',
						typeChat: 3,
						user: {
							username: itemDM?.usernames ?? '',
							avatar_url: itemDM?.channel_avatar?.[0] ?? '',
							id: itemDM?.user_id?.[0] ?? ''
						}
					};
				})
			: [];
		const listFriendsSearch = friends.length
			? friends.map((itemFriend: any) => {
					return {
						id: itemFriend?.id ?? '',
						name: itemFriend?.user.username ?? '',
						avatarUser: itemFriend?.user.avatar_url ?? '',
						displayName: itemFriend?.user.display_name ?? '',
						idDM: '',
						user: {
							username: itemFriend?.user.username ?? '',
							avatar_url: itemFriend?.user?.avatar_url ?? '',
							id: itemFriend?.id ?? ''
						}
					};
				})
			: [];
		const listUserClanSearch = usersClan.length
			? usersClan.map((itemUserClan: any) => {
					return {
						id: itemUserClan?.id ?? '',
						name: itemUserClan?.user?.username ?? '',
						avatarUser: itemUserClan?.user?.avatar_url ?? '',
						idDM: '',
						user: {
							username: itemUserClan?.user?.username ?? '',
							avatar_url: itemUserClan?.user?.avatar_url ?? '',
							id: itemUserClan?.id ?? ''
						}
					};
				})
			: [];

		const friendsMap = new Map(listFriendsSearch?.map((friend) => [friend.id, friend]));
		const listSearch = [
			...listDMSearch.map((itemDM) => {
				const friend = friendsMap.get(itemDM.id);
				return friend ? { ...itemDM, displayName: friend?.displayName || itemDM?.displayName } : itemDM;
			}),
			...listUserClanSearch
		];
		return removeDuplicatesById(listSearch?.filter((item) => item.id !== accountId));
	}, [accountId, friends, listDM, usersClan]);

	const listMemberSearch = useMemo(() => {
		return listMember
			.filter((item: any) => item?.name?.toUpperCase().indexOf(searchText?.toUpperCase()?.substring(1)) > -1)
			.sort((a: any, b: any) => {
				const indexA = a?.name?.toUpperCase().indexOf(searchText?.slice(1).toUpperCase());
				const indexB = b?.name?.toUpperCase().indexOf(searchText?.slice(1).toUpperCase());
				if (indexA === -1) return 1;
				if (indexB === -1) return -1;
				return indexA - indexB;
			});
	}, [searchText, listMember]);

	const TabList = useMemo(() => {
		return [
			{
				title: t('members'),
				quantitySearch: searchText && listMemberSearch?.length
			},
			{
				title: t('channels'),
				quantitySearch: searchText && listChannelSearch?.length
			}
		];
	}, [listChannelSearch, listMemberSearch, searchText, t]);
	return (
		<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: themeValue.secondary }}>
			<Block backgroundColor={themeValue.secondary} width={'100%'} height={'100%'}>
				<InputSearchMessageChannel openSearchChannelFrom={openSearchChannelFrom} onChangeText={handleSearchText} />
				<AssetsHeader pageID={pageID} onChange={handelHeaderTabChange} tabList={TabList} />
				<ScrollView bounces={false} horizontal pagingEnabled onScroll={handleScroll} ref={ref} scrollEventThrottle={100}>
					<MembersSearchTab listMemberSearch={listMemberSearch} />
					<ChannelsSearchTab listChannelSearch={listChannelSearch} />
				</ScrollView>
			</Block>
		</SafeAreaView>
	);
};

export default SearchMessageChannel;
