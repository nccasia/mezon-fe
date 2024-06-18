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

export const listClickMessageText = [
	{ name: 'Add Reaction', symbol: <CopyImageIcon /> },
	{ name: 'View Reactions', symbol: <CopyImageIcon /> }, // owner 
	{ name: 'Edit Message', symbol: <CopyImageIcon /> },
	{ name: 'Pin Message', symbol: <SaveImageIcon /> },
	{ name: 'Reply', symbol: <SaveImageIcon /> },
	{ name: 'Create Thread', symbol: <SaveImageIcon /> },
	{ name: 'Copy Text', symbol: <CopyLinkIcon /> },
	{ name: 'Apps', symbol: <OpenLinkIcon /> },
	{ name: 'Mark Unread', symbol: <OpenLinkIcon /> },
	{ name: 'Copy Message Link', symbol: <OpenLinkIcon /> },
	{ name: 'Speak Message', symbol: <OpenLinkIcon /> },
	{ name: 'Remove Reaction', symbol: <OpenLinkIcon /> }, // owner clan
	{ name: 'Remove All Reaction', symbol: <OpenLinkIcon /> }, // owner clan
	{ name: 'Delete Message', symbol: <OpenLinkIcon /> }, // owner message
	{ name: 'Report Message', symbol: <OpenLinkIcon /> }, // guest
];
