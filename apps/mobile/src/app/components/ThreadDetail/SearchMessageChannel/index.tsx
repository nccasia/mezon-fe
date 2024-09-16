import { useAuth, useChannels, useFriends } from '@mezon/core';
import { debounce, EOpenSearchChannelFrom } from '@mezon/mobile-components';
import { baseColor, Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { selectAllDirectMessages, selectAllUserClans } from '@mezon/store-mobile';
import { removeDuplicatesById } from '@mezon/utils';
import { RouteProp } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import ChannelsSearchTab from '../../ChannelsSearchTab';
import MembersSearchTab from '../../MembersSearchTab';
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

enum ACTIVE_TAB {
	MEMBER = 0,
	CHANNEL = 1
}
const SearchMessageChannel = ({ route }: SearchMessageChannelProps) => {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['searchMessageChannel']);
	const { openSearchChannelFrom } = route?.params || {};

	const { listChannels } = useChannels();
	const [searchText, setSearchText] = useState<string>('');
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3 && groupChat.channel_avatar);
	const { friends } = useFriends();
	const usersClan = useSelector(selectAllUserClans);
	const { userProfile } = useAuth();
	const accountId = userProfile?.user?.id ?? '';
	const [activeTab, setActiveTab] = useState<number>(ACTIVE_TAB.MEMBER);

	const handleSearchText = useCallback(
		debounce((text) => setSearchText(text), 300),
		[]
	);

	function handelHeaderTabChange(index: number) {
		setActiveTab(index);
	}

	const listChannelSearch = useMemo(() => {
		if (!searchText?.length) return listChannels;
		return [...listChannels].filter((item) => item?.channel_label?.toUpperCase()?.includes(searchText?.toUpperCase()));
	}, [listChannels, searchText]);
	
	const listMember = useMemo(() => {
		const listDMSearch = !listDM?.length
			? []
			: listDM.map((itemDM) => ({
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
				}));

		const listFriendsSearch = !friends?.length
			? []
			: friends.map((itemFriend) => ({
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
				}));

		const listUserClanSearch = !usersClan?.length
			? []
			: usersClan.map((itemUserClan) => ({
					id: itemUserClan?.id ?? '',
					name: itemUserClan?.user?.username ?? '',
					avatarUser: itemUserClan?.user?.avatar_url ?? '',
					idDM: '',
					user: {
						username: itemUserClan?.user?.username ?? '',
						avatar_url: itemUserClan?.user?.avatar_url ?? '',
						id: itemUserClan?.id ?? ''
					}
				}));

		const friendsMap = new Map(listFriendsSearch.map((friend) => [friend.id, friend]));
		const combinedList = [
			...listDMSearch.map((itemDM) => {
				const friend = friendsMap.get(itemDM.id);
				return friend ? { ...itemDM, displayName: friend.displayName || itemDM.displayName } : itemDM;
			}),
			...listUserClanSearch
		];

		return removeDuplicatesById(combinedList.filter((item) => item.id !== accountId));
	}, [accountId, friends, listDM, usersClan]);

	const listMemberSearch = useMemo(() => {
		const upperSearchText = searchText?.toUpperCase();
		return listMember.filter((item: any) => item?.name?.toUpperCase()?.includes?.(upperSearchText));
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
			<InputSearchMessageChannel openSearchChannelFrom={openSearchChannelFrom} onChangeText={handleSearchText} />
			<Block flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
				{TabList?.map((tab: any, index: number) => (
					<Pressable key={index.toString()} onPress={() => handelHeaderTabChange(index)}>
						<Block padding={size.s_20} paddingRight={0} paddingBottom={size.s_10} paddingVertical={size.s_20}>
							<Text style={{ color: index === activeTab ? baseColor.blurple : themeValue.text }}>
								{tab.title} {tab?.quantitySearch ? `(${tab?.quantitySearch})` : ''}
							</Text>
							{index === activeTab && <Block backgroundColor={Colors.bgViolet} height={size.s_2} top={size.s_8} />}
						</Block>
					</Pressable>
				))}
			</Block>
			<FlashList
				data={[activeTab === ACTIVE_TAB.MEMBER ? listMemberSearch?.splice(0, 50) : listChannelSearch?.splice(0, 50)]}
				renderItem={({ item }) => {
					if (activeTab === ACTIVE_TAB.MEMBER) {
						return <MembersSearchTab listMemberSearch={item} />;
					}
					return <ChannelsSearchTab listChannelSearch={item} />;
				}}
				estimatedItemSize={100}
				removeClippedSubviews={true}
			/>
		</SafeAreaView>
	);
};

export default SearchMessageChannel;
