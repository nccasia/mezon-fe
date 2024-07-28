import { Icons } from '@mezon/components';
import { useClans, useSearchMessages, useThreads } from '@mezon/core';
import { appActions, searchMessagesActions, selectCurrentChannel, selectCurrentClanId, selectIsShowMemberList, useAppDispatch } from '@mezon/store';
import { SIZE_PAGE_SEARCH } from '@mezon/utils';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';
import { useSelector } from 'react-redux';
import SearchMessageChannelModal from './SearchMessageChannelModal';
import SelectGroup from './SelectGroup';
import SelectItem from './SelectItem';
import darkMentionsInputStyle from './StyleSearchMessages';
import { hasKeySearch, searchFieldName } from './constant';

const SearchMessageChannel = () => {
	const dispatch = useAppDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const { isSearchMessage, fetchSearchMessages, currentPage } = useSearchMessages();
	const currentClanId = useSelector(selectCurrentClanId)
	const currentChannel = useSelector(selectCurrentChannel);
	const { listUserSearch } = useClans();
	const { setIsShowCreateThread } = useThreads();
	const [expanded, setExpanded] = useState(false);
	const [isShowSearchMessageModal, setIsShowSearchMessageModal] = useState(false);
	const [isShowSearchOptions, setIsShowSearchOptions] = useState('');
	const [valueInputSearch, setValueInputSearch] = useState<string>('');
	const [valueDisplay, setValueDisplay] = useState<string>('');
	const [search, setSearch] = useState<any | undefined>();
	const inputRef = useRef<HTMLInputElement>(null);
	const searchRef = useRef<HTMLInputElement | null>(null);

	const handleInputClick = () => {
		setExpanded(true);
		if (!hasKeySearch(valueInputSearch)) {
			setIsShowSearchMessageModal(true);
		}
	};

	const handleOutsideClick = (event: MouseEvent) => {
		const targetIsOutside = inputRef.current && !inputRef.current.contains(event.target as Node);

		if (targetIsOutside && !valueInputSearch) {
			setExpanded(false);
			setIsShowSearchMessageModal(false);
		}
		if (targetIsOutside && valueInputSearch) {
			setIsShowSearchMessageModal(false);
		}
	};

	const handleChange: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const value = event.target.value;
		setValueInputSearch(value);
		setValueDisplay(newPlainTextValue);
		const filter = [];
		if (mentions.length === 0) {
			filter.push({ field_name: 'content', field_value: value }, { field_name: 'clan_id', field_value: currentClanId });
		}
		for (const mention of mentions) {
			const convertMemtion = mention.display.split(':');
			filter.push({ field_name: searchFieldName[convertMemtion[0]], field_value: convertMemtion[1] });
		}
		setSearch({ ...search, filters: filter, from: 1, size: SIZE_PAGE_SEARCH });
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => {
		if (valueInputSearch && event.key === 'Enter') {
			setIsShowSearchMessageModal(false);
			dispatch(searchMessagesActions.setIsSearchMessage(true));
			setIsShowCreateThread(false, currentChannel?.parrent_id !== '0' ? currentChannel?.parrent_id : currentChannel.channel_id);
			if (isActive) dispatch(appActions.setIsShowMemberList(!isActive));
			if (search) {
				fetchSearchMessages(search);
			}
		}
	};

	const handleSearchIcon = () => {
		searchRef.current?.focus();
		setExpanded(true);
	};

	const handleClose = () => {
		setValueInputSearch('');
		setValueDisplay('');
		dispatch(searchMessagesActions.setIsSearchMessage(false));
		if (isSearchMessage) dispatch(appActions.setIsShowMemberList(!isActive));
		searchRef.current?.focus();
	};

	const handleClickSearchOptions = (value: string) => {
		setValueInputSearch(valueInputSearch + value);
		searchRef.current?.focus();
	};

	useEffect(() => {
		if (search) {
			fetchSearchMessages({ ...search, from: currentPage });
		}
	}, [currentPage]);

	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	}, [valueInputSearch]);

	return (
		<div className="relative" ref={inputRef}>
			<div
				className={`transition-all duration-300 ${expanded ? 'w-80' : 'w-40'
					} h-8 pl-2 pr-2 py-3 dark:bg-bgTertiary bg-bgLightTertiary rounded items-center inline-flex`}
			>
				<MentionsInput
					inputRef={searchRef}
					placeholder="Search"
					value={valueInputSearch ?? ''}
					style={darkMentionsInputStyle}
					onChange={handleChange}
					className="w-full mr-[10px] dark:bg-transparent bg-transparent dark:text-white text-colorTextLightMode rounded-md focus-visible:!border-0 focus-visible:!outline-none focus-visible:[&>*]:!outline-none"
					allowSpaceInQuery={true}
					singleLine={true}
					onClick={handleInputClick}
					onKeyDown={handleKeyDown}
					customSuggestionsContainer={(children: React.ReactNode) => {
						return (
							<div
								className={`absolute left-0 top-10 pb-3 ${valueInputSearch ? 'pt-0' : 'pt-3'} rounded dark:bg-bgProfileBody bg-bgLightPrimary z-[9999] w-widthModalSearch min-h-heightModalSearch shadow`}
							>
								{valueInputSearch && (
									<div className="first:mt-0 mt-3 p-3 rounded-t dark:bg-bgSecondary600 border-b border-borderDivider last:border-b-0 last:bottom-b-0">
										<div className="flex items-center justify-between">
											<div className="flex flex-row items-center flex-1 overflow-x-hidden">
												<h3 className="text-xs font-medium text-textLightTheme dark:text-textPrimary uppercase mr-1 flex-shrink-0">
													Search for:
												</h3>
												<p className="text-sm font-semibold w-full mr-[10px] whitespace-normal text-ellipsis overflow-x-hidden">
													{valueDisplay}
												</p>
											</div>
											<button className="px-1 h-5 w-10 text-xs text-textLightTheme dark:text-textPrimary font-semibold rounded bg-borderDividerLight dark:bg-borderDividerLight">
												Enter
											</button>
										</div>
									</div>
								)}
								<SelectGroup groupName="From user">{children}</SelectGroup>
							</div>
						);
					}}
				>
					<Mention
						appendSpaceOnAdd={true}
						data={listUserSearch ?? []}
						trigger="from:"
						displayTransform={(id: any, display: any) => {
							return `from:${display}`;
						}}
						renderSuggestion={(suggestion) => {
							return <SelectItem title="from: " content={suggestion.display} onClick={() => setIsShowSearchOptions('')} />;
						}}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
					/>

					<Mention
						appendSpaceOnAdd={true}
						data={listUserSearch ?? []}
						trigger="mentions:"
						displayTransform={(id: any, display: any) => {
							return `from:${display}`;
						}}
						renderSuggestion={(suggestion) => {
							return <SelectItem title="mentions: " content={suggestion.display} onClick={() => setIsShowSearchOptions('')} />;
						}}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
					/>
				</MentionsInput>
			</div>
			<div className="w-6 h-6 flex flex-row items-center pl-1 absolute right-1 bg-transparent top-1/2 transform -translate-y-1/2">
				<button
					onClick={handleSearchIcon}
					className={`${valueInputSearch ? 'z-0 opacity-0 rotate-0' : 'z-10 opacity-100 rotate-90'} w-4 h-4 absolute transition-transform`}
				>
					<Icons.Search className="w-4 h-4 dark:text-white text-colorTextLightMode" />
				</button>
				<button
					onClick={handleClose}
					className={`${valueInputSearch ? 'z-10 opacity-100 rotate-90' : 'z-0 opacity-0 rotate-0'} w-4 h-4 absolute transition-transform`}
				>
					<Icons.Close defaultSize="w-4 h-4" />
				</button>
			</div>
			{isShowSearchMessageModal && (
				<SearchMessageChannelModal
					hasKeySearch={hasKeySearch(valueInputSearch ?? '')}
					valueInputSearch={valueInputSearch}
					valueDisplay={valueDisplay}
					isShowSearchOptions={isShowSearchOptions}
					onClickSearchOptions={handleClickSearchOptions}
				/>
			)}
		</div>
	);
};

export default SearchMessageChannel;
