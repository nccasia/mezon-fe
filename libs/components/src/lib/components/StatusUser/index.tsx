import { Icons } from '@mezon/components';
import { selectCurrentChannelId, selectDmGroupCurrentId, selectTypingUserIdsByChannelId, useAppSelector } from '@mezon/store';
import { OfflineStatus } from 'libs/ui/src/lib/Icons';
import { ChannelType } from 'mezon-js';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { directMessageValueProps } from '../DmList/DMListItem';

type StatusUserProps = {
	status?: boolean;
	isMemberDMGroup: boolean;
	isMemberChannel: boolean;
	isListDm: boolean;
	directMessageValue?: directMessageValueProps;
	userId?: string;
	isTyping?: boolean;
	sizeStatusIcon?: string;
};

const StatusUser = memo((props: StatusUserProps) => {
	const { status, isMemberChannel, isMemberDMGroup, isListDm, directMessageValue, userId = '', isTyping = true, sizeStatusIcon } = props;
	const currentDMChannelID = useSelector(selectDmGroupCurrentId);
	const currentChannelID = useSelector(selectCurrentChannelId);
	const typingListMemberDMIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, currentDMChannelID || ''));
	const typingListMemberChannelIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, currentChannelID || ''));
	const typingListDMIds = useAppSelector((state) => selectTypingUserIdsByChannelId(state, directMessageValue?.dmID || ''));
	const checkDmGroup = Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP;

	const checkTypingUser = useMemo(() => {
		switch (true) {
			case isMemberDMGroup:
				return typingListMemberDMIds?.some((item) => item.id === userId);
			case isMemberChannel:
				return typingListMemberChannelIds?.some((item) => item.id === userId);

			case isListDm:
				return typingListDMIds?.some((item) => directMessageValue?.userId?.includes(item.id));

			default:
				return false;
		}
	}, [
		isMemberDMGroup,
		typingListMemberDMIds,
		userId,
		isMemberChannel,
		typingListMemberChannelIds,
		isListDm,
		typingListDMIds,
		directMessageValue?.userId
	]);

	return (
		<>
			{checkDmGroup ? (
				<>
					{isTyping && checkTypingUser && (
						<span
							className={`absolute bottom-[0px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode ${checkTypingUser ? 'rounded-lg -right-3' : 'rounded-full right-[-4px]'}`}
						>
							<Icons.IconLoadingTyping bgFill="bg-colorSuccess" />
						</span>
					)}
				</>
			) : (
				<span
					className={`absolute bottom-[0px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode ${checkTypingUser ? 'rounded-lg -right-3' : 'rounded-full right-[-4px]'}`}
				>
					{isTyping && checkTypingUser ? (
						<Icons.IconLoadingTyping bgFill="bg-colorSuccess" />
					) : status ? (
						<Icons.OnlineStatus defaultSize={sizeStatusIcon} />
					) : (
						<OfflineStatus defaultSize={sizeStatusIcon} />
					)}
				</span>
			)}
		</>
	);
});

export default StatusUser;
