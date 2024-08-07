import { createSticker, selectCurrentChannelId, selectCurrentClanId, updateSticker, useAppDispatch } from '@mezon/store';
import { handleUploadEmoticon, useMezon } from '@mezon/transport';
import { Button, Icons, InputField } from '@mezon/ui';
import { LIMIT_SIZE_UPLOAD_STICKER_AND_EMOJI } from '@mezon/utils';
import { Snowflake } from '@theinternetfolks/snowflake';
import { ApiClanSticker, ApiClanStickerAddRequest, ApiMessageAttachment, MezonUpdateClanStickerByIdBody } from 'mezon-js/api.gen';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ModalErrorTypeUpload, ModalOverData } from '../../ModalError';

type ModalEditStickerProps = {
	handleCloseModal: () => void;
	editSticker: ApiClanSticker | null;
};
type EdittingSticker = Pick<ApiClanSticker, 'source' | 'shortname'> & {
	fileName: string | null;
};
const ModalSticker = ({ editSticker, handleCloseModal }: ModalEditStickerProps) => {
	const [editingSticker, setEditingSticker] = useState<EdittingSticker>({
		fileName: editSticker?.source?.split('/').pop() ?? null,
		shortname: editSticker?.shortname ?? '',
		source: editSticker?.source ?? '',
	});
	const [openModal, setOpenModal] = useState(false);
	const [openModalType, setOpenModalType] = useState(false);
	const currentClanId = useSelector(selectCurrentClanId) || '';
	const currentChannelId = useSelector(selectCurrentChannelId) || '';
	const dispatch = useAppDispatch();
	const { sessionRef, clientRef } = useMezon();
	const fileRef = useRef<HTMLInputElement>(null);
	const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const srcPreview = URL.createObjectURL(e.target.files[0]);
			setEditingSticker({
				...editingSticker,
				source: srcPreview,
				fileName: e.target.files[0].name,
			});
		} else {
			console.error('No files selected.');
		}
	};
	const handleChangeShortNameSticker = (e: ChangeEvent<HTMLInputElement>) => {
		setEditingSticker({
			...editingSticker,
			shortname: e.target.value,
		});
	};
	const onSaveChange = async () => {
		if (editSticker && editSticker.id && editSticker.shortname !== editingSticker.shortname) {
			const stickerChange: MezonUpdateClanStickerByIdBody = {
				source: editSticker?.source,
				category: editSticker?.category,
				shortname: editingSticker.shortname,
			};
			await dispatch(updateSticker({ stickerId: editSticker?.id ?? '', request: stickerChange }));
			handleCloseModal();
			return;
		}
		handleCreateSticker();
	};
	const handleCreateSticker = () => {
		const checkAvilableCreate = editingSticker.fileName && editingSticker.shortname && editingSticker.source;
		if (!fileRef.current?.files || !checkAvilableCreate) {
			handleCloseModal();
			return;
		}
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}

		const file = fileRef.current.files[0];
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			setOpenModalType(true);
			return;
		}
		if (file.size > LIMIT_SIZE_UPLOAD_STICKER_AND_EMOJI) {
			setOpenModal(true);
			return;
		}
		const category = 'Among Us';
		const path = 'stickers/' + Snowflake.generate();
		handleUploadEmoticon(client, session, path, file).then(
			async (attachment: ApiMessageAttachment) => {
				const request: ApiClanStickerAddRequest = {
					category: category,
					clan_id: currentClanId,
					shortname: editingSticker.shortname,
					source: attachment.url,
				};
				dispatch(createSticker({ request: request, clanId: currentClanId }));
			},
		);

		handleCloseModal();
	};

	const handleCloseTypeModal = () => {
		setOpenModalType(false);
	};
	const handleCloseOverModal = () => {
		setOpenModal(false);
	};
	const validateSaveChange = useMemo(() => {
		return editingSticker?.fileName && editingSticker.shortname && editingSticker.shortname !== editSticker?.shortname ? false : true;
	}, [editingSticker?.fileName, editingSticker.shortname]);

	return (
		<>
			<div className={'relative w-full h-[468px] flex flex-col dark:bg-bgPrimary text-textPrimary '}>
				<div className={`w-full flex-1 flex flex-col overflow-hidden overflow-y-auto gap-4`}>
					<div className={`flex flex-col gap-2 items-center select-none dark:text-textPrimary text-textPrimaryLight`}>
						<p className="text-2xl font-semibold dark:text-bgTextarea text-textPrimaryLight">Upload a file</p>
						<p className="text-base">File should be APNG, PNG, or GIF (512KB max)</p>
					</div>
					<div className={'flex flex-col select-none dark:text-textPrimary text-textPrimaryLight'}>
						<p className="text-xs font-bold h-6 uppercase">PREVIEW</p>
						<div
							className={
								'flex items-center justify-center rounded-lg border-[0.08px] dark:border-borderDivider border-borderLightTabs overflow-hidden'
							}
						>
							<div className={'relative h-56 w-[50%] flex items-center justify-center bg-bgPrimary'}>
								{editingSticker.source ? (
									<PreviewStickerBox preview={editingSticker.source} />
								) : (
									<Icons.UploadImage className="w-16 h-16 text-bgLightModeSecond" />
								)}
							</div>
							<div className={'h-56 w-[50%] flex items-center justify-center bg-bgLightModeSecond'}>
								{editingSticker.source ? (
									<PreviewStickerBox preview={editingSticker.source} />
								) : (
									<Icons.UploadImage className="w-16 h-16 text-bgPrimary" />
								)}
							</div>
						</div>
					</div>
					<div className={'flex flex-row gap-4 dark:text-textPrimary text-textPrimaryLight'}>
						<div className={'w-1/2 flex flex-col gap-2'}>
							<p className={`text-xs font-bold uppercase select-none`}>FILE {editSticker && ' (THIS CANNOT BE EDITED)'}</p>
							<div
								className={`dark:bg-bgSecondary bg-bgLightSecondary border-[0.08px] dark:border-textLightTheme border-borderLightTabs flex flex-row rounded justify-between items-center py-[6px] px-3 dark:text-textPrimary box-border ${editingSticker.fileName && 'cursor-not-allowed'}`}
							>
								<p className="select-none flex-1 truncate">{editingSticker.fileName ?? 'Choose a file'}</p>
								{!editSticker && (
									<button className="hover:bg-hoverPrimary bg-primary rounded-[4px] py-[2px] px-2 text-nowrap relative select-none text-white overflow-hidden">
										Browse
										<input
											className="absolute w-full h-full cursor-pointer top-0 right-0 z-10 opacity-0 file:cursor-pointer"
											type="file"
											title=" "
											tabIndex={0}
											accept=".jpg,.jpeg,.png,.gif"
											onChange={handleChooseFile}
											ref={fileRef}
										></input>
									</button>
								)}
							</div>
						</div>
						<div className={'w-1/2 flex flex-col gap-2'}>
							<p className={`text-xs font-bold uppercase select-none`}>Sticker Name</p>
							<div
								className={
									'bg-bgLightSearchHover dark:bg-bgTertiary border-[0.08px] dark:border-textLightTheme border-borderLightTabs flex flex-row rounded justify-between items-center p-2 pl-3 dark:text-textPrimary box-border overflow-hidden'
								}
							>
								<InputField
									type="string"
									placeholder="ex. cat hug"
									className={'px-[8px] bg-bgLightSearchHover dark:bg-bgTertiary'}
									value={editingSticker.shortname}
									onChange={handleChangeShortNameSticker}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className={`absolute w-full h-[54px] bottom-0 flex items-end justify-end select-none`}>
					<Button
						label="Never Mind"
						className="dark:text-textPrimary !text-textPrimaryLight rounded px-4 py-1.5 hover:underline hover:bg-transparent bg-transparent "
						onClick={handleCloseModal}
					/>
					<Button
						label="Save Changes"
						className={`bg-blue-600 rounded-[4px] px-4 py-1.5 text-nowrap text-white`}
						disable={validateSaveChange}
						onClick={onSaveChange}
					/>
				</div>
			</div>

			<ModalOverData openModal={openModal} handleClose={handleCloseOverModal} />
			<ModalErrorTypeUpload openModal={openModalType} handleClose={handleCloseTypeModal} />
		</>
	);
};

export default ModalSticker;

const PreviewStickerBox = ({ preview }: { preview: string }) => {
	return (
		<div className={'m-auto absolute w-40 aspect-square overflow-hidden flex items-center justify-end'}>
			<img className="h-full w-auto object-cover" src={preview} />
		</div>
	);
};
