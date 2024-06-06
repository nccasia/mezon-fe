import { Modal } from 'flowbite-react';

type ModalValidateFileProps = {
	openModal: boolean;
	title?: string;
	content?: string;
	image?: string;
	onClose: () => void;
};

const ModalValidateFile = ({ openModal, title, content, image, onClose }: ModalValidateFileProps) => {
	return (
		<Modal dismissible show={openModal} onClose={() => onClose()}>
			<Modal.Body className="bg-red-500 rounded-lg">
				<div className="space-y-6 h-52 border-dashed border-2 flex text-center justify-center flex-col">
					<img className="w-60 h-60 absolute top-[-130px] left-1/2 translate-x-[-50%]" src={image} alt="file" />
					<h3 className="text-white text-4xl font-semibold">{title}</h3>
					<h4 className="text-white text-xl">{content}</h4>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default ModalValidateFile;
