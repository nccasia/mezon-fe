import { selectVoiceChannelAll } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import EventInfoModal from './eventInfoModal';
import LocationModal from './locationModal';
import ReviewModal from './reviewModal';

enum Tabs_Option {
	LOCATION = 0,
	EVENT_INFO = 1,
	REVIEW = 2,
}

export type ModalCreateProps = {
	onClose: () => void;
};

const ModalCreate = (props: ModalCreateProps) => {
	const { onClose } = props;
	const [currentModal, setCurrentModal] = useState(0);
	const [topic, setTopic] = useState('');
	const [voiceChannel, setVoiceChannel] = useState('');
	const [buttonWork, setButtonWork] = useState(true);
	const [titleEvent, setTitleEvent] = useState('');
	const [option, setOption] = useState('');

	const voicesChannel = useSelector(selectVoiceChannelAll);
	const tabs = ['Location', 'Event Info', 'Review'];

	const handleNext = (currentModal: number) => {
		if (buttonWork && currentModal < tabs.length - 1) {
			setCurrentModal(currentModal + 1);
		}
	};

	const handleBack = (currentModal: number) => {
		setCurrentModal(currentModal - 1);
	};

	const handleTopic = (topic: string) => {
		setTopic(topic);
	};

	const handleVoiceChannel = (channel: string) => {
		setVoiceChannel(channel);
	};

	const handleOption = (option: string) => {
		setOption(option);
	};

	const handleTitleEvent = (title: string) => {
		setTitleEvent(title);
	};

	const handleCurrentModal = (number: number) => {
		if (buttonWork || number < 1) {
			setCurrentModal(number);
		}
	};

	useEffect(() => {
		if (currentModal >= 1) {
			setButtonWork(false);
		} else {
			setButtonWork(true);
		}
		if (topic !== '') {
			setButtonWork(true);
		}
	}, [currentModal, topic]);

	return (
		<div className="bg-[#313339] rounded-lg overflow-hidden text-sm p-4">
			<div className="flex gap-x-4 mb-4">
				{tabs.map((item, index) => {
					const isCurrent = currentModal === index;
					return (
						<div className="flex-grow text-[10px]" key={index} onClick={() => handleCurrentModal(index)}>
							<div className={`w-full h-[6px] rounded mb-2 ${isCurrent ? 'bg-[#959CF7] ' : 'bg-slate-500'}`}></div>
							<p className={isCurrent ? 'text-[#959CF7]' : 'text-slate-500'}>{item}</p>
						</div>
					);
				})}
			</div>
			<div>
				{currentModal === Tabs_Option.LOCATION && (
					<LocationModal
						option={option}
						voice={voiceChannel}
						voicesChannel={voicesChannel}
						titleEvent={titleEvent}
						handleOption={handleOption}
						handleVoiceChannel={handleVoiceChannel}
						handleTitleEvent={handleTitleEvent}
					/>
				)}
				{currentModal === Tabs_Option.EVENT_INFO && <EventInfoModal topic={topic} handleTopic={handleTopic} />}
				{currentModal === Tabs_Option.REVIEW && <ReviewModal option={option} topic={topic} voice={voiceChannel} titleEvent={titleEvent} />}
			</div>
			<div className="flex justify-between mt-4 w-full">
				<button
					className={`py-2 text-[#84ADFF] font-bold ${currentModal === Tabs_Option.LOCATION && 'hidden'}`}
					onClick={() => handleBack(currentModal)}
				>
					Back
				</button>
				<div className="flex justify-end gap-x-4 w-full">
					<button className="px-4 py-2 rounded bg-slate-500" onClick={onClose}>
						Cancel
					</button>
					<button
						className={`px-4 py-2 rounded bg-primary ${!buttonWork && 'bg-opacity-50'}`}
						onClick={currentModal === Tabs_Option.REVIEW ? () => console.log('submit') : () => handleNext(currentModal)}
					>
						{currentModal === Tabs_Option.REVIEW ? 'Create Event' : 'Next'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModalCreate;
