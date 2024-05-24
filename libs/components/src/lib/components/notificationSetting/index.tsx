import { useCategory, useClans } from '@mezon/core';
import {
	defaultNotificationActions,
	defaultNotificationCategoryActions,
	notificationSettingActions,
	selectAllchannelCategorySetting,
	selectCurrentClanId,
	selectDefaultNotificationClan,
	selectnotificatonSelected,
	useAppDispatch,
} from '@mezon/store';
import { NotificationType } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Creatable from 'react-select/creatable';
import Modal from '../../../../../ui/src/lib/Modal';
export type ModalParam = {
	onClose: () => void;
	open: boolean;
	channelID: string;
};

const customStyles = {
	control: (provided: any) => ({
		...provided,
		backgroundColor: 'black',
	}),
	menu: (provided: any) => ({
		...provided,
		backgroundColor: 'bg-[#36393e]',
	}),
	option: (provided: any, state: any) => ({
		...provided,
		backgroundColor: state.isFocused ? '#36393e' : '#1f2023',
		color: 'white',
	}),
	multiValue: (provided: any) => ({
		...provided,
		backgroundColor: '#1f2023',
	}),
	multiValueLabel: (provided: any) => ({
		...provided,
		color: 'black',
	}),
	multiValueRemove: (provided: any) => ({
		...provided,
		color: 'red',
		':hover': {
			backgroundColor: '#36393e',
			color: 'white',
		},
	}),
};

const ModalNotificationSetting = (props: ModalParam) => {
	const { currentClan } = useClans();
	const notificationTypes = Object.values(NotificationType);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	const notificatonSelected = useSelector(selectnotificatonSelected);
	const channelCategorySettings = useSelector(selectAllchannelCategorySetting);
    const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();
	const handleNotificationClanChange = (event: any, notification: string) => {
		dispatch(defaultNotificationActions.setDefaultNotificationClan({ clan_id: currentClan?.id, notification_type: notification }));
	};
	const onCloseModal = () => {
		props.onClose();
	};
	const { categorizedChannels } = useCategory();
	const options = categorizedChannels.flatMap((category) => [
		{
			id: category.id,
			label: category.category_name,
			title: 'category',
		},
		...category.channels
			.filter((channel) => channel.type !== 4)
			.map((channel) => ({
				id: channel.id,
				label: `# ${channel.channel_label}`,
				title: 'channel',
			})),
	]);
	const [selectedOption, setSelectedOption] = useState(null);
	const handleChange = (newValue: any) => {
		setSelectedOption(newValue);
		if (newValue.title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.setDefaultNotificationCategory({
					category_id: newValue.id,
					notification_type: defaultNotificationClan?.notification_setting_type,
                    clan_id: currentClanId || ""
				}),
			);
		}
		if (newValue.title === 'channel') {
			dispatch(
				notificationSettingActions.setNotificationSetting({
					channel_id: newValue.id,
					notification_type: notificatonSelected?.notification_setting_type,
                    clan_id: currentClanId || ""
				}),
			);
		}
	};

	const handleDefaultNotificationChange = (notificationType: any, channelCategoryId: any, title: string) => {
		if (title === 'category') {
			dispatch(
				defaultNotificationCategoryActions.setDefaultNotificationCategory({
					category_id: channelCategoryId,
					notification_type: notificationType,
                    clan_id: currentClanId || ""
				}),
			);
		}
		if (title === 'channel') {
			dispatch(
				notificationSettingActions.setNotificationSetting({
					channel_id: channelCategoryId,
					notification_type: notificationType,
                    clan_id: currentClanId || ""
				}),
			);
		}
	};

    const handleRemoveOverride = (title: string, id: string) => {
                if (title=== 'category') {
                    dispatch(defaultNotificationCategoryActions.deleteDefaultNotificationCategory({category_id:id, clan_id: currentClan?.clan_id}));
                }
                if (title === 'channel') {
                    dispatch(notificationSettingActions.deleteNotiChannelSetting({ channel_id: id, clan_id: currentClanId|| ""}));
                }
            }
	return (
		<Modal
			title="Notification Setting"
			onClose={() => {
				onCloseModal();
			}}
			showModal={props.open}
			subTitleBox={`Máy chủ của ${currentClan?.clan_name}`}
			classSubTitleBox="ml-[0px] mt-[15px] cursor-default"
			borderBottomTitle="border-b "
		>
			<div>
				<hr />
				<div>
					<div>CLAN NOTIFICATION SETTINGS</div>
					<div>
						{notificationTypes.map((notificationType, index) => (
							<div key={index} className="flex items-center">
								<input
									type="radio"
									id={`notification-${index}`}
									name="notification-setting"
									value={notificationType}
									className="mr-2"
									checked={notificationType === defaultNotificationClan?.notification_setting_type}
									onChange={(event) => handleNotificationClanChange(event, notificationType)}
								/>
								<label htmlFor={`notification-${index}`}>{notificationType}</label>
							</div>
						))}
					</div>
					<hr />
					<div>NOTIFICATION OVERRIDES</div>
					<div>Add a channel to override its default notification settings</div>
					<Creatable
						isClearable
						onChange={handleChange}
						options={options}
						value={selectedOption}
						placeholder="Select or create an option..."
						styles={customStyles}
					/>
					<div className="mt-4 overflow-y-auto max-h-[200px]">
						<table className="w-full mt-4">
							<thead>
								<tr>
									<th className="w-40 text-left">CHANNEL OR CATEGORY</th>
									<th className="w-15">ALL</th>
									<th className="w-15">MENTIONS</th>
									<th className="w-15">NOTHING</th>
									<th className="w-15">Mute</th>
								</tr>
							</thead>
							<tbody>
								{channelCategorySettings.map((channelCategorySetting, index) => (
									<tr key={index} className="group relative">
										<td className="w-40">{channelCategorySetting.channel_category_label}</td>
										{notificationTypes.map((notificationType) => (
											<td key={notificationType} className="w-15 text-center">
												<input
													type="radio"
													name={`notification-${channelCategorySetting.id}`}
													checked={notificationType === channelCategorySetting.notification_setting_type}
													onChange={() =>
														handleDefaultNotificationChange(
															notificationType,
															channelCategorySetting.id,
															channelCategorySetting.channel_category_title || '',
														)
													}
												/>
											</td>
										))}
										<td className="w-15 text-center relative">
                                        <input type="checkbox" />
                                        <button
                                            className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hidden group-hover:block"
                                            onClick={() => handleRemoveOverride(channelCategorySetting.channel_category_title || "", channelCategorySetting.id || "")}
                                        >
                                            x
                                        </button>
                                    </td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</Modal>
	);
};
export default ModalNotificationSetting;
