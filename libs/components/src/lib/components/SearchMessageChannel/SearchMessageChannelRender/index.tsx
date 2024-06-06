import { useSearchMessages } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { Pagination } from 'flowbite-react';
import EmptySearch from './EmptySearch';
import MessageChannel from './MessageChannel';

const SearchMessageChannelRender = () => {
	const { searchMessagesChannel } = useSearchMessages();

	return (
		<>
			<div className="w-1 h-full dark:bg-bgPrimary bg-bgLightPrimary"></div>
			<div className="flex flex-col w-[420px] h-full">
				<div className="flex flex-row justify-between items-center h-14 p-4 bg-bgTertiary">
					<h3 className="select-none">{`${searchMessagesChannel?.messageChannels.length ?? 0} Results`}</h3>
					<div className="flex flex-row gap-2">
						<button className="px-1 h-8 min-w-12 text-base font-medium rounded bg-buttonSearch hover:bg-buttonSearchHover">New</button>
						<button className="px-1 h-8 min-w-12 text-base font-medium rounded bg-transparent hover:bg-buttonSearchHover">Old</button>
						<button className="px-1 h-8 min-w-12 text-base font-medium rounded bg-transparent hover:bg-buttonSearchHover">
							Relevant
						</button>
					</div>
				</div>
				{searchMessagesChannel.messageChannels?.length > 0 ? (
					<div className="flex flex-col flex-1 h-full p-4 bg-bgSecondary overflow-y-auto">
						<div className="flex flex-col">
							{searchMessagesChannel.messageChannels?.map((messagesChannels) =>
								messagesChannels.map((messagesChannel) => (
									<div key={messagesChannel.channel_label} className="flex flex-col">
										<h3 className="mb-2 text-base font-medium text-ellipsis whitespace-nowrap overflow-hidden">
											{messagesChannel.channel_label}
										</h3>
										<div className="flex flex-col gap-[10px]">
											{messagesChannel.messages?.map((message) => (
												<MessageChannel key={message.message_id} message={message as IMessageWithUser} />
											))}
										</div>
									</div>
								)),
							)}
						</div>
						<div className="mt-4">
							<Pagination currentPage={1} totalPages={100} onPageChange={() => {}} />
						</div>
					</div>
				) : (
					<EmptySearch />
				)}
			</div>
		</>
	);
};

export default SearchMessageChannelRender;
