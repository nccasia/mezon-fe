import { selectMemberByUserId } from '@mezon/store';
import { useSelector } from 'react-redux';

type Props = {
	readonly id: string;
	url?: string;
	name?: string;
};

export function AvatarComponent({ id, url }: Props) {
	const user = useSelector(selectMemberByUserId(id));
	return <img src={url ? url : user?.user?.avatar_url} className="w-8 h-8 rounded-full border border-gray-500 object-cover" alt={url ? url : user?.user?.avatar_url} />;
}
export function NameComponent({ id, name }: Props) {
	const user = useSelector(selectMemberByUserId(id));
	return <p className="text-sm font-medium dark:text-[#AEAEAE] text-colorTextLightMode">{name ? name : user?.user?.username}</p>;
}
