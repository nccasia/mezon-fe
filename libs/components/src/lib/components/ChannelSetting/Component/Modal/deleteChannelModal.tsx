import { useAppNavigation } from '@mezon/core';
import { channelsActions, selectChannelFirst, selectChannelSecond, selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface DeleteModalProps {
	onClose: () => void;
	onCloseModal?: () => void;
	channelLabel: string;
	channelId: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ onClose, onCloseModal, channelLabel, channelId }) => {
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const channelFirst = useSelector(selectChannelFirst);
	const channelSecond = useSelector(selectChannelSecond);
	let channelNavId = channelFirst.id;

	const { toChannelPage } = useAppNavigation();
	const navigate = useNavigate();

	const handleDeleteChannel = async (channelId: string) => {
		await dispatch(channelsActions.deleteChannel({ channelId, clanId: currentClanId as string }));
		if (channelId === currentChannelId) {
			if (currentChannelId === channelNavId) {
				channelNavId = channelSecond.id;
			}
			const channelPath = toChannelPage(channelNavId ?? '', currentClanId ?? '');
			navigate(channelPath);
		}
		onClose();
		if (onCloseModal) {
			onCloseModal();
		}
	};

	return (
		<div className="fixed  inset-0 flex items-center justify-center z-50 dark:text-white text-black">
			<div className="fixed inset-0 bg-black opacity-80"></div>
			<div className="relative z-10 dark:bg-gray-900 bg-bgLightModeSecond p-6 rounded-[5px] text-center">
				<h2 className="text-[30px] font-semibold mb-4">Delete Channel</h2>
				<p className="text-white-600 mb-6 text-[16px]">
					Are you sure you want to delete <b>{channelLabel}</b>?This cannot be undone.
				</p>
				<div className="flex justify-center mt-10 text-[14px]">
					<button
						color="gray"
						onClick={onClose}
						className="px-4 py-2 mr-5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
					>
						Cancel
					</button>
					<button
						color="blue"
						onClick={() => handleDeleteChannel(channelId)}
						className="px-4 py-2 bg-colorDanger dark:bg-colorDanger text-white rounded hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};
