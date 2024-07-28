import { referencesActions, selectMessageByMessageId, selectOpenReplyMessageState } from '@mezon/store';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../../../ui/src/lib/Icons/index';
import { useMessageParser } from '../MessageWithUser/useMessageParser';
import useShowName from '../MessageWithUser/useShowName';

type MessageReplyProps = {
	idMessage: string;
};

function ReplyMessageBox({ idMessage }: MessageReplyProps) {
	const dispatch = useDispatch();
	const refMessage = useSelector(selectMessageByMessageId(idMessage));
	const messageReplyState = useSelector(selectOpenReplyMessageState);

	const { userClanNickname, userDisplayName, username, senderId } = useMessageParser(refMessage);

	const nameShowed = useShowName(userClanNickname ?? '', userDisplayName ?? '', username ?? '', senderId ?? '');

	const handleRemoveReply = () => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(referencesActions.setIdReferenceMessageReply(''));
		dispatch(referencesActions.setDataReferences(null));
	};

	return (
		messageReplyState && (
			<div className="flex flex-row items-center justify-between w-full my-2 dark:bg-[#2B2D31] bg-bgLightMode p-2 rounded-md text-[14px]">
				<div className="dark:text-white text-black">
					Replying to <span className=" dark:text-[#84ADFF] text-[#3297ff] font-semibold">{nameShowed}</span>
				</div>
				<button className="relative" onClick={handleRemoveReply}>
					<Icons.CircleClose />
				</button>
			</div>
		)
	);
}

export default ReplyMessageBox;
