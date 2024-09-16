import { selectAllUserClans } from '@mezon/store';
import { UsersClanEntity } from '@mezon/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import SelectGroup from '../SelectGroup';
import SelectItem from '../SelectItem';
import { searchOptions } from '../constant';

type SearchMessageChannelModalProps = {
	valueDisplay?: string;
	valueInputSearch?: string;
	hasKeySearch?: boolean;
	isShowSearchOptions?: string;
	onClickSearchOptions: (value: string) => void;
	theme: string;
};

const SearchMessageChannelModal = ({
	valueDisplay,
	valueInputSearch,
	hasKeySearch,
	isShowSearchOptions,
	onClickSearchOptions,
	theme
}: SearchMessageChannelModalProps) => {
	const usersClan = useSelector(selectAllUserClans);

	const userClanSearch = useMemo(() => {
		return usersClan.length
			? usersClan
					.filter((item: UsersClanEntity) => {
						const name = item.user?.username ?? '';
						return name.indexOf(valueDisplay ?? '') > -1;
					})
					.slice(0, 3)
			: [];
	}, [usersClan, valueDisplay]);

	const [index, setIndex] = useState(0);
	const totalOptions = searchOptions.length;

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			setIndex((prevIndex) => (prevIndex + 1) % totalOptions);
			e.preventDefault();
		} else if (e.key === 'ArrowUp') {
			setIndex((prevIndex) => (prevIndex - 1 + totalOptions) % totalOptions);
			e.preventDefault();
		} else if (e.key === 'Enter') {
			const selectedItem = searchOptions[index];
			if (selectedItem) {
				onClickSearchOptions(selectedItem.title);
			}
			e.preventDefault();
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown as EventListener);
		return () => {
			window.removeEventListener('keydown', handleKeyDown as EventListener);
		};
	}, [index, totalOptions, onClickSearchOptions]);

	return (
		<div
			className={`absolute left-0 top-10 pb-3 ${valueDisplay ? 'pt-0' : 'pt-3'} rounded dark:bg-bgProfileBody bg-bgLightPrimary z-[9999] w-widthModalSearch shadow`}
			tabIndex={0}
		>
			{valueDisplay && (
				<div className="first:mt-0 mt-3 p-3 rounded-t dark:bg-bgSecondary600 border-b border-borderDivider last:border-b-0 last:bottom-b-0">
					<div className="flex items-center justify-between">
						<div className="flex flex-row items-center flex-1 overflow-x-hidden">
							<h3 className="text-xs font-medium text-textLightTheme dark:text-textPrimary uppercase mr-1 flex-shrink-0">
								Search for:
							</h3>
							<p className="text-sm font-semibold text-textLightTheme dark:text-textPrimary w-full mr-[10px] whitespace-normal text-ellipsis overflow-x-hidden">
								{valueDisplay}
							</p>
						</div>
						<button className="px-1 h-5 w-10 text-xs font-semibold rounded bg-borderDividerLight">Enter</button>
					</div>
				</div>
			)}

			{!hasKeySearch && !isShowSearchOptions && (
				<SelectGroup groupName="Search options">
					{searchOptions.map((searchItem, idx) => (
						<SelectItem
							key={idx}
							onClick={() => onClickSearchOptions(searchItem.title ?? '')}
							title={searchItem.title}
							content={searchItem.content}
							className={`${index === idx && theme === 'light' ? 'bg-[#EBEBED]' : index === idx && theme === 'dark' ? 'bg-[#282A2E]' : ''}`}
						/>
					))}
				</SelectGroup>
			)}

			{!hasKeySearch && valueInputSearch && userClanSearch.length > 0 && (
				<SelectGroup groupName="From user">
					{userClanSearch.map((item) => (
						<SelectItem key={item.id} title="from: " content={item.user?.username} />
					))}
				</SelectGroup>
			)}
		</div>
	);
};

export default SearchMessageChannelModal;
