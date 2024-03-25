import { InputField, TextArea } from '@mezon/ui';
import { IChannel } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import ModalAskChangeChannel from '../Modal/modalAskChangeChannel';

export type OverviewChannelProps = {
	channel: IChannel;
};

const OverviewChannel = (props: OverviewChannelProps) => {
	const { channel } = props;
	const [channelLabelInit, setChannelLabelInit] = useState(channel.channel_label);
	const [topicInit, setTopicInit] = useState('');

	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const [topic, setTopic] = useState(topicInit);
	const [channelLabel, setChannelLabel] = useState(channelLabelInit);
	const [countCharacterTopic, setCountCharacterTopic] = useState(1024);
	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTopic(e.target.value);
		setCountCharacterTopic(1024 - e.target.value.length);
	};

	const handleDisplayChannelLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
		setChannelLabel(e.target.value);
	};

	const handleReset = () => {
		setTopic(topicInit);
		setChannelLabel(channelLabelInit);
	};

	const handleSave = () => {
		setChannelLabelInit(channelLabel);
		setTopicInit(topic);
	};

	useEffect(() => {
		const textArea = textAreaRef.current;
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = textArea.scrollHeight + 'px';
		}
	}, [topic]);

	return (
		<div className="overflow-y-auto flex flex-col flex-1 shrink bg-bgSecondary w-1/2 pt-[94px] pb-7 pr-[10px] pl-[40px] overflow-x-hidden min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar">
			<div className="text-white text-[15px]">
				<h3 className="mb-4 font-bold">Overview</h3>
				<p className="uppercase mb-3">Channel name</p>
				<InputField
					type="text"
					placeholder={channelLabel}
					value={channelLabel}
					onChange={handleDisplayChannelLabel}
					className="bg-black pl-3 py-2 w-full border-0 outline-none rounded"
				/>
				<hr className="border-t border-solid border-borderDefault my-10" />
				<p className="uppercase mb-3">Channel Topic</p>
				<div className="relative">
					<TextArea
						placeholder="Let everyone know how to use this channel!"
						className="resize-none h-auto min-h-[87px] w-full bg-black overflow-y-hidden outline-none py-2 pl-3 pr-5"
						value={topic}
						onChange={handleChangeTextArea}
						rows={1}
						refTextArea={textAreaRef}
					></TextArea>
					<p className="absolute bottom-2 right-2 text-[#AEAEAE]">{countCharacterTopic}</p>
				</div>
			</div>
			{(channelLabelInit !== channelLabel || topicInit !== topic) && <ModalAskChangeChannel onReset={handleReset} onSave={handleSave} />}
		</div>
	);
};

export default OverviewChannel;
