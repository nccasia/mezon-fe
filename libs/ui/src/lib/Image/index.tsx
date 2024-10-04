import { Img, ImgProps } from 'react-image';

export type ImageProps = ImgProps & {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	placeholder?: string;
	blurdataurl?: string;
};

function Image({ loading = 'lazy', ...rest }: ImageProps) {
	return <Img {...rest} loading={loading} />;
}

export default Image;
