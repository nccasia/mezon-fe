import {
  ApiCategoryDesc,
  ApiChannelDescription,
  ChannelUserListChannelUser,
  ApiClanDesc,
  ApiUser,
  ApiAccount,
} from "@mezon/mezon-js/dist/api.gen";
import { ChannelMessage } from "@mezon/mezon-js";

export type LoadingStatus = "not loaded" | "loading" | "loaded" | "error";

export type IClan = ApiClanDesc & {
  id: string;
};
export type ICategory = ApiCategoryDesc & {
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
};

export type IThread = {
  name: string | undefined;
  id: string | undefined;
  clanId: string | undefined;
  channelId: string | undefined;
  content: string | undefined;
  date: string | undefined;
};

export type IContextMenuItemAction = "REST";

export type IContextMenuItemMethod = "GET" | "POST" | "PUT" | "DELETE";

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
  body: {
    text: string;
  };
  content?: {
    content?: string | undefined;
  };
  date?: string | undefined;
  creationTime?: Date;
  creationTimeMs?: number;
};

export type IMessageWithUser = IMessage & {
  user: IUser | null;
};

export type IUser = {
  name: string;
  username: string;
  id: string;
  avatarSm: string;
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
  OPEN = "open",
  CLOSE = "close",
}

export enum channelStatusEnum {
  LOCK = "lock",
  UNLOCK = "unlock",
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

export enum ChannelStatusEnum {
  LOCK = "lock",
  UNLOCK = "unlock",
}

export enum ChannelTypeEnum {
  CHANNEL_TEXT = 1,
  CHANNEL_VOICE = 4,
  FORUM = 2,
  ANNOUNCEMENT = 3,
}

export interface ChannelProps {
  name?: string;
  status?: ChannelStatusEnum;
  categories?: Record<string, CategoryProps>;
  type: ChannelTypeEnum;
}

export interface CategoryProps {
  name: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
}

export interface ThreadProps {
  name: string;
}

export enum DmCategoryExam {
  CLAN_DM = "093b8667-1ce3-4982-9140-790dfebcf3c9", //clan desc4
  CATEGORY_DM = "c2ac7ce4-2bd4-4bc8-9129-bd09a46bcd97", //  cate4
  CHANNEL_TEST = "f753b16b-aff6-429c-b4f5-4551ee8edc1c",
  // USER_ID = "a206e3ec-efe6-409c-a195-e133a76b445c",
  USER_ID2 = "4f0ab1da-d153-4965-841d-b8d0123b645d", //user11
}
