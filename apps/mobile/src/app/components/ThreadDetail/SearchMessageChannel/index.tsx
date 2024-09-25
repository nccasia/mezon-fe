import { debounce, EOpenSearchChannelFrom, IOption, IUerMention } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { DirectEntity, searchMessagesActions, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { IChannel, SearchFilter, SIZE_PAGE_SEARCH } from '@mezon/utils';
import { RouteProp } from '@react-navigation/native';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import InputSearchMessageChannel from './InputSearchMessageChannel';
import SearchMessagePage from './SearchMessagePage';
import SearchOptionPage from './SearchOptionPage';

type RootStackParamList = {
	SearchMessageChannel: {
		openSearchChannelFrom: EOpenSearchChannelFrom;
		currentChannel: IChannel | DirectEntity;
	};
};

type MuteThreadDetailRouteProp = RouteProp<RootStackParamList, 'SearchMessageChannel'>;

type SearchMessageChannelProps = {
	route: MuteThreadDetailRouteProp;
};

const Backspace = 'Backspace';

export const SearchMessageChannelContext = createContext(null);

const SearchMessageChannel = ({ route }: SearchMessageChannelProps) => {
	const { themeValue } = useTheme();
	const { t } = useTranslation(['searchMessageChannel']);
	const { openSearchChannelFrom, currentChannel } = route?.params || {};

	const [userMention, setUserMention] = useState<IUerMention>();
	const [isSearchMessagePage, setSearchMessagePage] = useState<boolean>(true);
	const currentClanId = useSelector(selectCurrentClanId);
	const [filtersSearch, setFiltersSearch] = useState<SearchFilter[]>();
	const dispatch = useAppDispatch();
	const [optionFilter, setOptionFilter] = useState<IOption>();

	const [searchText, setSearchText] = useState<string>('');
	const handleSearchText = useCallback(
		debounce((text) => {
			if (!text.length) {
				setSearchMessagePage(true);
			}
			setSearchText(text);
		}, 200),
		[]
	);

	const handleOptionFilter = useCallback(
		(option) => {
			setOptionFilter(option);
			setUserMention(null);
			if (option) setSearchMessagePage(false);
		},
		[optionFilter]
	);
	const handleSelectUserInfo = useCallback((user) => {
		setUserMention(user);
		setSearchMessagePage(true);
	}, []);

	useEffect(() => {
		handleSearchMessage();
	}, [searchText, userMention]);

	const handleSearchMessage = () => {
		const filter: SearchFilter[] = [];
		if (optionFilter && userMention) {
			filter.push(
				{ field_name: optionFilter.value, field_value: userMention?.display },
				{ field_name: 'channel_id', field_value: currentChannel?.id }
			);
		} else {
			filter.push(
				{
					field_name: 'content',
					field_value: searchText
				},
				{ field_name: 'channel_id', field_value: currentChannel?.id },
				{ field_name: 'clan_id', field_value: currentClanId as string }
			);
		}
		const payload = {
			filters: filter,
			from: 1,
			size: SIZE_PAGE_SEARCH
		};
		setFiltersSearch(filter);
		if ((optionFilter && userMention) || isSearchMessagePage) {
			dispatch(searchMessagesActions.fetchListSearchMessage(payload));
		}
	};
	const handleKeyPress = (e) => {
		if (e.nativeEvent.key === Backspace && !searchText?.length) {
			setUserMention(null);
			setOptionFilter(null);
		}
	};
	return (
		<SearchMessageChannelContext.Provider value={filtersSearch}>
			<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: themeValue.secondary }}>
				<InputSearchMessageChannel
					onKeyPress={handleKeyPress}
					optionFilter={optionFilter}
					inputValue={searchText}
					onChangeText={handleSearchText}
					onChangeOptionFilter={handleOptionFilter}
					userMention={userMention}
					currentChannel={currentChannel}
				/>
				{isSearchMessagePage ? (
					<SearchMessagePage
						isSearchMessagePage={isSearchMessagePage}
						userMention={userMention}
						currentChannel={currentChannel}
						searchText={searchText}
					/>
				) : (
					<SearchOptionPage
						optionFilter={optionFilter}
						currentChannel={currentChannel}
						onSelect={handleSelectUserInfo}
						searchText={searchText}
					/>
				)}
			</SafeAreaView>
		</SearchMessageChannelContext.Provider>
	);
};

export default SearchMessageChannel;
