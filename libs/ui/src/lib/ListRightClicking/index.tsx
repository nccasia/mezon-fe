import { Icons } from '@mezon/components';

const CopyImageIcon = () => <Icons.CopyIcon />;
const SaveImageIcon = () => <Icons.CopyIcon />;
const CopyLinkIcon = () => <Icons.CopyIcon />;
const OpenLinkIcon = () => <Icons.CopyIcon />;

export const listClickImageInViewer = [
	{ name: 'Copy Image', symbol: <></> },
	{ name: 'Save Image', symbol: <></> },
	{ name: 'Copy Link', symbol: <></> },
	{ name: 'Open Link', symbol: <></> },
];

export const listClickMessageTextDefault = [
	{ id: 0, name: 'Add Reaction', symbol: <CopyImageIcon /> },
	{ id: 1, name: 'View Reactions', symbol: <CopyImageIcon /> },
	{ id: 3, name: 'Pin Message', symbol: <SaveImageIcon /> },
	{ id: 4, name: 'Reply', symbol: <SaveImageIcon /> },
	{ id: 5, name: 'Create Thread', symbol: <SaveImageIcon /> },
	{ id: 6, name: 'Copy Text', symbol: <CopyLinkIcon /> },
	{ id: 7, name: 'Apps', symbol: <OpenLinkIcon /> },
	{ id: 8, name: 'Mark Unread', symbol: <OpenLinkIcon /> },
	{ id: 9, name: 'Copy Message Link', symbol: <OpenLinkIcon /> },
	{ id: 10, name: 'Speak Message', symbol: <OpenLinkIcon /> },
];

export const listClickMessageTextOwnerMessage = [
	{ id: 2, name: 'Edit Message', symbol: <CopyImageIcon /> }, // owner message
	{ id: 13, name: 'Delete Message', symbol: <OpenLinkIcon /> }, // owner message
];

export const listClickMessageTextOwnerClan = [
	{ id: 11, name: 'Remove Reaction', symbol: <OpenLinkIcon /> }, // owner clan
	{ id: 12, name: 'Remove All Reaction', symbol: <OpenLinkIcon /> }, // owner clan
];

export const listClickMessageTextGuest = [{ id: 14, name: 'Report Message', symbol: <OpenLinkIcon /> }];
