type UserDescriptionProps = {
	title: string;
	detail: string;
};

const UserDescription = ({ title, detail }: UserDescriptionProps) => {
	return (
		detail && (
			<>
				<div className="w-full border-b-[1px] dark:border-[#40444b] border-gray-200 p-2"></div>
				<div className="flex flex-col">
					<div className="font-bold tracking-wider text-xs pt-2">{title}</div>
					<div className="font-normal tracking-wider text-xs one-line">{detail}</div>
				</div>
			</>
		)
	);
};
export default UserDescription;
