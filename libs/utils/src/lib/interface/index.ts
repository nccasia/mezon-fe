export interface CategoryNameProps {
  roomType: string | undefined;
  statusRoom: string | undefined;
  name: string | undefined;
}

export interface ThreadNameProps {
  name: string;
}
export interface SearchMessageProps {
  url: string;
}

export interface IconProps {
  url: string;
}

export type ChannelListProps = { className?: string };

export enum ChannelStatus {
  OPEN = 'open',
  CLOSE = 'close',
}

export enum RoomStatus {
  LOCK = 'lock',
  UNLOCK = 'unlock',
}

export enum RoomType {
  CHAT = 'chat',
  VOICE = 'voice',
}

export interface ChannelProps {
  name: string;
  status?: string;
  categories?: Record<string, CategoryProps>;
}

export interface CategoryProps {
  name: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
}

export interface ThreadProps {
  name: string;
}
