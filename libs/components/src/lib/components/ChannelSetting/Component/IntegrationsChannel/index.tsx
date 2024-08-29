import { IChannel } from '@mezon/utils';
import Integrations from '../../../ClanSettings/Integrations';

interface IIntegrationsChannelProps {
	currentChannel?: IChannel;
}

const IntegrationsChannel = ({ currentChannel }: IIntegrationsChannelProps) => {
	return (
		<div className="dark:bg-bgPrimary bg-bgLightModeSecond max-sm:px-0 px-[40px]  w-1/2 min-w-full sbm:min-w-[700px] 2xl:min-w-[900px] max-w-[740px]  overflow-y-auto hide-scrollbar">
			<Integrations currentChannel={currentChannel} />
		</div>
	);
};

export default IntegrationsChannel;
