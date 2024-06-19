import { NavLink } from 'react-router-dom';
import { NavLinkComponent } from '@mezon/components';
import { Image } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import { selectDirectById } from '@mezon/store';

export type DirectMessUnreadProp = {
	readonly directMessage: Readonly<any>;
	readonly onSend: (
		DMid?: string,
		type?: number,
	) => void;
};

function DirectUnreads({ directMessage, onSend }: DirectMessUnreadProp) {
	const currentDirect = useSelector(selectDirectById(directMessage.id))
	
	return (
		<div onClick={() => onSend(directMessage.channel_id || "", directMessage.type|| 0)}>
			<div className="py-2 border-t-2 dark:border-t-borderDefault border-t-[#E1E1E1] duration-100" style={{ marginTop: '8px' }}></div>
			<NavLink to={`/chat/direct/message/${directMessage.channel_id}/${directMessage.type}`} >
				<NavLinkComponent clanName={directMessage.channel_label || ""}>
					<div>
						<Image
							src={`${directMessage.type === ChannelType.CHANNEL_TYPE_DM ? directMessage.channel_avatar : 'assets/images/avatar-group.png'}`}
							alt={'logoMezon'}
							width={48}
							height={48}
							className="clan w-full aspect-square"
						/>
						{currentDirect.count_mess_unread !== 0 && (
							<div className="absolute border-[4px] border-bgPrimary w-[24px] h-[24px] rounded-full bg-colorDanger text-[#fff] font-bold text-[11px] flex items-center justify-center top-7 right-[-6px]">
								{currentDirect.count_mess_unread}
							</div>
						)}
					</div>
				</NavLinkComponent>
			</NavLink>
		</div>
	);
}

export default DirectUnreads;
