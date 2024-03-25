import { ChannelType } from '@mezon/mezon-js';
import { InputField } from '@mezon/ui';
import { ChannelStatusEnum, IChannel } from '@mezon/utils';
import * as Icons from '../../../Icons';
import MembersComponent from '../PermissionsChannel/membersComponent';
import RolesComponent from '../PermissionsChannel/rolesComponent';

interface AddMemRoleProps {
	onClose: () => void;
	channel: IChannel;
}

export const AddMemRole: React.FC<AddMemRoleProps> = ({ onClose, channel }) => {
	const isPrivate = channel.channel_private;
	return (
		<div className="fixed  inset-0 flex items-center justify-center z-50 text-white">
			<div className="fixed inset-0 bg-black opacity-80"></div>
			<div className="relative z-10 dark:bg-gray-900  bg-bgDisable p-6 rounded-[5px] w-[440px] text-[15px]">
				<h2 className="text-[24px] font-semibold text-center">Add members or roles</h2>
				<div className="flex justify-center">
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.SpeakerLocked defaultSize="w-5 h-5" />
					)}
					{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
						<Icons.HashtagLocked defaultSize="w-5 h-5 " />
					)}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
					{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
					<p className="text-[#AEAEAE] text-[16px]" style={{ wordBreak: 'break-word' }}>
						{channel.channel_label}
					</p>
				</div>
				<div className="py-3">
					<InputField type="text" placeholder="enter" className="bg-black pl-3 py-[6px] w-full border-0 outline-none rounded" />
					<p className="text-xs pt-2">Add individual members by starting with @ or type a role name</p>
				</div>
				<div className="max-h-[270px] overflow-y-scroll hide-scrollbar">
					<div>
						<h3 className="uppercase font-bold text-xs">Roles</h3>
						<RolesComponent tick={true} />
					</div>
					<div>
						<h3 className="uppercase font-bold text-xs">Members</h3>
						<MembersComponent tick={true} />
					</div>
				</div>

				<div className="flex justify-center mt-10 text-[14px]">
					<button
						color="gray"
						onClick={onClose}
						className="px-4 py-2 mr-5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
					>
						Cancel
					</button>
					<button
						color="blue"
						onClick={onClose}
						className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};
