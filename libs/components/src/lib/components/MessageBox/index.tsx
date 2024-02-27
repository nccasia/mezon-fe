import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { MentionData, defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import { EditorState, Modifier, convertToRaw } from 'draft-js';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import * as Icons from '../Icons';

import createImagePlugin from '@draft-js-plugins/image';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { selectCurrentChannelId, selectCurrentClanId } from '@mezon/store';
import { uploadImageToMinIO } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { AtomicBlockUtils, ContentState } from 'draft-js';
import { useSelector } from 'react-redux';
import editorStyles from './editorStyles.module.css';

export type MessageBoxProps = {
	onSend: (mes: IMessageSendPayload) => void;
	onTyping?: () => void;
	listMentions?: MentionData[] | undefined;
};

function MessageBox(props: MessageBoxProps): ReactElement {
	const { onSend, onTyping, listMentions } = props;
	const [editorState, setEditorState] = useState(EditorState.createEmpty());
	const [suggestions, setSuggestions] = useState(listMentions);
	const [clearEditor, setClearEditor] = useState(false);
	const [content, setContent] = useState<string>('');
	const [userMentioned, setUserMentioned] = useState<string[]>([]);
	const [showPlaceHolder, setShowPlaceHolder] = useState(false);
	const [open, setOpen] = useState(false);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const mentionPlugin = useRef(
		createMentionPlugin({
			entityMutability: 'IMMUTABLE',
			theme: editorStyles,
			mentionPrefix: '@',
			supportWhitespace: true,
			mentionTrigger: '@',
		}),
	).current;
	const { MentionSuggestions } = mentionPlugin;
	const imagePlugin = createImagePlugin();
	const plugins = [mentionPlugin, imagePlugin];

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
			const messageContent = Object.values(messageRaw).map((item) => item.text);
			const messageBreakline = messageContent.join('\n').replace(/,/g, '');
			let mentionedUsers = [];
			for (let key in raw.entityMap) {
				const ent = raw.entityMap[key];
				if (ent.type === 'mention') {
					mentionedUsers.push(ent.data.mention);
				}
			}
			setContent(messageBreakline);
			setUserMentioned(mentionedUsers);
		},
		[onTyping],
	);

	const onSearchChange = ({ value }: any) => {
		setSuggestions(defaultSuggestionsFilter(value, listMentions || []) as any);
	};

	const onOpenChange = useCallback((_open: boolean) => {
		setOpen(_open);
	}, []);

	const onPastedFiles = useCallback((files: Blob[]) => {
		const file = new File(files, "upload.png", { type: "image/png" });
		const now = Date.now();
		const bucket = "mezon";
		const filename = (''+ currentClanId + '/' + currentChannelId).replace(/-/g, '_') + '/' + (now + file.type).replace('image/', '.');
		const metaData = {
			'Content-Type': 'image/png',
			'Content-Language': file.size,
		  };
		file.arrayBuffer().then((buf) => {			
			// upload to minio
			uploadImageToMinIO(bucket, filename, Buffer.from(buf), file.size, metaData, (err, etag) => {
				if (err) {
					console.log("err", err);
					return 'not-handled';
				}
				const url = 'https://cdn.mezon.vn/' + filename;
				const contentState = editorState.getCurrentContent();
				const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', {
					src: url,
					height: '20px',
					width: 'auto',
				});
				const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
				const newEditorState = EditorState.set(editorState, {
					currentContent: contentStateWithEntity,
				});

				setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
				setContent(url);
				return 'handled';
			});
		});

		setEditorState(() => EditorState.createWithContent(ContentState.createFromText('Uploading...')));
		return 'not-handled';
	}, [currentChannelId, currentClanId, editorState]);

	const handleSend = useCallback(() => {
		if (!content.trim()) {
			return;
		}
		const msg = userMentioned.length > 0 ? { t: content, m: userMentioned } : { t: content };
		onSend(msg);
		setContent('');
		setClearEditor(true);
	}, [content, onSend, userMentioned]);

	function keyBindingFn(e: React.KeyboardEvent<Element>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			return 'onsend';
		}
		return;
	}

	function handleKeyCommand(command: string) {
		if (command === 'onsend') {
			handleSend();
			return 'handled';
		}
		return 'not-handled';
	}
	const editorRef = useRef<Editor | null>(null);
	useEffect(() => {
		if (editorRef.current && clearEditor) {
			setTimeout(() => {
				editorRef.current!.focus();
			}, 0);
		}
		if (content.length === 0) {
			setShowPlaceHolder(true);
		} else setShowPlaceHolder(false);
	}, [clearEditor, content]);

	const editorDiv = document.getElementById('editor');
	const editorHeight = editorDiv?.clientHeight;
	document.documentElement.style.setProperty('--editor-height', (editorHeight && editorHeight - 10) + 'px');
	document.documentElement.style.setProperty('--bottom-emoji', (editorHeight && editorHeight + 25) + 'px');

	const [isShowEmoji, setShowEmoji] = useState(false);

	const handleOpenEmoji = () => {
		setShowEmoji(!isShowEmoji);
	};

	function EmojiReaction() {
		const handleEmojiSelect = (emoji: any) => {
			setShowPlaceHolder(false);
			setEditorState((prevEditorState) => {
				const currentContentState = prevEditorState.getCurrentContent();
				const newContentState = Modifier.insertText(currentContentState, prevEditorState.getSelection(), emoji.native);
				return EditorState.push(prevEditorState, newContentState, 'insert-characters');
			});
		};

		return <Picker data={data} onEmojiSelect={handleEmojiSelect} />;
	}

	return (
		<div className="flex flex-inline w-max-[97%] items-center gap-2 box-content mt-3 mx-4 mb-5 bg-black rounded-md pr-2">
			<div className="flex flex-row h-6 w-6 items-center justify-center ml-2">
				<Icons.AddCircle />
			</div>

			<div
				className={`w-[96%] bg-black gap-3 relative`}
				onClick={() => {
					editorRef.current!.focus();
				}}
			>
				<div id="editor" className="p-[10px] flex items-center text-[15px]">
					<Editor
						keyBindingFn={keyBindingFn}
						handleKeyCommand={handleKeyCommand}
						editorState={clearEditor ? EditorState.createEmpty() : editorState}
						onChange={onChange}
						plugins={plugins}
						ref={editorRef}
						handlePastedFiles={onPastedFiles}
					/>
					{showPlaceHolder && <p className="absolute duration-300 text-gray-300 whitespace-nowrap">Write your thoughs here...</p>}
				</div>

				<MentionSuggestions open={open} onOpenChange={onOpenChange} onSearchChange={onSearchChange} suggestions={suggestions || []} />
			</div>

			<div className="flex flex-row h-full items-center gap-1 w-18">
				<Icons.Gif />
				<Icons.Help />
				<button onClick={handleOpenEmoji}>
					<Icons.Emoji />
				</button>
			</div>
			{isShowEmoji && (
				<div className="absolute right-4 bottom-[--bottom-emoji]">
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
