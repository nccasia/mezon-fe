import { useAppNavigation } from '@mezon/core';
import { RootState, channelsActions, createNewChannel, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { AlertTitleTextWarning } from 'libs/ui/src/lib/Alert';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../Icons';
import { ChannelLableModal } from './ChannelLabel';
import { ChannelNameTextField } from './ChannelNameTextField';
import { ChannelStatusModal } from './ChannelStatus';
import { ChannelTypeComponent } from './ChannelType';
import { CreateChannelButton } from './CreateChannelButton';

export const CreateNewChannelModal = () => {
	const dispatch = useAppDispatch();

	const currentClanId = useSelector(selectCurrentClanId);
	const currentCategory = useSelector((state: RootState) => state.channels.currentCategory);
	const isOpenModal = useSelector((state: RootState) => state.channels.isOpenCreateNewChannel);
	const isLoading = useSelector((state: RootState) => state.channels.loadingStatus);

	useEffect(() => {
		if (isLoading === 'loaded') {
			dispatch(channelsActions.openCreateNewModalChannel(false));
		}
	}, [dispatch, isLoading]);

	const [isErrorType, setIsErrorType] = useState<string>('');
	const [isErrorName, setIsErrorName] = useState<string>('');

	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();

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
		};

		const newChannelCreatedId = await dispatch(createNewChannel(body));
		const payload = newChannelCreatedId.payload as ApiCreateChannelDescRequest;
		const channelID = payload.channel_id;
		const typeChannel = payload.type;

		if (newChannelCreatedId && typeChannel !== ChannelType.CHANNEL_TYPE_VOICE) {
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

	const [channelName, setChannelName] = useState('');
	const handleChannelNameChange = (value: string) => {
		setIsErrorName('');
		setChannelName(value);
	};
	const [validate, setValidate] = useState(true);
	const checkValidate = (check: boolean) => {
		setValidate(check);
	};

	const [channelType, setChannelType] = useState<number>(-1);
	const onChangeChannelType = (value: number) => {
		setIsErrorType('');
		setChannelType(value);
	};
	const [isPrivate, setIsPrivate] = useState<number>(0);
	const onChangeToggle = (value: number) => {
		setIsPrivate(value);
	};

	const clearDataAfterCreateNew = () => {
		setChannelName('');
		setChannelType(-1);
		setIsPrivate(0);
	};
	return (
		isOpenModal && (
				<div className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center">
					<div className="z-60 w-full h-full sm:w-4/5 sm:max-h-[570px] md:w-[684px] dark:bg-bgPrimary bg-bgLightModeSecond rounded-2xl flex-col justify-start  items-start gap-3 inline-flex">
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
									<div className="Frame405 self-stretch  flex-col justify-start items-start gap-2 flex max-h-[200px] overflow-y-scroll max-xl:h-auto">
										<ChannelTypeComponent
											type={ChannelType.CHANNEL_TYPE_TEXT}
											onChange={onChangeChannelType}
											error={isErrorType}
										/>
										<ChannelTypeComponent
											disable={false}
											type={ChannelType.CHANNEL_TYPE_VOICE}
											onChange={onChangeChannelType}
											error={isErrorType}
										/>
										<ChannelTypeComponent
											disable={true}
											type={ChannelType.CHANNEL_TYPE_FORUM}
											onChange={onChangeChannelType}
											error={isErrorType}
										/>
										<ChannelTypeComponent
											disable={true}
											type={ChannelType.CHANNEL_TYPE_ANNOUNCEMENT}
											onChange={onChangeChannelType}
											error={isErrorType}
										/>
									</div>
								</div>
								<ChannelNameTextField
									onChange={handleChannelNameChange}
									onCheckValidate={checkValidate}
									type={channelType}
									channelNameProps="What is channel's name?"
									error={isErrorName}
								/>
								<ChannelStatusModal onChangeValue={onChangeToggle} channelNameProps="Is private channel?" />
								<CreateChannelButton onClickCancel={handleCloseModal} onClickCreate={handleSubmit} />
							</div>
						</div>
					</div>
					{isErrorType !== '' && <AlertTitleTextWarning description={isErrorType} />}
					{isErrorName !== '' && <AlertTitleTextWarning description={isErrorName} />}
				</div>
			)
	);
};
