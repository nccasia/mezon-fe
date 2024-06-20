import { ViewProps, ViewStyle } from 'react-native';

export interface BlockProps extends ViewProps, ViewStyle {
  container?: boolean;

  containerFluid?: boolean;

  block?: boolean;

  backgroundColor?: any;
}
