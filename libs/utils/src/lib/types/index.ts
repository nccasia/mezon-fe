import { ChannelMessage, ChannelType } from '@mezon/mezon-js';
import {
	ApiAccount,
	ApiCategoryDesc,
	ApiClanDesc,
	ApiClanProfile,
	ApiPermission,
	ApiRole,
	ApiUser,
	ChannelUserListChannelUser,
	ClanUserListClanUser,
	RoleUserListRoleUser,
} from '@mezon/mezon-js/dist/api.gen';

import { ApiChannelDescription, ApiInviteUserRes } from '@mezon/mezon-js/api.gen';

export * from './permissions';

export type LoadingStatus = 'not loaded' | 'loading' | 'loaded' | 'error';

export type IClan = ApiClanDesc & {
	id: string;
};

export type IInvite = ApiInviteUserRes & {
	id: string;
};

export type IClanProfile = ApiClanProfile & {
	id: string;
};
export type ICategory = ApiCategoryDesc & {
	id: string;
};

export type IPermissionUser = ApiPermission & {
	id: string;
};

export type IUsersClan = ClanUserListClanUser & {
	id: string;
};

export type IRolesClan = ApiRole & {
	id: string;
};

export type IUsersRole = RoleUserListRoleUser & {
	id: string;
};

export type ICategoryChannel = ICategory & {
	channels: IChannel[];
};

export type IRole = {
	role_id: string;
};

export type IRoleUsers = IRole & {
	users: ApiUser[];
};

export type IChannel = ApiChannelDescription & {
	id: string;
	unread?: boolean;
	description?: string;
};

export type IChannelMember = ChannelUserListChannelUser & {
	id: string;
	channelId?: string;
};

export type IThread = {
	name: string | undefined;
	id: string | undefined;
	clanId: string | undefined;
	channelId: string | undefined;
	content: string | undefined;
	date: string | undefined;
};

export type IContextMenuItemAction = 'REST';

export type IContextMenuItemMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type IContextMenuItemPayload = {
	// any
};

export type IContextMenuItemCallback = {
	// any
};

export type IContextMenuItem = {
	label: string;
	icon?: string;
	action: IContextMenuItemAction;
	method: IContextMenuItemMethod;
	payload: IContextMenuItemPayload;
};

export type IMessageContextMenu = {
	items: IContextMenuItem[];
};

export type IMessageMeta = {
	contextMenu: IMessageContextMenu;
};

export type IMessage = ChannelMessage & {
	id: string;
	content: {
		t?: string | undefined;
	};
	date?: string | undefined;
	creationTime?: Date;
	creationTimeMs?: number;
	lastSeen?: boolean;
};

export type IMessageWithUser = IMessage & {
	user: IUser | null;
};

export type IMessageSendPayload = {
	t: string;
};

export type IUser = {
	name: string;
	username: string;
	id: string;
	avatarSm: string;
};

export type IVoice = {
	clan_id: string;
	clan_name: string;
	participant: string;
	voice_channel_id: string;
	voice_channel_label: string;
	last_screenshot: string;
};

export interface CategoryNameProps {
	ChannelType: string | undefined;
	channelStatus: string | undefined;
	name: string | undefined;
}

export interface ThreadNameProps {
	name: string | undefined;
}

export interface IconProps {
	url: string;
}

export type ChannelListProps = { className?: string };

export enum ChannelStatus {
	OPEN = 'open',
	CLOSE = 'close',
}

export enum channelStatusEnum {
	LOCK = 'lock',
	UNLOCK = 'unlock',
}

export interface CategoryProps {
	name: string | undefined;
	status?: string | undefined;
	type?: string | undefined;
}

export interface ThreadProps {
	name: string;
}

export type IUserAccount = ApiAccount;

export type IPermission = ApiPermission;

export enum ChannelStatusEnum {
	isPrivate = 1,
}

export interface ChannelProps {
	name?: string;
	isPrivate?: ChannelStatusEnum;
	categories?: Record<string, CategoryProps>;
	type?: ChannelType;
}

export interface CategoryProps {
	name: string | undefined;
	status?: string | undefined;
	type?: string | undefined;
}

export interface ThreadProps {
	name: string;
}

export interface IWithError {
	error: string | Error;
}

export enum EmojiPlaces {
	EMOJI_REACTION = 'EMOJI_REACTION',
	EMOJI_REACTION_BOTTOM = 'EMOJI_REACTION_BOTTOM',
	EMOJI_EDITOR = 'EMOJI_EDITOR',
}

export interface UnreadChannel {
	channelId: string;
	channelLastMessageId: string;
	channelLastSeenMesageId: string;
}

export enum TabNamePopup {
	NONE = 'NONE',
	GIFS = 'GIFS',
	STICKERS = 'STICKER',
	EMOJI = 'EMOJI',
}
