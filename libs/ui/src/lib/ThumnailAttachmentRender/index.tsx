import { Icons, MessageVideo } from '@mezon/components';
import { fileTypeImage, fileTypeVideo, SHOW_POSITION } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { typeFormats } from './TypeFormats';
import { useCallback } from 'react';
import { useMessageContextMenu } from 'apps/chat/src/app/pages/channel/ContextMenu/MessageContextMenuContext';

export const RenderAttachmentThumbnail = (attachment: ApiMessageAttachment, size?: string, pos?: string) => {
	const fileType = attachment.filetype;

	const renderIcon = typeFormats.find((typeFormat) => typeFormat.type === fileType);

	const hasFileImage = fileType && fileTypeImage.includes(fileType);

	const hasFileVideo = fileType && fileTypeVideo.includes(fileType);

	const { setPositionShow } = useMessageContextMenu();

	const handleContextMenu = useCallback(()=>{
		if(attachment.filetype === 'image/gif'){
			setPositionShow(SHOW_POSITION.IN_STICKER)
		}
	},[attachment.filetype])

	return (
		<div onContextMenu={handleContextMenu}>
			{hasFileImage && <img  key="image-thumbnail" src={attachment.url} role="presentation" className="w-[174px] aspect-square object-cover" alt={attachment.url} />}

			{hasFileVideo && (
				<div className={`w-35 h-32 flex flex-row justify-center items-center relative mt-[-10px]`}>
					<MessageVideo attachmentData={attachment} />
				</div>
			)}

			{renderIcon && <renderIcon.icon defaultSize={size} />}

			{!hasFileImage && !hasFileVideo && !renderIcon && <Icons.EmptyType defaultSize={size} />}
		</div>
	);
};
