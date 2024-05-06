import { Appearance } from 'react-native';

const isDarkTheme = Appearance.getColorScheme() === 'dark';

const colors = {
	transparent: 'rgba(0,0,0,0)',
	white: isDarkTheme ? '#FFFFFF' : '#000000',
	black: isDarkTheme ? '#000000' : '#FFFFFF',
	textGray: isDarkTheme ? '#c7c7c7' : '#c7c7c7',
	titleReset: isDarkTheme ? 'rgba(148, 154, 164, 1)' : 'rgb(44,44,45)',
	gray72: isDarkTheme ? '#727272' : '#727272',
	Tertiary: isDarkTheme ? '#AEAEAE' : '#AEAEAE',
	gray48: isDarkTheme ? '#484848' : '#484848',
};

export default colors;
