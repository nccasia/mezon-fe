import { useMessageValue, useThreads } from '@mezon/core';
import { ApiChannelDescription } from 'mezon-js/api.gen';
import * as Icons from '../../../../Icons';

type ThreadHeaderProps = {
	threadCurrentChannel?: ApiChannelDescription | null;
};

const ThreadHeader = ({ threadCurrentChannel }: ThreadHeaderProps) => {
	const { setNameValueThread, setIsShowCreateThread, setTurnOffThreadMessage } = useThreads();
	const { setValueTextInput } = useMessageValue();

	const handleCloseModal = () => {
		setTurnOffThreadMessage();
		setIsShowCreateThread(false);
		setNameValueThread('');
		setValueTextInput('', true);
	};

	return (
		<div className="flex flex-row items-center justify-between px-4 h-[58px] min-h-[58px] border-b dark:border-gray-800 border-white">
			<div className="flex flex-row items-center gap-2 pointer-events-none">
				<Icons.ThreadIcon />
				<span className="text-base font-semibold dark:text-white text-colorTextLightMode">{threadCurrentChannel ? threadCurrentChannel.channel_label : 'New Thread'}</span>
			</div>
			<button onClick={handleCloseModal} className="relative right-0">
				<Icons.Close />
			</button>
		</div>
	);
};

export default ThreadHeader;
