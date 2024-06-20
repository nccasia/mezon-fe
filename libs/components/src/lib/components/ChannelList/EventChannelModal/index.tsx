import { useCallback, useState } from 'react';
import DetailItemEvent from '../DetailItemEvent';
import ModalCreate from './ModalCreate';
import StartEventModal from './StartEvent';

export type EventModalProps = {
	numberEventManagement: number;
	onClose: () => void;
};

const EventModal = (props: EventModalProps) => {
	const { numberEventManagement, onClose } = props;
	const [openModal, setOpenModal] = useState(false);
	const [openModalDetail, setOpenModalDetail] = useState(false);

	const handleModalDetail = useCallback((status: boolean) => {
		setOpenModalDetail(status);
	}, []);

	return (
		<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-80 dark:text-white text-black hide-scrollbar overflow-hidden">
			{!openModalDetail ? (
				<div className={`relative w-full sm:h-auto ${openModal ? 'max-w-[472px]' : 'max-w-[600px]'}`}>
					<div className="rounded-lg overflow-hidden text-sm">
						{!openModal ? (
							<StartEventModal
								onClose={onClose}
								onOpenCreate={() => setOpenModal(true)}
								onOpenDetailItem={handleModalDetail}
								numberEventManagement={numberEventManagement}
							/>
						) : (
							<ModalCreate onClose={() => setOpenModal(false)} onCloseEventModal={onClose} />
						)}
					</div>
				</div>
			) : (
				<DetailItemEvent setOpenModalDetail={handleModalDetail} />
			)}
		</div>
	);
};

export default EventModal;
