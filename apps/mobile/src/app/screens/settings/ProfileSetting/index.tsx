import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, Alert } from 'react-native';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import UserProfile from './UserProfile';
import ServerProfile from './ServerProfile';
import MezonTabView from '../../../temp-ui/MezonTabView';
import MezonTabHeader from '../../../temp-ui/MezonTabHeader';
import { ArrowLeftIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { useAuth } from '@mezon/core';
import { isEqual } from 'lodash';
import { useEffect } from 'react';

export enum EProfileTab {
    UserProfile,
    ClanProfile
}

export interface IUserProfileValue {
    username: string;
    imgUrl: string,
    displayName: string,
    aboutMe: string,
}

export const ProfileSetting = ({ navigation }: { navigation: any }) => {
    const user = useAuth();
    const [tab, setTab] = useState<number>(0);
    const [triggerToSaveTab, setTriggerToSaveTab] = useState<EProfileTab | null>(null);
    const { t } = useTranslation(['profileSetting']);
    const [originUserProfileValue, setOriginUserProfileValue] = useState<IUserProfileValue>({
        username: '',
        imgUrl: '',
        displayName: '',
        aboutMe: '',
    });

    const [currentUserProfileValue, setCurrentUserProfileValue] = useState<IUserProfileValue>({
        username: '',
        imgUrl: '',
        displayName: '',
        aboutMe: '',
    });

    const checkIsNotChanged = (): boolean => {
        return isEqual(originUserProfileValue, currentUserProfileValue);
    }

    useEffect(() => {
        if (user?.userId) {
            const { display_name, avatar_url, username, about_me } = user.userProfile.user;
            const initialValue = {
                username,
                imgUrl: avatar_url,
                displayName: display_name,
                aboutMe: about_me
            };
            setOriginUserProfileValue(initialValue);
            setCurrentUserProfileValue(initialValue);
        }
    }, [user])

    navigation.setOptions({
        headerRight: () => (
            <Pressable onPress={() => saveCurrentTab()}>
                <Text style={[styles.saveChangeButton, checkIsNotChanged() ? styles.notChange : styles.changed]}>
                    {t("header.save")}
                </Text>
            </Pressable>
        ),
        headerLeft: () => (
            <TouchableOpacity onPress={() => handleBack()} style={styles.backArrow}>
                <ArrowLeftIcon color={Colors.textGray} />
            </TouchableOpacity>
        ),
    });

    const handleBack = () => {
        if (checkIsNotChanged()) {
            navigation.goBack();
            return;
        }

        Alert.alert(
            t('changedAlert.title'),
            t('changedAlert.description'),
            [
                {
                    text: t('changedAlert.keepEditing'),
                    style: 'cancel',
                },
                {
                    text: t('changedAlert.discard'),
                    onPress: () => navigation.goBack(),
                }
            ],
            { cancelable: false },
        );
    }

    const handleTabChange = (index: number) => {
        setTab(index);
    }

    const saveCurrentTab = () => {
        if (checkIsNotChanged()) {
            return;
        }
        if (tab === EProfileTab.UserProfile) {
            setTriggerToSaveTab(EProfileTab.UserProfile);
            return
        }

        if (tab === EProfileTab.ClanProfile) {
            setTriggerToSaveTab(EProfileTab.ClanProfile);
            return
        }
    }

    return (
        <View style={styles.container}>
            <MezonTabHeader
                tabIndex={tab}
                onChange={handleTabChange}
                tabs={[
                    t('switch.userProfile'),
                    t('switch.serverProfile')
                ]}
            />

            <MezonTabView
                pageIndex={tab}
                onChange={handleTabChange}
                views={[
                    <UserProfile
                        triggerToSave={triggerToSaveTab}
                        userProfileValue={currentUserProfileValue}
                        setCurrentUserProfileValue={setCurrentUserProfileValue}
                    />,
                    <ServerProfile trigger={0}/>,
                ]}
            />
        </View>
    )
}