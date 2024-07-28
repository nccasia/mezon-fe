import { Icons } from 'libs/components/src/lib/components';
import { ApiWebhook } from 'mezon-js/api.gen';

interface IIntegrationProps {
	setIsOpenWebhooks(): void;
	allWebhooks?: ApiWebhook[] | undefined;
}

const MainIntegrations = ({ setIsOpenWebhooks, allWebhooks }: IIntegrationProps) => {
	return (
		<>
			<div className="dark:text-[#b5bac1] text-textLightTheme text-sm pt-5">
				Customize your server with integrations. Manage webhooks, followed channels and apps, as well as Twitch and YouTube settings for
				creators. <b className="font-semibold text-[#00a8fc] hover:underline cursor-pointer">Learn more about managing integrations.</b>
			</div>
			<div className="border-b-[1px] border-[#616161] my-[32px]"></div>
			<div
				onClick={() => {
					if (allWebhooks && allWebhooks?.length !== 0) {
						setIsOpenWebhooks();
					}
				}}
				className={`dark:text-[#b5bac1] text-textLightTheme py-[20px] px-[16px] flex justify-between items-center border dark:border-black border-[#d1d4d9] rounded-md dark:bg-[#2b2d31] bg-bgLightSecondary ${allWebhooks?.length !== 0 ? 'cursor-pointer' : ''}`}
			>
				<div className="flex gap-3 items-center">
					<div className="rounded-full p-4 dark:bg-[#111214]">
						<Icons.WebhooksIcon className="text-[#4e5058] dark:text-[#b5bac1]" />
					</div>
					<div>
						<div className="pb-[3px] font-semibold">Webhooks</div>
						<div className="text-[12px]">
							{allWebhooks && allWebhooks?.length > 1 ? allWebhooks?.length + ' webhooks' : allWebhooks?.length + ' webhook'}
						</div>
					</div>
				</div>
				{allWebhooks && allWebhooks?.length === 0 ? (
					<div
						onClick={setIsOpenWebhooks}
						className="bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md py-2 px-3 cursor-pointer font-semibold"
					>
						Create Webhook
					</div>
				) : (
					<div className="items-center cursor-pointer text-[#4e5058] dark:text-[#b5bac1] text-[14px] flex gap-[4px]">
						<div>View Webhook</div>
						<Icons.ArrowDown defaultSize="h-[15px] w-[15px] dark:text-[#b5bac1] text-black -rotate-90" />
					</div>
				)}
			</div>
		</>
	);
};

export default MainIntegrations;
