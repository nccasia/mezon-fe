import { ILinkOnMessage, ILinkVoiceRoomOnMessage, IMarkdownOnMessage, processText } from '@mezon/utils';
import { useEffect, useState } from 'react';

const useProcessedContent = (inputText: string) => {
	const [linkList, setLinkList] = useState<ILinkOnMessage[]>([]);
	const [markdownList, setMarkdownList] = useState<IMarkdownOnMessage[]>([]);
	const [voiceLinkRoomList, setVoiceLinkRoomList] = useState<ILinkVoiceRoomOnMessage[]>([]);

	useEffect(() => {
		const processInput = async () => {
			const { links, markdowns, voiceRooms } = await processText(inputText);
			console.log('links: ', links);
			setLinkList(links);
			setMarkdownList(markdowns);
			setVoiceLinkRoomList(voiceRooms);
		};

		processInput();
	}, [inputText]);
	return { linkList, markdownList, inputText, voiceLinkRoomList };
};

export default useProcessedContent;
