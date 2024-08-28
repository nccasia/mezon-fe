import { getApplicationDetail } from '@mezon/store';
import { CustomLoaderFunction } from './appLoader';

interface IBotLoaderData {
	applicationId: string;
}

export const applicationLoader: CustomLoaderFunction = async ({ params, dispatch }) => {
	const { applicationId } = params;
	if (!applicationId) {
		throw new Error('Application ID null');
	}
	dispatch(getApplicationDetail({ appId: applicationId }));
	return {
		applicationId
	} as IBotLoaderData;
};
