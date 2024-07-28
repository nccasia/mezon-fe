import { ChannelsEntity, generateWebhook, useAppDispatch } from '@mezon/store';
import { ApiWebhook, ApiWebhookCreateRequest } from 'mezon-js/api.gen';
import WebhookItemModal from './WebhookItemModal';

interface IWebhooksProps{
	allWebhooks?: ApiWebhook[] | undefined;
	parentChannelsInClan: ChannelsEntity[];
}

const Webhooks = ({allWebhooks, parentChannelsInClan} : IWebhooksProps) => {
	const dispatch = useAppDispatch();
	const webhookNames = ['Captain hook', 'Spidey bot', 'Komu Knight', 'Anh ThaiPQ', 'Chi Nga Tester'];

	const getRandomWebhookName = (): string => {
		const randomIndex = Math.floor(Math.random() * webhookNames.length);
		return webhookNames[randomIndex];
	};

	const handleAddWebhook = () => {
		const newWebhookReq: ApiWebhookCreateRequest = {
			channel_id: parentChannelsInClan[0].channel_id,
			webhook_name: getRandomWebhookName(),
		};
		dispatch(generateWebhook({ request: newWebhookReq, channelId: parentChannelsInClan[0].channel_id as string }));
	};
	

	return (
		<div className='pb-5'>
			<div className="dark:text-[#b5bac1] text-textLightTheme text-sm pt-5">
				Webhooks are a simple way to post messages from other apps and websites into Discord using internet magic.
				<b className="font-semibold text-[#00a8fc] hover:underline cursor-pointer"> Learn more</b> or try{' '}
				<b className="font-semibold text-[#00a8fc] hover:underline cursor-pointer">building one yourself.</b>
			</div>
			<div className="border-b-[1px] border-[#616161] my-[32px]"></div>
			<div onClick={handleAddWebhook} className="py-2 px-4 bg-[#5865f2] rounded-sm mb-[24px] w-fit text-[14px] font-semibold cursor-pointer">
				New Webhook
			</div>
			{allWebhooks &&
				allWebhooks.map((webhook) => (
					<WebhookItemModal
						parentChannelsInClan={parentChannelsInClan}
						webhookItem={webhook}
						key={webhook.id}
					/>
				))}
		</div>
	);
};

export default Webhooks;
