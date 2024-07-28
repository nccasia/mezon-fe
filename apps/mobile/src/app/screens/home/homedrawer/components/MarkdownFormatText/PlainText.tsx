import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import {Linking, Text} from 'react-native';
import { style } from './styles';

type IPlainText = {
	key: string;
	text: string;
	isLink?: boolean;
};
export const PlainText = React.memo(({ key, text, isLink = false }: IPlainText) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	const openUrl = (url: string) => {
		if (isLink)
		Linking.openURL(url);
	}
	
	return (
		<Text key={key} style={[styles.plainText, isLink && styles.textLink]} onPress={() => openUrl(text)}>
			{text}
		</Text>
	);
});
