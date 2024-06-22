import { useEventManagement } from '@mezon/core';
import { selectCurrentClanId, selectVoiceChannelAll } from '@mezon/store';
import { ContenSubmitEventProps, OptionEvent, Tabs_Option } from '@mezon/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentTimeRounded, handleTimeISO } from '../timeFomatEvent';
import EventInfoModal from './eventInfoModal';
import HeaderEventCreate from './headerEventCreate';
import LocationModal from './locationModal';
import ReviewModal from './reviewModal';

export type ModalCreateProps = {
	onClose: () => void;
	onCloseEventModal: () => void;
};

const ModalCreate = (props: ModalCreateProps) => {
	const { onClose, onCloseEventModal } = props;
	const currentClanId = useSelector(selectCurrentClanId);
	const voicesChannel = useSelector(selectVoiceChannelAll);
	const tabs = ['Location', 'Event Info', 'Review'];
	const [currentModal, setCurrentModal] = useState(0);
	const [contentSubmit, setContentSubmit] = useState<ContenSubmitEventProps>({
		topic: '',
		titleEvent: '',
		timeStart: '00:00',
		timeEnd: '00:00',
		selectedDateStart: new Date(),
		selectedDateEnd: new Date(),
		voiceChannel: voicesChannel[0]?.id || '',
		logo: '',
		description: '',
	});
	const [buttonWork, setButtonWork] = useState(true);
	const [option, setOption] = useState('');
	const [errorOption, setErrorOption] = useState(false);
	const [errorTime, setErrorTime] = useState(false);
	const { createEventManagement } = useEventManagement();

	const choiceSpeaker = useMemo(() => option === OptionEvent.OPTION_SPEAKER, [option]);
	const choiceLocation = useMemo(() => option === OptionEvent.OPTION_LOCATION, [option]);

	const handleNext = (currentModal: number) => {
		if (buttonWork && currentModal < tabs.length - 1 && !errorTime && !errorOption) {
			setCurrentModal(currentModal + 1);
		}
	};

	const handleBack = (currentModal: number) => {
		setCurrentModal(currentModal - 1);
	};

	const handleOption = (option: string) => {
		setOption(option);
	};

	const handleCurrentModal = (number: number) => {
		if (errorOption || errorTime) {
			return;
		}

		if (buttonWork || number < 1) {
			setCurrentModal(number);
		}
	};

	const handleSubmit = async () => {
		const voice = choiceSpeaker ? contentSubmit.voiceChannel : '';
		const title = choiceLocation ? contentSubmit.titleEvent : '';

		const timeValueStart = handleTimeISO(contentSubmit.selectedDateStart, contentSubmit.timeStart);
		const timeValueEnd = handleTimeISO(contentSubmit.selectedDateEnd, contentSubmit.timeEnd);

		await createEventManagement(
			currentClanId || '',
			voice,
			title,
			contentSubmit.topic,
			timeValueStart,
			choiceSpeaker ? timeValueStart : timeValueEnd,
			contentSubmit.description,
			contentSubmit.logo,
		);
		hanldeCloseModal();
	};

	const hanldeCloseModal = () => {
		onClose();
		onCloseEventModal();
	};

	useEffect(() => {
		if (currentModal >= 1) {
			setButtonWork(false);
		} else {
			setButtonWork(true);
		}
		if (contentSubmit.topic !== '') {
			setButtonWork(true);
		}
	}, [currentModal, contentSubmit.topic]);

	useEffect(() => {
		if ((choiceLocation && contentSubmit.titleEvent === '') || (choiceSpeaker && contentSubmit.voiceChannel === '')) {
			setErrorOption(true);
		} else {
			setErrorOption(false);
		}
	}, [choiceLocation, choiceSpeaker, contentSubmit.titleEvent, contentSubmit.voiceChannel, option]);

	const defaultTimeStart = useMemo(() => getCurrentTimeRounded(), []);
	const defaultTimeEnd = useMemo(() => getCurrentTimeRounded(true), []);

	useEffect(() => {
		setContentSubmit((prev) => ({ ...prev, timeStart: defaultTimeStart }));
		setContentSubmit((prev) => ({ ...prev, timeEnd: defaultTimeEnd }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="dark:bg-[#313339] bg-bgLightMode rounded-lg overflow-hidden text-sm p-4">
			<div className="flex gap-x-4 mb-4">
				<HeaderEventCreate tabs={tabs} currentModal={currentModal} onHandleTab={(num: number) => handleCurrentModal(num)} />
			</div>
			<div>
				{currentModal === Tabs_Option.LOCATION && (
					<LocationModal
						contentSubmit={contentSubmit}
						choiceSpeaker={choiceSpeaker}
						choiceLocation={choiceLocation}
						voicesChannel={voicesChannel}
						handleOption={handleOption}
						setContentSubmit={setContentSubmit}
					/>
				)}
				{currentModal === Tabs_Option.EVENT_INFO && (
					<EventInfoModal
						contentSubmit={contentSubmit}
						choiceLocation={choiceLocation}
						timeStartDefault={defaultTimeStart}
						timeEndDefault={defaultTimeEnd}
						setContentSubmit={setContentSubmit}
						setErrorTime={(status: boolean) => setErrorTime(status)}
					/>
				)}
				{currentModal === Tabs_Option.REVIEW && <ReviewModal contentSubmit={contentSubmit} option={option} />}
			</div>
			<div className="flex justify-between mt-4 w-full text-white">
				<button
					className={`py-2 text-[#84ADFF] font-bold ${(currentModal === Tabs_Option.LOCATION || errorTime) && 'hidden'}`}
					onClick={() => handleBack(currentModal)}
				>
					Back
				</button>
				<div className="flex justify-end gap-x-4 w-full">
					<button className="px-4 py-2 rounded bg-slate-500 font-semibold" onClick={onClose}>
						Cancel
					</button>
					{currentModal === Tabs_Option.REVIEW ? (
						<button
							className={`px-4 py-2 rounded font-semibold bg-primary ${(option === '' || errorOption) && 'dark:text-slate-400 text-slate-500 bg-opacity-50'}`}
							// eslint-disable-next-line @typescript-eslint/no-empty-function
							onClick={option === '' || errorOption ? () => {} : () => handleSubmit()}
						>
							Create Event
						</button>
					) : (
						<button
							className={`px-4 py-2 rounded font-semibold bg-primary ${(!buttonWork || errorTime || errorOption) && 'dark:text-slate-400 text-slate-500 bg-opacity-50'}`}
							onClick={() => handleNext(currentModal)}
						>
							Next
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ModalCreate;
