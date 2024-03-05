import React from 'react';
// import unionClassNames from 'union-class-names';

interface ImageProps {
	// @ts-ignore
	block: any; // Adjust the type accordingly
	className?: string;
	theme?: any; // Adjust the type accordingly
	blockProps?: any; // Adjust the type accordingly
	customStyleMap?: any; // Adjust the type accordingly
	customStyleFn?: any; // Adjust the type accordingly
	decorator?: any; // Adjust the type accordingly
	forceSelection?: any; // Adjust the type accordingly
	offsetKey?: any; // Adjust the type accordingly
	selection?: any; // Adjust the type accordingly
	tree?: any; // Adjust the type accordingly
	contentState: any;
}

const ImageComponent: React.FC<ImageProps> = ({ block, className, theme = {}, contentState, ...otherProps }) => {
	const {
		blockProps, // eslint-disable-line no-unused-vars
		customStyleMap, // eslint-disable-line no-unused-vars
		customStyleFn, // eslint-disable-line no-unused-vars
		decorator, // eslint-disable-line no-unused-vars
		forceSelection, // eslint-disable-line no-unused-vars
		offsetKey, // eslint-disable-line no-unused-vars
		selection, // eslint-disable-line no-unused-vars
		tree,
		...elementProps
	} = otherProps;

	const combinedClassName = theme.image + className;
	const { src, onRemove } = contentState.getEntity(block.getEntityAt(0)).getData();

	return (
		<div className="cursor-pointer" onClick={() => onRemove(block.key)}>
			<img {...elementProps} src={src} role="presentation" className={combinedClassName} />
			<div
				className="absolute top-0 right-0 bg-[#34383E] w-8 h-8 rounded hover:bg-slate-800"
				style={{ display: 'flex', justifyContent: 'center' }}
			>
				<button className="">x</button>
			</div>
		</div>
	);
};

export default ImageComponent;
