import React from 'react';
import { TextStyle, View, ViewStyle, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { styles } from './style';

interface IMezonButtonProps extends TouchableOpacityProps {
    children: React.ReactNode | string;
    disabled?: boolean;
    onPress?: () => void;
    viewContainerStyle?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle;
}

export const MezonButton = (props: IMezonButtonProps) => {
  const {
    children,
    textStyle,
    disabled,
    viewContainerStyle,
    onPress,
  } = props;
  const isString = typeof children === 'string';

  return (
    <TouchableOpacity
      disabled={disabled}
      style={styles.fill}
      onPress={onPress}
      {...props}
    >
      <View style={[styles.buttonWrapper, disabled && styles.disable, viewContainerStyle]}>
        {isString ? (
          <Text style={[styles.text, textStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
};
