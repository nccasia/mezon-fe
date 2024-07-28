type PlainTextOpt = {
	text: string;
	showOnchannelLayout?: boolean;
};

export const PlainText: React.FC<PlainTextOpt> = ({ text, showOnchannelLayout }) => {
	return (
		<span
			className={`whitespace-pre-line ${showOnchannelLayout ? 'dark:text-white text-colorTextLightMode' : 'dark:text-[#B4BAC0] hover:dark:text-[#E6F3F5]'} text-[#4E5057] hover:text-[#060607]`}
		>
			{text}
		</span>
	);
};
export default PlainText;
