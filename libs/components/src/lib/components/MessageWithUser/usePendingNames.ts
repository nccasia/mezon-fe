import { IMessageWithUser } from '@mezon/utils';
import { useMemo } from 'react';

const usePendingNames = (
	message: IMessageWithUser,
	clanNickFromMemList?: string,
	displayNameFromMemList?: string,
	usernameFromMemList?: string,
	userClanNicknameFromMessage?: string,
	userDisplayNameFromMessage?: string,
	usernameFromMessage?: string,
	avatarFromMemberList?: string,
	avatarFromMessage?: string,
	clanAvatarFromMemList?: string,
	clanAvatarFormMessage?: string,
) => {
	const getPendingName = (isMe: boolean | undefined, messageUsername: string | undefined, nameFromMemList: string, nameFromMessage: string) => {
		return useMemo(() => {
			if (isMe && !messageUsername) {
				return nameFromMemList;
			} else {
				return nameFromMessage;
			}
		}, [isMe, messageUsername, nameFromMemList, nameFromMessage]);
	};

	const pendingClannick = getPendingName(message.isMe, message.username, clanNickFromMemList ?? '', userClanNicknameFromMessage ?? '');
	const pendingDisplayName = getPendingName(message.isMe, message.username, displayNameFromMemList ?? '', userDisplayNameFromMessage ?? '');
	const pendingUserName = getPendingName(message.isMe, message.username, usernameFromMemList ?? '', usernameFromMessage ?? '');
	const pendingUserAvatar = getPendingName(message.isMe, message.username, avatarFromMemberList ?? '', avatarFromMessage ?? '');
	const pendingClanAvatar = getPendingName(message.isMe, message.username, clanAvatarFromMemList ?? '', clanAvatarFormMessage ?? '');

	return {
		pendingClannick,
		pendingDisplayName,
		pendingUserName,
		pendingUserAvatar,
		pendingClanAvatar,
	};
};

export default usePendingNames;
