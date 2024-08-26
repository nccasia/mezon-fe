import { useEscapeKey, useOnClickOutside } from '@mezon/core';
import { selectDirectsOpenlist, selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateMessageGroup from './CreateMessageGroup';
import ListDMChannel from './listDMChannel';

export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

const sortDMItem = (notSortedArr: IChannel[]): IChannel[] => {
	return notSortedArr.slice().sort((a, b) => {
		const timestampA = a.last_sent_message?.timestamp_seconds || a.create_time_seconds || 0;
		const timestampB = b.last_sent_message?.timestamp_seconds || b.create_time_seconds || 0;
		return timestampB - timestampA;
	});
};

function DirectMessageList() {
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const appearanceTheme = useSelector(selectTheme);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const buttonPlusRef = useRef<HTMLDivElement | null>(null);

	const filterDmGroupsByChannelLabel = (data: IChannel[]) => {
		const uniqueLabels = new Set();
		return data.filter((obj: IChannel) => {
			const isUnique = !uniqueLabels.has(obj.channel_id);
			uniqueLabels.add(obj.channel_id);
			return isUnique;
		});
	};

	const sortedFilteredDataDM = useMemo(() => {
		return sortDMItem(filterDmGroupsByChannelLabel(dmGroupChatList));
	}, [dmGroupChatList]);

	useEffect(() => {
		if (sortedFilteredDataDM.length === 0) {
			navigate('/chat/direct/friends');
		}
	}, [sortedFilteredDataDM, navigate]);

	const onClickOpenModal = (event: React.MouseEvent) => {
		setIsOpen(!isOpen);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
	};

	useEscapeKey(() => setIsOpen(false));

	useOnClickOutside(buttonPlusRef, handleCloseModal);

	return (
		<>
			<div className="mt-5 px-2 py-1">
				<div className="w-full flex flex-row items-center">
					<button
						className={`py-2 px-3 rounded-[4px] dark:text-white text-black w-full flex gap-4 items-center ${pathname.includes('friends') ? 'dark:bg-bgModifierHover bg-[#F7F7F7]' : ''}`}
						onClick={() => {
							navigate('/chat/direct/friends');
						}}
					>
						<Icons.IconFriends />
						Friends
					</button>
				</div>

				<div className="text-xs font-semibold tracking-wide left-sp dark:text-[#AEAEAE] text-[#585858] mt-6 flex flex-row items-center w-full justify-between px-2 pb-0 h-5 cursor-default dark:hover:text-white hover:text-black">
					<p>DIRECT MESSAGES</p>
					<div
						ref={buttonPlusRef}
						onClick={onClickOpenModal}
						className="relative cursor-pointer flex flex-row justify-end  ml-0 dark:hover:bg-bgSecondary hover:bg-bgLightMode rounded-full"
					>
						<Tooltip content="Create DM" trigger="hover" animation="duration-500" style={appearanceTheme === 'light' ? 'light' : 'dark'}>
							<Icons.Plus className="w-4 h-4" />
						</Tooltip>
						{isOpen && <CreateMessageGroup onClose={() => setIsOpen(false)} isOpen={isOpen} />}
					</div>
				</div>
			</div>
			<div
				className={`flex-1 overflow-y-scroll font-medium text-gray-300 px-2 h-2/3 ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			>
				<div className="flex flex-col gap-1 text-[#AEAEAE] py-1 text-center relative">
					<ListDMChannel listDM={sortedFilteredDataDM} />
				</div>
			</div>
		</>
	);
}

export default DirectMessageList;
