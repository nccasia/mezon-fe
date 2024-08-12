import { AttachmentLoading, AttachmentPreviewThumbnail, MentionReactInput } from '@mezon/components';
import {
	messagesActions,
	referencesActions,
	selectAttachmentData,
	selectCloseMenu,
	selectStatusLoadingAttachment,
	selectStatusMenu,
	selectTheme,
	useAppDispatch,
} from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { IMessageSendPayload, MIN_THRESHOLD_CHARS, MentionDataProps, ThreadValue, typeConverts } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { Fragment, ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../../../../../ui/src/lib/Icons';
import FileSelectionButton from './FileSelectionButton';

export type MessageBoxProps = {
	readonly onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
		value?: ThreadValue,
		anonymous?: boolean,
		mentionEveryone?: boolean,
	) => void;
	readonly onTyping?: () => void;
	readonly listMentions?: MentionDataProps[];
	readonly currentChannelId?: string;
	readonly currentClanId?: string;
	readonly mode?: number;
};

function MessageBox(props: MessageBoxProps): ReactElement {
	const dispatch = useAppDispatch();
	const { sessionRef, clientRef } = useMezon();
	const { currentChannelId, currentClanId } = props;
	const attachmentDataRef = useSelector(selectAttachmentData(currentChannelId || ''));
	const statusLoadingAttachment = useSelector(selectStatusLoadingAttachment);
	const appearanceTheme = useSelector(selectTheme);

	const onConvertToFiles = useCallback((content: string) => {
		if (content.length > MIN_THRESHOLD_CHARS) {
			const fileContent = new Blob([content], { type: 'text/plain' });
			const now = Date.now();
			const filename = now + '.txt';
			const file = new File([fileContent], filename, { type: 'text/plain' });

			const session = sessionRef.current;
			const client = clientRef.current;

			if (!client || !session || !currentChannelId) {
				throw new Error('Client is not initialized');
			}
			handleUploadFile(client, session, currentClanId || '', currentChannelId || '', filename, file)
				.then((attachment) => {
					handleFinishUpload(attachment);
					return 'handled';
				})
				.catch((err) => {
					return 'not-handled';
				});
		}
	}, []);

	const handleFinishUpload = useCallback(
		async (attachment: ApiMessageAttachment) => {
			typeConverts.map((typeConvert) => {
				if (typeConvert.type === attachment.filetype) {
					return (attachment.filetype = typeConvert.typeConvert);
				}
			});
			dispatch(messagesActions.setIsFocused(true));
			dispatch(referencesActions.setAttachmentData({ channelId: currentChannelId || '', attachments: [attachment] }));
		},
		[currentChannelId],
	);

	const removeAttachmentByUrl = (urlToRemove: string) => {
		dispatch(referencesActions.removeAttachment({ channelId: currentChannelId || '', urlAttachment: urlToRemove }));
	};

	const onPastedFiles = useCallback(
		(event: React.ClipboardEvent<HTMLDivElement>) => {
			const items = (event.clipboardData || (window as any).clipboardData).items;
			const files: Blob[] = [];
			if (items) {
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.indexOf('image') !== -1) {
						const file = items[i].getAsFile();
						if (file) {
							files.push(file);
						}
					}
				}

				if (files.length > 0) {
					const blob = new Blob(files, { type: files[0].type });
					const filename = Date.now() + '.png';
					const file = new File([blob], filename, { type: blob.type });
					const session = sessionRef.current;
					const client = clientRef.current;

					if (!client || !session || !currentChannelId) {
						throw new Error('Client is not initialized');
					}

					handleUploadFile(client, session, currentClanId || '', currentChannelId || '', filename, file)
						.then((attachment) => {
							handleFinishUpload(attachment);
							files.length = 0;
							navigator.clipboard
								.writeText('')
								.then(() => {})
								.catch((error) => {
									console.error('Failed to clear clipboard:', error);
								});
							return 'handled';
						})
						.catch((err) => {
							console.error('Error uploading file:', err);
							files.length = 0;
							navigator.clipboard
								.writeText('')
								.then(() => {})
								.catch((error) => {
									console.error('Failed to clear clipboard:', error);
								});
							return 'not-handled';
						});

					return 'not-handled';
				}
			}
		},
		[attachmentDataRef, clientRef, currentChannelId, currentClanId, sessionRef, props.mode],
	);

	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const handleChildContextMenu = (event: React.MouseEvent) => {
		event.stopPropagation();
	};

	return (
		<div className="relative max-sm:-pb-2  ">
			<div
				className={`${attachmentDataRef.length > 0 || statusLoadingAttachment ? 'px-3 pb-1 pt-5 rounded-t-lg border-b-[1px] dark:border-[#42444B] border-borderLightTabs' : ''} dark:bg-channelTextarea bg-channelTextareaLight max-h-full`}
			>
				<div
					className={`max-h-full flex gap-6 overflow-y-hidden overflow-x-auto attachment-scroll  ${appearanceTheme === 'light' ? 'attachment-scroll-light' : ''}`}
				>
					{attachmentDataRef?.map((item: ApiMessageAttachment, index: number) => {
						return (
							<Fragment key={index}>
								<AttachmentPreviewThumbnail attachment={item} onRemove={removeAttachmentByUrl} />
							</Fragment>
						);
					})}
					{statusLoadingAttachment && <AttachmentLoading />}
				</div>
			</div>

			<div
				className={`flex flex-inline items-start gap-2 box-content mb-4 max-sm:mb-0
				 dark:bg-channelTextarea bg-channelTextareaLight rounded-lg relative ${attachmentDataRef.length > 0 ? 'rounded-t-none' : 'rounded-t-lg'}
				  ${closeMenu && !statusMenu ? 'max-w-wrappBoxChatViewMobile' : 'w-wrappBoxChatView'}`}
			>
				<FileSelectionButton
					currentClanId={currentClanId || ''}
					currentChannelId={currentChannelId || ''}
					onFinishUpload={handleFinishUpload}
				/>

				<div className={`w-full dark:bg-channelTextarea bg-channelTextareaLight gap-3 flex items-center rounded-e-md `}>
					<div
						className={`w-full rounded-r-lg dark:bg-channelTextarea bg-channelTextareaLight gap-3 relative whitespace-pre-wrap`}
						onContextMenu={handleChildContextMenu}
					>
						<MentionReactInput
							handlePaste={onPastedFiles}
							listMentions={props.listMentions}
							onSend={props.onSend}
							onTyping={props.onTyping}
							currentChannelId={props.currentChannelId ?? ''}
							handleConvertToFile={onConvertToFiles}
							currentClanId={currentClanId}
							mode={props.mode}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

MessageBox.Skeleton = () => {
	return (
		<div className="self-stretch h-fit px-4 mb-[8px] mt-[8px] flex-col justify-end items-start gap-2 flex overflow-visible">
			<form className="self-stretch p-4 dark:bg-neutral-950 bg-bgLightSecondary rounded-lg justify-start gap-2 inline-flex items-center">
				<div className="flex flex-row h-full items-center">
					<div className="flex flex-row  justify-end h-fit">
						<Icons.AddCircle />
					</div>
				</div>

				<div className="grow self-stretch justify-start items-center gap-2 flex">
					<div
						contentEditable
						className="grow text-sm placeholder-[#AEAEAE] h-fit border-none focus:border-none outline-none bg-transparent overflow-y-auto resize-none dark:text-textDarkTheme text-textLightTheme"
					/>
				</div>
				<div className="flex flex-row h-full items-center gap-1 mr-2 w-12 rounded-r-lg">
					<Icons.Gif />
					<Icons.Help />
				</div>
			</form>
		</div>
	);
};

export default MessageBox;
