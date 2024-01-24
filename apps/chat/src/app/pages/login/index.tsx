import { LoginForm } from '@mezon/components';
import { QRSection } from 'libs/components/src/lib/components/LoginForm/QR/index';
import { TitleSection } from 'libs/components/src/lib/components/LoginForm/Title/index';
import GoogleButtonLogin from 'libs/components/src/lib/components/LoginForm/GoogleButton';
import { useSelector } from 'react-redux';
import { selectIsLogin } from '@mezon/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const isLogin = useSelector(selectIsLogin);
  const navigate = useNavigate();
  useEffect(() => {
    if (isLogin) {
      navigate('/chat/direct');
    } else {
      navigate('/guess/login');
    }
  }, [isLogin, navigate]);

  return (
    <div
      className=" w-screen h-screen flex items-center justify-center"
      style={{
        background:
          'linear-gradient(219.23deg, #2970FF 1.49%, #8E84FF 43.14%, #E0D1FF 94.04%)',
      }}
    >
      <div className="flex-row justify-center items-center flex w-[850px] h-fit p-12 gap-x-12 rounded-2xl bg-[#0b0b0b]">
        <div className="flex-col justify-start items-center flex w-full h-fit p-0 gap-y-8">
          <TitleSection />
          <GoogleButtonLogin />
          <LoginForm />
        </div>
        <QRSection />
      </div>
    </div>
  );
}

export default Login;
