import { AvatarImage, NavLinkComponent } from '@mezon/components';
import { DirectEntity, directActions, useAppDispatch } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { NavLink, useNavigate } from 'react-router-dom';

export type DirectMessUnreadProp = {
	readonly directMessage: Readonly<DirectEntity>;
	countMessUnread: number;
};

function DirectUnreads({ directMessage, countMessUnread }: DirectMessUnreadProp) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleClick = async () => {
		await dispatch(
			directActions.joinDirectMessage({
				directMessageId: directMessage.id,
				channelName: '',
				type: directMessage.type
			})
		);

		navigate(`/chat/direct/message/${directMessage.channel_id}/${directMessage.type}`);
	};
	return (
		<NavLink to="#" onClick={handleClick}>
			<NavLinkComponent>
				<div>
					<AvatarImage
						alt={directMessage.usernames || ''}
						userName={directMessage.usernames}
						className="min-w-12 min-h-12 max-w-12 max-h-12"
						src={
							directMessage.type === ChannelType.CHANNEL_TYPE_DM
								? directMessage?.channel_avatar?.at(0)
								: 'assets/images/avatar-group.png'
						}
					/>
					{countMessUnread !== undefined && countMessUnread !== 0 && (
						<div className="absolute border-[4px] dark:border-bgPrimary border-white w-[24px] h-[24px] rounded-full bg-colorDanger text-[#fff] font-bold text-[11px] flex items-center justify-center top-7 right-[-6px]">
							{countMessUnread >= 100 ? '99+' : countMessUnread}
						</div>
					)}
				</div>
			</NavLinkComponent>
		</NavLink>
	);
}

export default DirectUnreads;
