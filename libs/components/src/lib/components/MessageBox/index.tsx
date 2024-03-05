import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import createMentionPlugin, { MentionData, defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { handleUploadFile, handleUrlInput, useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { AtomicBlockUtils, ContentState, EditorState, Modifier, SelectionState, convertToRaw } from 'draft-js';
import { SearchIndex, init } from 'emoji-mart';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
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
	const { onSend, onTyping, listMentions, isOpenEmojiPropOutside, currentChannelId, currentClanId } = props;
	const [editorState, setEditorState] = useState(EditorState.createEmpty());
	const [suggestions, setSuggestions] = useState(listMentions);
	const [clearEditor, setClearEditor] = useState(false);
	const [content, setContent] = useState<string>('');
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const [attachmentData, setAttachmentData] = useState<ApiMessageAttachment[]>([]);
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

	const onChange = useCallback((editorState: EditorState) => {
		if (typeof onTyping === 'function') {
			onTyping();
		}
		setClearEditor(false);
		setEditorState(editorState);
		const contentState = editorState.getCurrentContent();
		const raw = convertToRaw(contentState);
		// get message
		const messageRaw = raw.blocks;
		const messageContent = Object.values(messageRaw).map((item) => item.text);
		const messageBreakline = messageContent.join('\n').replace(/,/g, '');

		if (messageBreakline.length > 2000) {
			setContent('Message too long. @TODO: convert it to attachment');
			return;
		}

		handleUrlInput(messageBreakline).then((attachment) => {
			handleFinishUpload(attachment);
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
		setContent(content + messageBreakline);
		setMentionData(mentionedUsers);
	}, []);

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
			}

			const contentState = editorState.getCurrentContent();
			const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
				src: urlFile,
				height: '20px',
				width: 'auto',
				onRemove: (key: string) => handleRemove(key),
			});
			const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
			const newEditorState = EditorState.set(editorState, {
				currentContent: contentStateWithEntity,
			});
			setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
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

			if (!client || !session || !currentClanId) {
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

			setEditorState(() => EditorState.createWithContent(ContentState.createFromText('Uploading...')));

			return 'not-handled';
		},
		[attachmentData, clientRef, content, currentChannelId, currentClanId, editorState, sessionRef],
	);

	const handleRemove = (keyToRemove: string) => {
		const currentContentState = editorState.getCurrentContent();
		const newContentState = Modifier.applyEntity(currentContentState, editorState.getSelection(), null);
		const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
		setEditorState(newEditorState);
	};

	const handleSend = useCallback(() => {
		setShowEmojiSuggestion(false);
		if (!content.trim() && !attachmentData && !mentionData) {
			return;
		}

		onSend({ t: content }, mentionData, attachmentData);
		setContent('');
		setAttachmentData([]);
		setClearEditor(true);
		setSelectedItemIndex(0);
		liRefs?.current[selectedItemIndex]?.focus();
		setEditorState(() => EditorState.createEmpty());
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

	const [showEmojiSuggestion, setShowEmojiSuggestion] = useState(false);

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
	const [selectionToEnd, setSelectionToEnd] = useState(false);

	useEffect(() => {
		if (content.length === 0) {
			setShowPlaceHolder(true);
			setShowEmojiSuggestion(false);
		} else setShowPlaceHolder(false);

		if (content.length >= 0) {
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
		}
	}, [clearEditor, content, showEmojiSuggestion]);

	useEffect(() => {
		const editorElement = document.querySelectorAll('[data-offset-key]');
		editorElement[2].classList.add('break-all');
	}, []);

	const editorDiv = document.getElementById('editor');
	const editorHeight = editorDiv?.clientHeight;
	document.documentElement.style.setProperty('--editor-height', (editorHeight && editorHeight - 10) + 'px');
	document.documentElement.style.setProperty('--bottom-emoji', (editorHeight && editorHeight + 25) + 'px');

	function handleEmojiClick(clickedEmoji: string) {
		setEditorState((prevEditorState) => {
			const currentContentState = prevEditorState.getCurrentContent();
			const newContentState = Modifier.insertText(currentContentState, prevEditorState.getSelection(), clickedEmoji);
			const newEditorState = EditorState.push(prevEditorState, newContentState, 'insert-characters');
			return newEditorState;
		});
	}
	const [isShowEmoji, setShowEmoji] = useState<boolean>(false);
	const handleOpenEmoji = () => {
		setShowEmoji(!isShowEmoji);
		if (isOpenEmojiPropOutside && isShowEmoji) {
			setShowEmoji(true);
		}
	};

	useEffect(() => {
		if (isOpenEmojiPropOutside && isShowEmoji) {
			setShowEmoji(true);
		}
		if (!isOpenEmojiPropOutside && isShowEmoji) {
			setShowEmoji(false);
		}
	}, [isOpenEmojiPropOutside]);

	function EmojiReaction() {
		const handleEmojiSelect = (emoji: any) => {
			setShowPlaceHolder(false);
			setShowEmoji(false);
			handleEmojiClick(emoji.native);
		};
		return <Picker data={data} onEmojiSelect={handleEmojiSelect} />;
	}

	const [emojiResult, setEmojiResult] = useState<string[]>([]);

	function clickEmojiSuggestion(emoji: string, index: number) {
		setSelectedItemIndex(index);
		handleEmojiClick(emoji);
		setEditorState((prevEditorState) => {
			const currentContentState = prevEditorState.getCurrentContent();
			const raw = convertToRaw(currentContentState);
			const messageRaw = raw.blocks;
			const emojiPicker = messageRaw[0].text.toString();
			const regexEmoji = /:[^\s]+(?=$|[\p{Emoji}])/gu;
			const emojiArray = Array.from(emojiPicker.matchAll(regexEmoji), (match) => match[0]);
			const lastEmoji = emojiArray[0]?.slice(syntax.length);
			const blockMap = editorState.getCurrentContent().getBlockMap();
			const selectionsToReplace: SelectionState[] = [];
			const findWithRegex = (regex: RegExp, contentBlock: Draft.ContentBlock | undefined, callback: (start: number, end: number) => void) => {
				const text = contentBlock?.getText() || '';
				let matchArr, start, end;
				while ((matchArr = regex.exec(text)) !== null) {
					start = matchArr.index;
					end = start + matchArr[0].length;
					callback(start, end);
				}
			};

			blockMap.forEach((contentBlock) => {
				findWithRegex(regexEmoji, contentBlock, (start: number, end: number) => {
					const blockKey = contentBlock?.getKey();
					const blockSelection = SelectionState.createEmpty(blockKey ?? '').merge({
						anchorOffset: start,
						focusOffset: end,
					});

					selectionsToReplace.push(blockSelection);
				});
			});
			let contentState = editorState.getCurrentContent();
			selectionsToReplace.forEach((selectionState: SelectionState) => {
				contentState = Modifier.replaceText(contentState, selectionState, lastEmoji ?? '�️');
			});
			const newEditorState = EditorState.push(prevEditorState, contentState, 'insert-characters');

			return newEditorState;
		});
	}
	const [syntax, setSyntax] = useState<string>('');
	const regexDetect = /:[^\s]{2,}/;
	const handleDetectEmoji = async (value: string) => {
		const inputValue = value;
		if (!regexDetect.test(inputValue)) {
			setEmojiResult([]);
			setShowEmojiSuggestion(false);
			return;
		}
		const matches = regexDetect.exec(inputValue)?.[0];

		matches && setSyntax(matches);
		const emojiPickerActive = matches?.startsWith(':');
		const lastEmojiIdx = emojiPickerActive ? inputValue.lastIndexOf(':') : null;
		const emojiSearch = emojiPickerActive ? inputValue.slice(Number(lastEmojiIdx)) : null;
		const emojiSearchWithOutPrefix = emojiSearch?.slice(1);
		let emojiResults = (await SearchIndex.search(emojiSearch)) || [];
		if (emojiResults.length === 0) {
			emojiResults = await SearchIndex.search(emojiSearchWithOutPrefix);
		}

		const results =
			emojiResults.map((emoji: any) => {
				return emoji.skins[0];
			}) || [];
		if (results) {
			setShowPlaceHolder(false);
			setEmojiResult(results);
			moveSelectionToEnd();
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent, native: string) => {
		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				setSelectedItemIndex((prevIndex) => Math.min(liRefs.current.length - 1, prevIndex - 1));
				liRefs?.current[selectedItemIndex]?.focus();
				setClicked(!clicked);
				break;
			case 'ArrowDown':
				e.preventDefault();
				setSelectedItemIndex((prevIndex) => Math.min(liRefs.current.length - 1, prevIndex + 1));
				liRefs?.current[selectedItemIndex]?.focus();
				setClicked(!clicked);
				break;
			case 'Enter':
				clickEmojiSuggestion(native as string, selectedItemIndex);
				setTimeout(() => {
					editorRef.current!.focus();
				}, 0);
				break;
			case 'Escape':
				setShowEmojiSuggestion(false);
				setEmojiResult([]);
				break;
			case 'Backscape':
				setShowEmojiSuggestion(false);
				setTimeout(() => {
					editorRef.current!.focus();
				}, 0);
				moveSelectionToEnd();
				break;
			default:
				editorRef.current!.focus();
				setSelectionToEnd(!selectionToEnd);
				break;
		}
	};

	const [selectedItemIndex, setSelectedItemIndex] = useState(0);
	const liRefs = useRef<(HTMLLIElement | null)[]>([]);
	const ulRef = useRef<HTMLUListElement | null>(null);
	const [clicked, setClicked] = useState<boolean>(false);
	useEffect(() => {
		if (liRefs.current[selectedItemIndex]) {
			liRefs?.current[selectedItemIndex]?.focus();
		}

		emojiResult.length > 0 ? setShowEmojiSuggestion(true) : setShowEmojiSuggestion(false);
	}, [showEmojiSuggestion, emojiResult, syntax]);

	useEffect(() => {
		handleDetectEmoji(content);
		liRefs?.current[selectedItemIndex]?.focus();
	}, [content]);

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		const fullfilename = ('' + currentClanId + '/' + currentChannelId).replace(/-/g, '_') + '/' + file?.name;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session || !currentClanId) {
			throw new Error('Client or file is not initialized');
		}

		handleUploadFile(client, session, fullfilename, file).then((attachment) => {
			handleFinishUpload(attachment);
		});
	};

	return (
		<div className="flex flex-inline w-max-[97%] items-end gap-2 box-content m-4 mr-4 mb-4 bg-black rounded-md pr-2 relative">
			{showEmojiSuggestion && (
				<div tabIndex={1} id="content" className="absolute bottom-[150%] bg-black rounded w-[400px] flex justify-center flex-col">
					<p className=" text-center p-2">Emoji Matching: {syntax}</p>
					<div className={`${emojiResult?.length > 0} ? 'p-2' : '' w-[100%] h-[400px] overflow-y-auto hide-scrollbar`}>
						<ul
							ref={ulRef}
							className="w-full flex flex-col"
							onKeyDown={(e) => {
								if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
									e.preventDefault();
								}
							}}
						>
							{emojiResult?.map((emoji: any, index: number) => (
								<li
									ref={(el) => (liRefs.current[index] = el)}
									key={emoji.shortcodes}
									onKeyDown={(e) => handleKeyPress(e, emoji.native)}
									onClick={() => clickEmojiSuggestion(emoji.native, index)}
									className={`hover:bg-gray-900 p-2 cursor-pointer focus:bg-gray-900 focus:outline-none focus:p-2 ${
										selectedItemIndex === index ? 'selected-item' : ''
									}`}
									tabIndex={0}
								>
									{emoji.native} {emoji.shortcodes}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
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
					{showPlaceHolder && <p className="absolute duration-300 text-gray-300 whitespace-nowrap top-2.5">Write your thoughs here...</p>}
				</div>

				<MentionSuggestions open={open} onOpenChange={onOpenChange} onSearchChange={onSearchChange} suggestions={suggestions || []} />
			</div>

			<div className="flex flex-row h-full items-center gap-1 w-18 mb-3">
				<Icons.Gif />
				<Icons.Help />
				<button onClick={handleOpenEmoji}>
					<Icons.Emoji defaultFill={isShowEmoji ? '#FFFFFF' : '#AEAEAE'} />
				</button>
			</div>
			{isShowEmoji && (
				<div className="absolute right-4 bottom-[--bottom-emoji] z-20">
					<EmojiReaction />
				</div>
			)}
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
