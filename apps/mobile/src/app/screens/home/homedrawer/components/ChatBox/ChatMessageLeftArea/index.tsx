import { Icons } from "@mezon/mobile-components";
import { Block, size, useTheme } from "@mezon/mobile-ui";
import { selectCurrentChannel } from "@mezon/store-mobile";
import { useNavigation } from "@react-navigation/native";
import { Dispatch, memo, SetStateAction } from "react";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { APP_SCREEN } from "../../../../../../navigation/ScreenTypes";
import AttachmentSwitcher from "../../AttachmentPicker/AttachmentSwitcher";
import { IModeKeyboardPicker } from "../../BottomKeyboardPicker";
import { style } from "../ChatBoxBottomBar/style";

interface IChatMessageLeftAreaProps {
  text: string;
  isShowAttachControl: boolean;
  setIsShowAttachControl: Dispatch<SetStateAction<boolean>>;
  hiddenIcon?: {
    threadIcon?: boolean;
  };
  modeKeyBoardBottomSheet: IModeKeyboardPicker;
  handleKeyboardBottomSheetMode: (mode: IModeKeyboardPicker) => void;
}

export const ChatMessageLeftArea = memo(({
  text,
  isShowAttachControl,
  setIsShowAttachControl,
  hiddenIcon,
  modeKeyBoardBottomSheet,
  handleKeyboardBottomSheetMode
}: IChatMessageLeftAreaProps) => {
  const currentChannel = useSelector(selectCurrentChannel);
  const { themeValue } = useTheme();
  const styles = style(themeValue);
  const navigation = useNavigation<any>();
  return (
    <Block flexDirection="row" gap={size.s_6}>
      {text?.length > 0 && !isShowAttachControl ? (
        <TouchableOpacity style={[styles.btnIcon]} onPress={() => setIsShowAttachControl(!isShowAttachControl)}>
          <Icons.ChevronSmallLeftIcon width={22} height={22} color={themeValue.textStrong} />
        </TouchableOpacity>
      ) : (
        <>
          <Block style={styles.btnIcon}>
            <AttachmentSwitcher
              onChange={handleKeyboardBottomSheetMode}
              mode={modeKeyBoardBottomSheet}
            />
          </Block>
          {!hiddenIcon?.threadIcon && !!currentChannel?.channel_label && !Number(currentChannel?.parrent_id) && (
            <TouchableOpacity
              style={[styles.btnIcon]}
              onPress={() => navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD })}
            >
              <Icons.ThreadPlusIcon width={22} height={22} color={themeValue.textStrong} />
            </TouchableOpacity>
          )}
        </>
      )}
    </Block>
  )
})
