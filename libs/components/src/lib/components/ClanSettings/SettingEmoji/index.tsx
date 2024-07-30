import { createEmoji, selectAllEmoji, selectCurrentChannelId, selectCurrentClanId, settingClanEmojiActions, useAppDispatch } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { ApiClanEmojiCreateRequest, ApiMessageAttachment } from 'mezon-js/api.gen';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalErrorTypeUpload, ModalOverData } from '../../ModalError';
import SettingEmojiList from './SettingEmojiList';

const SettingEmoji = () => {
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId) || '';
	const currentClanId = useSelector(selectCurrentClanId) || '';
	const { sessionRef, clientRef } = useMezon();
	const emojiList = useSelector(selectAllEmoji);

	const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			const imageSize = file?.size;
			const fileNameParts = file?.name.split('.');
			const fileName = fileNameParts.slice(0, -1).join('.').slice(0, 62);
			const session = sessionRef.current;
			const client = clientRef.current;
			const category = 'Custom';
			const path = 'emojis/' + category;
			if (!client || !session) {
				throw new Error('Client or file is not initialized');
			}
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
			if (!allowedTypes.includes(file?.type)) {
				setOpenModalType(true);
				return;
			}

			if (imageSize > 1000000) {
				setOpenModal(true);
				return;
			}
			handleUploadFile(client, session, currentClanId, currentChannelId, file?.name, file, path).then(
				async (attachment: ApiMessageAttachment) => {
					const request: ApiClanEmojiCreateRequest = {
						category: category,
						clan_id: currentClanId,
						shortname: ':' + fileName + ':',
						source: attachment.url,
					};
					await dispatch(createEmoji({ request: request, clanId: currentClanId }));
				},
			);
		} else {
			return;
		}
	};

	const fetchEmojis = useCallback(async () => {
		if (currentClanId) {
			await dispatch(settingClanEmojiActions.fetchEmojisByClanId({ clanId: currentClanId, noCache: true }));
		}
	}, [dispatch]);

	useEffect(() => {
		fetchEmojis();
	}, [fetchEmojis]);

	return (
		<>
			<div className="flex flex-col gap-3 pb-[40px] dark:text-textSecondary text-textSecondary800 text-sm">
				<div className={'dark:text-textSecondary flex flex-col gap-2 text-textSecondary800'}>
					<p className={''}>
						Add up to 250 custom emoji that anyone can use in this server. Animated GIF emoji may be used by members with Mezon Nitro
					</p>
					<p className={'uppercase text-xs'}>UPLOAD REQUIREMENTS</p>
					<ul className={'list-disc ml-[16px]'}>
						<li>File type: JPEG, PNG, GIF</li>
						<li>Recommended file size: 256 KB (We'll compress for you)</li>
						<li>Recommended dimensions: 128x128</li>
						<li>Naming: Emoji names must be at least 2 characters long and can only contain alphanumeric characters and underscores</li>
					</ul>
				</div>
				<div className="h-[38px] font-semibold rounded bg-[#3297ff] text-[#ffffff] w-28 relative flex flex-row items-center justify-center hover:bg-[#2b80d7]">
					Upload emoji
					<input
						className="absolute w-full h-full cursor-pointer z-10 opacity-0 file:cursor-pointer"
						type="file"
						title=" "
						tabIndex={0}
						accept=".jpg,.jpeg,.png,.gif"
						onChange={handleSelectFile}
					></input>
				</div>
			</div>

			<SettingEmojiList title={'Emoji'} emojiList={emojiList} />

			<ModalOverData openModal={openModal} handleClose={() => setOpenModal(false)} />
			<ModalErrorTypeUpload openModal={openModalType} handleClose={() => setOpenModalType(false)} />
		</>
	);
};

export default SettingEmoji;
