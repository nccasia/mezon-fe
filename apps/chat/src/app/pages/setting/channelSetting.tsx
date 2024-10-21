import { ListChannelSetting } from '@mezon/components';
import {
	channelSettingActions,
	selectAllChannelSuggestion,
	selectCurrentClanId,
	selectNumberChannelCount,
	selectNumberThreadCount,
	useAppDispatch
} from '@mezon/store';
import { ChannelStatusEnum } from '@mezon/utils';
import { ApiChannelSettingItem } from 'mezon-js/api.gen';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const ChannelSetting = () => {
	const [privateFilter, setPrivateFilter] = useState(true);
	const [threadFilter, setThreadFilter] = useState(false);

	const [searchFilter, setSearchFilter] = useState('');
	const listChannel = useSelector(selectAllChannelSuggestion);
	const countChannel = useSelector(selectNumberChannelCount);
	const countThread = useSelector(selectNumberThreadCount);

	const dispatch = useAppDispatch();
	const selectClanId = useSelector(selectCurrentClanId);

	const handleFilterPrivateChannel = (e: ChangeEvent<HTMLInputElement>) => {
		setPrivateFilter(e.target.checked);
	};
	const handleFilterThread = (e: ChangeEvent<HTMLInputElement>) => {
		setThreadFilter(e.target.checked);
	};
	const handleSearchByNameChannel = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchFilter(e.target.value);
	};

	const filterChannel = (channel: ApiChannelSettingItem) => {
		if (privateFilter && channel.channel_private !== ChannelStatusEnum.isPrivate) {
			return false;
		}
		if (threadFilter && channel.parent_id === '0') {
			return false;
		}
		if (!channel.channel_label?.includes(searchFilter)) {
			return false;
		}
		return true;
	};

	const listChannelSetting = useMemo(() => {
		const listChannelRecord: Record<string, ApiChannelSettingItem[]> = {};
		listChannel.forEach((channel) => {
			if (!filterChannel(channel)) {
				return;
			}
			if (listChannelRecord[channel.parent_id as string]) {
				listChannelRecord[channel.parent_id as string].push(channel);
				return;
			}
			if (channel.parent_id === '0') {
				listChannelRecord[channel.id as string] = [];
			} else {
				listChannelRecord[channel.parent_id as string] = [channel];
			}
		});

		return listChannelRecord;
	}, [privateFilter, searchFilter, listChannel.length, threadFilter]);

	useEffect(() => {
		async function fetchListChannel() {
			await dispatch(channelSettingActions.fetchChannelByUserId({ clanId: selectClanId as string }));
		}
		fetchListChannel();
	}, []);

	return (
		<div className="p-8 h-[calc(100vh_-_56px)] flex flex-col">
			<div className="p-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="private_filter"
						defaultChecked={privateFilter}
						onChange={handleFilterPrivateChannel}
						className="w-4 h-4 rounded-md border-channelTextLabel overflow-hidden"
					/>
					<label htmlFor="private_filter">
						Only Private <span className="font-semibold italic">({countChannel})</span>
					</label>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="thread_filter"
						defaultChecked={threadFilter}
						onChange={handleFilterThread}
						className="w-4 h-4 rounded-md border-channelTextLabel overflow-hidden"
					/>
					<label htmlFor="thread_filter">
						Only Thread <span className="font-semibold italic">({countThread})</span>
					</label>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="text"
						value={searchFilter}
						placeholder="Search"
						onChange={handleSearchByNameChannel}
						className=" max-w-60 h-8 pl-2 pr-2 py-3 dark:bg-bgTertiary bg-bgLightTertiary rounded items-center inline-flex outline-none focus:outline-none"
					/>
				</div>
			</div>
			<ListChannelSetting listChannel={listChannelSetting} />
		</div>
	);
};
export default ChannelSetting;
