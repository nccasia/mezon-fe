import { Dimensions, Platform } from 'react-native';

export const { width, height } = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

// Used via Metrics.baseMargin
const Metrics = {
  zero: 0,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,
  textFieldRadius: 6,
  borderLineWidth: 1,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  navBarHeight: Platform.OS === 'ios' ? verticalScale(64) : verticalScale(54),
  buttonRadius: 4,
  icons: {
    tiny: 16,
    small: 20,
    medium: 30,
    large: 45,
    xl: 50
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    logo: 200
  },
  headerShadow: {
    shadowColor: 'grey',
    shadowOffset: { width: 1, height: 2.5 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2
  },
  size: {
    xs: 3,
    s: 5,
    m: 10,
    l: 15,
    xl: 20,
    xxl: 25,
    xxxl: 30
  }
};
export {
  horizontalScale,
  verticalScale,
  moderateScale,
  Metrics
};
