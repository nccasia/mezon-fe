import { CustomFlowbiteTheme, Flowbite, Modal, ModalBody } from 'flowbite-react';
import { useState } from 'react';
import { ApiMessageAttachment } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

export type MessageImage = {
	content?: string;
	attachmentData: ApiMessageAttachment;
};

const customTheme: CustomFlowbiteTheme = {
	modal: {
		content: {
			inner: 'relative rounded-lg bg-transparent shadow dark:bg-gray-700 flex flex-col max-h-[90vh]',
			base: '',
		},
	},
};

function MessageImage({ attachmentData }: MessageImage) {
	const [openModal, setOpenModal] = useState(false);
	return (
		<>
			<div className="break-all">
				<img className="max-w-[400px] max-h-[350px] my-2 rounded" src={attachmentData.url} alt="" onClick={() => setOpenModal(true)} />
			</div>
			<Flowbite theme={{ theme: customTheme }}>
				<Modal show={openModal} dismissible={true} onClose={() => setOpenModal(false)} className="bg-black bg-opacity-80">
					<ModalBody className="bg-transparent p-0">
						<div className="flex justify-center items-center">
							{attachmentData.url && <img className="max-h-[80vh]" src={attachmentData.url} alt="" />}
						</div>
					</ModalBody>
				</Modal>
			</Flowbite>
		</>
	);
}

export default MessageImage;
