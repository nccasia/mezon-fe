import { Appearance } from 'react-native';

// const isDarkTheme = Appearance.getColorScheme() === 'dark';
// TODO: hardcode to check only dark theme
const isDarkTheme = true;

const colors = {
	primary: isDarkTheme ? '#000000' : '#FFFFFF',
	surface: isDarkTheme ? '#0B0B0B' : '#F7F7F7',
	secondary: isDarkTheme ? '#151515' : '#F0F0F0',
	transparent: 'rgba(0,0,0,0)',
	white: isDarkTheme ? '#FFFFFF' : '#000000',
	black: isDarkTheme ? '#000000' : '#FFFFFF',
	textGray: isDarkTheme ? '#c7c7c7' : '#c7c7c7',
	titleReset: isDarkTheme ? 'rgba(148, 154, 164, 1)' : 'rgb(44,44,45)',
	gray72: isDarkTheme ? '#727272' : '#727272',
	tertiary: isDarkTheme ? '#AEAEAE' : '#AEAEAE',
	tertiaryWeight: isDarkTheme ? '#1E1E1E' : '#E1E1E1',
	gray48: isDarkTheme ? '#484848' : '#484848',
	textLink: '#007AFF',
};

export default colors;
