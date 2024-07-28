import { useEffect, useState } from 'react';
import { Icons } from '../../../components';
import MainIntegrations from './MainIntegrations';
import Webhooks from './Webhooks';
import { ChannelsEntity, fetchWebhooksByChannelId, selectAllChannels, selectAllWebhooks, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
import { ChannelIsNotThread } from '@mezon/utils';

const Integrations = () => {
	const dispatch = useAppDispatch();
	const [isOpenWebhooks, setIsOpenWebhooks] = useState(false);
	const allWebhooks = useSelector(selectAllWebhooks);
	const allChannel = useSelector(selectAllChannels);
	const [parentChannelsInClan, setParentChannelsInClan] = useState<ChannelsEntity[]>([]);

	useEffect(() => {
		const normalChannels = allChannel.filter((channel) => channel.parrent_id === ChannelIsNotThread.TRUE);
		setParentChannelsInClan(normalChannels);
	}, [allChannel]);

	useEffect(() => {
		if (parentChannelsInClan[0]) {
			dispatch(fetchWebhooksByChannelId({ channelId: parentChannelsInClan[0].channel_id as string }));
		}
	}, [parentChannelsInClan]);

	return (
		<div className="sbm:mt-[60px] mt-[10px]">
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

			{isOpenWebhooks ? <Webhooks allWebhooks={allWebhooks} parentChannelsInClan={parentChannelsInClan}/> : <MainIntegrations allWebhooks={allWebhooks} setIsOpenWebhooks={() => setIsOpenWebhooks(true)} />}
		</div>
	);
};

export default Integrations;
