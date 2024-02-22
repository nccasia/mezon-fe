import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { MentionData, defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import { EditorState, convertToRaw } from 'draft-js';
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageBoxProps } from '.';
import * as Icons from '../Icons';
import mentionsStyles from '../MentionMessage/MentionsStyles.module.css';

export function MessageBox(props: MessageBoxProps): ReactElement {
	const onSearchChange = useCallback(
		({ value }: { value: string }) => {
			setSuggestions(defaultSuggestionsFilter(value, props.memberList ?? []));
		},
		[props.memberList],
	);
	const ref = useRef<Editor>(null);
	const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
	const [open, setOpen] = useState(false);
	const { MentionSuggestions, plugins } = useMemo(() => {
		const mentionPlugin = createMentionPlugin({
			entityMutability: 'IMMUTABLE',
			theme: mentionsStyles,
			// mentionPrefix: '@',
			supportWhitespace: true,
		});
		const { MentionSuggestions } = mentionPlugin;
		const plugins = [mentionPlugin];
		return { plugins, MentionSuggestions };
	}, []);
	const [suggestions, setSuggestions] = useState<MentionData[]>(props.memberList ?? []);
	const [userMentioned, setUserMentioned] = useState<string[]>([]);
	const { onSend, onTyping } = props;

	const onChange = useCallback(
		(editorState: EditorState) => {
			if (typeof onTyping === 'function') {
				onTyping();
			}
			setEditorState(editorState);
			const contentState = editorState.getCurrentContent();
			const contentRaw = convertToRaw(contentState).blocks;
			const content = Object.values(contentRaw).map((item) => item.text);
			const contentBreakLine = content.join('\n').replace(/,/g, '');
			const mentionedRaw = convertToRaw(contentState).entityMap;
			const mentioned = Object.values(mentionedRaw).map((item) => item.data.mention?.id);
			setContent(contentBreakLine);
			setUserMentioned(mentioned);
		},
		[onTyping],
	);

	const onOpenChange = useCallback((_open: boolean) => {
		setOpen(_open);
	}, []);

	const [content, setContent] = useState('');
	const [showPlaceHolder, setShowPlaceHolder] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const handleSend = useCallback(() => {
		if (!content.trim()) {
			return;
		}
		onSend({ text: content, mentioned: userMentioned });
		setEditorState(() => EditorState.createEmpty());
		setContent('');
	}, [content, onSend, userMentioned]);

	// const checkSelectionCursor = () => {
	// 	if (content === '@') {
	// 		const updatedEditorState = EditorState.moveFocusToEnd(editorState);
	// 		setEditorState(updatedEditorState);
	// 	} else setEditorState(editorState);
	// 	if (content.length === 0) {
	// 		setShowPlaceHolder(true);
	// 	} else setShowPlaceHolder(false);
	// };
	const checkSelectionCursor = useCallback(() => {
		if (content === '@') {
			const updatedEditorState = EditorState.moveFocusToEnd(editorState);
			setEditorState(updatedEditorState);
		} else setEditorState(editorState);
		if (content.length === 0) {
			setShowPlaceHolder(true);
		} else setShowPlaceHolder(false);
	}, [content]);

	useEffect(() => {
		console.log('dfdfdfdf');
		checkSelectionCursor();
	}, [refresh, content]);

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

	return (
		<div className="flex w-full items-center relative">
			<div className="flex flex-inline w-full items-center gap-2 box-content m-4 mr-4 mb-4 bg-black rounded-md pr-2">
				<div className="flex flex-row h-6 w-6 items-center justify-center ml-2">
					<Icons.AddCircle />
				</div>

				<div
					className={`w-[96%] bg-black gap-3`}
					onClick={() => {
						ref.current!.focus();
					}}
				>
					<div className="p-[10px] flex items-center text-[15px]">
						<Editor
							editorKey={'editor'}
							editorState={editorState}
							onChange={onChange}
							plugins={plugins}
							ref={ref}
							keyBindingFn={keyBindingFn}
							handleKeyCommand={handleKeyCommand}
						/>
						{showPlaceHolder && <p className="absolute duration-300 text-gray-300">Write your thoughs here...</p>}
					</div>
					<div className="absolute w-[90%] box-border bottom-[100%] bg-black rounded-md ">
						<MentionSuggestions
							open={open}
							onOpenChange={onOpenChange}
							suggestions={props.memberList ?? []}
							onSearchChange={onSearchChange}
							popoverContainer={({ children }: any) => <div>{children}</div>}
						/>
					</div>
				</div>

				<div className="flex flex-row h-full items-center gap-1 w-12">
					<Icons.Gif />
					<Icons.Help />
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
