import { SearchItemProps, TypeSearch } from '@mezon/utils';
import { memo } from 'react';
import SuggestItem from '../MessageBox/ReactionMentionInput/SuggestItem';

type ListSearchModalProps = {
	listSearch: SearchItemProps[];
	searchText: string;
	itemRef: React.MutableRefObject<HTMLDivElement | null>;
	idActive: string;
	handleSelect: (type: boolean, item: SearchItemProps) => Promise<void>;
	setIdActive: React.Dispatch<React.SetStateAction<string>>;
	isSearchByUsername?: boolean;
};

const ListSearchModal = (props: ListSearchModalProps) => {
	const { listSearch, itemRef, searchText, idActive, handleSelect, setIdActive, isSearchByUsername } = props;

	return (
		listSearch.length > 0 &&
		listSearch.map((item: SearchItemProps) => {
			const isTypeChannel = item.type === TypeSearch.Channel_Type;
			return (
				<div
					ref={itemRef}
					key={item.id}
					onClick={() => handleSelect(isTypeChannel, item)}
					onMouseEnter={() => setIdActive(item.id ?? '')}
					onMouseLeave={() => setIdActive(item.id ?? '')}
					className={`${idActive === item.id ? 'dark:bg-bgModifierHover bg-bgLightModeThird' : ''}  w-full px-[10px] py-[4px] rounded-[6px] cursor-pointer`}
				>
					{isTypeChannel ? (
						<SuggestItem
							display={item?.prioritizeName}
							symbol={item.icon}
							subText={item.subText}
							channelId={item.channelId}
							valueHightLight={searchText}
							subTextStyle="uppercase"
							isOpenSearchModal
							emojiId={item.id as string}
						/>
					) : (
						<SuggestItem
							display={item?.prioritizeName}
							avatarUrl={item?.avatarUser}
							showAvatar
							valueHightLight={isSearchByUsername ? searchText.slice(1) : searchText}
							subText={item?.name}
							wrapSuggestItemStyle="gap-x-1"
							subTextStyle="text-[13px]"
							isHightLight={!isSearchByUsername}
							emojiId={item.id as string}
						/>
					)}
				</div>
			);
		})
	);
};

export default memo(ListSearchModal);
