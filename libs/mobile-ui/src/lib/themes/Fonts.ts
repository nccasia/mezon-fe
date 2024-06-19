import { verticalScale } from "./Metrics";

const family = {
  arial: 'Arial',
};

const type = {
  light: '',
  medium: '',
  regular: '',
  bold: '',
  base: '',
};

export const size = {
  h1: 38,
  h2: 34,
  h3: 30,
  h4: 26,
  h5: 20,
  h6: 19,
  h7: 14,
  h8: 11,
  h9: 9,
  input: 18,
  regular: 17,
  medium: verticalScale(14),
  small: verticalScale(12),
  tiny: verticalScale(8.5),
  label: verticalScale(16),

	s_2: verticalScale(2),
  s_8: verticalScale(8),
  s_4: verticalScale(4),
  s_6: verticalScale(6),
  s_10: verticalScale(10),
  s_12: verticalScale(12),
  s_14: verticalScale(14),
  s_18: verticalScale(18),
  s_20: verticalScale(20),
  s_24: verticalScale(24),

  s_16: verticalScale(16),
  s_22: verticalScale(22),
  s_28: verticalScale(28),
  s_30: verticalScale(30),
  s_34: verticalScale(34),
  s_32: verticalScale(32),
  s_40: verticalScale(40),
  s_50: verticalScale(50),
  s_60: verticalScale(60),
  s_100: verticalScale(100),
};

const style = {
  h1: {
    fontFamily: type.base,
    fontSize: size.h1
  },
  h2: {
    fontWeight: 'bold',
    fontSize: size.h2
  },
  h4: {
    fontFamily: type.base,
    fontSize: size.h4
  },
  h5: {
    fontFamily: type.base,
    fontSize: size.h5
  },
  h6: {
    fontFamily: type.base,
    fontSize: size.h6
  },
  normal: {
    fontFamily: type.base,
    fontSize: size.regular
  },
  description: {
    fontFamily: type.base,
    fontSize: size.medium
  },
  label: {
    fontFamily: type.base,
    fontSize: size.label
  }
};

export default {
  type,
  size,
  style,
  family
};
