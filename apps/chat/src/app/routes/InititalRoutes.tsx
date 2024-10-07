import { selectIsLogin } from '@mezon/store';
import { useSelector } from 'react-redux';

import { Navigate } from 'react-router-dom';

const InitialRoutes = () => {
	const isLogin = useSelector(selectIsLogin);

	if (!isLogin) {
		return <Navigate to="/desktop/login" replace />;
	}

	return <Navigate to="/chat/direct/friends" replace />;
};

export default InitialRoutes;
