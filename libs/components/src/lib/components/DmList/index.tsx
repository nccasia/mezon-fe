import { useAppNavigation, useDirect } from '@mezon/core';
import { RootState, directActions, useAppDispatch } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Icons from '../Icons';
import { IconFriends } from '../Icons';
import MemberProfile from '../MemberProfile';
import { ModalCreateDM } from './ModalCreateDmGroup/index';

export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function DirectMessageList() {
	const currentDmGroupId = useSelector((state: RootState) => state.direct.currentDirectMessageId);
	const pathname = useLocation().pathname;
	const { listDM: dmGroupChatList } = useDirect();
	const filterDmGroupsByChannelLabel = (data: IChannel[]) => {
		const uniqueLabels = new Set();
		return data.filter((obj: IChannel) => {
			const isUnique = !uniqueLabels.has(obj.channel_lable);
			uniqueLabels.add(obj.channel_lable);
			return isUnique;
		});
	};

	const filteredDataDM = filterDmGroupsByChannelLabel(dmGroupChatList);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const onClickOpenModal = () => {
		setIsOpen(!isOpen);
	};

	const dispatch = useAppDispatch();
	const { toDmGroupPage } = useAppNavigation();
	const navigate = useNavigate();

	const joinToChatAndNavigate = async (DMid: string, type: number) => {
		const result = await dispatch(
			directActions.joinDirectMessage({
				directMessageId: DMid,
				channelName: '',
				type: type,
			}),
		);
		await dispatch(directActions.selectDmGroupCurrentId(DMid));
		if (result) {
			navigate(toDmGroupPage(DMid, type));
		}
	};

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

				<div className="text-[14px] px-3 font-bold text-[#fff] mt-6 flex flex-row items-center w-full justify-between px-1 pb-5 h-5">
					<p>DIRECT MESSAGE</p>
					<button onClick={onClickOpenModal} className="cursor-pointer flex flex-row justify-end  ml-0">
						<Icons.Plus />
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-scroll font-medium text-gray-300 px-2">
				<div className="flex flex-col gap-1 text-[#AEAEAE] py-1 text-center relative">
					{filteredDataDM.map((directMessage: any) => (
						<button
							key={directMessage.channel_id}
							className={`group text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] hover:bg-bgSecondary py-2 w-full focus:bg-bgTertiary ${directMessage.channel_id === currentDmGroupId && !pathname.includes('friends') ? 'bg-[#1E1E1E] text-white' : ''}`}
							onClick={() => joinToChatAndNavigate(directMessage.channel_id, directMessage.type)}
						>
							<MemberProfile
								numberCharacterCollapse={22}
								avatar={directMessage?.channel_avatar.length !== 1 ? '' : (directMessage?.channel_avatar ?? '')}
								name={directMessage?.channel_lable ?? ''}
								status={false}
								isHideStatus={true}
								isHideIconStatus={false}
								key={directMessage.channel_id}
							/>
						</button>
					))}
				</div>
			</div>
		</>
	);
}

export default DirectMessageList;
