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
	APP_DIRECTORY: 'app-directory',
};

export const listItemSetting: ItemObjProps[] = [
	{ id: ItemSetting.OVERVIEW, name: 'Overview' },
	{ id: ItemSetting.ROLES, name: 'Roles' },
	{ id: ItemSetting.EMOJI, name: 'Emoji' },
	{ id: ItemSetting.STICKERS, name: 'Stickers' },
	{ id: ItemSetting.NOTIFICATION_SOUND, name: 'Notification Sound' },
];

export const listItemSettingApp: ItemObjProps[] = [
	{ id: ItemSetting.INTEGRATIONS, name: 'Integrations' },
	{ id: ItemSetting.APP_DIRECTORY, name: 'App Directory' },
];

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

export const listItemSettingClanPermission: ItemObjProps[] = [
	{ id: ItemSetting.OVERVIEW, name: 'Overview' },
	{ id: ItemSetting.EMOJI, name: 'Emoji' },
	{ id: ItemSetting.STICKERS, name: 'Stickers' },
	{ id: ItemSetting.NOTIFICATION_SOUND, name: 'Notification Sound' },
];

export const sideBarListItemClanPermission: ListSideBarProps[] = [
	{
		title: '',
		listItem: listItemSettingClanPermission,
	},
	{
		title: 'Apps',
		listItem: listItemSettingApp,
	},
];

export const categorySettingItem = {
	OVERVIEW: 'overview',
	PERMISSIONS: 'permissions',
};

export const categorySettingList = [
	{ id: categorySettingItem.OVERVIEW, name: 'Overview' },
	{ id: categorySettingItem.PERMISSIONS, name: 'Permissions' },
];
