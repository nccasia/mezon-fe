import Markdown from 'markdown-to-jsx';
import PreClass from './PreClass';

type MarkdownFormatTextProps = {
	markdown: string;
};

const MarkdownFormatText = ({ markdown }: MarkdownFormatTextProps) => {
	return (
		<article className="prose prose-pre:w-[600px] prose-sm prose-ul:leading-[6px] prose-code:text-[15px] prose-blockquote:leading-[6px] prose-ol:leading-[6px] prose-p:leading-[20px] prose-li:relative prose-li:bottom-[-5px]">
			<Markdown
				children={markdown}
				options={{
					overrides: {
						pre: {
							component: PreClass,
						},
						li: {
							props: 'liProps',
						},
						ol: {
							props: 'olProps',
						},
					},
				}}
			/>
		</article>
	);
};

export default MarkdownFormatText;
