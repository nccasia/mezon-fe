import { ValidateSpecialCharacters } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import * as Icons from '../../Icons';
import { ChannelLableModal } from '../ChannelLabel';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

interface ChannelNameModalProps {
	type: number;
	channelNameProps: string;
	onChange: (value: string) => void;
	onCheckValidate: (check: boolean) => void;
	onHandleChangeValue: () => void
	error: string;
}

export type ChannelNameModalRef = {
	checkInput: () => boolean;
}

export const ChannelNameTextField = forwardRef<ChannelNameModalRef, ChannelNameModalProps>((props, ref) => {
	const { channelNameProps, type, onChange, onCheckValidate, onHandleChangeValue, error } = props;
	const [checkvalidate, setCheckValidate] = useState(true);
	const [checkNameChannel, setCheckNameChannel] = useState(true);
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		onChange(value);
		if (value === '') {
			setCheckNameChannel(true);
		} else {
			setCheckNameChannel(false);
		}
		const regex = ValidateSpecialCharacters();
		if (regex.test(value)) {
			setCheckValidate(false);
			onCheckValidate(true);
		} else {
			setCheckValidate(true);
			onCheckValidate(false);
		}
	};

	const iconMap = {
		[ChannelType.CHANNEL_TYPE_TEXT]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_VOICE]: <Icons.Speaker defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_FORUM]: <Icons.Forum defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_ANNOUNCEMENT]: <Icons.Announcement defaultSize="w-6 h-6" />,
		// 2 lines below only get index
		[ChannelType.CHANNEL_TYPE_DM]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_GROUP]: <Icons.Speaker defaultSize="w-6 h-6" />,
	};

	useImperativeHandle(ref, () => ({
        checkInput: () => checkvalidate || checkNameChannel,
    }));

	useEffect(() => {
		onHandleChangeValue();
	},[checkvalidate, checkNameChannel, onHandleChangeValue]);

	return (
		<div className="Frame408 self-stretch h-[84px] flex-col justify-start items-start gap-2 flex mt-1">
			<ChannelLableModal labelProp={channelNameProps} />
			<div className="ContentContainer self-stretch h-11 flex-col items-start flex">
				<div
					className={`InputContainer self-stretch h-11 px-4 py-3 dark:bg-neutral-950 bg-white rounded shadow border w-full ${error ? 'border border-red-500' : 'border-blue-600'}  justify-start items-center gap-2 inline-flex`}
				>
					{type === -1 ? [] : iconMap[type as ChannelType]}
					<div className="InputValue grow shrink basis-0 self-stretch justify-start items-center flex">
						<input
							className="Input grow shrink basis-0 h-10 outline-none dark:bg-neutral-950 bg-white dark:text-white text-black text-sm font-normal placeholder-[#AEAEAE]"
							onChange={handleInputChange}
							placeholder="Enter the channel's name"
							maxLength={64}
						/>
					</div>
				</div>
			</div>
			{checkvalidate || checkNameChannel ? (
				<p className="text-[#e44141] text-xs italic font-thin">
					Please enter a valid channel name (max 64 characters, only words, numbers, _ or -).
				</p>
			) : null}
		</div>
	);
});
