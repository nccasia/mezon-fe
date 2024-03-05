import { ImageProps } from '@draft-js-plugins/image/lib/Image';
import React from 'react';

const ImageComponent: React.FC<ImageProps> = ({ block, contentState, ...otherProps }) => {
	const {
		blockProps, // eslint-disable-line no-unused-vars
		customStyleMap, // eslint-disable-line no-unused-vars
		customStyleFn, // eslint-disable-line no-unused-vars
		decorator, // eslint-disable-line no-unused-vars
		forceSelection, // eslint-disable-line no-unused-vars
		offsetKey, // eslint-disable-line no-unused-vars
		selection, // eslint-disable-line no-unused-vars
		tree,
		preventScroll,
		blockStyleFn,
		...elementProps
	} = otherProps;

	const { src, onRemove } = contentState.getEntity(block.getEntityAt(0)).getData();

	return (
		<div className="cursor-pointer" onClick={() => onRemove()} {...elementProps}>
			<img src={src} role="presentation" className="imageTextChat" alt="imageTextChat" />
			<div
				className="absolute top-0 right-0 bg-[#34383E] w-8 h-8 rounded hover:bg-slate-800"
				style={{ display: 'flex', justifyContent: 'center' }}
			>
				<button className="remove-icon">x</button>
			</div>
		</div>
	);
};

export default ImageComponent;
