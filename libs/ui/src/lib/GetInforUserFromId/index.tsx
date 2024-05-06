import { selectMemberByUserId } from '@mezon/store';
import { useSelector } from 'react-redux';

type Props = {
	readonly id: string;
};

export function AvatarComponent({ id }: Props) {
	const user = useSelector(selectMemberByUserId(id));
	return <img src={user?.user?.avatar_url} className="w-8 h-8 rounded-full border border-gray-500 object-cover" alt={user?.user?.avatar_url} />;
}
export function NameComponent({ id }: Props) {
	const user = useSelector(selectMemberByUserId(id));
	return <p className="text-sm font-medium text-[#AEAEAE]">{user?.user?.username}</p>;
}
