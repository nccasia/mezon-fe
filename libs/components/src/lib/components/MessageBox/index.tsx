import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import createMentionPlugin, { MentionData, defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import data from '@emoji-mart/data';
import { ChatContext, useChatMessages } from '@mezon/core';
import { channelsActions, selectArrayNotification, selectCurrentChannel, selectEmojiSuggestion, useAppDispatch } from '@mezon/store';
import { handleUploadFile, handleUrlInput, useMezon } from '@mezon/transport';
import { EmojiPlaces, IMessageSendPayload, NotificationContent, TabNamePopup } from '@mezon/utils';
import { AtomicBlockUtils, ContentState, EditorState, Modifier, convertToRaw } from 'draft-js';
import { init } from 'emoji-mart';
import { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import EmojiList from '../EmojiComponentCustom';
import * as Icons from '../Icons';
import ImageComponent from './ImageComponet';
import editorStyles from './editorStyles.module.css';

export type MessageBoxProps = {
	onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
	) => void;
	onTyping?: () => void;
	listMentions?: MentionData[] | undefined;
	isOpenEmojiPropOutside?: boolean | undefined;
	currentChannelId?: string;
	currentClanId?: string;
};

init({ data });

function MessageBox(props: MessageBoxProps): ReactElement {
	const dispatch = useAppDispatch();
	const currentChanel = useSelector(selectCurrentChannel);
	const arrayNotication = useSelector(selectArrayNotification);
	const { messages } = useChatMessages({ channelId: currentChanel?.id || '' });
	const emojiPicked = useSelector(selectEmojiSuggestion);
	const { onSend, onTyping, listMentions, isOpenEmojiPropOutside, currentChannelId, currentClanId } = props;
	const [editorState, setEditorState] = useState(EditorState.createEmpty());
	const [suggestions, setSuggestions] = useState(listMentions);
	const [clearEditor, setClearEditor] = useState(false);
	const [content, setContent] = useState<string>('');
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const [attachmentData, setAttachmentData] = useState<ApiMessageAttachment[]>([]);
	const [referenceData, setReferencesData] = useState<ApiMessageRef[]>([]);
	const [showPlaceHolder, setShowPlaceHolder] = useState(false);
	const [open, setOpen] = useState(false);
	const { sessionRef, clientRef } = useMezon();

	const mentionPlugin = useRef(
		createMentionPlugin({
			entityMutability: 'IMMUTABLE',
			theme: editorStyles,
			mentionPrefix: '@',
			supportWhitespace: true,
			mentionTrigger: '@',
		}),
	);

	const { MentionSuggestions } = mentionPlugin.current;
	const imagePlugin = createImagePlugin({ imageComponent: ImageComponent });
	const plugins = [mentionPlugin.current, imagePlugin];
	//clear Editor after navigate channel
	useEffect(() => {
		setEditorState(EditorState.createEmpty());
	}, [currentChannelId, currentClanId]);

	const onChange = useCallback(
		(editorState: EditorState) => {
			if (typeof onTyping === 'function') {
				onTyping();
			}
			setClearEditor(false);
			setEditorState(editorState);
			const contentState = editorState.getCurrentContent();
			const raw = convertToRaw(contentState);
			// get message
			const messageRaw = raw.blocks;
			const messageContent = Object.values(messageRaw)
				.filter((item) => item.text.trim() !== '')
				.map((item) => item.text);
			const messageBreakline = messageContent.join('\n').replace(/,/g, '');

			onConvertToFiles(messageBreakline);

			handleUrlInput(messageBreakline)
				.then((attachment) => {
					handleFinishUpload(attachment);
				})
				.catch(() => {
					setContent(content + messageBreakline);
				});

			const mentionedUsers = [];
			for (const key in raw.entityMap) {
				const ent = raw.entityMap[key];
				if (ent.type === 'mention') {
					mentionedUsers.push({
						user_id: ent.data.mention.id,
						username: ent.data.mention.name,
					});
				}
			}
			setMentionData(mentionedUsers);
		},
		[attachmentData],
	);

	const onConvertToFiles = useCallback(
		(content: string) => {
			if (content.length > 2000) {
				const fileContent = new Blob([content], { type: 'text/plain' });
				const now = Date.now();
				const filename = now + '.txt';
				const file = new File([fileContent], filename, { type: 'text/plain' });
				const fullfilename = ('' + currentClanId + '/' + currentChannelId).replace(/-/g, '_') + '/' + filename;

				const session = sessionRef.current;
				const client = clientRef.current;

				if (!client || !session || !currentChannelId) {
					throw new Error('Client is not initialized');
				}
				handleUploadFile(client, session, fullfilename, file)
					.then((attachment) => {
						handleFinishUpload(attachment);
						return 'handled';
					})
					.catch((err) => {
						return 'not-handled';
					});
				return;
			}
		},
		[attachmentData],
	);
	const onSearchChange = ({ value }: any) => {
		setSuggestions(defaultSuggestionsFilter(value, listMentions || []) as any);
	};

	const onOpenChange = useCallback((_open: boolean) => {
		setOpen(_open);
	}, []);

	const handleFinishUpload = useCallback(
		(attachment: ApiMessageAttachment) => {
			let urlFile = attachment.url;
			if (attachment.filetype?.indexOf('pdf') !== -1) {
				urlFile = '/assets/images/pdficon.png';
			} else if (attachment.filetype?.indexOf('text') !== -1) {
				urlFile = '/assets/images/text.png';
			} else if (attachment.filetype?.indexOf('vnd.openxmlformats-officedocument.presentationml.presentation') !== -1) {
				urlFile = '/assets/images/pptfile.png';
			} else if (attachment.filetype?.indexOf('mp4') !== -1) {
				urlFile = '/assets/images/video.png';
			}

			const contentState = editorState.getCurrentContent();
			const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
				src: urlFile,
				height: '20px',
				width: 'auto',
				onRemove: () => handleRemove(),
			});
			const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

			const newEditorState = EditorState.push(editorState, contentStateWithEntity, 'insert-fragment');
			const newEditorStateWithImage = EditorState.forceSelection(
				newEditorState,
				newEditorState.getSelection().merge({
					anchorOffset: 0,
					focusOffset: 0,
				}),
			);
			const newStateWithImage = AtomicBlockUtils.insertAtomicBlock(newEditorStateWithImage, entityKey, ' ');
			setEditorState(newStateWithImage);

			attachmentData.push(attachment);
			setAttachmentData(attachmentData);
		},
		[attachmentData, content, editorState],
	);

	const onPastedFiles = useCallback(
		(files: Blob[]) => {
			const now = Date.now();
			const filename = now + '.png';
			const file = new File(files, filename, { type: 'image/png' });
			const fullfilename = ('' + currentClanId + '/' + currentChannelId).replace(/-/g, '_') + '/' + filename;

			const session = sessionRef.current;
			const client = clientRef.current;

			if (!client || !session || !currentChannelId) {
				throw new Error('Client is not initialized');
			}
			handleUploadFile(client, session, fullfilename, file)
				.then((attachment) => {
					handleFinishUpload(attachment);
					return 'handled';
				})
				.catch((err) => {
					return 'not-handled';
				});

			return 'not-handled';
		},
		[attachmentData, clientRef, content, currentChannelId, currentClanId, editorState, sessionRef],
	);

	const handleRemove = () => {
		const currentContentState = editorState.getCurrentContent();
		const newContentState = Modifier.applyEntity(currentContentState, editorState.getSelection(), null);
		const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
		setEditorState(newEditorState);
	};

	const { messageRef, isOpenReply, setIsOpenReply } = useContext(ChatContext);

	useEffect(() => {
		if (messageRef) {
			setReferencesData([
				{
					message_id: '',
					message_ref_id: messageRef.id,
					ref_type: 0,
					message_sender_id: messageRef.sender_id,
					has_attachment: (messageRef.attachments?.length as number) > 0,
					content: JSON.stringify(messageRef.content),
				},
			]);
		}
	}, [messageRef]);

	const handleSend = useCallback(() => {
		// setIsOpenEmojiChatBoxSuggestion(false);
		if (!content.trim() && attachmentData.length === 0 && mentionData.length === 0) {
			return;
		}
		if (isOpenReply) {
			onSend({ t: content }, mentionData, attachmentData, referenceData);
			setContent('');
			setAttachmentData([]);
			setMentionData([]);
			setEditorState(() => EditorState.createEmpty());
			setIsOpenReply(false);
			dispatch(
				channelsActions.setChannelSeenLastSeenMessageId({
					channelId: currentChanel?.id || '',
					channelLastSeenMesageId: messages[0].id ? messages[0].id : '',
				}),
			);
			dispatch(channelsActions.setChannelLastSeenMessageId({ channelId: currentChanel?.id || '', channelLastSentMessageId: messages[0].id }));
		} else {
			onSend({ t: content }, mentionData, attachmentData);
			setContent('');
			setAttachmentData([]);
			setClearEditor(true);
			setEditorState(() => EditorState.createEmpty());
			if (messages.length > 0) {
				dispatch(
					channelsActions.setChannelSeenLastSeenMessageId({ channelId: currentChanel?.id || '', channelLastSeenMesageId: messages[0].id }),
				);
				dispatch(
					channelsActions.setChannelLastSeenMessageId({ channelId: currentChanel?.id || '', channelLastSentMessageId: messages[0].id }),
				);
				const notificationLength = arrayNotication.length;
				const notification = arrayNotication[notificationLength - 1]?.content as NotificationContent;
				const timestamp = notification.update_time?.seconds || '';
				dispatch(channelsActions.setTimestamp({ channelId: currentChanel?.id || '', timestamp: String(timestamp) }));
			}
		}
	}, [content, onSend, mentionData, attachmentData]);

	function keyBindingFn(e: React.KeyboardEvent<Element>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			return 'onsend';
		}
	}

	function handleKeyCommand(command: string) {
		if (command === 'onsend') {
			handleSend();
			return 'handled';
		}

		return 'not-handled';
	}
	const editorRef = useRef<Editor | null>(null);

	// const [showEmojiSuggestion, setIsOpenEmojiChatBoxSuggestion] = useState(false);

	const onFocusEditorState = () => {
		moveSelectionToEnd();
		setTimeout(() => {
			editorRef.current!.focus();
		}, 0);
	};

	const moveSelectionToEnd = () => {
		editorRef.current!.focus();
		const editorContent = editorState.getCurrentContent();
		const editorSelection = editorState.getSelection();
		const updatedSelection = editorSelection.merge({
			anchorKey: editorContent.getLastBlock().getKey(),
			anchorOffset: editorContent.getLastBlock().getText().length,
			focusKey: editorContent.getLastBlock().getKey(),
			focusOffset: editorContent.getLastBlock().getText().length,
		});
		const updatedEditorState = EditorState.forceSelection(editorState, updatedSelection);
		setEditorState(updatedEditorState);
	};

	const { setEmojiPlaceActive, emojiSelectedMess, setMessageRef } = useContext(ChatContext);
	useEffect(() => {
		if (content.length === 0) {
			setShowPlaceHolder(true);
			// setIsOpenEmojiChatBoxSuggestion(false);
		} else setShowPlaceHolder(false);

		if (content.length === 1) {
			moveSelectionToEnd();
		}
	}, [clearEditor, content, emojiSelectedMess]);

	useEffect(() => {
		if (emojiSelectedMess) {
			moveSelectionToEnd();
		}
	}, [emojiSelectedMess]);

	useEffect(() => {
		const editorElement = document.querySelectorAll('[data-offset-key]');
		editorElement[2].classList.add('break-all');
	}, []);

	// const editorDiv = document.getElementById('editor');
	// const editorHeight = editorDiv?.clientHeight;
	// document.documentElement.style.setProperty('--editor-height', (editorHeight && editorHeight - 10) + 'px');
	// document.documentElement.style.setProperty('--bottom-emoji', (editorHeight && editorHeight + 25) + 'px');
	// const { heightEditor, setHeightEditor } = useContext(ChatContext);

	// useEffect(() => {
	// 	setHeightEditor(editorHeight ?? 50);
	// }, [editorHeight]);

	// function handleEmojiClick(clickedEmoji: string) {
	// 	setEditorState((prevEditorState) => {
	// 		const currentContentState = prevEditorState.getCurrentContent();
	// 		const newContentState = Modifier.insertText(currentContentState, prevEditorState.getSelection(), clickedEmoji);
	// 		const newEditorState = EditorState.push(prevEditorState, newContentState, 'insert-characters');
	// 		return newEditorState;
	// 	});
	// }

	const { activeTab, setActiveTab } = useContext(ChatContext);

	const handleOpenGifs = (event: React.MouseEvent<HTMLDivElement>) => {
		setActiveTab(TabNamePopup.GIFS);
		event.stopPropagation();
	};

	const handleOpenStickers = (event: React.MouseEvent<HTMLDivElement>) => {
		setActiveTab(TabNamePopup.STICKERS);
		setMessageRef(undefined);
		event.stopPropagation();
	};

	const handleOpenEmoji = (event: React.MouseEvent<HTMLDivElement>) => {
		setActiveTab(TabNamePopup.EMOJI);
		setEmojiPlaceActive(EmojiPlaces.EMOJI_EDITOR);
		setMessageRef(undefined);
		event.stopPropagation();
	};

	function clickEmojiSuggestion() {
		if (!emojiPicked) {
			return;
		}
		const currentContentState = editorState.getCurrentContent();
		const selectionState = editorState.getSelection();
		const contentText = currentContentState.getPlainText();
		const syntaxEmoji = findSyntaxEmoji(contentText);
		if (!syntaxEmoji) {
			return;
		}
		const updatedContentText = contentText.replace(syntaxEmoji, emojiPicked);
		const newContentState = ContentState.createFromText(updatedContentText);
		const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
		const updatedEditorState = EditorState.forceSelection(newEditorState, selectionState);
		setEditorState(updatedEditorState);
	}

	function findSyntaxEmoji(contentText: string): string | null {
		const regexEmoji = /:[^\s]+(?=$|[\p{Emoji}])/gu;

		const emojiArray = Array.from(contentText.matchAll(regexEmoji), (match) => match[0]);
		if (emojiArray.length > 0) {
			return emojiArray[0];
		}
		return null;
	}

	const [valueSearchEmoji, setValueSearchEmoji] = useState<string>();

	useEffect(() => {
		clickEmojiSuggestion();
	}, [emojiPicked]);

	useEffect(() => {
		setValueSearchEmoji(content);
	}, [content]);

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		const fullfilename = ('' + currentClanId + '/' + currentChannelId).replace(/-/g, '_') + '/' + file?.name;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session || !currentChannelId) {
			throw new Error('Client or file is not initialized');
		}

		handleUploadFile(client, session, fullfilename, file).then((attachment) => {
			handleFinishUpload(attachment);
		});
	};

	useEffect(() => {
		if (isOpenReply) {
			editorRef.current!.focus();
		}
	}, [isOpenReply]);

	const editorElement = document.getElementById('editor');
	useEffect(() => {
		const hasFigure = editorElement?.querySelector('figure');
		const firstChildHasBr = editorElement?.querySelector('br');
		if (hasFigure) {
			if (firstChildHasBr) {
				firstChildHasBr.style.display = 'none';
			}
		}
	}, [editorState]);

	return (
		<div className="relative">
			<EmojiList valueInput={valueSearchEmoji ?? ''} />
			<div className="flex flex-inline w-max-[97%] items-end gap-2 box-content mb-4 bg-black rounded-md relative">
				<label>
					<input
						id="preview_img"
						type="file"
						onChange={(e) => {
							handleFile(e), (e.target.value = '');
						}}
						className="block w-full hidden"
					/>
					<div className="flex flex-row h-6 w-6 items-center justify-center ml-2 mb-2 cursor-pointer">
						<Icons.AddCircle />
					</div>
				</label>

				<div
					className={`w-full bg-black gap-3 flex items-center`}
					onClick={() => {
						editorRef.current!.focus();
					}}
				>
					<div
						className={`w-[96%] bg-black gap-3 relative`}
						onClick={() => {
							editorRef.current!.focus();
						}}
					>
						<div id="editor" className={`p-[10px] items-center text-[15px] break-all min-w-full relative `}>
							<Editor
								keyBindingFn={keyBindingFn}
								handleKeyCommand={handleKeyCommand}
								editorState={clearEditor ? EditorState.createEmpty() : editorState}
								onChange={onChange}
								plugins={plugins}
								ref={editorRef}
								handlePastedFiles={onPastedFiles}
							/>
							{showPlaceHolder && (
								<p className="absolute duration-300 text-gray-300 whitespace-nowrap top-2.5">Write your thoughs here...</p>
							)}
						</div>
					</div>
					<MentionSuggestions open={open} onOpenChange={onOpenChange} onSearchChange={onSearchChange} suggestions={suggestions || []} />

					<div className="flex flex-row h-full items-center gap-1 w-18 mr-3 relative">
						<div onClick={handleOpenGifs} className="cursor-pointer">
							<Icons.Gif defaultFill={`${activeTab === TabNamePopup.GIFS ? '#FFFFFF' : '#AEAEAE'}`} />
						</div>

						<div onClick={handleOpenStickers} className="cursor-pointer">
							<Icons.Sticker defaultFill={`${activeTab === TabNamePopup.STICKERS ? '#FFFFFF' : '#AEAEAE'}`} />
						</div>

						<div onClick={handleOpenEmoji} className="cursor-pointer">
							<Icons.Smile defaultFill={`${activeTab === TabNamePopup.EMOJI ? '#FFFFFF' : '#AEAEAE'}`} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

MessageBox.Skeleton = () => {
	return (
		<div className="self-stretch h-fit px-4 mb-[8px] mt-[8px] flex-col justify-end items-start gap-2 flex overflow-hidden">
			<form className="self-stretch p-4 bg-neutral-950 rounded-lg justify-start gap-2 inline-flex items-center">
				<div className="flex flex-row h-full items-center">
					<div className="flex flex-row  justify-end h-fit">
						<Icons.AddCircle />
					</div>
				</div>

				<div className="grow self-stretch justify-start items-center gap-2 flex">
					<div
						contentEditable
						className="grow text-white text-sm font-['Manrope'] placeholder-[#AEAEAE] h-fit border-none focus:border-none outline-none bg-transparent overflow-y-auto resize-none "
					/>
				</div>
				<div className="flex flex-row h-full items-center gap-1 mr-2 w-12">
					<Icons.Gif />
					<Icons.Help />
				</div>
			</form>
		</div>
	);
};

export default MessageBox;
