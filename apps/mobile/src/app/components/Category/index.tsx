import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ApiCreateCategoryDescRequest } from 'mezon-js/api.gen';
import { categoriesActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import styles from './styles';
import { CrossIcon, LockIcon } from '@mezon/mobile-components';
import { useTranslation } from 'react-i18next';
import MezonInput from '../../temp-ui/MezonInput2';
import { IMezonMenuSectionProps, MezonMenu } from '../../temp-ui';
import MezonToggleButton from '../../temp-ui/MezonToggleButton';
import { validInput } from '../../utils/validate';

type CreateCategoryScreen = typeof APP_SCREEN.MENU_CLAN.CREATE_CATEGORY;
export default function CategoryCreator({ navigation }: MenuClanScreenProps<CreateCategoryScreen>) {
    const [isPrivate, setPrivate] = useState<boolean>(false);
    const [categoryName, setCategoryName] = useState<string>("");
    const dispatch = useAppDispatch();
    const currentClanId = useSelector(selectCurrentClanId);
    const { t } = useTranslation(['categoryCreator']);

    navigation.setOptions({
        headerRight: () => (
            <Pressable onPress={handleCreateCategory}>
                <Text style={{
                    color: "white",
                    paddingHorizontal: 20,
                    opacity: categoryName.trim().length > 0 ? 1 : 0.5
                }}>
                    {t("actions.create")}
                </Text>
            </Pressable>
        ),

        headerLeft: () => (
            <Pressable style={{ padding: 20 }} onPress={handleClose}>
                <CrossIcon height={16} width={16} />
            </Pressable>
        ),
    });

    const ToggleBtn = () => <MezonToggleButton
        onChange={() => { }}
        height={25}
        width={45}
    />

    const handleCreateCategory = async () => {
        if (!validInput(categoryName)) return;

        const body: ApiCreateCategoryDescRequest = {
            clan_id: currentClanId?.toString(),
            category_name: categoryName.trim(),
        };
        await dispatch(categoriesActions.createNewCategory(body));
        setCategoryName('');

        navigation.navigate(APP_SCREEN.HOME);
    };

    function handleClose() {
        navigation.goBack();
    }

    const menuPrivate: IMezonMenuSectionProps[] = [
        {
            bottomDescription: t('fields.catePrivate.description'),
            items: [
                {
                    title: t('fields.catePrivate.title'),
                    component: <ToggleBtn />,
                    icon: <LockIcon height={18} width={18} />
                }
            ]
        }
    ]

    return (
        <View style={styles.container}>
            <MezonInput
                value={categoryName}
                onTextChange={setCategoryName}
                placeHolder={t('fields.cateName.placeholder')}
                errorMessage={t('fields.cateName.errorMessage')}
                label={t('fields.cateName.title')} />
            <MezonMenu menu={menuPrivate} />
        </View>
    )
}

