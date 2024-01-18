import { selectIsLogin } from '@mezon/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const AppLayout = () => {
  const isLogin = useSelector(selectIsLogin);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      navigate('/guess/login');
    }
  }, [isLogin, navigate]);

  return (
    <div id="app-layout">
      <Outlet />
    </div>
  );
};

export default AppLayout;
