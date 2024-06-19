import React from 'react';
/**
 * ? Local Imports
 */
import { Fonts, verticalScale } from '../themes/index';
import { StyleSheet, TextProps, Text as TextRN, TextStyle } from 'react-native';

interface ITextWrapperProps extends TextProps {
	fontFamily?: string;
	children?: React.ReactNode;
	h1?: boolean;
	h2?: boolean;
	h25?: boolean;
	h3?: boolean;
	h4?: boolean;
	h5?: boolean;
	h6?: boolean;
	left?: boolean;
	bold?: boolean;
	color?: string;
	right?: boolean;
	center?: boolean;
	style?: TextStyle;
}

export const Text: React.FC<ITextWrapperProps> = ({
	fontFamily = Fonts.family.arial,
	children,
	h1,
	h2,
	h25,
	h3,
	h4,
	h5,
	h6,
	left,
	bold,
	right,
	style,
	color,
	center,
	...rest
}) => {
	return (
		<TextRN
			style={[
				style,
				h1 && styles.h1,
				h2 && styles.h2,
				h25 && styles.h25,
				h3 && styles.h3,
				h4 && styles.h4,
				h5 && styles.h5,
				h6 && styles.h6,
				center && styles.center,
				right && styles.right,
				left && styles.left,
				bold && styles.bold,
				!!color && { color: color },
				!!fontFamily && { fontFamily: fontFamily },
			]}
			{...rest}
		>
			{children}
		</TextRN>
	);
};

const styles = StyleSheet.create({
	h1: {
		fontSize: verticalScale(32),
		marginLeft: 0,
		marginRight: 0,
	},
	h2: {
		fontSize: verticalScale(24),
		marginLeft: 0,
		marginRight: 0,
	},
	h25: {
		fontSize: verticalScale(23),
		marginLeft: 0,
		marginRight: 0,
	},
	h3: {
		fontSize: verticalScale(18),
		marginLeft: 0,
		marginRight: 0,
	},
	h4: {
		fontSize: verticalScale(16),
		marginLeft: 0,
		marginRight: 0,
	},
	h5: {
		fontSize: verticalScale(13),
		marginLeft: 0,
		marginRight: 0,
	},
	h6: {
		fontSize: verticalScale(10),
		marginLeft: 0,
		marginRight: 0,
	},
	center: {
		textAlign: 'center',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
	left: {
		textAlign: 'left',
		alignItems: 'flex-start',
		alignContent: 'flex-start',
		justifyContent: 'flex-start',
	},
	right: {
		textAlign: 'right',
		alignItems: 'flex-end',
		alignContent: 'flex-end',
		justifyContent: 'flex-end',
	},
	bold: {
		fontWeight: 'bold',
	},
});
