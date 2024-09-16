import { useDMInvite } from '@mezon/core';
import { DirectEntity, selectTheme } from '@mezon/store';
import { ChangeEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ListMemberInviteItem from './ListMemberInviteItem';
export type ModalParam = {
	url: string;
	channelID?: string;
};
const ListMemberInvite = (props: ModalParam) => {
	const appearanceTheme = useSelector(selectTheme);
	const { listDMInvite, listUserInvite } = useDMInvite(props.channelID);
	const [searchTerm, setSearchTerm] = useState('');
	const [sendIds, setSendIds] = useState<Record<string, boolean>>({});
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const filteredListDMBySearch = useMemo(() => {
		return listDMInvite?.filter((dmGroup) => {
			return dmGroup.channel_label?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listDMInvite, searchTerm]);

	const filteredListUserBySearch = useMemo(() => {
		return listUserInvite?.filter((dmGroup) => {
			return dmGroup.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listUserInvite, searchTerm]);

	const handleSend = (dmGroup: DirectEntity) => {
		setSendIds((ids) => {
			return {
				...ids,
				[dmGroup.id]: true
			};
		});
	};

	return (
		<>
			<input
				type="text"
				value={searchTerm}
				onChange={handleInputChange}
				placeholder="Search for friends"
				className="w-full h-10 dark:bg-black bg-[#dfe0e2] rounded-[5px] px-[16px] py-[13px] text-[14px] outline-none"
			/>
			<p className="ml-[0px] mt-1 mb-4 dark:text-[#AEAEAE] text-black text-[15px] cursor-default">
				This channel is private, only select members and roles can view this channel.
			</p>
			<hr className="border-solid dark:border-borderDefault border-gray-200 rounded-t "></hr>
			<div
				className={`py-[10px] pr-2 cursor-default overflow-y-auto max-h-[200px] overflow-x-hidden ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
			>
				{listDMInvite ? (
					<div>
						{filteredListDMBySearch?.map((dmGroup) => (
							<ListMemberInviteItem
								dmGroup={dmGroup}
								key={dmGroup.id}
								url={props.url}
								onSend={handleSend}
								isSent={!!sendIds[dmGroup.id]}
							/>
						))}
					</div>
				) : (
					<div>
						{filteredListUserBySearch?.map((user) => (
							<ListMemberInviteItem user={user} key={user.id} url={props.url} onSend={handleSend} isSent={!!sendIds[user.id]} />
						))}
					</div>
				)}
			</div>
			<hr className="border-solid dark:border-borderDefault border-gray-200 rounded-t " />
		</>
	);
};

export default ListMemberInvite;
