import { selectTheme, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ValidateSpecialCharacters } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ChannelLableModal } from '../ChannelLabel';

interface ChannelNameModalProps {
	type: ChannelType;
	channelNameProps: string;
	onChange: (value: string) => void;
	onCheckValidate?: (check: boolean) => void;
	onHandleChangeValue?: () => void;
	error?: string;
	placeholder: string;
	shouldValidate: boolean;
}

export type ChannelNameModalRef = {
	checkInput: () => boolean;
};

export const ChannelNameTextField = forwardRef<ChannelNameModalRef, ChannelNameModalProps>((props, ref) => {
	const { channelNameProps, type, onChange, onCheckValidate, onHandleChangeValue, error, placeholder, shouldValidate } = props;
	const [checkvalidate, setCheckValidate] = useState(true);
	const [checkNameChannel, setCheckNameChannel] = useState(true);
	const theme = useAppSelector(selectTheme);

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
			if (onCheckValidate) {
				onCheckValidate(true);
			}
		} else {
			setCheckValidate(true);
			if (onCheckValidate) {
				onCheckValidate(false);
			}
		}
	};

	const iconMap: Partial<Record<ChannelType, JSX.Element>> = {
		[ChannelType.CHANNEL_TYPE_TEXT]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_VOICE]: <Icons.Speaker defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_FORUM]: <Icons.Forum defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_ANNOUNCEMENT]: <Icons.Announcement defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_APP]: <Icons.AppChannelIcon className="w-6 h-6" fill={theme} />,
		[ChannelType.CHANNEL_TYPE_STREAMING]: <Icons.Stream defaultSize="w-6 h-6" />,
		// 2 lines below only get index
		[ChannelType.CHANNEL_TYPE_DM]: <Icons.Hashtag defaultSize="w-6 h-6" />,
		[ChannelType.CHANNEL_TYPE_GROUP]: <Icons.Speaker defaultSize="w-6 h-6" />
	};

	useImperativeHandle(ref, () => ({
		checkInput: () => checkvalidate || checkNameChannel
	}));

	useEffect(() => {
		if (onHandleChangeValue) {
			onHandleChangeValue();
		}
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
							placeholder={placeholder}
							maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
						/>
					</div>
				</div>
			</div>
			{shouldValidate && (checkvalidate || checkNameChannel) ? (
				<p className="text-[#e44141] text-xs italic font-thin">
					Please enter a valid channel name (max 64 characters, only words, numbers, _ or -).
				</p>
			) : null}
		</div>
	);
});
