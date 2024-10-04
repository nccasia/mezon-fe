import { useAuth } from '@mezon/core';
import React from 'react';
import FormLogin from './FormLogin';

export type LoginFormPayload = {
	userEmail: string;
	password: string;
	remember: boolean;
};

type LoginFormProps = {
	onSubmit?: (data: LoginFormPayload) => void;
};

function LoginForm(props: LoginFormProps) {
	const { loginEmail } = useAuth();

	const handleSubmit = React.useCallback(
		async (values: LoginFormPayload) => {
			try {
				await loginEmail(values.userEmail, values.password);
			} catch (error) {
				console.error(error);
			}
		},
		[loginEmail]
	);

	return <FormLogin onSubmit={handleSubmit} />;
}

export default LoginForm;
