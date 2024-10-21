import { canvasActions } from '@mezon/store';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

interface ActiveFormats {
	bold: boolean;
	italic: boolean;
	underline: boolean;
	strike: boolean;
	'code-block': boolean;
	link: boolean;
	header?: string;
}

type CanvasContentProps = {
	isLightMode: boolean;
	content: string;
	idCanvas: string;
	isEditCanvas: boolean;
};

function CanvasContent({ isLightMode, content, idCanvas, isEditCanvas }: CanvasContentProps) {
	const [toolbarVisible, setToolbarVisible] = useState(false);
	const quillRef = useRef<Quill | null>(null);
	const editorRef = useRef<HTMLDivElement | null>(null);
	const toolbarRef = useRef<HTMLDivElement | null>(null);
	const dispatch = useDispatch();
	const [quill, setQuill] = useState<Quill | null>(null);
	const placeholderColor = isLightMode ? 'rgba(0,0,0,0.6)' : '#ffffff';

	const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
		bold: false,
		italic: false,
		underline: false,
		strike: false,
		'code-block': false,
		link: false,
		header: 'paragraph'
	});

	useEffect(() => {
		if (content && quillRef.current) {
			const selection = quillRef.current.getSelection();
			quillRef.current.setContents(JSON.parse(content));
			if (selection) {
				quillRef.current.setSelection(selection.index, selection.length);
			}
		}
	}, [content]);

	useEffect(() => {
		quillRef.current = new Quill('#editor', {
			theme: 'snow',
			modules: {
				toolbar: false,
				clipboard: {
					matchVisual: false
				}
			},
			placeholder: 'Type / to insert...'
		});
		setQuill(quillRef.current);

		quillRef.current.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
			delta.ops.forEach((op) => {
				if (op.attributes && op.attributes.background) {
					delete op.attributes.background;
				}
				// if (op.attributes && op.attributes.color) {
				// 	op.attributes.color = isLightMode ? 'black' : 'white';
				// }
			});
			return delta;
		});

		if (content && quillRef.current) {
			quillRef.current.setContents(JSON.parse(content));
		}

		quillRef.current.on('text-change', () => {
			if (isEditCanvas) {
				const data = JSON.stringify(quillRef.current?.getContents());
				handleContentChange(data);
			} else {
				quillRef.current?.disable();
			}
		});

		const handleSelectionChange = (range: any) => {
			if (range && range.length > 0) {
				setToolbarVisible(true);
				const formats = quillRef.current?.getFormat(range) || {};
				setActiveFormats({
					bold: !!formats.bold,
					italic: !!formats.italic,
					underline: !!formats.underline,
					strike: !!formats.strike,
					'code-block': !!formats['code-block'],
					link: !!formats.link
				});
			} else {
				setToolbarVisible(false);
				setActiveFormats({
					bold: false,
					italic: false,
					underline: false,
					strike: false,
					'code-block': false,
					link: false,
					header: 'paragraph'
				});
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				setToolbarVisible(false);
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (editorRef.current && !editorRef.current.contains(event.target as Node) && !toolbarRef.current) {
				setToolbarVisible(false);
				setActiveFormats({
					bold: false,
					italic: false,
					underline: false,
					strike: false,
					'code-block': false,
					link: false,
					header: 'paragraph'
				});
			}
		};

		quillRef.current.on('selection-change', handleSelectionChange);
		quillRef.current.root.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			quillRef.current?.off('selection-change', handleSelectionChange);
			quillRef.current?.root.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isEditCanvas]);

	const handleContentChange = (content: string) => {
		dispatch(canvasActions.setContent(content));
	};

	const formatText = (format: keyof ActiveFormats) => {
		if (quillRef.current && isEditCanvas) {
			const currentFormat = quillRef.current.getFormat();
			const isActive = !!currentFormat[format];
			quillRef.current.format(format, !isActive);

			setActiveFormats((prev) => ({
				...prev,
				[format]: !isActive
			}));
		}
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (quill && isEditCanvas) {
			if (value === 'h1') {
				quill.format('header', 1);
			} else if (value === 'h2') {
				quill.format('header', 2);
			} else if (value === 'h3') {
				quill.format('header', 3);
			} else if (value === 'paragraph') {
				quill.format('header', false);
			} else if (value === 'check-list') {
				quill.format('list', 'check');
			} else if (value === 'order-list') {
				quill.format('list', 'ordered');
			} else if (value === 'bullet-list') {
				quill.format('list', 'bullet');
			} else if (value === 'code-block') {
				quill.format('code-block', true);
			} else if (value === 'block-quote') {
				quill.format('blockquote', true);
			}
			setActiveFormats((prevFormats) => {
				const updatedFormats = {
					...prevFormats,
					header: value
				};
				return updatedFormats;
			});
		}
	};

	const getStyle = (type: 'button' | 'option', value: string | keyof ActiveFormats) => {
		if (type === 'button') {
			const format = value as keyof ActiveFormats;
			// active ? black : !light ? black : white

			return {
				padding: '5px',
				fontWeight: format === 'bold' ? 600 : 'normal',
				fontStyle: format === 'italic' ? 'italic' : 'normal',
				textDecoration: format === 'underline' ? 'underline' : format === 'strike' ? 'line-through' : 'none',
				backgroundColor: activeFormats[format] ? (isLightMode ? '#d3d3d3' : '#555') : 'transparent',
				color:
					activeFormats[format] && isLightMode ? 'rgb(51, 51, 51)' : !activeFormats[format] && !isLightMode ? 'rgb(51, 51, 51)' : 'white',
				border: 'none',
				cursor: 'pointer',
				borderRadius: '5px'
			};
		} else if (type === 'option') {
			const optionValue = value as string;
			return {
				backgroundColor: activeFormats.header === optionValue ? (isLightMode ? '#d3d3d3' : '#555') : 'transparent',
				color:
					activeFormats.header === optionValue && isLightMode
						? 'rgb(51, 51, 51)'
						: !(activeFormats.header === optionValue) && !isLightMode
							? 'rgb(51, 51, 51)'
							: 'white'
			};
		}
		return {};
	};

	useEffect(() => {
		quillRef?.current?.setContents(quillRef.current.getContents());
		quillRef?.current?.formatText(0, quillRef.current.getLength(), { color: isLightMode ? 'rgb(51, 51, 51)' : 'white' });
	}, [isLightMode, idCanvas]);

	return (
		<div className="note-canvas" style={{ position: 'relative' }}>
			{toolbarVisible && (
				<div
					ref={toolbarRef}
					id="toolbar"
					className="toolbar"
					style={{
						position: 'absolute',
						top: '-30px',
						left: '0',
						padding: '0 10px',
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
						background: isLightMode ? '#333' : '#f0f0f0',
						color: isLightMode ? 'white' : 'rgb(51, 51, 51)',
						borderRadius: '5px',
						zIndex: 99,
						boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
					}}
				>
					{/* Header Selection */}
					<select
						className="header-select"
						style={{
							padding: '5px',
							borderRadius: '3px',
							border: 'none',
							background: isLightMode ? '#333' : '#f0f0f0',
							color: isLightMode ? 'white' : 'rgb(51, 51, 51)'
						}}
						value={activeFormats.header || 'paragraph'}
						onChange={handleSelectChange}
						defaultValue="paragraph"
					>
						<option value="paragraph" style={getStyle('option', 'paragraph')}>
							<svg data-5iu="true" data-qa="paragraph" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
								<path
									fill="currentColor"
									fill-rule="evenodd"
									d="M7.25 3.007C5.42 3.109 4 4.335 4 6.25s1.42 3.14 3.25 3.243zm0 7.988C4.75 10.886 2.5 9.152 2.5 6.25c0-2.999 2.402-4.75 5-4.75h9.25a.75.75 0 0 1 0 1.5h-3v14.75a.75.75 0 0 1-1.5 0V3h-3.5v14.75a.75.75 0 0 1-1.5 0z"
									clip-rule="evenodd"
								></path>
							</svg>{' '}
							Paragraph
						</option>
						<option value="h1" style={getStyle('option', 'h1')}>
							<svg
								data-5iu="true"
								data-qa="heading-1"
								aria-hidden="true"
								viewBox="0 0 20 20"
								className="is-inline"
								style={{ width: '1em', height: '1em' }}
							>
								<path
									fill="currentColor"
									fill-rule="evenodd"
									d="M3 3.25a.75.75 0 0 0-1.5 0v13.5a.75.75 0 0 0 1.5 0v-6h6.2v6a.75.75 0 0 0 1.5 0V3.25a.75.75 0 0 0-1.5 0v6H3zM17.45 8.5a.75.75 0 0 0-1.191-.607l-2.75 2a.75.75 0 1 0 .882 1.214l1.559-1.134v6.777a.75.75 0 0 0 1.5 0z"
									clip-rule="evenodd"
								></path>
							</svg>{' '}
							H1 Big Heading
						</option>
						<option value="h2" style={getStyle('option', 'h2')}>
							H2 Medium heading
						</option>
						<option value="h3" style={getStyle('option', 'h3')}>
							H3 Small heading
						</option>
						<hr></hr>
						<option value="check-list" style={getStyle('option', 'check-list')}>
							Checked list
						</option>
						<option value="order-list" style={getStyle('option', 'order-list')}>
							Ordered list
						</option>
						<option value="bullet-list" style={getStyle('option', 'bullet-list')}>
							Bulleted list
						</option>
						<hr></hr>
						<option value="code-block" style={getStyle('option', 'code-block')}>
							Code block
						</option>
						<option value="block-quote" style={getStyle('option', 'block-quote')}>
							Blockquote
						</option>
					</select>

					<span
						className={`separator ${isLightMode ? 'bg-white' : 'bg-[#8080808f]'}`}
						style={{ height: '20px', width: '1px', margin: '0 4px' }}
					></span>

					<button type="button" onClick={() => formatText('bold')} style={getStyle('button', 'bold')} title="Bold">
						<svg data-5iu="true" data-qa="bold" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>

					<button type="button" onClick={() => formatText('italic')} style={getStyle('button', 'italic')} title="Italic">
						<svg data-5iu="true" data-qa="italic" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>

					<button type="button" onClick={() => formatText('strike')} style={getStyle('button', 'strike')} title="Strikethrough">
						<svg data-5iu="true" data-qa="strikethrough" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>

					<span
						className={`separator ${isLightMode ? 'bg-white' : 'bg-[#8080808f]'}`}
						style={{ height: '20px', width: '1px', margin: '0 4px' }}
					></span>

					<button type="button" onClick={() => formatText('code-block')} style={getStyle('button', 'code-block')} title="Code Block">
						<svg data-5iu="true" data-qa="code" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>
					<span
						className={`separator ${isLightMode ? 'bg-white' : 'bg-[#8080808f]'}`}
						style={{ height: '20px', width: '1px', margin: '0 4px' }}
					></span>
					<button type="button" onClick={() => formatText('link')} style={getStyle('button', 'link')} title="Link">
						<svg data-5iu="true" data-qa="link" aria-hidden="true" viewBox="0 0 20 20" style={{ width: '1em', height: '1em' }}>
							<path
								fill="currentColor"
								fill-rule="evenodd"
								d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>
				</div>
			)}
			<div
				id="editor"
				ref={editorRef}
				style={{
					height: 'auto',
					width: '100%',
					fontSize: '15px',
					color: isLightMode ? 'black' : 'white',
					border: 'none'
				}}
			/>
			<style>
				{`
				.ql-editor.ql-blank::before {
					color: ${placeholderColor};
					opacity: 1; 
				}

				.ql-snow .ql-editor code {
					background-color: #23241f;
					color: #f0f0f0 !important;
				}
					span, strong {
						color: ${placeholderColor} !important;
					}
        `}
			</style>
		</div>
	);
}

export default CanvasContent;
