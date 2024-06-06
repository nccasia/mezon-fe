import { InputField, TextArea } from '@mezon/ui';
import { IChannel } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import ModalAskChangeChannel from '../Modal/modalAskChangeChannel';
import { channelsActions, useAppDispatch } from '@mezon/store';
import { ApiUpdateChannelDescRequest } from 'mezon-js';

export type OverviewChannelProps = {
	channel: IChannel;
};

const OverviewChannel = (props: OverviewChannelProps) => {
	const { channel } = props;
	const dispatch = useAppDispatch();
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

	const handleSave = async () => {
		setChannelLabelInit(channelLabel);
		setTopicInit(topic);
		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: channel.channel_id || '',
			channel_label: channelLabel ,
			category_id: channel.category_id,
		}
		await dispatch(channelsActions.updateChannel(updateChannel));
	};

	useEffect(() => {
		const textArea = textAreaRef.current;
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = textArea.scrollHeight + 'px';
		}
	}, [topic]);

	return (
		<div className="overflow-y-auto flex flex-col flex-1 shrink dark:bg-bgPrimary bg-bgLightModeSecond  w-1/2 pt-[94px] sbm:pb-7 sbm:pr-[10px] sbm:pl-[40px] p-4 overflow-x-hidden min-w-full sbm:min-w-[700px] 2xl:min-w-[900px] max-w-[740px] hide-scrollbar">
			<div className="dark:text-white text-black text-[15px]">
				<h3 className="mb-4 font-bold">Overview</h3>
				<p className="uppercase mb-3">Channel name</p>
				<InputField
					type="text"
					placeholder={channelLabel}
					value={channelLabel}
					onChange={handleDisplayChannelLabel}
					className="dark:bg-black bg-white pl-3 py-2 w-full border-0 outline-none rounded"
				/>
				<hr className="border-t border-solid dark:border-borderDefault my-10" />
				<p className="uppercase mb-3">Channel Topic</p>
				<div className="relative">
					<TextArea
						placeholder="Let everyone know how to use this channel!"
						className="resize-none h-auto min-h-[87px] w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black overflow-y-hidden outline-none py-2 pl-3 pr-5"
						value={topic}
						onChange={handleChangeTextArea}
						rows={1}
						refTextArea={textAreaRef}
					></TextArea>
					<p className="absolute bottom-2 right-2 text-[#AEAEAE]">{countCharacterTopic}</p>
				</div>
			</div>
			{(channelLabelInit !== channelLabel || topicInit !== topic) && (
				<ModalAskChangeChannel onReset={handleReset} onSave={handleSave} className="relative mt-8 bg-transparent pr-0" />
			)}
		</div>
	);
};

export default OverviewChannel;
