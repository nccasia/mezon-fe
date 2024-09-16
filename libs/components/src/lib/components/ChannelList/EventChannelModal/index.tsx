import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import DetailItemEvent from '../DetailItemEvent';
import ModalCreate from './ModalCreate';
import StartEventModal from './StartEvent';

export type EventModalProps = {
	numberEventManagement: number;
	onClose: () => void;
	openModalDetail: boolean;
	setOpenModalDetail: Dispatch<SetStateAction<boolean>>;
};

const EventModal = (props: EventModalProps) => {
	const { numberEventManagement, onClose, openModalDetail, setOpenModalDetail } = props;
	const [openModal, setOpenModal] = useState(false);

	const handleModalDetail = useCallback((status: boolean) => {
		setOpenModalDetail(status);
	}, []);

	return (
		<div className="justify-center items-center flex overflow-x-hidden rounded-lg overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-80 dark:text-white text-black hide-scrollbar overflow-hidden">
			{!openModalDetail ? (
				<div className={`relative w-full sm:h-auto rounded-lg ${openModal ? 'max-w-[472px]' : 'max-w-[600px]'}`}>
					{!openModal ? (
						<div className="rounded-lg text-sm overflow-hidden">
							<StartEventModal
								onClose={onClose}
								onOpenCreate={() => setOpenModal(true)}
								onOpenDetailItem={handleModalDetail}
								numberEventManagement={numberEventManagement}
							/>
						</div>
					) : (
						<div className="rounded-lg text-sm">
							<ModalCreate onClose={() => setOpenModal(false)} onCloseEventModal={onClose} />
						</div>
					)}
				</div>
			) : (
				<DetailItemEvent setOpenModalDetail={handleModalDetail} />
			)}
		</div>
	);
};

export default EventModal;
