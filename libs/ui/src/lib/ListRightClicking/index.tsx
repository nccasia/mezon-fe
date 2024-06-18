import { Icons } from '@mezon/components';

const CopyImageIcon = () => <Icons.CopyIcon />;
const SaveImageIcon = () => <Icons.CopyIcon />;
const CopyLinkIcon = () => <Icons.CopyIcon />;
const OpenLinkIcon = () => <Icons.CopyIcon />;

export const listClickImageInViewer = [
	{ name: 'Copy Image', symbol: <CopyImageIcon /> },
	{ name: 'Save Image', symbol: <SaveImageIcon /> },
	{ name: 'Copy Link', symbol: <CopyLinkIcon /> },
	{ name: 'Open Link', symbol: <OpenLinkIcon /> },
];

export const listClickMessageText = [
	{ name: 'Add Reaction', symbol: <CopyImageIcon /> },
	{ name: 'Edit Message', symbol: <CopyImageIcon /> },
	{ name: 'Pin Message', symbol: <SaveImageIcon /> },
	{ name: 'Reply', symbol: <SaveImageIcon /> },
	{ name: 'Create Thread', symbol: <SaveImageIcon /> },
	{ name: 'Copy Text', symbol: <CopyLinkIcon /> },
	{ name: 'Apps', symbol: <OpenLinkIcon /> },
	{ name: 'Mark Unread', symbol: <OpenLinkIcon /> },
	{ name: 'Copy Message Link', symbol: <OpenLinkIcon /> },
	{ name: 'Speak Message', symbol: <OpenLinkIcon /> },
	{ name: 'Remove Reaction', symbol: <OpenLinkIcon /> },
	{ name: 'Remove All Reaction', symbol: <OpenLinkIcon /> },
	{ name: 'Delete Message', symbol: <OpenLinkIcon /> },
	{ name: 'Report Message', symbol: <OpenLinkIcon /> },
];
