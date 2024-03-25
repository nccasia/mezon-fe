import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownFormatTextProps = {
	markdown: string;
};

const MarkdownFormatText = ({ markdown }: MarkdownFormatTextProps) => {
	return (
		<Markdown
			remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
			children={markdown}
			className="prose prose-sm prose-ul:leading-[6px] prose-blockquote:leading-[6px] prose-ol:leading-[6px]"
		/>
	);
};

export default MarkdownFormatText;
