import { accountActions, authActions, clansActions, getStoreAsync, selectInitialPath } from '@mezon/store';
import { IWithError } from '@mezon/utils';

export interface IAuthLoaderData {
    isLogin: boolean;
	redirect?: string;
}

function getRedirectTo(initialPath?: string): string {
	const searchParams = new URLSearchParams(window.location.search);
	const redirectParam = searchParams.get('redirect');

	if (redirectParam) {
		return redirectParam;
	}

	if (initialPath && !initialPath.startsWith('/guess')) {
		return initialPath;
	}

	return '';
}


export const authLoader = async () => {
	const store = await getStoreAsync();
	store.dispatch(clansActions.joinClan({clanId: "0"}),);
	try {
		const response = await store.dispatch(authActions.refreshSession());
		if ((response as unknown as IWithError).error) {
			throw new Error('Session expired');
		}
	
		const profileResponse = await store.dispatch(accountActions.getUserProfile());
		
		if ((profileResponse as unknown as IWithError).error) {
			throw new Error('Session expired');
		}
		return {
			isLogin: true
		} as IAuthLoaderData;
	} catch (error) {
		const initialPath = selectInitialPath(store.getState());
		
		const redirectTo = getRedirectTo(initialPath)
		const redirect = redirectTo ? `/guess/login?redirect=${redirectTo}` : '/guess/login';

		return {
			isLogin: false,
			redirect: redirect
		} as IAuthLoaderData;
	}
};

export const shouldRevalidateAuth = () => {
	return false;
};
