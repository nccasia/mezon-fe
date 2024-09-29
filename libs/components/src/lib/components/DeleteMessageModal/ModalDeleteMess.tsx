import { useDeleteMessage, useEditMessage } from '@mezon/core';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect } from 'react';
import MessageWithUser from '../MessageWithUser';

type ModalDeleteMessProps = {
	mess: IMessageWithUser;
	closeModal: () => void;
	mode: number;
	channelId?: string;
	channelLable?: string;
};

const ModalDeleteMess = (props: ModalDeleteMessProps) => {
	const { mess, closeModal, mode } = props;
	const { deleteSendMessage } = useDeleteMessage({
		channelId: mess.channel_id,
		mode: mode
	});

	const { handleCancelEdit } = useEditMessage(props.channelId ?? '', props.channelLable ?? '', mode, mess);

	const handleDeleteMess = () => {
		deleteSendMessage(mess.id);
		handleCancelEdit();
		closeModal();
	};

	const handleEnter = (e: any) => {
		if (e.key === 'Enter') {
			handleDeleteMess();
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', handleEnter);

		return () => {
			document.removeEventListener('keydown', handleEnter);
		};
	}, []);

	return (
		<div className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center">
			<div className="w-fit h-fit dark:bg-bgPrimary bg-bgLightModeThird rounded-lg flex-col justify-start  items-start gap-3 inline-flex overflow-hidden">
				<div className="dark:text-white text-black">
					<div className="p-4 pb-0">
						<h3 className="font-bold pb-4">Delete Message</h3>
						<p>Are you sure you want to delete this message?</p>
					</div>
					<div className="p-4">
						<MessageWithUser
							allowDisplayShortProfile={false}
							message={mess}
							isMessNotifyMention={true}
							mode={mode}
							isMention={true}
							isShowFull={true}
						/>
					</div>
					<div className="w-full dark:bg-bgSecondary bg-bgLightSecondary p-4 flex justify-end gap-x-4">
						<button onClick={closeModal} className="px-4 py-2 hover:underline rounded">
							Cancel
						</button>
						<button onClick={handleDeleteMess} className="px-4 py-2 bg-[#DA363C] rounded hover:bg-opacity-85 text-white">
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModalDeleteMess;
