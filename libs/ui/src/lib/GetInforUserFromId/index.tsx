type Props = {
	name?: string;
};

export function NameComponent({ name }: Props) {
	return <p className="text-sm font-medium dark:text-[#AEAEAE] text-colorTextLightMode">{name}</p>;
}
