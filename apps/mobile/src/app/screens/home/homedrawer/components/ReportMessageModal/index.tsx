import { IMessageWithUser } from "@mezon/utils";
import { MezonModal } from "../../../../../../app/temp-ui";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, Easing, FlatList, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import MessageItem from "../../MessageItem";
import { ChannelStreamMode } from "mezon-js";
import { CheckIcon, ChevronIcon, DotIcon } from "@mezon/mobile-components";
import { SeparatorWithSpace } from "apps/mobile/src/app/components/Common";
import { Colors, size } from "@mezon/mobile-ui";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

interface IReportMessageModalProps {
    isVisible: boolean;
    onClose: () => void;
	message: IMessageWithUser;
}

interface IReportOption {
    title: string;
    type: EReportCategory;
}

enum EReportCategory {
    ABUSE_OR_HARASSMENT = "ABUSE_OR_HARASSMENT",
    SPAM = "SPAM",
    HARMFUL_MISINFORMATION_OR_GLORIFYING_VIOLENCE = "HARMFUL_MISINFORMATION_OR_GLORIFYING_VIOLENCE",
    EXPOSING_PRIVATE_IDENTIFYING_INFORMATION = "EXPOSING_PRIVATE_IDENTIFYING_INFORMATION",
}
//mock data
const reportOptionList: IReportOption[] = [
    {
        title: 'Spam',
        type: EReportCategory.SPAM
    },
    {
        title: 'Abuse or harassment',
        type: EReportCategory.ABUSE_OR_HARASSMENT
    },
    {
        title: 'Harmful misinformation or glorifying violence',
        type: EReportCategory.HARMFUL_MISINFORMATION_OR_GLORIFYING_VIOLENCE
    },
    {
        title: 'Exposing private identifying information',
        type: EReportCategory.EXPOSING_PRIVATE_IDENTIFYING_INFORMATION
    }
]

export const ReportMessageModal = memo((props: IReportMessageModalProps) => {
    const { isVisible, onClose, message } = props;
    const [reportSelected, setReportSelected] = useState<IReportOption | null>(null);
    const slideAnim = useRef(new Animated.Value(1)).current;
    const { t } = useTranslation('message');

    const onVisibleChange = (value: boolean) => {
        if (!value) {
            onClose();
        }
    }

    useEffect(() => {
        Animated.timing(slideAnim, {
          toValue: reportSelected ? 0 : size.s_100,
          duration: 300,
          useNativeDriver: true,
        }).start();
    }, [reportSelected]);

    const handleReportMessage = async () => {
        onVisibleChange(false)
        //TODO: call api
        setTimeout(() => {
            Toast.show({
                type: 'success',
                props: {
                    text2: t('reportMessage.reportSubmitted'),
                    leadingIcon: <CheckIcon color={Colors.green} width={20} height={20} />
                }
            })
        })
    }

    return (
        <MezonModal
            visible={isVisible}
            rightClose={true}
            onBack={() => setReportSelected(null)}
            visibleBackButton={!!reportSelected}
            visibleChange={onVisibleChange}
        >
            <View style={styles.reportMessageModalContainer}>
                <View style={styles.contentWrapper}>
                    {reportSelected ? (
                        <Animated.View style={{ transform: [{translateX: slideAnim}] }}>
                            <View>
                                <Text style={styles.title}>{t('reportMessage.reportSummary')}</Text>
                                <Text style={styles.subTitle}>{t('reportMessage.reviewYourReportBeforeSubmitting')}</Text>
                            </View>
                            <View style={{marginVertical: 10}}>
                                <Text style={styles.reportCategory}>{t('reportMessage.reportCategory')}</Text>
                                
                                <View style={styles.reportCategoryWrapper}>
                                    <DotIcon color={Colors.bgViolet} height={5} width={5} />
                                    <Text style={styles.reportCategoryTitle}>{reportSelected?.title}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    ): (
                        <View>
                            <Text style={styles.title}>{t('reportMessage.title')}</Text>
                            <Text style={styles.subTitle}>{t('reportMessage.subTitle')}</Text>
                        </View>
                    )}

                    <Text style={styles.selectedMessageText}>{t('reportMessage.selectedMessage')}</Text>
                    <View style={styles.messageBox}>
                        <MessageItem
                            messageId={message.id}
                            channelId={message.channel_id}
                            mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
                            showUserInformation
                            preventAction
                        />
                    </View>

                    {!reportSelected ? (
                        <View style={styles.reportList}>
                            <FlatList
                                data={reportOptionList}
                                keyExtractor={(item) => item.type}
                                ItemSeparatorComponent={SeparatorWithSpace}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity onPress={() => setReportSelected(item)} style={styles.reportItem}>
                                            <Text style={styles.reportTitle}>{item.title}</Text>
                                            <ChevronIcon height={15} width={15}/>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    ): null}
                </View>

                {reportSelected ? (
                    <View style={styles.buttonWrapper}>
                        <Text style={styles.subTitle}>{t('reportMessage.submitDescription')}</Text>
                        <TouchableOpacity style={styles.SubmitButton} onPress={() => handleReportMessage()}>
                            <Text style={styles.SubmitText}>{t('reportMessage.submitReport')}</Text>
                        </TouchableOpacity>
                    </View>
                ): (
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity onPress={() => onVisibleChange(false)}>
                            <Text style={styles.cannelText}>{t('reportMessage.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </MezonModal>
    )
})