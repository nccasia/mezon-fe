import { useReference } from '@mezon/core';
import { referencesActions, selectMemberByUserId, selectMessageByMessageId, selectOpenReplyMessageState } from '@mezon/store';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../Icons/index';

function ReplyMessageBox() {
	const dispatch = useDispatch();
	const { idMessageRefReply } = useReference();
	const refMessage = useSelector(selectMessageByMessageId(idMessageRefReply));
	const getSenderMessage = useSelector(selectMemberByUserId(refMessage?.sender_id));
	const messageReplyState = useSelector(selectOpenReplyMessageState);

	const handleRemoveReply = () => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(referencesActions.setReferenceMessage(null));
		dispatch(referencesActions.setDataReferences(null));
	};

	return (
		idMessageRefReply &&
		messageReplyState && (
			<div className="flex flex-row items-center justify-between w-full my-2 dark:bg-[#2B2D31] bg-bgLightMode p-2 rounded-md text-[14px]">
				<div className="dark:text-white text-black">
					Replying to <span className=" dark:text-[#84ADFF] text-[#3297ff] font-semibold">{getSenderMessage?.user?.username}</span>
				</div>
				<button className="relative" onClick={handleRemoveReply}>
					<Icons.CircleClose />
				</button>
			</div>
		)
	);
}

export default ReplyMessageBox;
