import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  authActions,
  accountActions,
  useAppDispatch,
  selectAllAccount
} from '@mezon/store';

export function useAuth() {
  const {userProfile} = useSelector(selectAllAccount)

  const dispatch = useAppDispatch();

  const userId = useMemo(() => userProfile?.user?.id, [userProfile]);

  const fetchUserProfile = React.useCallback(
    async () => {
      const action = await dispatch(
        accountActions.getUserProfile(),
      );
      return action.payload;
    },
    [dispatch],
  );

  const loginEmail = useCallback(
    async (username: string, password: string) => {
      const action = await dispatch(
        authActions.authenticateEmail({ username, password }),
      );
      const session = action.payload;
      dispatch(accountActions.setAccount(session));
    },
    [dispatch],
  );

  const loginByGoogle = useCallback(
    async (token: string) => {
      const action = await dispatch(authActions.authenticateGoogle(token));
      const session = action.payload;
      dispatch(accountActions.setAccount(session));
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      userProfile,
      userId,
      loginEmail,
      loginByGoogle,
      fetchUserProfile
    }),
    [userProfile, userId, loginEmail, loginByGoogle, fetchUserProfile],
  );
}
