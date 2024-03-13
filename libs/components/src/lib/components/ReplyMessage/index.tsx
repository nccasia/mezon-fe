import { ChatContext } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../Icons/index';

function ReplyMessage() {
	const { messageRef, isOpenReply, setMessageRef, setIsOpenReply } = useContext(ChatContext);
	const getSenderMessage = useSelector(selectMemberByUserId(messageRef?.sender_id ?? ''));

	const handleRemoveReply = () => {
		setIsOpenReply(false);
		setMessageRef(undefined);
	};

	return (
		<>
			{isOpenReply && (
				<div className="flex flex-row items-center justify-between w-full my-2  bg-[#2B2D31] p-2 rounded-md text-[14px]">
					<div className="">
						Replying to <span className=" text-green-500 font-semibold">{getSenderMessage?.user?.username}</span>
					</div>
					<button className="relative iconHover" onClick={handleRemoveReply}>
						<Icons.CircleClose />
					</button>
				</div>
			)}
		</>
	);
}

export default ReplyMessage;
