import { useDragAndDrop, useReference } from '@mezon/core';
import { selectCurrentClanId } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { DragEvent } from 'react';
import { useSelector } from 'react-redux';
import DragAndDropUI from './DragAndDropUI';

type FileUploadByDnDOpt = {
	currentId: string;
};

function FileUploadByDnD({ currentId }: FileUploadByDnDOpt) {
	const { setDraggingState } = useDragAndDrop();
	const { setAttachmentData, setStatusLoadingAttachment } = useReference();
	const { sessionRef, clientRef } = useMezon();
	const currentClanId = useSelector(selectCurrentClanId) || '';

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
		if (!files || !client || !session || !currentId) {
			throw new Error('Client or files are not initialized');
		}

		const promises = Array.from(files).map((file) => {
			return handleUploadFile(client, session, currentClanId, currentId, file.name, file);
		});
		Promise.all(promises)
			.then((attachments) => {
				attachments.forEach((attachment) => setAttachmentData(attachment));
			})
			.then(() => {
				setStatusLoadingAttachment(false);
			});
	};

	return <DragAndDropUI onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} />;
}

export default FileUploadByDnD;
