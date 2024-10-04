import { useAppNavigation, useEscapeKeyClose } from '@mezon/core';
import { RootState, channelsActions, createNewChannel, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { AlertTitleTextWarning, Icons } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChannelLableModal } from './ChannelLabel';
import { ChannelNameModalRef, ChannelNameTextField } from './ChannelNameTextField';
import { ChannelStatusModal } from './ChannelStatus';
import { ChannelTypeComponent } from './ChannelType';
import { CreateChannelButton } from './CreateChannelButton';

export const CreateNewChannelModal = () => {
	const dispatch = useAppDispatch();
	const InputRef = useRef<ChannelNameModalRef>(null);
	const appUrlInputRef = useRef<ChannelNameModalRef>(null);
	const [isInputError, setIsInputError] = useState<boolean>(true);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentCategory = useSelector((state: RootState) => state.channels.currentCategory);
	const isOpenModal = useSelector((state: RootState) => state.channels.isOpenCreateNewChannel);
	const isLoading = useSelector((state: RootState) => state.channels.loadingStatus);
	const [validate, setValidate] = useState(true);
	const [channelName, setChannelName] = useState('');
	const [appUrl, setAppUrl] = useState<string>('');
	const [isErrorType, setIsErrorType] = useState<string>('');
	const [isErrorName, setIsErrorName] = useState<string>('');
	const [isPrivate, setIsPrivate] = useState<number>(0);
	const [channelType, setChannelType] = useState<number>(-1);
	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();
	const isAppChannel = channelType === ChannelType.CHANNEL_TYPE_APP;

	useEffect(() => {
		if (isLoading === 'loaded') {
			dispatch(channelsActions.openCreateNewModalChannel(false));
		}
	}, [dispatch, isLoading]);

	const handleSubmit = async () => {
		if (channelType === -1) {
			setIsErrorType("Channel's type is required");
			return;
		}
		if (channelName === '') {
			setIsErrorName("Channel's name is required");
			return;
		}

		if (!validate) {
			setIsErrorName('Please enter a valid channel name');
			return;
		}

		const body: ApiCreateChannelDescRequest = {
			clan_id: currentClanId?.toString(),
			type: channelType,
			channel_label: channelName,
			channel_private: isPrivate,
			category_id: currentCategory?.category_id,
			...(isAppChannel && { app_url: appUrl })
		};

		const newChannelCreatedId = await dispatch(createNewChannel(body));
		const payload = newChannelCreatedId.payload as ApiCreateChannelDescRequest;
		const channelID = payload.channel_id;
		const typeChannel = payload.type;

		if (newChannelCreatedId && typeChannel !== ChannelType.CHANNEL_TYPE_VOICE && typeChannel !== ChannelType.CHANNEL_TYPE_STREAMING) {
			const channelPath = toChannelPage(channelID ?? '', currentClanId ?? '');
			navigate(channelPath);
		}
		clearDataAfterCreateNew();
	};

	const handleCloseModal = () => {
		setIsErrorType('');
		setIsErrorName('');
		clearDataAfterCreateNew();
		dispatch(channelsActions.openCreateNewModalChannel(false));
	};

	const handleChannelNameChange = (value: string) => {
		setIsErrorName('');
		setChannelName(value);
	};

	const checkValidate = (check: boolean) => {
		setValidate(check);
	};

	const onChangeChannelType = (value: number) => {
		setIsErrorType('');
		setChannelType(value);
	};

	const onChangeToggle = (value: number) => {
		setIsPrivate(value);
	};

	const clearDataAfterCreateNew = () => {
		setChannelName('');
		setChannelType(-1);
		setIsPrivate(0);
	};

	const handleChangeValue = useCallback(() => {
		const isValid = InputRef.current?.checkInput();
		setIsInputError(isValid ?? false);
	}, []);

	const modalRef = useRef<HTMLDivElement>(null);
	const handleClose = useCallback(() => {
		dispatch(channelsActions.openCreateNewModalChannel(false));
	}, [isOpenModal]);
	useEscapeKeyClose(modalRef, handleClose);

	const handleChangeAppUrl = (value: string) => {
		setAppUrl(value);
	};
	return (
		isOpenModal && (
			<div
				ref={modalRef}
				tabIndex={-1}
				className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center"
			>
				<div
					className={`z-60 w-full h-full sm:w-4/5 ${isAppChannel ? 'sm:max-h-[700px]' : 'sm:max-h-[570px]'}  md:w-[684px] dark:bg-bgPrimary bg-bgLightModeSecond rounded-2xl flex-col justify-start  items-start gap-3 inline-flex relative shadow-lg`}
				>
					<div className="self-stretch md:h-96 flex-col justify-start items-start flex">
						<div className="self-stretch md:h-96 px-5 pt-8 flex-col justify-start items-start gap-3 flex">
							<div className="self-stretch h-14 flex-col justify-center items-start gap-1 flex">
								<div className="flex flex-col items-start gap-x-2 sm:flex-row sm:items-center w-full relative">
									<ChannelLableModal labelProp="CREATE A NEW CHANNEL IN" />
									<span>
										<p className="self-stretch  text-sm font-bold leading-normal uppercase text-cyan-500">
											{currentCategory?.category_name}
										</p>
									</span>
									<div className="absolute right-1 top-[-10px]">
										<button onClick={handleCloseModal} className="hover:text-[#ffffff]">
											<Icons.Close />
										</button>
									</div>
								</div>

								<div className=" dark:text-zinc-400 text-colorTextLightMode text-sm">Kindly set up a channel of your choice.</div>
							</div>
							<div className="Frame407 self-stretch flex-col items-center gap-2 flex">
								<ChannelLableModal labelProp="Choose channel's type:" />
								<div className="Frame405 self-stretch  flex-col justify-start items-start gap-2 flex max-h-[200px] overflow-y-scroll max-xl:h-auto hide-scrollbar">
									<ChannelTypeComponent type={ChannelType.CHANNEL_TYPE_TEXT} onChange={onChangeChannelType} error={isErrorType} />
									<ChannelTypeComponent
										disable={false}
										type={ChannelType.CHANNEL_TYPE_VOICE}
										onChange={onChangeChannelType}
										error={isErrorType}
									/>
									{/* <ChannelTypeComponent
										disable={true}
										type={ChannelType.CHANNEL_TYPE_FORUM}
										onChange={onChangeChannelType}
										error={isErrorType}
									/> */}
									<ChannelTypeComponent
										disable={false}
										type={ChannelType.CHANNEL_TYPE_STREAMING}
										onChange={onChangeChannelType}
										error={isErrorType}
									/>
									<ChannelTypeComponent
										disable={false}
										type={ChannelType.CHANNEL_TYPE_APP}
										onChange={onChangeChannelType}
										error={isErrorType}
									/>
								</div>
							</div>
							<ChannelNameTextField
								ref={InputRef}
								onChange={handleChannelNameChange}
								onCheckValidate={checkValidate}
								type={channelType}
								channelNameProps="What is channel's name?"
								error={isErrorName}
								onHandleChangeValue={handleChangeValue}
								placeholder={"Enter the channel's name"}
								shouldValidate={true}
							/>
							{channelType === ChannelType.CHANNEL_TYPE_APP && (
								<div className={'mt-2 w-full'}>
									<ChannelNameTextField
										ref={appUrlInputRef}
										onChange={handleChangeAppUrl}
										type={channelType}
										channelNameProps="What is app's URL?"
										placeholder={"Enter the app's URL"}
										shouldValidate={false}
									/>
								</div>
							)}
							{channelType !== ChannelType.CHANNEL_TYPE_VOICE && channelType !== ChannelType.CHANNEL_TYPE_STREAMING && (
								<ChannelStatusModal onChangeValue={onChangeToggle} channelNameProps="Is private channel?" />
							)}
						</div>
					</div>
					<CreateChannelButton onClickCancel={handleCloseModal} onClickCreate={handleSubmit} checkInputError={isInputError} />
				</div>
				{isErrorType !== '' && <AlertTitleTextWarning description={isErrorType} />}
				{isErrorName !== '' && <AlertTitleTextWarning description={isErrorName} />}
			</div>
		)
	);
};
