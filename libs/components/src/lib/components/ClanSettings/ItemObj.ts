export type ItemObjProps = {
	id: string;
	name: string;
};

export type ListSideBarProps = {
	title: string;
	listItem: ItemObjProps[];
};

export const ItemSetting = {
	OVERVIEW: 'overview',
	ROLES: 'roles',
	EMOJI: 'emoji',
	STICKERS: 'Stickers',
	DELETE_SERVER: 'delete_server',
	INTEGRATIONS: 'integrations',
	NOTIFICATION_SOUND: 'notification-sound',
};

export const listItemSetting: ItemObjProps[] = [
	{ id: ItemSetting.OVERVIEW, name: 'Overview' },
	{ id: ItemSetting.ROLES, name: 'Roles' },
	{ id: ItemSetting.EMOJI, name: 'Emoji' },
	{ id: ItemSetting.STICKERS, name: 'Stickers' },
	{ id: ItemSetting.NOTIFICATION_SOUND, name: 'Notification Sound' },
];
export const listItemSettingApp: ItemObjProps[] = [{ id: ItemSetting.INTEGRATIONS, name: 'Integrations' }];

export const sideBarListItem: ListSideBarProps[] = [
	{
		title: '',
		listItem: listItemSetting,
	},
	{
		title: 'Apps',
		listItem: listItemSettingApp,
	},
];
