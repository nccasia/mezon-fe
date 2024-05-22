import { AttachmentPreviewThumbnail, MentionReactInput } from '@mezon/components';
import { useMenu, useReference } from '@mezon/core';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { IMessageSendPayload, MIN_THRESHOLD_CHARS, MentionDataProps, SubPanelName, ThreadValue } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { Fragment, ReactElement, useCallback } from 'react';
import * as Icons from '../Icons';
import FileSelectionButton from './FileSelectionButton';
import GifStickerEmojiButtons from './GifsStickerEmojiButtons';

export type MessageBoxProps = {
	readonly onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
		value?: ThreadValue,
		anonymous?: boolean,
	) => void;
	readonly onTyping?: () => void;
	readonly listMentions?: MentionDataProps[];
	readonly currentChannelId?: string;
	readonly currentClanId?: string;
};

function MessageBox(props: MessageBoxProps): ReactElement {
	const { sessionRef, clientRef } = useMezon();
	const { currentChannelId, currentClanId } = props;
	const { attachmentDataRef, setAttachmentData } = useReference();

	const onConvertToFiles = useCallback((content: string) => {
		if (content.length > MIN_THRESHOLD_CHARS) {
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
		}
	}, []);

	const handleFinishUpload = useCallback((attachment: ApiMessageAttachment) => {
		setAttachmentData(attachment);
	}, []);

	function removeAttachmentByUrl(urlToRemove: string) {
		const removedAttachment: ApiMessageAttachment[] = attachmentDataRef.reduce(
			(acc: ApiMessageAttachment[], attachment: ApiMessageAttachment) => {
				if (attachment.url !== urlToRemove) {
					acc.push(attachment);
				}
				return acc;
			},
			[],
		);
		setAttachmentData(removedAttachment);
	}

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

					return 'not-handled';
				}
			}
		},
		[attachmentDataRef, clientRef, currentChannelId, currentClanId, sessionRef],
	);

	const { closeMenu, statusMenu, isShowMemberList } = useMenu();
	return (
		<div className="relative">
			<div
				className={`w-wrappBoxChatView max-w-wrappBoxChatView ssm:max-w-wrappBoxChatViewMobile ${attachmentDataRef.length > 0 ? 'px-3 pb-1 pt-5 rounded-t-lg border-b-[1px] border-[#42444B]' : ''} dark:bg-channelTextarea bg-bgLightMode max-h-full`}
			>
				<div className={`max-h-full flex gap-2 overflow-y-hidden overflow-x-auto attachment-scroll`}>
					{attachmentDataRef.map((item: ApiMessageAttachment, index: number) => {
						return (
							<Fragment key={index}>
								<AttachmentPreviewThumbnail attachment={item} onRemove={removeAttachmentByUrl} />
							</Fragment>
						);
					})}
				</div>
			</div>

			<div
				className={`flex flex-inline items-center gap-2 box-content mb-4 dark:bg-channelTextarea bg-bgLightMode rounded-lg relative ${attachmentDataRef.length > 0 ? 'rounded-t-none' : 'rounded-t-lg'} ${closeMenu && !statusMenu ? 'max-w-wrappBoxChatViewMobile' : 'w-wrappBoxChatView'}`}
			>
				<FileSelectionButton
					currentClanId={currentClanId || ''}
					currentChannelId={currentChannelId || ''}
					onFinishUpload={handleFinishUpload}
				/>

				<div className={`w-full dark:bg-channelTextarea bg-bgLightMode gap-3 flex items-center rounded-e-md`}>
					<div className={`w-[96%] bg-black gap-3 relative whitespace-pre-wrap`}>
						<MentionReactInput
							handlePaste={onPastedFiles}
							listMentions={props.listMentions}
							onSend={props.onSend}
							onTyping={props.onTyping}
							currentChannelId={props.currentChannelId ?? ''}
							handleConvertToFile={onConvertToFiles}
							currentClanId={currentClanId}
						/>
					</div>
					<GifStickerEmojiButtons activeTab={SubPanelName.NONE} />
					
				</div>
			</div>
		</div>
	);
}

MessageBox.Skeleton = () => {
	return (
		<div className="self-stretch h-fit px-4 mb-[8px] mt-[8px] flex-col justify-end items-start gap-2 flex overflow-visible">
			<form className="self-stretch p-4 bg-neutral-950 rounded-lg justify-start gap-2 inline-flex items-center">
				<div className="flex flex-row h-full items-center">
					<div className="flex flex-row  justify-end h-fit">
						<Icons.AddCircle />
					</div>
				</div>

				<div className="grow self-stretch justify-start items-center gap-2 flex">
					<div
						contentEditable
						className="grow text-white text-sm placeholder-[#AEAEAE] h-fit border-none focus:border-none outline-none bg-transparent overflow-y-auto resize-none "
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
