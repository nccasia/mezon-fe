import { IChannel } from '@mezon/utils';
import { useState } from 'react';
import IntegrationsChannel from './Component/IntegrationsChannel';
import InvitesChannel from './Component/InvitesChannel';
import OverviewChannel from './Component/OverviewChannel';
import PermissionsChannel from './Component/PermissionsChannel';
import ChannelSettingItem from './channelSettingItem';
import ExitSetting from './exitSetting';

export type ModalSettingProps = {
	open: boolean;
	onClose: () => void;
	channel: IChannel;
};

const SettingChannel = (props: ModalSettingProps) => {
	const { open, onClose, channel } = props;
	const [currentSetting, setCurrentSetting] = useState<string>('Overview');

	const handleSettingItemClick = (settingName: string) => {
		setCurrentSetting(settingName);
	};

	return (
		<div>
			{open ? (
				<div className="  flex fixed inset-0  w-screen z-10">
					<div className="flex text-gray- w-screen relative">
						<ChannelSettingItem onItemClick={handleSettingItemClick} channel={channel} onCloseModal={onClose}/>
						{currentSetting === 'Overview' && <OverviewChannel channel={channel} />}
						{currentSetting === 'Permissions' && <PermissionsChannel channel={channel} />}
						{currentSetting === 'Invites' && <InvitesChannel />}
						{currentSetting === 'Integrations' && <IntegrationsChannel />}
						<ExitSetting onClose={onClose} />
					</div>
				</div>
			) : null}
		</div>
	);
};

export default SettingChannel;
