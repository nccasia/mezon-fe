import { usePermissionChecker } from '@mezon/core';
import {
	emojiSuggestionActions,
	selectCurrentClanId,
	selectCurrentUserId,
	selectMemberClanByUserId,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { EPermission, MAX_FILE_NAME_EMOJI, getSrcEmoji } from '@mezon/utils';
import { ClanEmoji } from 'mezon-js';
import { MezonUpdateClanEmojiByIdBody } from 'mezon-js/api.gen';
import { ChangeEvent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type SettingEmojiItemProp = {
	emoji: ClanEmoji;
	onUpdateEmoji: (emoji: ClanEmoji) => void;
};

const SettingEmojiItem = ({ emoji, onUpdateEmoji }: SettingEmojiItemProp) => {
	const [showEdit, setShowEdit] = useState<boolean>(false);
	const [focus, setFocus] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const clanId = useSelector(selectCurrentClanId);
	const [nameEmoji, setNameEmoji] = useState<string>(emoji.shortname || '');
	const dataAuthor = useSelector(selectMemberClanByUserId(emoji.creator_id ?? ''));
	const [hasManageClanPermission] = usePermissionChecker([EPermission.manageClan]);
	const currentUserId = useAppSelector(selectCurrentUserId);
	const hasDeleteOrEditPermission = useMemo(() => {
		return hasManageClanPermission || currentUserId === emoji.creator_id;
	}, [hasManageClanPermission, currentUserId]);

	const handleDelete = () => {
		dispatch(emojiSuggestionActions.deleteEmojiSetting({ emoji: emoji, clan_id: clanId as string }));
	};
	const handleOnMouseLeave = () => {
		if (!focus) {
			setShowEdit(false);
		}
	};

	const handleHoverEmoji = () => {
		if (hasDeleteOrEditPermission) {
			setShowEdit(true);
		}
	};
	const handleChangeEmojiName = (e: ChangeEvent<HTMLInputElement>) => {
		setNameEmoji(e.target.value);
	};

	const handleUpdateEmoji = async () => {
		if (nameEmoji !== emoji.shortname && nameEmoji !== '') {
			const request: MezonUpdateClanEmojiByIdBody = {
				source: emoji.src,
				shortname: nameEmoji,
				category: emoji.category,
				clan_id: clanId as string
			};
			await dispatch(emojiSuggestionActions.updateEmojiSetting({ request: request, emojiId: emoji.id || '' }));
			setFocus(false);
			setShowEdit(false);
		}
	};
	return (
		<div
			className={'flex flex-row w-full max-w-[700px] pr-5 relative h-[65px]  hover:bg-[#f9f9f9] dark:hover:bg-transparent'}
			onMouseOver={handleHoverEmoji}
			onMouseLeave={handleOnMouseLeave}
			onBlur={handleOnMouseLeave}
		>
			<div className="w-full h-full flex flex-row shadow-emoji_item dark:shadow-emoji_item_dark items-center">
				<div className={'w-14 h-8'}>
					<div className={'w-8 h-8 overflow-hidden flex items-center justify-center select-none '}>
						<img className={'w-auto max-h-full object-cover'} src={getSrcEmoji(emoji.id as string)} alt={emoji.shortname} />
					</div>
				</div>

				<div className={'flex-1 relative'}>
					<div
						className={
							'h-[26px] px-1 w-fit relative before:absolute after:absolute before:content-[":"] before:text-gray-400 after:content-[":"] after:text-gray-400 before:left-[-3px] after:right-[-3px]'
						}
					>
						<p className={`max-w-[172px] truncate overflow-hidden inline-block select-none`}>{emoji.shortname}</p>
					</div>
					{showEdit && (
						<input
							className={` dark:bg-channelTextarea bg-channelTextareaLight dark:text-white text-black animate-faded_input h-[26px] top-0 ml-[2px] outline-none pl-2 absolute rounded-[3px]`}
							value={nameEmoji}
							onChange={(e) => handleChangeEmojiName(e)}
							onKeyDown={(e) => {
								e.key === 'Enter' && handleUpdateEmoji();
							}}
							maxLength={MAX_FILE_NAME_EMOJI}
						/>
					)}
				</div>

				<div className={'flex-1 flex gap-[6px]  select-none'}>
					<div className={'w-6 h-6 rounded-[50%] overflow-hidden flex items-center justify-center'}>
						<img className={'w-full h-auto object-cover'} src={dataAuthor?.user?.avatar_url} />
					</div>
					<p className={'text-sm h-auto leading-6'}>{dataAuthor?.user?.username}</p>
				</div>

				{showEdit && (
					<div className={'absolute text-xs font-bold w-6 top-[-12px] right-[-12px]'}>
						<button
							onClick={handleDelete}
							className="dark:border-black dark:shadow-[#000000] bg-white dark:bg-transparent text-red-600 shadow-emoji_item-delete  text-xs font-bold w-6 h-6 flex items-center justify-center rounded-[50%]"
						>
							X
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SettingEmojiItem;
