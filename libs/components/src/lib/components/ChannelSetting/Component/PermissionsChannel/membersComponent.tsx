import { useAuth } from '@mezon/core';
import { ChannelMembersEntity, selectCurrentChannelId, selectMembersByChannelId } from '@mezon/store';
import { useSelector } from 'react-redux';
import * as Icons from '../../../Icons';

export type MembersComponentProps = {
	tick?: boolean;
};

const MembersComponent = ({ tick }: MembersComponentProps) => {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const rawMembers = useSelector(selectMembersByChannelId(currentChannelId));
	const { userProfile } = useAuth();

	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	return (
		<div className="pt-4">
			{rawMembers.map((user: ChannelMembersEntity, index) => (
				<div className="flex justify-between pb-4" key={user.id}>
					<div className="flex gap-x-2">
						{tick && (
							<input
								id={`checkbox-item-${index}`}
								type="checkbox"
								value={user.name}
								className="peer relative appearance-none w-5 h-5 border rounded-sm focus:outline-none checked:bg-gray-300"
							/>
						)}
						<img src={user.user?.avatar_url} alt={user.name} className="size-6 object-cover rounded-full" />
						<p className="text-sm">{user.user?.display_name}</p>
					</div>
					<div className="flex items-center">
						<p className="text-xs text-[#AEAEAE] mr-2">{checkOwner(user.user?.google_id || '') ? 'Server Owner' : ''}</p>
						{!tick && (
							<Icons.EscIcon
								defaultSize={`${checkOwner(user.user?.google_id || '') ? '' : 'cursor-pointer'} size-[15px]`}
								defaultFill={`${checkOwner(user.user?.google_id || '') ? '#4C4D55' : '#AEAEAE'}`}
							/>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default MembersComponent;
