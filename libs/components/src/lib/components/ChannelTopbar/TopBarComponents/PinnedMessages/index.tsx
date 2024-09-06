import { selectTheme } from '@mezon/store';
import { useSelector } from 'react-redux';
import ListPinMessage from './ListPinMessage';

type PinnedMessagesProps = {
	onClose?: () => void;
};

const PinnedMessages = ({ onClose }: PinnedMessagesProps) => {
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div className="absolute top-8 right-0 shadow z-[99999999]">
			<div className="flex flex-col rounded-md w-[420px] max-h-[80vh] overflow-hidden dark:shadow-shadowBorder shadow-shadowInbox">
				<div className="dark:bg-bgTertiary bg-bgLightTertiary flex flex-row items-center justify-between p-[16px] h-12">
					<div className="flex flex-row items-center pr-[16px] gap-4">
						<span className="text-base font-medium cursor-default dark:text-white text-black">Pinned Messages</span>
					</div>
				</div>
				<div
					className={`flex flex-col dark:bg-bgSecondary bg-bgLightSecondary flex-1 overflow-y-auto ${appearanceTheme === 'light' ? 'customScrollLightMode' : 'thread-scroll'}`}
				>
					<ListPinMessage onClose={onClose} />
				</div>
			</div>
		</div>
	);
};

export default PinnedMessages;
