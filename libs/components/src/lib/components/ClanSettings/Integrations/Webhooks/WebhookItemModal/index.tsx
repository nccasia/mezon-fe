import { ChannelsEntity, deleteWebhookById, selectChannelById, selectMemberById, selectTheme, useAppDispatch } from '@mezon/store';
import { Icons } from 'libs/components/src/lib/components';
import { ApiWebhook } from 'mezon-js/api.gen';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface IWebhookItemModalProps {
	webhookItem: ApiWebhook;
	parentChannelsInClan: ChannelsEntity[];
}

const convertDate = (isoDateString: string): string => {
	const date = new Date(isoDateString);
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	};
	return date.toLocaleDateString('en-GB', options);
};

const WebhookItemModal = ({ parentChannelsInClan, webhookItem }: IWebhookItemModalProps) => {
	const [isExpand, setIsExpand] = useState(false);
	const webhookOwner = useSelector(selectMemberById(webhookItem.creator_id as string));
	return (
		<div className="dark:bg-[#2b2d31] bg-bgLightMode p-[20px] border dark:border-black rounded-md mb-[20px]">
			<div className="flex gap-[20px] items-center mb-[12px]">
				<img
					src="https://dl.memuplay.com/new_market/img/com.discord.icon.2024-01-05-03-09-38.png"
					alt=""
					className="aspect-square w-[50px] rounded-full"
				/>
				<div className="flex w-full justify-between items-center dark:text-textDarkTheme text-textLightTheme">
					<div className="">
						<div>{webhookItem.webhook_name}</div>
						<div className="flex gap-1 items-center">
							<Icons.ClockIcon className="dark:text-[#b5bac1] text-textLightTheme" />
							<div className="dark:text-[#b5bac1] text-textLightTheme text-[13px]">
								Created on {convertDate(webhookItem.create_time || '')} by {webhookOwner?.user?.username}
							</div>
						</div>
					</div>
					<div
						onClick={() => setIsExpand(!isExpand)}
						className={`cursor-pointer transition duration-100 ease-in-out ${isExpand ? '' : '-rotate-90'}`}
					>
						<Icons.ArrowDown defaultSize="h-[30px] w-[30px] dark:text-[#b5bac1] text-black" />
					</div>
				</div>
			</div>
			{isExpand && <ExpendedWebhookModal parentChannelsInClan={parentChannelsInClan} webhookItem={webhookItem} />}
		</div>
	);
};

interface IExpendedWebhookModal {
	webhookItem: ApiWebhook;
	parentChannelsInClan: ChannelsEntity[];
}

const ExpendedWebhookModal = ({ webhookItem, parentChannelsInClan }: IExpendedWebhookModal) => {
	const dispatch = useAppDispatch();
	const handleCopyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
	};

	const handleDeleteWebhook = (webhook: ApiWebhook) => {
		dispatch(deleteWebhookById(webhook));
	};

	return (
		<div className="pt-[20px] border-t dark:border-[#3b3d44]">
			<div className="flex">
				<div className="w-3/12 dark:text-[#b5bac1] text-textLightTheme">
					<img
						src="https://dl.memuplay.com/new_market/img/com.discord.icon.2024-01-05-03-09-38.png"
						alt=""
						className="aspect-square w-[100px] rounded-full hover:grayscale-[50%]"
					/>
					<div className="text-[10px] mt-[10px]">
						Minimum Size: <b>128x128</b>
					</div>
				</div>
				<div className="w-9/12">
					<div className="flex gap-6 w-full">
						<div className="w-1/2">
							<div className="dark:text-[#b5bac1] text-textLightTheme text-[12px] mb-[10px]">
								<b>NAME</b>
							</div>
							<input
								type="text"
								defaultValue={webhookItem.webhook_name}
								className="w-full dark:text-[#b5bac1] text-textLightTheme dark:bg-[#1e1f22] bg-bgLightModeThird p-[10px] rounded-sm outline-none"
							/>
						</div>
						<div className="w-1/2">
							<div className="dark:text-[#b5bac1] text-textLightTheme text-[12px] mb-[10px]">
								<b>CHANNEL</b>
							</div>
							<WebhookItemChannelDropdown parentChannelsInClan={parentChannelsInClan} webhookItem={webhookItem} />
						</div>
					</div>
					<div className="border-t dark:border-[#3b3d44] my-[24px]"></div>
					<div className="flex items-center gap-[20px]">
						<div
							onClick={() => handleCopyUrl(webhookItem.url as string)}
							className="px-4 py-2 dark:bg-[#4e5058] bg-[#808084] dark:hover:bg-[#808084] hover:bg-[#4e5058] rounded-sm cursor-pointer"
						>
							Copy Webhook URL
						</div>
						<div onClick={() => handleDeleteWebhook(webhookItem || '')} className="text-red-400 hover:underline cursor-pointer">
							Delete Webhook
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

interface IWebhookItemChannelDropdown {
	parentChannelsInClan: ChannelsEntity[];
	webhookItem: ApiWebhook;
}

const WebhookItemChannelDropdown = ({ webhookItem, parentChannelsInClan }: IWebhookItemChannelDropdown) => {
	const webhookChannel = useSelector(selectChannelById(webhookItem.channel_id as string));
	const appearanceTheme = useSelector(selectTheme);
	const [isOpenDropdown, setIsOpenDropdown] = useState(false);
	const toggleDropdown = () => {
		setIsOpenDropdown(!isOpenDropdown);
	};
	const [dropdownValue, setDropdownValue] = useState(webhookChannel.channel_label);
	return (
		<div className="relative">
			<button
				id="dropdownDefaultButton"
				onClick={toggleDropdown}
				className="w-full p-[10px] cursor-pointer justify-between dark:text-[#b5bac1] text-textLightTheme dark:bg-[#1e1f22] bg-bgLightModeThird rounded-sm outline-none inline-flex items-center"
				type="button"
			>
				<input
					type="text"
					className="outline-none border-none dark:bg-[#1e1f22] bg-bgLightModeThird cursor-pointer truncate"
					readOnly
					value={dropdownValue}
				/>
				<Icons.ArrowDown defaultSize="h-[15px] w-[15px] dark:text-[#b5bac1] text-black" />
			</button>

			{isOpenDropdown && (
				<div
					id="dropdown"
					className={`${appearanceTheme === 'dark' ? 'thread-scroll' : 'customSmallScrollLightMode'} absolute w-full top-[50px] left-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 max-h-[300px] overflow-y-scroll`}
				>
					<div className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
						{parentChannelsInClan.map((channel) => (
							<div
								key={channel?.channel_id}
								className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white truncate cursor-pointer"
								onClick={() => {
									setDropdownValue(channel?.channel_label as string);
									toggleDropdown();
								}}
							>
								{channel?.channel_label}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default WebhookItemModal;
