import { Icons } from '@mezon/components';
import { selectCurrentChannelId, selectDmGroupCurrentId, selectTypingUserIdsByChannelId } from '@mezon/store';
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
	const typingListMemberDMIds = useSelector(selectTypingUserIdsByChannelId(currentDMChannelID || ''));
	const typingListMemberChannelIds = useSelector(selectTypingUserIdsByChannelId(currentChannelID || ''));
	const typingListDMIds = useSelector(selectTypingUserIdsByChannelId(directMessageValue?.dmID || ''));
	const checkDmGroup = Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP;

	const checkTypingUser = useMemo(() => {
		switch (true) {
			case isMemberDMGroup:
				return typingListMemberDMIds?.includes(userId);
			case isMemberChannel:
				return typingListMemberChannelIds?.includes(userId);

			case isListDm:
				return typingListDMIds?.some((id) => directMessageValue?.userId?.includes(id));

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
		<span
			className={`absolute bottom-[0px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode ${checkTypingUser ? 'rounded-lg -right-3' : 'rounded-full right-[-4px]'}`}
		>
			{isTyping && checkTypingUser ? (
				<Icons.IconLoadingTyping bgFill="bg-colorSuccess" />
			) : (
				!checkDmGroup && (status ? <Icons.OnlineStatus defaultSize={sizeStatusIcon} /> : <OfflineStatus defaultSize={sizeStatusIcon} />)
			)}
		</span>
	);
});

export default StatusUser;
