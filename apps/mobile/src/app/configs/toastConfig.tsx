import { Attributes, size, useTheme } from '@mezon/mobile-ui';
import { StyleSheet, View } from 'react-native';
import { BaseToast, ToastConfig } from 'react-native-toast-message';

const style = (colors: Attributes) => StyleSheet.create({
	container: {
		height: size.s_50,
		width: '80%',
		backgroundColor: colors.tertiary,
		borderRadius: size.s_40,
		flexDirection: 'row',
		alignItems: 'center',
		borderLeftColor: 'transparent',
		paddingHorizontal: size.s_20,
	},
	iconWrapper: {
		width: size.s_20,
		height: size.s_20,
	},
});

const WrapperIcon = ({ children }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return <View style={styles.iconWrapper}>{children}</View>;
};

export const toastConfig: ToastConfig = {
	/*
		Custom toast:
		They will be passed when calling the `show` method
	*/

	success: (props) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		return (
			<BaseToast
				style={styles.container}
				contentContainerStyle={{ paddingHorizontal: size.s_20 }}
				text1Style={[
					{
						fontSize: size.label,
						color: themeValue.text,
					},
					props.text1Style,
				]}
				text2Style={[
					{
						fontSize: size.medium,
						color: themeValue.text,
					},
					props.text2Style,
				]}
				text1={props.props.text1}
				text2={props.props.text2}
				renderLeadingIcon={() => <WrapperIcon>{props.props?.leadingIcon}</WrapperIcon>}
				renderTrailingIcon={() => <WrapperIcon>{props.props?.trailingIcon}</WrapperIcon>}
			/>
		);
	},
};
