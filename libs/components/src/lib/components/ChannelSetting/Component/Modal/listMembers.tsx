import { Icons } from '@mezon/ui';
import { getAvatarForPrioritize, getNameForPrioritize } from '@mezon/utils';
import { ApiUser } from 'mezon-js/api.gen';
import { AvatarImage } from '../../../AvatarImage/AvatarImage';

type ListMembersProps = {
	listItem: (ApiUser | undefined)[];
	selectedUserIds: string[];
	handleCheckboxUserChange: (event: React.ChangeEvent<HTMLInputElement>, userId: string) => void;
};

const ListMembers = (props: ListMembersProps) => {
	const { listItem, selectedUserIds, handleCheckboxUserChange } = props;
	return listItem.map((user: any) => (
		<ItemMember
			key={user?.id}
			userName={user?.username}
			displayName={user?.display_name}
			clanAvatar={user.clanAvatar}
			avatar={user?.avatar_url}
			clanName={user.clanNick}
			checked={selectedUserIds.includes(user?.id || '')}
			onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleCheckboxUserChange(event, user?.id || '')}
		/>
	));
};

export default ListMembers;

type ItemMemberProps = {
	userName?: string;
	displayName?: string;
	clanName?: string;
	clanAvatar?: string;
	avatar?: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ItemMember = (props: ItemMemberProps) => {
	const { userName = '', displayName = '', clanName = '', clanAvatar = '', avatar = '', checked, onChange } = props;
	const namePrioritize = getNameForPrioritize(clanName, displayName, userName);
	const avatarPrioritize = getAvatarForPrioritize(clanAvatar, avatar);
	return (
		<div className={`flex justify-between py-2 rounded hover:bg-[#E1E2E4] dark:hover:bg-[#43444B] px-[6px]`}>
			<label className="flex gap-x-2 items-center w-full">
				<div className="relative flex flex-row justify-center">
					<input
						type="checkbox"
						value={displayName}
						checked={checked}
						onChange={onChange}
						className="peer appearance-none forced-colors:appearance-auto relative w-4 h-4 border dark:border-textPrimary border-gray-600 rounded-md focus:outline-none"
					/>
					<Icons.Check className="absolute invisible peer-checked:visible forced-colors:hidden w-4 h-4" />
				</div>
				<AvatarImage
					alt={userName}
					userName={userName}
					className="min-w-6 min-h-6 max-w-6 max-h-6"
					src={avatarPrioritize}
					classNameText="text-[9px] pt-[3px]"
				/>
				<p className="text-sm one-line">{namePrioritize}</p>
				<p className="text-contentTertiary font-light">{userName}</p>
			</label>
		</div>
	);
};
