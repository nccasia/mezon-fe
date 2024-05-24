
import { BaseToast, ToastConfig } from 'react-native-toast-message';
import { View, StyleSheet } from 'react-native';
import { Colors, size } from '@mezon/mobile-ui';

const styles = StyleSheet.create({
    container: {
        height: size.s_50,
        width: '80%',
        backgroundColor: Colors.surface,
        borderRadius: size.s_40,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftColor: 'transparent',
        paddingHorizontal: size.s_20,
    },
    iconWrapper: {
        width: size.s_20,
        height: size.s_20,
    }
});

const WrapperIcon = ({ children }) => {
    return (
        <View style={styles.iconWrapper}>
            {children}
        </View>
    );
}

export const toastConfig: ToastConfig = {
	/*
        Custom toast:
        They will be passed when calling the `show` method
    */

    success: (props) => {
        return (
            <BaseToast
                style={styles.container}
                contentContainerStyle={{ paddingHorizontal: size.s_20 }}
                text1Style={[{
                    fontSize: size.label,
                    color: Colors.white,
                }, props.text1Style]}
                text2Style={[{
                    fontSize: size.medium,
                    color: Colors.white,
                }, props.text2Style]}
                text1={props.props.text1}
                text2={props.props.text2}
                renderLeadingIcon={() => <WrapperIcon>{props.props?.leadingIcon}</WrapperIcon>}
                renderTrailingIcon={() => <WrapperIcon>{props.props?.trailingIcon}</WrapperIcon>}
            />
        )
    },
};