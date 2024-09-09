import { Icons } from '@mezon/ui';
import { ITabs } from './tabSideBar';

export const appDetailTabs: ITabs[] = [
	{ name: 'General Information', routerLink: 'information', icon: <Icons.AdminHomeIcon /> },
	{ name: 'Installation', routerLink: 'installation', icon: <Icons.AdminSettingIcon /> },
	{ name: 'Flow', routerLink: 'flow', icon: <Icons.ToolIcon /> }
];
