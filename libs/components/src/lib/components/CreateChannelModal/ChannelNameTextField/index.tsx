import { checkDuplicateChannelName, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { DEBOUNCE_TYPING_TIME, ValidateSpecialCharacters } from '@mezon/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import { ChannelType } from 'mezon-js';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ChannelLableModal } from '../ChannelLabel';

interface ChannelNameModalProps {
	type: ChannelType;
	channelNameProps: string;
	categoryId:string;
	onChange: (value: string) => void;
	onCheckValidate: (check: boolean) => void;
	onHandleChangeValue: () => void;
	error: string;
}

export type ChannelNameModalRef = {
	checkInput: () => boolean;
};

enum EValidateListMessageChannelLabel {
	INVALID_NAME = 'Please enter a valid channel name (max 64 characters, only words, numbers, _ or -)',
	DUPLICATE_NAME = 'The channel name already exists. Please enter another name.',
	VALIDATED = 'VALIDATED'
}


export const ChannelNameTextField = forwardRef<ChannelNameModalRef, ChannelNameModalProps>((props, ref) => {
	const { channelNameProps, type, onChange, onCheckValidate, onHandleChangeValue, error } = props;
	const [checkvalidate, setCheckValidate] = useState<EValidateListMessageChannelLabel | null>(EValidateListMessageChannelLabel.INVALID_NAME);
	const [checkNameChannel, setCheckNameChannel] = useState(true);
	const dispath = useAppDispatch()

	const debouncedSetCategoryName = useDebouncedCallback(async (value: string) => {
		const regex = ValidateSpecialCharacters();
		if (regex.test(value)) {
		  await dispath(checkDuplicateChannelName({categoryId: props.categoryId, channelLabel: value.trim()})).then(unwrapResult).then(result => {
			if (result) {
			  setCheckValidate(EValidateListMessageChannelLabel.DUPLICATE_NAME)
			  onCheckValidate(false);
			  return;
			}
			setCheckValidate(EValidateListMessageChannelLabel.VALIDATED)
			onCheckValidate(true);
		  });
		  return;
		}
		setCheckValidate(EValidateListMessageChannelLabel.INVALID_NAME);
		onCheckValidate(false)
	  }, DEBOUNCE_TYPING_TIME);


	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		onChange(value);
		if (value === '') {
			setCheckNameChannel(true);

		} else {
			setCheckNameChannel(false);
		}
		debouncedSetCategoryName(value)
	};

	const iconMap: Partial<Record<ChannelType, JSX.Element>> = {
		[ChannelType.CHANNEL_TYPE_TEXT]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_VOICE]: <Icons.Speaker defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_FORUM]: <Icons.Forum defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_ANNOUNCEMENT]: <Icons.Announcement defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_THREAD]: <Icons.ThreadIcon defaultSize="w-6 h-6" />,
		// 2 lines below only get index
		[ChannelType.CHANNEL_TYPE_DM]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_GROUP]: <Icons.Speaker defaultSize="w-6 h-6" />
	};

	useImperativeHandle(ref, () => ({
		checkInput: () => checkvalidate !== EValidateListMessageChannelLabel.VALIDATED
	}));
	
	useEffect(() => {
		onHandleChangeValue();
	}, [checkvalidate, checkNameChannel, onHandleChangeValue]);

	return (
		<div className="Frame408 self-stretch h-[84px] flex-col justify-start items-start gap-2 flex mt-1">
			<ChannelLableModal labelProp={channelNameProps} />
			<div className="ContentContainer self-stretch h-11 flex-col items-start flex">
				<div
					className={`InputContainer self-stretch h-11 px-4 py-3 dark:bg-neutral-950 bg-white rounded shadow border w-full ${error ? 'border border-red-500' : 'border-blue-600'}  justify-start items-center gap-2 inline-flex`}
				>
					{iconMap[type]}
					<div className="InputValue grow shrink basis-0 self-stretch justify-start items-center flex">
						<input
							className="Input grow shrink basis-0 h-10 outline-none dark:bg-neutral-950 bg-white dark:text-white text-black text-sm font-normal placeholder-[#AEAEAE]"
							onChange={handleInputChange}
							placeholder="Enter the channel's name"
							maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
						/>
					</div>
				</div>
			</div>
			{checkvalidate !== EValidateListMessageChannelLabel.VALIDATED ? (
				<p className="text-[#e44141] text-xs italic font-thin">
					{checkvalidate}
				</p>
			) : null}
		</div>
	);
});
