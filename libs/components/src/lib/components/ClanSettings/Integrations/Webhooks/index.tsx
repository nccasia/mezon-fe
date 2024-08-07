import { useAuth, useClanOwner } from '@mezon/core';
import { generateWebhook, selectCurrentChannel, useAppDispatch } from '@mezon/store';
import { Image } from '@mezon/ui';
import { ApiWebhook, ApiWebhookCreateRequest } from 'mezon-js/api.gen';
import { useSelector } from 'react-redux';
import WebhookItemModal from './WebhookItemModal';
import { IChannel } from '@mezon/utils';

interface IWebhooksProps {
	allWebhooks?: ApiWebhook[] | undefined;
	currentChannel?: IChannel;
}

const Webhooks = ({ allWebhooks, currentChannel }: IWebhooksProps) => {
	const dispatch = useAppDispatch();
	const webhookNames = ['Captain hook', 'Spidey bot', 'Komu Knight'];
	const getRandomWebhookName = (): string => {
		const randomIndex = Math.floor(Math.random() * webhookNames.length);
		return webhookNames[randomIndex];
	};

	const webHookAvatars = [
		'https://cdn.mezon.vn/1787707828677382144/1790996992529272832/red_webhook.png',
		'https://cdn.mezon.vn/1787707828677382144/1790996992529272832/green_webhook.png',
		'https://cdn.mezon.vn/1787707828677382144/1790996992529272832/yellow_webhook.png',
		'https://cdn.mezon.vn/1787707828677382144/1790996992529272832/blue_webhook.png',
	];

	const getRandomAvatar = (): string => {
		const randomIndex = Math.floor(Math.random() * webHookAvatars.length);
		return webHookAvatars[randomIndex];
	};

	const handleAddWebhook = () => {
		const newWebhookReq: ApiWebhookCreateRequest = {
			channel_id: currentChannel?.channel_id as string,
			webhook_name: getRandomWebhookName(),
			avatar: getRandomAvatar(),
		};
		dispatch(generateWebhook({ request: newWebhookReq, channelId: currentChannel?.channel_id as string }));
	};

	return (
		<div className="pb-5">
			<div className="dark:text-[#b5bac1] text-textLightTheme text-sm pt-5">
				Webhooks are a simple way to post messages from other apps and websites into Discord using internet magic.
				<b className="font-semibold text-[#00a8fc] hover:underline cursor-pointer"> Learn more</b> or try{' '}
				<b className="font-semibold text-[#00a8fc] hover:underline cursor-pointer">building one yourself.</b>
			</div>
			<div className="border-b-[1px] dark:border-[#616161] my-[32px]" />
			{allWebhooks?.length !== 0 ? (
				<>
					<div
						onClick={handleAddWebhook}
						className="py-2 px-4 bg-[#5865f2] rounded-sm mb-[24px] w-fit text-[14px] font-semibold cursor-pointer"
					>
						New Webhook
					</div>
					{allWebhooks &&
						allWebhooks.map((webhook) => (
							<WebhookItemModal webhookItem={webhook} key={webhook.id} />
						))}
				</>
			) : (
				<div className='flex items-center flex-col gap-4'>
					<Image
						src={`assets/images/empty-webhook.svg`}
						alt={'logoMezon'}
						width={48}
						height={48}
						className="clan object-cover w-[272px]"
					/>
					<div className='font-medium dark:text-[#b5bac1] text-textLightTheme'>You have no webhooks!</div>
					<div
						onClick={handleAddWebhook}
						className="py-2 px-4 bg-[#5865f2] rounded-sm mb-[24px] w-fit text-[14px] font-semibold cursor-pointer"
					>
						New Webhook
					</div>
				</div>
			)}
		</div>
	);
};

export default Webhooks;
