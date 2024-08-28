import { categoriesActions, selectAllCategories, selectCategoryIdSortChannel, useAppDispatch } from '@mezon/store';
import { ICategoryChannel, IChannel } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../../app/hooks/useAppNavigation';
import { useChannels } from './useChannels';

export function useCategory() {
	const { listChannels } = useChannels();
	const categories = useSelector(selectAllCategories);
	const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { toChannelPage, toMembersPage } = useAppNavigation();

	const categorizedChannels = React.useMemo(() => {
		const results = categories.map((category) => {
			const categoryChannels = listChannels.filter((channel) => channel && channel?.category_id === category.id) as IChannel[];

			if (category.category_id && categoryIdSortChannel[category.category_id]) {
				categoryChannels.sort((a, b) => {
					if (a.channel_label && b.channel_label) {
						return b.channel_label.localeCompare(a.channel_label);
					}
					return 0;
				});
			}

			return {
				...category,
				channels: categoryChannels
			};
		});

		return results as ICategoryChannel[];
	}, [categories, listChannels, categoryIdSortChannel]);

	const handleDeleteCategory = async ({ category }: { category: ICategoryChannel }) => {
		await dispatch(categoriesActions.deleteCategory({ clanId: category.clan_id as string, categoryId: category.id as string }));
		const targetIndex = categorizedChannels.findIndex((obj) => obj.category_id === category.id);

		let channelNavId = '';
		if (targetIndex !== -1) {
			if (targetIndex === 0) {
				channelNavId = categorizedChannels[targetIndex + 1]?.channels[0]?.id;
				if (!channelNavId) {
					const clanPath = toMembersPage(category.clan_id ?? '');
					navigate(clanPath);
					return;
				}
			} else if (targetIndex === categorizedChannels.length - 1) {
				channelNavId = categorizedChannels[targetIndex - 1]?.channels[0]?.id;
			} else {
				channelNavId = categorizedChannels[targetIndex - 1]?.channels[0]?.id;
			}
		}

		if (channelNavId && category.clan_id) {
			const channelPath = toChannelPage(channelNavId ?? '', category.clan_id ?? '');
			navigate(channelPath);
			return;
		}
	};

	return useMemo(
		() => ({
			categorizedChannels,
			handleDeleteCategory
		}),
		[categorizedChannels, handleDeleteCategory]
	);
}
