import { IMessageWithUser } from "@mezon/utils";
import { memo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { EMessageActionType } from "../../enums";
import Modal from "react-native-modal";
import { styles } from "./styles";
import MessageItem from "../../MessageItem";
import { ChannelStreamMode } from "mezon-js";
import { useDispatch } from "react-redux";
import { AppDispatch, pinMessageActions } from "@mezon/store-mobile";
import { SeparatorWithLine } from "../../../../../components/Common";
import { Colors } from "@mezon/mobile-ui";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { CheckIcon } from "@mezon/mobile-components";
import { useRoute } from "@react-navigation/native";
import UseMentionList from "../../../../../../app/hooks/useUserMentionList";

interface IConfirmPinMessageModalProps {
    isVisible: boolean,
    onClose: () => void,
    message: IMessageWithUser;
    type?: EMessageActionType
}

export const ConfirmPinMessageModal = memo((props: IConfirmPinMessageModalProps) => {
    const { isVisible, message, onClose, type } = props;
    const route = useRoute();
    const { params } = route;
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation('message');
    const listMentions = UseMentionList(params?.['directMessageId'] ? params?.['directMessageId'] : message?.channel_id || '');


    const onConfirm = async () => {
        switch (type) {
            case EMessageActionType.UnPinMessage:
                dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: params?.['directMessageId'] ? params?.['directMessageId'] : message?.channel_id || '', message_id: message.id }));
                break;
            case EMessageActionType.PinMessage:
                dispatch(pinMessageActions.setChannelPinMessage({ channel_id: message?.channel_id, message_id: message?.id }));
                break;
            default:
                break;
        }
        Toast.show({
			type: 'success',
			props: {
				text2: EMessageActionType.PinMessage === type ? t('pinSuccess') : t('unpinSuccess'),
				leadingIcon: <CheckIcon color={Colors.green} />,
			},
		});
        onClose()
    }
    return (
        <Modal
            isVisible={isVisible}
            animationIn={'fadeIn'}
            hasBackdrop={true}
            coverScreen={true}
            avoidKeyboard={false}
            backdropColor={'rgba(0,0,0, 0.7)'}
        >
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>{EMessageActionType.PinMessage === type ? t('pinMessage') : t('unpinMessage')}</Text>
                    <SeparatorWithLine />
                </View>
                <Text style={styles.descriptionText}>{EMessageActionType.PinMessage === type ? t('confirmPinMessage') : t('confirmUnPinMessage')}</Text>
                <View style={styles.messageBox}>
                    <ScrollView>
                        {message && <MessageItem message={message} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} showUserInformation preventAction />}
                    </ScrollView>
                </View>
                <View style={styles.buttonsWrapper}>
                    <TouchableOpacity onPress={() => onConfirm()} style={styles.yesButton}>
                        <Text style={styles.buttonText}>{t('Yes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClose()} style={styles.noButton}>
                        <Text style={styles.buttonText}>{t('No')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
})
