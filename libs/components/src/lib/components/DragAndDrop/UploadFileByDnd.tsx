import { useDragAndDrop, useReference } from '@mezon/core';
import { selectCurrentChannelId, selectCurrentClanId } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { DragEvent } from 'react';
import { useSelector } from 'react-redux';
import DragAndDropUI from './DragAndDropUI';

function FileUploadByDnD() {
	const { setDraggingState } = useDragAndDrop();
	const { setAttachmentData, setStatusLoadingAttachment } = useReference();
	const { sessionRef, clientRef } = useMezon();
	
	const currentClanId = useSelector(selectCurrentClanId) || '';
	const currentChannelId = useSelector(selectCurrentChannelId) || '';

	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(true);
	};

	const handleDragOver = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragLeave = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(false);
	};

	const handleDrop = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDraggingState(false);
		setStatusLoadingAttachment(true);
		const files = e.dataTransfer.files;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!files || !client || !session || !currentChannelId) {
			throw new Error('Client or files are not initialized');
		}

		const promises = Array.from(files).map((file) => {
			return handleUploadFile(client, session, currentClanId, currentChannelId, file.name, file);
		});
		Promise.all(promises).then((attachments) => {
			attachments.forEach((attachment) => setAttachmentData(attachment));
		}).then(() => {
			setStatusLoadingAttachment(false);
		});
	};

	return <DragAndDropUI onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} />;
}

export default FileUploadByDnD;
