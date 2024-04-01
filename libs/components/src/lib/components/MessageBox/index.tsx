import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import createMentionPlugin, { MentionData } from '@draft-js-plugins/mention';
import { EmojiListSuggestion } from '@mezon/components';
import { useChatMessages, useEmojis } from '@mezon/core';
import {
	channelsActions,
	referencesActions,
	selectArrayNotification,
	selectCurrentChannel,
	selectEmojiSelectedMess,
	selectReference,
	useAppDispatch,
} from '@mezon/store';
import { handleUploadFile, handleUrlInput, useMezon } from '@mezon/transport';
import { IMessageSendPayload, NotificationContent } from '@mezon/utils';
import { AtomicBlockUtils, ContentState, EditorState, Modifier, convertToRaw } from 'draft-js';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import * as Icons from '../Icons';
import FileSelectionButton from './FileSelectionButton';
import GifStickerEmojiButtons from './GifsStickerEmojiButtons';
import ImageComponent from './ImageComponet';
import MentionSuggestionWrapper from './MentionSuggestionWrapper';
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

function MessageBox(props: MessageBoxProps): ReactElement {
	const { sessionRef, clientRef } = useMezon();
	const dispatch = useAppDispatch();
	const currentChanel = useSelector(selectCurrentChannel);
	const arrayNotication = useSelector(selectArrayNotification);
	const { messages } = useChatMessages({ channelId: currentChanel?.id || '' });

	const { onSend, onTyping, listMentions, currentChannelId, currentClanId } = props;
	const [editorState, setEditorState] = useState(EditorState.createEmpty());

	const [clearEditor, setClearEditor] = useState(false);
	const [content, setContent] = useState<string>('');
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const [attachmentData, setAttachmentData] = useState<ApiMessageAttachment[]>([]);
	const [showPlaceHolder, setShowPlaceHolder] = useState(false);

	const imagePlugin = createImagePlugin({ imageComponent: ImageComponent });
	const mentionPlugin = useRef(
		createMentionPlugin({
			entityMutability: 'IMMUTABLE',
			theme: editorStyles,
			mentionPrefix: '@',
			supportWhitespace: true,
			mentionTrigger: '@',
		}),
	);

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
				onRemove: () => handleEditorRemove(),
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

	const handleEditorRemove = () => {
		const currentContentState = editorState.getCurrentContent();
		const newContentState = Modifier.applyEntity(currentContentState, editorState.getSelection(), null);
		const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
		setEditorState(newEditorState);
	};

	const refMessage = useSelector(selectReference);

	const handleSend = useCallback(() => {
		if (!content.trim() && attachmentData.length === 0 && mentionData.length === 0) {
			return;
		}

		if (refMessage) {
			onSend({ t: content }, mentionData, attachmentData, refMessage.references);
			setContent('');
			setAttachmentData([]);
			setMentionData([]);
			setEditorState(() => EditorState.createEmpty());
			dispatch(referencesActions.setReference(null));
			dispatch(
				channelsActions.setChannelLastSeenMessageId({
					channelId: currentChanel?.id || '',
					channelLastSeenMesageId: messages[0].id ? messages[0].id : '',
				}),
			);
			dispatch(channelsActions.setChannelLastSentMessageId({ channelId: currentChanel?.id || '', channelLastSentMessageId: messages[0].id }));
		} else {
			onSend({ t: content }, mentionData, attachmentData);
			setContent('');
			setAttachmentData([]);
			setClearEditor(true);
			setEditorState(() => EditorState.createEmpty());
			if (messages.length > 0) {
				dispatch(
					channelsActions.setChannelLastSeenMessageId({ channelId: currentChanel?.id || '', channelLastSeenMesageId: messages[0].id }),
				);
				dispatch(
					channelsActions.setChannelLastSentMessageId({ channelId: currentChanel?.id || '', channelLastSentMessageId: messages[0].id }),
				);
				const notificationLength = arrayNotication.length;
				const notification = arrayNotication[notificationLength - 1]?.content as NotificationContent;
				const timestamp = notification.update_time?.seconds || '';
				dispatch(channelsActions.setTimestamp({ channelId: currentChanel?.id || '', timestamp: String(timestamp) }));
			}
		}
		clearSuggestionEmojiAfterSendMessage();
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

	const onFocusEditorState = () => {
		setTimeout(() => {
			editorRef.current!.focus();
		}, 0);
	};

	const moveSelectionToEnd = useCallback(() => {
		setTimeout(() => {
			editorRef.current!.focus();
		}, 0);
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
	}, [editorState]);

	const emojiSelectedMess = useSelector(selectEmojiSelectedMess);

	useEffect(() => {
		if (content.length === 0) {
			setShowPlaceHolder(true);
		} else setShowPlaceHolder(false);

		if (content.length >= 1) {
			moveSelectionToEnd();
		}
	}, [clearEditor, content]);

	useEffect(() => {
		const editorElement = document.querySelectorAll('[data-offset-key]');
		editorElement[2].classList.add('break-all');
	}, []);

	// please no delete
	const editorDiv = document.getElementById('editor');
	const editorHeight = editorDiv?.clientHeight;
	document.documentElement.style.setProperty('--editor-height', (editorHeight && editorHeight - 10) + 'px');
	document.documentElement.style.setProperty('--bottom-emoji', (editorHeight && editorHeight + 25) + 'px');
	//

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

	const emojiListRef = useRef<HTMLDivElement>(null);
	const {
		isEmojiListShowed,
		emojiPicked,
		isFocusEditor,
		setIsEmojiListShowed,
		setEmojiSuggestion,
		textToSearchEmojiSuggestion,
		setTextToSearchEmojiSuggesion,
		setIsFocusEditorStatus,
	} = useEmojis();

	useEffect(() => {
		clickEmojiSuggestion();
	}, [emojiPicked]);

	useEffect(() => {
		if (content) {
			setTextToSearchEmojiSuggesion(content);
		}
	}, [content]);

	useEffect(() => {
		if (isEmojiListShowed) {
			emojiListRef.current && emojiListRef.current.focus();
		} else {
			onFocusEditorState();
		}
	}, [isEmojiListShowed, textToSearchEmojiSuggestion]);

	const clearSuggestionEmojiAfterSendMessage = () => {
		setIsEmojiListShowed(false);
		setEmojiSuggestion('');
		setTextToSearchEmojiSuggesion('');
		setIsFocusEditorStatus(false);
		setEditorState(() => EditorState.createEmpty());
	};

	useEffect(() => {
		if (isFocusEditor) {
			onFocusEditorState();
		}
	}, [isFocusEditor]);

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
		let newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
		const updatedEditorState = EditorState.forceSelection(newEditorState, selectionState);
		setEditorState(updatedEditorState);
		onFocusEditorState();
	}

	function findSyntaxEmoji(contentText: string): string | null {
		const regexEmoji = /:[^\s]+(?=$|[\p{Emoji}])/gu;
		const emojiArray = Array.from(contentText.matchAll(regexEmoji), (match) => match[0]);
		if (emojiArray.length > 0) {
			return emojiArray[0];
		}
		return null;
	}

	return (
		<div className="relative">
			<EmojiListSuggestion ref={emojiListRef} valueInput={textToSearchEmojiSuggestion ?? ''} />

			<div className="flex flex-inline w-max-[97%] items-end gap-2 box-content mb-4 bg-black rounded-md relative">
				<FileSelectionButton
					currentClanId={currentClanId || ''}
					currentChannelId={currentChannelId || ''}
					onFinishUpload={handleFinishUpload}
				/>

				<div
					className={`w-full bg-black gap-3 flex items-center`}
					onClick={() => {
						editorRef.current!.focus();
					}}
				>
					<div className={`w-[96%] bg-black gap-3 relative`} onClick={onFocusEditorState}>
						<div
							id="editor"
							className={`p-[10px] items-center text-[15px] break-all min-w-full relative `}
							style={{ wordBreak: 'break-word' }}
						>
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
					<MentionSuggestionWrapper mentionPlugin={mentionPlugin.current} listMentions={listMentions} />
					<GifStickerEmojiButtons />
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
