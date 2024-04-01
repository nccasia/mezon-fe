import { channelMembersActions, friendsActions, mapMessageChannelToEntity, messagesActions, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageWithUser } from '@mezon/utils';
import React, { useCallback, useEffect } from 'react';


type EmojiContextProviderProps = {
	children: React.ReactNode;
};

export type EmojiContextValue = {
	// TODO: add your context value here
	messageRef: IMessageWithUser | undefined;
	setMessageRef: React.Dispatch<React.SetStateAction<IMessageWithUser | undefined>>;
	isOpenReply: boolean;
	setIsOpenReply: React.Dispatch<React.SetStateAction<boolean>>;
	isOpenEmojiMessBox: boolean;
	setIsOpenEmojiMessBox: React.Dispatch<React.SetStateAction<boolean>>;
	emojiSelectedReacted: string;
	setEmojiSelectedReacted: React.Dispatch<React.SetStateAction<string>>;
	emojiSelectedMess: string;
	setEmojiSelectedMess: React.Dispatch<React.SetStateAction<string>>;
	isOpenEmojiReacted: boolean;
	setIsOpenEmojiReacted: React.Dispatch<React.SetStateAction<boolean>>;
	isOpenEmojiReactedBottom: boolean;
	setIsOpenEmojiReactedBottom: React.Dispatch<React.SetStateAction<boolean>>;
	emojiPlaceActive: string;
	setEmojiPlaceActive: React.Dispatch<React.SetStateAction<string>>;
	widthEmojiBar: number;
	setWidthEmojiBar: React.Dispatch<React.SetStateAction<number>>;


    activeTab: string;
	setActiveTab: React.Dispatch<React.SetStateAction<string>>;
};

const EmojiContext = React.createContext<EmojiContextValue>({} as EmojiContextValue);

const EmojiContextProvider: React.FC<EmojiContextProviderProps> = ({ children }) => {
	const [messageRef, setMessageRef] = React.useState<IMessageWithUser>();
	const [isOpenReply, setIsOpenReply] = React.useState<boolean>(false);
	const [isOpenEmojiMessBox, setIsOpenEmojiMessBox] = React.useState<boolean>(false);
	const [emojiSelectedReacted, setEmojiSelectedReacted] = React.useState<string>('');
	const [emojiSelectedMess, setEmojiSelectedMess] = React.useState<string>('');
	const [isOpenEmojiReacted, setIsOpenEmojiReacted] = React.useState<boolean>(false);
	const [isOpenEmojiReactedBottom, setIsOpenEmojiReactedBottom] = React.useState<boolean>(false);
	const [emojiPlaceActive, setEmojiPlaceActive] = React.useState<string>('');
	const [widthEmojiBar, setWidthEmojiBar] = React.useState<number>(0);


    const [activeTab, setActiveTab] = React.useState<string>('');


	const value = React.useMemo<EmojiContextValue>(
		() => ({
			messageRef,
			setMessageRef,
			isOpenReply,
			setIsOpenReply,
			isOpenEmojiMessBox,
			setIsOpenEmojiMessBox,
			emojiSelectedReacted,
			setEmojiSelectedReacted,
			isOpenEmojiReacted,
			setIsOpenEmojiReacted,
			emojiPlaceActive,
			setEmojiPlaceActive,
			emojiSelectedMess,
			setEmojiSelectedMess,
			widthEmojiBar,
			setWidthEmojiBar,
			isOpenEmojiReactedBottom,
			setIsOpenEmojiReactedBottom,
            activeTab,
            setActiveTab
		}),
		[
			messageRef,
			setMessageRef,
			isOpenReply,
			setIsOpenReply,
			isOpenEmojiMessBox,
			setIsOpenEmojiMessBox,
			emojiSelectedReacted,
			setEmojiSelectedReacted,
			isOpenEmojiReacted,
			setIsOpenEmojiReacted,
			emojiPlaceActive,
			setEmojiPlaceActive,
			emojiSelectedMess,
			setEmojiSelectedMess,
			widthEmojiBar,
			setWidthEmojiBar,
			isOpenEmojiReactedBottom,
			setIsOpenEmojiReactedBottom,
            activeTab,
            setActiveTab
		],
	);

	return <EmojiContext.Provider value={value}>{children}</EmojiContext.Provider>;
};

const EmojiContextConsumer = EmojiContext.Consumer;

export { EmojiContext, EmojiContextConsumer, EmojiContextProvider };