import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { styles } from './styles';
import { EAddFriendBy, EAddFriendWays } from '../../../enum';
import { MezonButton, MezonModal } from 'apps/mobile/src/app/temp-ui';
import { useAuth, useFriends } from '@mezon/core';
import { useTranslation } from 'react-i18next';
import { Colors, size } from '@mezon/mobile-ui';
import { requestAddFriendParam } from '@mezon/store-mobile';
import Toast from 'react-native-toast-message';
import { UserPlusIcon } from '@mezon/mobile-components';

interface IAddFriendModal {
    type: EAddFriendWays;
    onClose: () => void
}

export const AddFriendModal = React.memo((props: IAddFriendModal) => {
    const { type, onClose } = props;
    const { userProfile } = useAuth();
    const { addFriend } = useFriends();
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [requestAddFriend, setRequestAddFriend] = useState<requestAddFriendParam>({
		usernames: [],
		ids: [],
	});
    const [isKeyBoardShow, setIsKeyBoardShow] = useState<boolean>(false);
    const { t } = useTranslation('friends');
    const inputRef = useRef(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        setVisibleModal(type !== null);

        if (type === EAddFriendWays.UserName) {
            timeoutId = setTimeout(() => {
                if (inputRef?.current) {
                    inputRef.current.focus();
                }
            }, 300)
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                resetField();
            }
        }
    }, [type])

    const handleTextChange = (type: EAddFriendBy, text: string) => {
        switch (type) {
            case EAddFriendBy.Username:
                if ((text || '').trim().length) {
                    setRequestAddFriend({...requestAddFriend, usernames: [text]});
                } else {
                    setRequestAddFriend({...requestAddFriend, usernames: []});
                }
                break;
            case EAddFriendBy.Id:
                setRequestAddFriend({...requestAddFriend, ids: [text]})
            break;
            default:
                break;
        }
    }

    const onVisibleChange = (visible: boolean) => {
        if (!visible) {
            onClose();
        }
    }

    const resetField = () => {
		setRequestAddFriend({
			usernames: [],
			ids: [],
		});
	};

    const sentFriendRequest = async () => {
        if (!(requestAddFriend.usernames[0] || '').trim().length) return null;
        if (inputRef?.current) {
            inputRef.current.blur();
        }
        await addFriend(requestAddFriend);
        Toast.show({
            type: 'success',
            props: {
                text2: t('addFriend.addFriendToast'),
                leadingIcon: <UserPlusIcon color={Colors.green} width={30} height={17} />
            }
        });
        resetField();
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          () => {
            setIsKeyBoardShow(true);
          }
        );
    
        const keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          () => {
            setIsKeyBoardShow(false);
          }
        );

        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
      }, []);

    const addFriendByUsernameContent = () => {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.fill}
            >
                <View style={styles.fill}>
                    <View style={styles.fill}>
                        <Text style={styles.headerTitle}>{t('addFriend.addByUserName')}</Text>
                        <Text style={styles.defaultText}>{t('addFriend.whoYouWantToAddFriend')}</Text>
                        <View style={styles.searchUsernameWrapper}>
                            <TextInput
                                ref={inputRef}
                                value={requestAddFriend.usernames[0]}
                                placeholder={t('addFriend.searchUsernamePlaceholder')}
                                placeholderTextColor={Colors.tertiary}
                                style={styles.searchInput}
                                onChangeText={(text) => handleTextChange(EAddFriendBy.Username, text)}
                            />
                        </View>
                        <View style={styles.byTheWayText}>
                            <Text style={styles.defaultText}>{t('addFriend.byTheWay')}</Text>
                            <Text style={styles.whiteText}>{userProfile?.user?.username}</Text>
                        </View>
                    </View>
                    <View style={[styles.buttonWrapper, isKeyBoardShow && { marginBottom: 120 }]}>
                        <View style={{height: size.s_50}}>
                            <MezonButton
                                disabled={!requestAddFriend.usernames[0]?.length}
                                onPress={() => sentFriendRequest()}
                                viewContainerStyle={styles.sendButton}
                            >{t('addFriend.sendRequestButton')}</MezonButton>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }

    const findYourFriendContent = () => {
        return (
            <View>
                {/* TODO: update later */}
                <Text style={styles.whiteText}>Find Your Friend</Text>
                <Text style={styles.whiteText}>Let's see which of your contacts are already on Mezon</Text>
            </View>
        )
    }

    const content = useMemo(() => {
        switch (type) {
            case EAddFriendWays.FindFriend:
                return findYourFriendContent();
            case EAddFriendWays.UserName:
                return addFriendByUsernameContent();
            default:
                return <View />
        }
    }, [type, requestAddFriend, isKeyBoardShow])

    return (
        <MezonModal
            visible={visibleModal}
            visibleChange={onVisibleChange}
        >
            <View style={styles.addFriendModalContainer}>
                {content}
            </View>
        </MezonModal>
    )
})