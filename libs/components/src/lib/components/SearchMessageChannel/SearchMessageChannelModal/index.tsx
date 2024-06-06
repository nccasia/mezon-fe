import { useClans } from '@mezon/core';
import { UsersClanEntity } from '@mezon/utils';
import { useMemo } from 'react';
import SelectGroup from '../SelectGroup';
import SelectItem from '../SelectItem';

type SearchMessageChannelModalProps = {
	value?: string;
};

const SearchMessageChannelModal = ({ value }: SearchMessageChannelModalProps) => {
	const { usersClan } = useClans();

	const userClanSearch = useMemo(() => {
		return usersClan.length
			? usersClan
					.filter((item: UsersClanEntity) => {
						const name = item.user?.username ?? '';
						return name.indexOf(value ?? '') > -1;
					})
					.slice(0, 3)
			: [];
	}, [usersClan, value]);

	return (
		<div
			className={`absolute left-0 top-10 pb-3 ${value ? 'pt-0' : 'pt-3'} rounded dark:bg-bgProfileBody bg-bgLightPrimary z-[9999] w-widthModalSearch min-h-heightModalSearch`}
		>
			{value && (
				<div className="first:mt-0 mt-3 p-3 rounded-t dark:bg-bgSecondary600 border-b border-borderDivider last:border-b-0 last:bottom-b-0">
					<div className="flex items-center justify-between">
						<div className="flex flex-row items-center flex-1 overflow-x-hidden">
							<h3 className="text-xs font-medium uppercase mr-1 flex-shrink-0">Search for:</h3>
							<p className="text-sm font-semibold w-full mr-[10px] whitespace-normal text-ellipsis overflow-x-hidden">{value}</p>
						</div>
						<button className="px-1 h-5 w-10 text-xs font-semibold rounded bg-borderDividerLight">Enter</button>
					</div>
				</div>
			)}

			{!value && (
				<SelectGroup groupName="Search options">
					<SelectItem title="from: " content="user" />
					<SelectItem title="mentions: " content="user" />
					<SelectItem title="has: " content="link, embed or file" />
					<SelectItem title="before: " content="specific data" />
					<SelectItem title="during: " content="specific data" />
					<SelectItem title="after: " content="specific data" />
					<SelectItem title="pinned: " content="true or false" />
				</SelectGroup>
			)}

			{value && userClanSearch.length > 0 && (
				<SelectGroup groupName="From user">
					{userClanSearch.map((item) => (
						<SelectItem key={item.id} title="from: " content={item.user?.username} />
					))}
				</SelectGroup>
			)}

			<SelectGroup groupName="History">
				<SelectItem title="from: " content="user" />
			</SelectGroup>
		</div>
	);
};

export default SearchMessageChannelModal;
