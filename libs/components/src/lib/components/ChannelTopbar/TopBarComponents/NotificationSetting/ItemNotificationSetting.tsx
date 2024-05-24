import { Icons } from '@mezon/components';
import { selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { Checkbox, Radio } from 'flowbite-react';
import { notificationSettingActions } from 'libs/store/src/lib/notificationSetting/notificationSettingChannel.slice';
import { useSelector } from 'react-redux';

type ItemNotificationSettingProps = {
	children: string;
	dropdown?: string;
	type?: 'radio' | 'checkbox' | 'none';
	onClick?: () => void;
	name?: string;
	notificationId?: string;
	notifiSelected?: boolean;
	defaultNotifi?: boolean;
	defaultNotifiName?: string;
};

const ItemNotificationSetting = ({ children, dropdown, type, onClick, name, notificationId, notifiSelected, defaultNotifi, defaultNotifiName}: ItemNotificationSettingProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();
	
	const setNotification = () =>{
		if (defaultNotifi) {
			dispatch(notificationSettingActions.deleteNotiChannelSetting({ channel_id: currentChannelId || "", clan_id: currentClanId|| ""}));
		}else {
			const body = {
				channel_id : currentChannelId|| "",
				notification_type: notificationId || "",
				clan_id: currentClanId || ""
			}
			dispatch(notificationSettingActions.setNotificationSetting(body))
		}
	}
	return (
		<div className=' hover:bg-bgSelectItem hover:[&>*]:text-[#fff]'>
			<div onClick={onClick} className="flex items-center justify-between rounded-sm hover:bg-bgSelectItem group pr-2">
			<li className="text-[14px] dark:text-[#B5BAC1] text-black group-hover:text-white w-full py-[6px] px-[8px] cursor-pointer list-none ">{children}</li>
				{dropdown && <Icons.RightIcon defaultFill="#fff" />}
				{type === 'checkbox' && <Checkbox id="accept" defaultChecked />}
				{type === 'radio' && <Radio className="" name={name} value="change here" onClick={setNotification} defaultChecked={notifiSelected}/>}
			</div>
			{defaultNotifi && 
				<div className='text-[12px] text-[#B5BAC1] ml-[10px] mt-[-10px]'>
					{defaultNotifiName}
				</div>
			}
		</div>
	);
};

export default ItemNotificationSetting;
