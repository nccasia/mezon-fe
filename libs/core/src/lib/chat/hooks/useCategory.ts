import { selectAllCategories, selectCategoryIdSortChannel } from '@mezon/store';
import { ICategoryChannel, IChannel } from '@mezon/utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useChannels } from './useChannels';

export function useCategory() {
	const { listChannels } = useChannels();
	const categories = useSelector(selectAllCategories);
	const categoryIdSortChannel = useSelector(selectCategoryIdSortChannel);

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
				channels: categoryChannels,
			};
		});

		return results as ICategoryChannel[];
	}, [categories, listChannels, categoryIdSortChannel]);

	return useMemo(
		() => ({
			categorizedChannels,
		}),
		[categorizedChannels],
	);
}
