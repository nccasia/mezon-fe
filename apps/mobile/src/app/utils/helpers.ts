import { Platform } from 'react-native';
import qs from 'query-string';

type Size =
  | '64w'
  | '128w'
  | '320w'
  | '480w'
  | '640w'
  | '720w'
  | '960w'
  | '1280w'
  | '64h'
  | '128h'
  | '320h'
  | '480h'
  | '640h'
  | '720h'
  | '960h'
  | '1280h'; // largest web image

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'android';

export const getSnapToOffets = (imageWidth: number, padding: number, width: number, array) => {
  const imageWidthWithPadding = imageWidth + padding;
  const snapToOffsets = array.map((_, id: number) => {
    if (id === 1) {
      return id * (imageWidthWithPadding - ((width - imageWidth) / 2 - padding * 2 + 2));
    } else {
      return id * imageWidthWithPadding - ((width - imageWidth) / 2 - padding * 2 + 2);
    }
  });

  return snapToOffsets;
};
export const isImage = (url?: string) => {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)/.test(url);
};
