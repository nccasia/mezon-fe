import { ILinkOnMessage, ILinkVoiceRoomOnMessage, IMarkdownOnMessage, processText } from '@mezon/utils';
import { useEffect, useState } from 'react';

const useProcessedContent = (inputText: string) => {
	const [linkList, setLinkList] = useState<ILinkOnMessage[]>([]);
	const [markdownList, setMarkdownList] = useState<IMarkdownOnMessage[]>([]);
	const [voiceLinkRoomList, setVoiceLinkRoomList] = useState<ILinkVoiceRoomOnMessage[]>([]);

	useEffect(() => {
		const processInput = () => {
			const { links, markdowns, voiceRooms } = processText(inputText);
			setLinkList(links);
			setMarkdownList(markdowns);
			setVoiceLinkRoomList(voiceRooms);
		};

		processInput();
	}, [inputText]);
	return { linkList, markdownList, inputText, voiceLinkRoomList };
};

export default useProcessedContent;
