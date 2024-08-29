import { useEscapeKey } from '@mezon/core';
import { selectAllEmojiSuggestion, settingClanStickerActions, useAppDispatch } from '@mezon/store';
import { Modal } from '@mezon/ui';
import { EEmojiCategory } from '@mezon/utils';
import { ClanEmoji } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalErrorTypeUpload, ModalOverData } from '../../ModalError';
import ModalSticker, { EGraphicType } from '../SettingSticker/ModalEditSticker';
import SettingEmojiList from './SettingEmojiList';

const SettingEmoji = () => {
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const emojiList = useSelector(selectAllEmojiSuggestion).filter((emoji) => emoji.category === EEmojiCategory.CUSTOM && emoji?.src);
	const [selectedEmoji, setSelectedEmoji] = useState<ClanEmoji | null>(null);
	const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
	const dispatch = useAppDispatch();

	const handleOpenUpdateEmojiModal = (emoji: ClanEmoji) => {
		setSelectedEmoji(emoji);
		setIsOpenEditModal(true);
		dispatch(settingClanStickerActions.openModalInChild());
	};

	const handleCreateEmoji = () => {
		setSelectedEmoji(null);
		setIsOpenEditModal(true);
		dispatch(settingClanStickerActions.openModalInChild());
	};

	const handleCloseModal = () => {
		setIsOpenEditModal(false);
		dispatch(settingClanStickerActions.closeModalInChild());
	};

	useEscapeKey(handleCloseModal);

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
				<div
					onClick={handleCreateEmoji}
					className="h-[38px] font-semibold rounded bg-buttonPrimary text-contentPrimary w-28 relative flex flex-row items-center justify-center hover:bg-contentBrand cursor-pointer"
				>
					Upload emoji
				</div>
			</div>

			<SettingEmojiList title={'Emoji'} emojiList={emojiList} onUpdateEmoji={handleOpenUpdateEmojiModal} />

			<ModalOverData openModal={openModal} handleClose={() => setOpenModal(false)} />
			<ModalErrorTypeUpload openModal={openModalType} handleClose={() => setOpenModalType(false)} />

			{isOpenEditModal && (
				<Modal
					showModal={isOpenEditModal}
					onClose={handleCloseModal}
					classNameBox={'max-w-[600px]'}
					children={<ModalSticker graphic={selectedEmoji} handleCloseModal={handleCloseModal} type={EGraphicType.EMOJI} />}
				/>
			)}
		</>
	);
};

export default SettingEmoji;
