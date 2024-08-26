import { CheckIcon, isEqual } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { categoriesActions, selectCategoryById, useAppDispatch } from '@mezon/store-mobile';
import { UserShieldIcon } from 'libs/mobile-components/src/lib/icons2';
import { ApiUpdateCategoryDescRequest } from 'mezon-js/api.gen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonConfirm, MezonInput, MezonMenu } from '../../temp-ui';
import { style } from './styles';

type ScreenChannelSetting = typeof APP_SCREEN.MENU_CLAN.CATEGORY_SETTING;
export default function CategorySetting({ navigation, route }: MenuClanScreenProps<ScreenChannelSetting>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['categorySetting']);
	const dispatch = useAppDispatch();
    const { categoryId } = route.params;
    const category = useSelector(selectCategoryById(categoryId || ''));
	const [isVisibleDeleteChannelModal, setIsVisibleDeleteChannelModal] = useState<boolean>(false);
	const [categorySettingValue, setCategorySettingValue] = useState<string>('');
	const [currentSettingValue, setCurrentSettingValue] = useState<string>('');

    const isNotChanged = useMemo(() => {
		return isEqual(categorySettingValue, currentSettingValue);
	}, [categorySettingValue, currentSettingValue]);

    useEffect(() => {
		if (category?.category_id) {
			setCategorySettingValue(category?.category_name);
			setCurrentSettingValue(category?.category_name);
		}
	}, [category]);

    const permissionMenu = useMemo(
		() =>
			[
				{
					title: t('fields.categoryPermission.permission'),
					expandable: true,
					icon: <UserShieldIcon color={themeValue.text} />,
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);

    const deleteMenu = useMemo(
		() =>
			[
				{
					title: t('fields.categoryDelete.delete'),
					textStyle: { color: 'red' },
					onPress: () => handlePressDeleteCategory(),
				},
			] satisfies IMezonMenuItemProps[],
		[],
	);
    
    const menu = useMemo(
		() =>
			[
				{
					items: permissionMenu,
					bottomDescription: t('fields.categoryPermission.description'),
				},
                {
                    items: deleteMenu
                }
			] satisfies IMezonMenuSectionProps[],
		[],
	);

	navigation.setOptions({
		headerTitle: t('title'),
		headerRight: () => (
			<Pressable onPress={() => handleSaveChannelSetting()}>
				<Text style={[styles.saveChangeButton, !isNotChanged ? styles.changed : styles.notChange]}>{t('confirm.save')}</Text>
			</Pressable>
		),
	});

	const handleUpdateValue = (text: string) => {
		setCurrentSettingValue(text);
	};

    const handleSaveChannelSetting = async () => {
        const request: ApiUpdateCategoryDescRequest = {
            category_id: category?.category_id || '',
            category_name: currentSettingValue,
        }
        dispatch(categoriesActions.updateCategory({
            clanId: category?.clan_id || '',
            request: request
        }))

		navigation?.goBack();
		Toast.show({
			type: 'success',
			props: {
				text2: t('toast.updated'),
				leadingIcon: <CheckIcon color={Colors.green} />,
			},
		});
	};

	const handleDeleteCategory = async () => {
		// await dispatch(
		// 	categoriesActions.deleteChannel({
		// 		categoryId: category?.category_id,
		// 		clanId: category?.clan_id,
		// 	}),
		// );
            
        navigation.navigate(APP_SCREEN.HOME);
	};

	const handleDeleteModalVisibleChange = (visible: boolean) => {
		setIsVisibleDeleteChannelModal(visible);
	};

	const handlePressDeleteCategory = () => {
		setIsVisibleDeleteChannelModal(true);
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.inputWrapper}>
				<MezonInput
					label={t('fields.categoryName.title')}
					value={currentSettingValue}
					onTextChange={handleUpdateValue}
				/>
			</View>

            <MezonMenu menu={menu} />

			<MezonConfirm
				visible={isVisibleDeleteChannelModal}
				onVisibleChange={handleDeleteModalVisibleChange}
				onConfirm={handleDeleteCategory}
				title={t('confirm.delete.title')}
				confirmText={t('confirm.delete.confirmText')}
				content={t('confirm.delete.content', {
					categoryName: category?.category_name,
				})}
			/>
		</ScrollView>
	);
}
