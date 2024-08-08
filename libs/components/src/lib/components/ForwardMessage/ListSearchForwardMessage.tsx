import { Checkbox } from '@mezon/ui';
import { filterListByName, sortFilteredList, TypeSearch } from '@mezon/utils';
import { useMemo } from 'react';
import SuggestItem from '../MessageBox/ReactionMentionInput/SuggestItem';

type ListSearchForwardMessageProps = {
	listSearch: any[];
	searchText: string;
	selectedObjectIdSends: any[];
	handleToggle: (id: string, type: number, clanId?: string, channel_label?: string) => void;
};

const ListSearchForwardMessage = (props: ListSearchForwardMessageProps) => {
	const { listSearch, searchText, selectedObjectIdSends, handleToggle } = props;

	const filteredList = useMemo(() => filterListByName(listSearch, searchText, false), [listSearch, searchText]);
	const sortedList = useMemo(() => sortFilteredList(filteredList, searchText, false), [filteredList, searchText]);
	if (sortedList.length === 0) {
		return null;
	}
	return (
		sortedList.length &&
		sortedList.slice(0, 15).map((item: any) => {
			const isTypeDm = item.typeSearch === TypeSearch.Dm_Type;
			return (
				<div key={item.id} className="flex items-center px-4 py-1 dark:hover:bg-bgPrimary1 hover:bg-bgLightModeThird rounded">
					{isTypeDm ? (
						<ItemDm
							id={item.idDM}
							avatar={item.avatarUser}
							name={item.prioritizeName}
							searchText={searchText}
							checked={selectedObjectIdSends.some((selectedItem: any) => selectedItem.id === item.idDM)}
							handleToggle={() => handleToggle(item.idDM, item.typeChat || 0)}
							userName={item.userName}
						/>
					) : (
						<ItemChannel
							id={item.id}
							name={item.prioritizeName}
							subText={item.subText}
							searchText={searchText}
							checked={selectedObjectIdSends.some((selectedItem: any) => selectedItem.id === item.id)}
							handleToggle={() => handleToggle(item.id, item.type || 0, item.clanId, item.channel_label || '')}
						/>
					)}
				</div>
			);
		})
	);
};

export default ListSearchForwardMessage;

type ItemDmProps = {
	id: string;
	name: string;
	avatar: string;
	searchText: string;
	checked: boolean;
	handleToggle: () => void;
	userName?: string;
};

const ItemDm = (props: ItemDmProps) => {
	const { id, name, avatar, searchText, checked, handleToggle, userName } = props;
	return (
		<>
			<div className="flex-1 mr-1">
				<SuggestItem
					display={name}
					avatarUrl={avatar}
					showAvatar
					valueHightLight={searchText}
					subText={userName}
					wrapSuggestItemStyle="gap-x-1"
					subTextStyle="text-[13px]"
					emojiId="" // TODO:
				/>
			</div>
			<Checkbox className="w-4 h-4 focus:ring-transparent" id={`checkbox-item-${id}`} checked={checked} onChange={handleToggle} />
		</>
	);
};

type ItemChannelProps = {
	id: string;
	name: string;
	subText: string;
	searchText: string;
	checked: boolean;
	handleToggle: () => void;
};

const ItemChannel = (props: ItemChannelProps) => {
	const { id, name, subText, searchText, checked, handleToggle } = props;
	return (
		<>
			<div className="flex-1 mr-1">
				<SuggestItem
					display={name}
					subText={subText}
					channelId={id}
					valueHightLight={searchText}
					subTextStyle="uppercase"
					isOpenSearchModal
					emojiId="" //TODO:
				/>
			</div>
			<Checkbox className="w-4 h-4 focus:ring-transparent" id={`checkbox-item-${id}`} checked={checked} onChange={handleToggle} />
		</>
	);
};
