import { selectAllWebhooks } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icons } from '../../../components';
import MainIntegrations from './MainIntegrations';
import Webhooks from './Webhooks';

interface IIntegrationsProps {
	currentChannel?: IChannel;
}

const Integrations = ({ currentChannel }: IIntegrationsProps) => {
	const [isOpenWebhooks, setIsOpenWebhooks] = useState(false);
	const allWebhooks = useSelector(selectAllWebhooks);
	return (
		<div className="max-sm:px-[30px] mt-[60px]">
			<h2 className="text-xl font-semibold mb-5 dark:text-textDarkTheme text-textLightTheme flex">
				<div
					onClick={() => setIsOpenWebhooks(false)}
					className={`${isOpenWebhooks ? 'text-[#b5bac1] hover:dark:text-textDarkTheme hover:text-textLightTheme cursor-pointer' : ''}`}
				>
					Integrations
				</div>{' '}
				{isOpenWebhooks ? (
					<div className="flex">
						<Icons.ArrowDown defaultSize="-rotate-90 w-[20px]" />
						Webhooks
					</div>
				) : (
					''
				)}
			</h2>

			{isOpenWebhooks ? (
				<Webhooks allWebhooks={allWebhooks} currentChannel={currentChannel} />
			) : (
				<MainIntegrations allWebhooks={allWebhooks} setIsOpenWebhooks={() => setIsOpenWebhooks(true)} />
			)}
		</div>
	);
};

export default Integrations;
