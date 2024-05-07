import { useDirect, useEscapeKey } from '@mezon/core';
import { IChannel } from '@mezon/utils';
import { getIsShowPopupForward } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ForwardMessageModal from '../ForwardMessage';
import * as Icons from '../Icons';
import { IconFriends } from '../Icons';
import DMListItem from './DMListItem';
import { ModalCreateDM } from './ModalCreateDmGroup/index';

export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function DirectMessageList() {
	const pathname = useLocation().pathname;
	const { listDM: dmGroupChatList } = useDirect();
	const filterDmGroupsByChannelLabel = (data: IChannel[]) => {
		const uniqueLabels = new Set();
		return data.filter((obj: IChannel) => {
			const isUnique = !uniqueLabels.has(obj.channel_label);
			uniqueLabels.add(obj.channel_label);
			return isUnique;
		});
	};

	const filteredDataDM = filterDmGroupsByChannelLabel(dmGroupChatList);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const onClickOpenModal = () => {
		setIsOpen(!isOpen);
	};
	const navigate = useNavigate();
	const isChange = useSelector(getIsShowPopupForward);

	useEscapeKey(() => setIsOpen(false));

	return (
		<>
			<div className="absolute">
				<ModalCreateDM onClose={onClickOpenModal} isOpen={isOpen} />
			</div>

			<div className="mt-5 px-2 py-1">
				<div className="w-full flex flex-row items-center">
					<button
						className={`py-2 px-3 rounded-[4px] w-full flex gap-4 items-center ${pathname.includes('friends') ? 'bg-bgTertiary' : ''}`}
						onClick={() => {
							navigate('/chat/direct/friends');
						}}
					>
						<IconFriends />
						Friends
					</button>
				</div>

				<div className="text-xs font-semibold tracking-wide left-sp text-[#AEAEAE] mt-6 flex flex-row items-center w-full justify-between px-2 pb-0 h-5 cursor-default hover:text-white">
					<p>DIRECT MESSAGES</p>
					<button
						onClick={onClickOpenModal}
						className="cursor-pointer flex flex-row justify-end  ml-0 hover:bg-bgSecondary rounded-full iconHover"
					>
						<Icons.Plus />
					</button>
				</div>
			</div>
			{isChange ? <ForwardMessageModal open={isChange} /> : null}
			<div className="flex-1 overflow-y-scroll font-medium text-gray-300 px-2 h-2/3">
				<div className="flex flex-col gap-1 text-[#AEAEAE] py-1 text-center relative">
					{filteredDataDM.map((directMessage: any, index: number) => {
						return <DMListItem key={index} directMessage={directMessage} />;
					})}
				</div>
			</div>
		</>
	);
}

export default DirectMessageList;
