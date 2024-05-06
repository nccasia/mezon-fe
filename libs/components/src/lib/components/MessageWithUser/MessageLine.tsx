import MarkdownFormatText from '../MarkdownFormatText';
import { useMessageLine } from './useMessageLine';
import { useInvite } from '@mezon/core';
import ExpiryTimeModal from '../ExpiryTime';
import { useModal } from 'react-modal-hook';

type MessageLineProps = {
	line: string;
};

const LineWithLink = ({ link }: { link: string }) => {
	const { getLinkInvite } = useInvite();
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ExpiryTimeModal onClose={closeInviteChannelModal} open={true} />
	));
	const getLinkinvite = () => {
		const inviteId = link.split('/invite/')[1];
		getLinkInvite(inviteId).then((res) => {
			if (res.expiry_time) {
				if (new Date(res.expiry_time) < new Date()) {
					openInviteChannelModal();
				} else {
					window.location.href = link;
				}
			}
		})
	}
	return (
		<p className="text-blue-500 hover:underline" rel="noopener noreferrer"
			onClick={getLinkinvite}
		>
			{link}
		</p>
	);
};

const isLink = (line: string) => {
	if (line?.includes(' ')) {
		return false;
	}
	if ((line?.startsWith('http://')) || (line?.startsWith('https://'))) {
		return true;
	}
	return false;
};

// TODO: refactor component for message lines
const MessageLine = ({ line }: MessageLineProps) => {
	const { mentions } = useMessageLine(line);

	return (
		<>
			{isLink(line) ? (
				<LineWithLink link={line} />
			) : (
				<div>
					<MarkdownFormatText mentions={mentions} />
				</div>
			)}
		</>
	);
};

export default MessageLine;
