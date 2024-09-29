import { Icons } from '@mezon/mobile-components';
import { Block, size, Text, useTheme } from '@mezon/mobile-ui';
import { CategoriesEntity, channelsActions, selectAllCategories, useAppDispatch } from '@mezon/store-mobile';
import { ApiUpdateChannelDescRequest } from 'mezon-js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuChannelScreenProps } from '../../navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu } from '../../temp-ui';

type ChangeCategory = typeof APP_SCREEN.MENU_CHANNEL.CHANGE_CATEGORY;
export const ChangeCategory = ({ navigation, route }: MenuChannelScreenProps<ChangeCategory>) => {
	const { channel } = route.params;
	const { themeValue } = useTheme();
	const { t } = useTranslation(['channelSetting']);
    const listCategory = useSelector(selectAllCategories);
    const dispatch = useAppDispatch();

    const handleMoveChannelToNewCategory = async (category: CategoriesEntity) => {
        const updateChannel: ApiUpdateChannelDescRequest = {
          category_id: category.id,
          channel_id: channel?.channel_id ?? '',
          channel_label: channel?.channel_label
        }
        await dispatch(channelsActions.updateChannel(updateChannel)).then(() => {
            navigation.goBack()
        })
		dispatch(channelsActions.setCurrentChannelId(channel?.channel_id))
    }

    const listOtherCategories = useMemo(() => {
        return listCategory.filter((category) => (category.id !== channel.category_id))
    }, [listCategory])

    const CategoryList = useMemo(() => 
        listOtherCategories.map((category) => {
            return {
                onPress: () => handleMoveChannelToNewCategory(category),
                title: category.category_name ?? '',
            }
    }) satisfies IMezonMenuItemProps[], []);

    const menu: IMezonMenuSectionProps[] = [
		{
			title: t('changeCategory.label', { currentChannel: channel?.category_name }),
			items: CategoryList,
		}
	];

	navigation.setOptions({
		headerTitle: () => (
			<Block>
				<Text bold h3 color={themeValue?.white}>
					{t('changeCategory.title')}
				</Text>
			</Block>
		),
		headerLeft: () => {
			return (
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Block marginLeft={size.s_16}>
						<Icons.ArrowLargeLeftIcon color={themeValue.white} height={size.s_22} width={size.s_22} />
					</Block>
				</TouchableOpacity>
			);
		}
	});

	return (
		<Block flex={1} backgroundColor={themeValue.primary} paddingHorizontal={size.s_12}>
			<MezonMenu menu={menu} />
		</Block>
	);
};
