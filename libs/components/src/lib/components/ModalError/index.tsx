import { Modal } from 'flowbite-react';

type props = {
    openModal: boolean;
    handleClose: () => void;
}

export const ModalOverData = ({openModal, handleClose}: props) => {
    return(
        <Modal dismissible show={openModal} onClose={handleClose}>
				<Modal.Body className="bg-red-500 rounded-lg">
					<div className="space-y-6 h-52 border-dashed border-2 flex text-center justify-center flex-col">
						<img
							className="w-60 h-60 absolute top-[-130px] left-1/2 translate-x-[-50%]"
							src="assets/images/file-and-folder.png"
							alt="file"
						/>
						<h3 className="text-white text-4xl font-semibold">Your files are too powerful</h3>
						<h4 className="text-white text-xl">Max file size is 1MB, please!</h4>
					</div>
				</Modal.Body>
			</Modal>
    );
}

export const ModalErrorTypeUpload = ({openModal, handleClose}: props) => {
    return(
        <Modal dismissible show={openModal} onClose={handleClose}>
				<Modal.Body className="bg-red-500 rounded-lg">
					<div className="space-y-6 h-52 border-dashed border-2 flex text-center justify-center flex-col">
						<img
							className="w-60 h-60 absolute top-[-130px] left-1/2 translate-x-[-50%]"
							src="assets/images/file-and-folder.png"
							alt="file"
						/>
						<h3 className="text-white text-4xl font-semibold">Only image files are allowed</h3>
						<h4 className="text-white text-xl">Just uploaf type file (JPEG, PNG), please!</h4>
					</div>
				</Modal.Body>
			</Modal>
    );
}