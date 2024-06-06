import { Keyboard, KeyboardEvent, Text, View } from "react-native";
import styles from "./styles";
import MezonInput from "apps/mobile/src/app/temp-ui/MezonInput";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@mezon/core";

interface IDetailUser {
    username: string;
    displayName: string;
    bio: string;
}

interface IDetailInfoProps {
    value: IDetailUser,
    onChange: (value: IDetailUser) => void
}
export default function DetailInfo({ value, onChange }: IDetailInfoProps) {
    const { t } = useTranslation(['profileSetting']);
    const [displayName, setDisplayName] = useState<string>(value.displayName);
    const [username, setUsername] = useState<string>(value.username);
    const [bio, setBio] = useState<string>(value.bio);
    const auth = useAuth();

    useEffect(() => {
        onChange({ bio, displayName, username })
    }, [displayName, username, , bio])

    return (
        <View style={styles.container}>
            <View style={styles.nameWrapper}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.username}>{username}</Text>
            </View>

            <MezonInput
                value={displayName}
                onTextChange={setDisplayName}
                placeHolder={auth.userProfile.user.display_name}
                label={t('fields.displayName.label')}
            />

            <MezonInput
                value=""
                // onTextChange=
                textarea
                placeHolder=""
                label={t("fields.pronouns.label")}
            />

            <MezonInput
                value={bio}
                onTextChange={setBio}
                textarea
                placeHolder=""
                label={t("fields.bio.label")}
            />
        </View>
    )
}