import React, { useMemo } from "react";
import { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Colors } from "@mezon/mobile-ui";

const Backdrop = (props: BottomSheetBackdropProps) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.animatedIndex.value,
      [-1, 0],
      [0, 0.7],
      Extrapolation.CLAMP
    ),
  }));

  const containerStyle = useMemo(
    () => [
      props.style,
      {
        backgroundColor: Colors.primary,
      },
      containerAnimatedStyle,
    ],
    [props.style, containerAnimatedStyle]
  );
  return (
    <BottomSheetBackdrop
      {...props}
      style={containerStyle}
      pressBehavior="close"
    />
  )
}

export default Backdrop;