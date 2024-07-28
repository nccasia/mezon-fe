import { referencesActions, selectIsUseProfileDM } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../../../../../../ui/src/lib/Icons/index';
import { AvatarImage } from '../../AvatarImage/AvatarImage';
import MessageLine from '../MessageLine';
import { useMessageLine } from '../useMessageLine';
import { useMessageParser } from '../useMessageParser';
import useShowName from '../useShowName';
type MessageReplyProps = {
	message: IMessageWithUser;
};

// TODO: refactor component for message lines
const MessageReply: React.FC<MessageReplyProps> = ({ message }) => {
	const isUseProfileDM = useSelector(selectIsUseProfileDM);

	const {
		senderIdMessageRef,
		messageContentRef,
		messageUsernameSenderRef,
		messageAvatarSenderRef,
		messageClanNicknameSenderRef,
		messageDisplayNameSenderRef,
		messageIdRef,
		hasAttachmentInMessageRef,
	} = useMessageParser(message);

	const dispatch = useDispatch();

	const getIdMessageToJump = useCallback(
		(idRefMessage: string, e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
			e.stopPropagation();
			if (idRefMessage) {
				dispatch(referencesActions.setIdMessageToJump(idRefMessage));
				dispatch(referencesActions.setIdReferenceMessageReply(''));
			}
		},
		[dispatch],
	);

	const { mentions } = useMessageLine(messageContentRef.t);
	const markUpOnReplyParent = useRef<HTMLDivElement | null>(null);

	const [parentWidth, setParentWidth] = useState<number>();
	const getWidthParent = useMemo(() => {
		return markUpOnReplyParent.current?.getBoundingClientRect().width;
	}, [isUseProfileDM, window.innerWidth, markUpOnReplyParent]);

	useLayoutEffect(() => {
		setParentWidth(getWidthParent);
	}, [getWidthParent, isUseProfileDM]);

	const nameShowed = useShowName(
		messageClanNicknameSenderRef ?? '',
		messageDisplayNameSenderRef ?? '',
		messageUsernameSenderRef ?? '',
		senderIdMessageRef ?? '',
	);

	return (
		<div className="overflow-hidden " ref={markUpOnReplyParent}>
			<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
				<Icons.ReplyCorner />
				<div className="flex flex-row gap-1 mb-2 pr-12 items-center w-full">
					<div className="w-5 h-5">
						<AvatarImage className="w-5 h-5" alt="user avatar" userName={messageUsernameSenderRef} src={messageAvatarSenderRef} />
					</div>

					<div className="gap-1 flex flex-row items-center w-full">
						<span className=" text-[#84ADFF] font-bold hover:underline cursor-pointer tracking-wide">{nameShowed}</span>
						{hasAttachmentInMessageRef ? (
							<div className=" flex flex-row items-center">
								<div
									onClick={(e) => getIdMessageToJump(messageIdRef ?? '', e)}
									className="text-[14px] pr-1 mr-[-5px] dark:hover:text-white dark:text-[#A8BAB8] text-[#818388]  hover:text-[#060607] cursor-pointer italic   w-fit one-line break-all pt-0"
								>
									Click to see attachment
								</div>
								<Icons.ImageThumbnail />
							</div>
						) : (
							<MessageLine
								showOnchannelLayout={false}
								onClickToMessage={(e) => getIdMessageToJump(messageIdRef ?? '', e)}
								content={messageContentRef}
							/>
						)}
					</div>
				</div>
			</div>

			{!message.references && (
				<div className="rounded flex flex-row gap-1 items-center justify-start w-fit text-[14px] ml-5 mb-[-5px] mt-1 replyMessage">
					<Icons.ReplyCorner />
					<div className="flex flex-row gap-1 mb-2 pr-12 items-center">
						<div className="rounded-full dark:bg-bgSurface bg-bgLightModeButton size-4">
							<Icons.IconReplyMessDeleted />
						</div>
						<i className="dark:text-zinc-400 text-colorTextLightMode text-[13px]">Original message was deleted</i>
					</div>
				</div>
			)}
		</div>
	);
};

export default memo(MessageReply);
