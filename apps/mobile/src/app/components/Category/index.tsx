import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import LockIcon from "../../../assets/svg/lock.svg"
import { ApiCreateCategoryDescRequest } from 'mezon-js/api.gen';
import { categoriesActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import styles from './style';
import { CrossIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';

export default function CategoryCreator({ navigation }: { navigation: any }) {
    const [isPrivate, setPrivate] = useState<boolean>(false);
    const [categoryName, setCategoryName] = useState<string>("");
    const dispatch = useAppDispatch();
    const currentClanId = useSelector(selectCurrentClanId);

    navigation.setOptions({
        headerRight: () => (
            <Pressable onPress={handleCreateCategory}>
                <Text style={{ color: "white", paddingHorizontal: 20 }}>Create</Text>
            </Pressable>
        ),
        headerLeft: () => (
            <Pressable style={{ padding: 20 }} onPress={handleClose}>
                <CrossIcon height={16} width={16} />
            </Pressable>
        ),
    });

    const handleCreateCategory = async () => {
        const body: ApiCreateCategoryDescRequest = {
            clan_id: currentClanId?.toString(),
            category_name: categoryName,
        };
        await dispatch(categoriesActions.createNewCategory(body));
        setCategoryName('');

        // @ts-ignore
        navigation.navigate(APP_SCREEN.HOME);
    };

    function handleClose() {
        navigation.goBack();
    }

    function handleTogglePrivate() {
        setPrivate(previousState => !previousState);
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                    placeholderTextColor={'gray'}
                    placeholder='New Category'
                    style={styles.input}
                    value={categoryName}
                    onChangeText={setCategoryName}
                />
            </View>

            <View>
                <View style={styles.checkboxWrapper}>
                    <View style={styles.labelIconWrapper}>
                        <LockIcon height={18} width={18} />
                        <Text style={styles.labelNormal}>Private Category</Text>
                    </View>
                    <Switch
                        trackColor={{ false: Colors.gray48, true: Colors.green }}
                        onValueChange={handleTogglePrivate}
                        value={isPrivate}
                    />
                </View>
                <Text style={styles.description}>
                    By making a category private, only selected members and roles will be able to view this category. Synced channels in this category will automatically match to this setting.
                </Text>
            </View>
        </View>
    )
}

