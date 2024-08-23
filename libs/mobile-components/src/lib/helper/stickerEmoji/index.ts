import { useEmojiSuggestion } from '@mezon/core';
import { createUploadFilePath, uploadFile } from "@mezon/transport";
import { Buffer as BufferMobile } from 'buffer';
import { Client, Session } from "mezon-js";
import { ApiMessageAttachment } from "mezon-js/api.gen";
import RNFS from 'react-native-fs';
import { STORAGE_RECENT_EMOJI } from '../../constant';
import { load, save } from '../storage';

interface IFile {
    uri: string;
    name: string;
    type: string;
    size: number;
    fileData: any;
}

interface IEmojiWithChannel {
    [key: string]: string[]
}

export async function handleUploadEmoticonMobile(client: Client, session: Session, filename: string, file: IFile): Promise<ApiMessageAttachment> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
        try {
            let fileType = file.type;
            if (!fileType) {
                const fileNameParts = file.name.split('.');
                const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
                fileType = `text/${fileExtension}`;
            }

            const arrayBuffer = BufferMobile.from(file.fileData, 'base64');
            if (!arrayBuffer) {
                console.log('Failed to read file data.');
                return;
            }

            resolve(uploadFile(client, session, filename, fileType, Number(file.size) || 0, arrayBuffer, true));
        } catch (error) {
            console.log('handleUploadEmojiStickerMobile Error: ', error);
            reject(new Error(`${error}`));
        }
    });
}

export function getEmojis(clan_id: string) {
    const { categoriesEmoji, emojis } = useEmojiSuggestion();
    const recentEmojiIDs: IEmojiWithChannel = load(STORAGE_RECENT_EMOJI) || {};
    const recentClanEmojiIDs = recentEmojiIDs?.[clan_id] || [];

    const recentEmojis = recentClanEmojiIDs
        .map(emojiID => emojis.find(emoji => emoji.id === emojiID))
        .filter(emoji => !!emoji)
        .map(attr => ({ ...attr, category: "Recent" }));

    return {
        categoriesEmoji,
        emojis: [...recentEmojis, ...emojis],
    }
}

export async function setRecentEmojiById(emojiIDs: string[], clan_id: string) {
    const oldRecentEmojis: IEmojiWithChannel = load(STORAGE_RECENT_EMOJI) || {};
    const oldRecentClanEmojiID: string[] = oldRecentEmojis?.[clan_id] || [];

    const newRecentEmojis = emojiIDs
        .filter(emojiID => oldRecentClanEmojiID.every(oldEmoji => oldEmoji !== emojiID))

    const currentEmoji = { ...oldRecentEmojis, [clan_id]: [...newRecentEmojis, ...oldRecentClanEmojiID] }
    save(STORAGE_RECENT_EMOJI, currentEmoji);
}

export async function handleUploadAttachments(sessionRef: any, clientRef: any, clan_id: string, channel_id: string, attachments: ApiMessageAttachment[]) {
    const session = sessionRef.current;
    const client = clientRef.current;

    const uploadedAttachments = await Promise.all(
        attachments?.map((att) => {
            return handleUploadAttachmentMobile(client, session, clan_id, channel_id, att);
        }));

    return uploadedAttachments
};

export async function handleUploadAttachmentMobile(
    client: Client,
    session: Session,
    currentClanId: string,
    currentChannelId: string,
    attachment: ApiMessageAttachment
): Promise<ApiMessageAttachment> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
        try {
            const fileType = attachment.filetype || "text/plainText";
            const filePath = attachment.url || "";
            const fileName = attachment.filename || "";
            const fileSize = Number(attachment.size) || 0;
            const fileData = await RNFS.readFile(filePath, 'base64');
            const arrayBuffer = BufferMobile.from(fileData, 'base64');

            if (!arrayBuffer) {
                console.log('Failed to read file data.');
                return;
            }

            const fullFilename = createUploadFilePath(session, currentClanId, currentChannelId, fileName);
            resolve(uploadFile(client, session, fullFilename, fileType, fileSize, arrayBuffer, true));
        }
        catch (error) {
            console.log('handleUploadFileMobile Error: ', error);
            reject(new Error(`${error}`));
        }
    });
};
