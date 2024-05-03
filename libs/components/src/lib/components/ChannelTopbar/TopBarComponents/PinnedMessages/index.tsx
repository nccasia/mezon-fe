import EmptyPinMessage from './EmptyPinMessage';

type PinnedMessagesProps = {
	onClose?: () => void;
};

const PinnedMessages = ({ onClose }: PinnedMessagesProps) => {
	return (
		<div className="absolute top-8 right-0 shadow z-[99999999]">
			<div className="flex flex-col rounded-md w-[420px] max-h-[80vh] shadow-sm overflow-hidden">
				<div className="bg-[#1E1E1E] flex flex-row items-center justify-between p-[16px] h-12">
					<div className="flex flex-row items-center pr-[16px] gap-4">
						<span className="text-base font-medium cursor-default">Pinned Messages</span>
					</div>
				</div>
				<div className="flex flex-col bg-[#323232] min-h-full flex-1 overflow-y-auto thread-scroll">
					{/* <ItemPinMessage /> */}
					{<EmptyPinMessage />}
				</div>
			</div>
		</div>
	);
};

export default PinnedMessages;
