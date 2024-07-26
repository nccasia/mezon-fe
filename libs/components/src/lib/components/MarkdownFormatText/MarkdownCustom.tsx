import React, { memo, useEffect, useState } from 'react';
import rehypeReact from 'rehype-react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import './index.css'; // Ensure Tailwind CSS and custom styles are imported

// MentionUser Component
const MentionUser: React.FC<{ tagName: string }> = ({ tagName }) => {
	return <span className="text-red-500">@{tagName}</span>;
};

// Hashtag Component
const Hashtag: React.FC<{ tagName: string }> = ({ tagName }) => {
	return <span className="text-blue-500">#{tagName}</span>;
};

// Custom Markdown Plugins
const mentionPlugin = () => {
	return (tree: any) => {
		visit(tree, 'text', (node, index, parent) => {
			const mentionRegex = /@(\w+)/g;
			const { value } = node;
			let match;
			const nodes = [];

			let lastIndex = 0;
			while ((match = mentionRegex.exec(value))) {
				const [fullMatch, username] = match;
				const startIndex = match.index;
				const endIndex = startIndex + fullMatch.length;

				if (startIndex > lastIndex) {
					nodes.push({ type: 'text', value: value.slice(lastIndex, startIndex) });
				}

				nodes.push({
					type: 'element',
					tagName: 'mention',
					properties: { tagName: username },
					children: [{ type: 'text', value: `@${username}` }],
				});

				lastIndex = endIndex;
			}

			if (lastIndex < value.length) {
				nodes.push({ type: 'text', value: value.slice(lastIndex) });
			}

			parent.children.splice(index, 1, ...nodes);
		});
	};
};

const hashtagPlugin = () => {
	return (tree: any) => {
		visit(tree, 'text', (node, index, parent) => {
			const hashtagRegex = /#(\w+)/g;
			const { value } = node;
			let match;
			const nodes = [];

			let lastIndex = 0;
			while ((match = hashtagRegex.exec(value))) {
				const [fullMatch, hashtag] = match;
				const startIndex = match.index;
				const endIndex = startIndex + fullMatch.length;

				if (startIndex > lastIndex) {
					nodes.push({ type: 'text', value: value.slice(lastIndex, startIndex) });
				}

				nodes.push({
					type: 'element',
					tagName: 'hashtag',
					properties: { tagName: hashtag },
					children: [{ type: 'text', value: `#${hashtag}` }],
				});

				lastIndex = endIndex;
			}

			if (lastIndex < value.length) {
				nodes.push({ type: 'text', value: value.slice(lastIndex) });
			}

			parent.children.splice(index, 1, ...nodes);
		});
	};
};

// CustomMarkdown Component
const CustomMarkdown: React.FC<{ document: string }> = ({ document }) => {
	const [content, setContent] = useState<React.ReactNode>(null);

	useEffect(() => {
		const processMarkdown = async () => {
			try {
				const file = await unified()
					.use(remarkParse) // Parses the markdown to a syntax tree
					.use(remarkGfm) // Adds support for GitHub Flavored Markdown (tables, strikethrough, etc.)
					.use(mentionPlugin) // Custom plugin for mentions
					.use(hashtagPlugin) // Custom plugin for hashtags
					.use(remarkRehype) // Converts the markdown syntax tree to a rehype (HTML) syntax tree
					.use(rehypeReact, {
						createElement: React.createElement,
						components: { mention: MentionUser, hashtag: Hashtag }, // Map custom tags to React components
					} as any) // Cast to any to bypass TypeScript type errors
					.process(document);

				setContent(file.result);
			} catch (error) {
				console.error('Error processing markdown:', error);
			}
		};

		processMarkdown();
	}, [document]);

	return <div className="prose prose-lg p-4 rounded border border-gray-200 bg-gray-50">{content}</div>;
};

export default memo(CustomMarkdown);
