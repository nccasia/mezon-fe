import Markdown from 'markdown-to-jsx';
import PreClass from './PreClass';

type MarkdownFormatTextProps = {
	markdown: string;
	tagName?: string;
};

const MarkdownFormatText = ({ markdown,tagName }: MarkdownFormatTextProps) => {
	return (
		<article className=" prose prose-pre:w-[600px] prose-sm prose-ul:leading-[6px] prose-code:text-[15px] prose-blockquote:leading-[6px] prose-ol:leading-[6px] prose-p:leading-[20px] prose-li:relative prose-li:bottom-[-5px]">
			{tagName && (
				<span style={{color:'#3297ff'}} className='cursor-pointer'>
					{tagName}
				</span>
			)}
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
