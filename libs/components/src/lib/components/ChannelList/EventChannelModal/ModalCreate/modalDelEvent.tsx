import { useEventManagement } from '@mezon/core';
import { EventManagementEntity } from '@mezon/store';

type ModalDelEventProps = {
	event: EventManagementEntity | undefined;
	onClose: () => void;
	setOpenModalDelEvent: React.Dispatch<React.SetStateAction<boolean>>;
	onHandle: (e: any) => void;
};

const ModalDelEvent = (props: ModalDelEventProps) => {
	const { event, onClose, setOpenModalDelEvent, onHandle } = props;
	const { deleteEventManagement } = useEventManagement();

	const handleDeleteEvent = async () => {
		await deleteEventManagement(event?.clan_id || '', event?.id || '');
		closeModal();
	};

	const closeModal = () => {
		setOpenModalDelEvent(false);
	};

	return (
		<div
			className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center"
			onClick={(e) => {
				onHandle(e);
				onClose();
			}}
		>
			<div className="w-fit h-fit dark:bg-bgPrimary bg-bgLightModeThird rounded-lg flex-col justify-start  items-start gap-3 inline-flex overflow-hidden">
				<div className="dark:text-white text-black w-[440px]">
					<div className="p-4 pb-0">
						<h3 className="font-bold pb-4 text-xl">Cancel Event?</h3>
						<p className="pb-4">Are you sure you want to cancel this event?</p>
					</div>
					<div className="w-full dark:bg-bgSecondary bg-bgLightSecondary p-4 flex justify-end gap-x-4 font-medium">
						<button onClick={closeModal} className="px-4 py-2 hover:underline rounded">
							Never Mind
						</button>
						<button onClick={handleDeleteEvent} className="px-4 py-2 bg-[#DA363C] rounded hover:bg-opacity-85 text-white">
							Cancel Event
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ModalDelEvent;
