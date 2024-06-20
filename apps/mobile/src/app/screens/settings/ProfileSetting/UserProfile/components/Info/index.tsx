import { Text, View } from "react-native";
import styles from "./styles";
import { MezonInput } from "../../../../../../../app/temp-ui";
import { useTranslation } from "react-i18next";
import { IUserProfileValue } from "../../..";

interface IDetailInfoProps {
    value: IUserProfileValue,
    onChange: (value: Partial<IUserProfileValue>) => void
}
export default function DetailInfo({ value, onChange }: IDetailInfoProps) {
    const { t } = useTranslation(['profileSetting']);

    return (
        <View style={styles.container}>
            <View style={styles.nameWrapper}>
                <Text style={styles.name}>{value?.displayName || value?.username}</Text>
                <Text style={styles.username}>{value?.username}</Text>
            </View>

            <MezonInput
                value={value?.displayName}
                onTextChange={(newValue) => onChange({displayName: newValue})}
                placeHolder={value?.username}
                maxCharacter={32}
                label={t('fields.displayName.label')}
            />

            <MezonInput
                value={value?.aboutMe}
                onTextChange={(newValue) => onChange({aboutMe: newValue})}
                maxCharacter={128}
                textarea
                placeHolder=""
                label={t("fields.bio.label")}
            />
        </View>
    )
}