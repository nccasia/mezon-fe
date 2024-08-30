import { useChatSending } from "@mezon/core";
import { handleUploadAttachmentMobile } from "@mezon/mobile-components";
import { referencesActions, selectAttachmentByChannelId, selectNewMesssageUpdateImage } from "@mezon/store";
import { useAppDispatch, useAppSelector } from "@mezon/store-mobile";
import { useMezon } from "@mezon/transport";
import { EUploadingStatus, failAttachment } from "@mezon/utils";
import { useEffect } from "react";

interface IUpdateAttachment {
    currentChannelId: string;
    currentClanId: string;
}
export default function useUpdateAttachmentMessages({ currentChannelId, currentClanId }: IUpdateAttachment) {
    const { sessionRef, clientRef } = useMezon();
    const dispatch = useAppDispatch();

    const newMessage = useAppSelector(selectNewMesssageUpdateImage);
    const attachmentFilteredByChannelId = useAppSelector(selectAttachmentByChannelId(currentChannelId));

    const { updateImageLinkMessage } = useChatSending({ channelId: newMessage.channel_id ?? '', mode: newMessage.mode ?? 0, directMessageId: currentChannelId });

    const session = sessionRef.current;
    const client = clientRef.current;

    useEffect(() => {
        if (attachmentFilteredByChannelId?.messageId !== '' &&
            attachmentFilteredByChannelId !== null &&
            attachmentFilteredByChannelId.files.length > 0 &&
            client &&
            session) {

            dispatch(
                referencesActions.setAtachmentAfterUpload({
                    channelId: currentChannelId,
                    messageId: '',
                    files: [],
                }),
            );

            const promises = attachmentFilteredByChannelId?.files?.map((file) =>
                handleUploadAttachmentMobile(client, session, currentClanId, currentChannelId, {
                    name: file.filename,
                    path: file.url,
                    type: file.filetype,
                    size: file.size
                }),
            );

            Promise.all(promises)
                .then((results) => {
                    updateImageLinkMessage(
                        newMessage.clan_id,
                        newMessage.channel_id ?? '',
                        newMessage.mode,
                        newMessage.content,
                        newMessage.message_id,
                        newMessage.mentions,
                        results,
                        undefined,
                        false
                    );
                })
                .then(() => {
                    dispatch(
                        referencesActions.setUploadingStatus({
                            channelId: currentChannelId,
                            messageId: attachmentFilteredByChannelId?.messageId ?? '',
                            statusUpload: EUploadingStatus.SUCCESSFULLY,
                            count: attachmentFilteredByChannelId?.files?.length,
                        }),
                    );
                })
                .catch((error) => {
                    updateImageLinkMessage(
                        newMessage.clan_id,
                        newMessage.channel_id ?? '',
                        newMessage.mode,
                        newMessage.content,
                        newMessage.message_id,
                        newMessage.mentions,
                        [failAttachment],
                        undefined,
                        false
                    );

                    dispatch(
                        referencesActions.setUploadingStatus({
                            channelId: currentChannelId,
                            messageId: attachmentFilteredByChannelId?.messageId ?? '',
                            statusUpload: EUploadingStatus.ERROR,
                            count: attachmentFilteredByChannelId?.files?.length,
                        }),
                    );
                    console.error('Error uploading files:', error);
                });
        }

        dispatch(
            referencesActions.setUploadingStatus({
                channelId: currentChannelId,
                messageId: attachmentFilteredByChannelId?.messageId ?? '',
                statusUpload: EUploadingStatus.LOADING,
                count: attachmentFilteredByChannelId?.files?.length,
            }),
        );
    }, [attachmentFilteredByChannelId?.messageId, currentChannelId]);

    useEffect(() => {
        if (newMessage.isMe && attachmentFilteredByChannelId?.files.length > 0) {
            dispatch(
                referencesActions.updateAttachmentMessageId({
                    channelId: currentChannelId,
                    messageId: newMessage.message_id ?? '',
                }),
            );
        }
    }, [newMessage]);

    return;
}