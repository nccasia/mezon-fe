import { useGoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useChat } from '@mezon/core';
import googleIcon from 'apps/chat/src/assets/SVG/google-icon.png';

const GoogleButtonLogin: React.FC = () => {
  const { loginByGoogle } = useChat();
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      await loginByGoogle(code);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  return (
    <button
      onClick={googleLogin}
      className="flex justify-center w-full h-fit p-3 rounded-[4px] bg-[#d1e0ff] relative"
    >
      <div className="flex  w-fit h-fit gap-x-1 p-0 ">
        <img src={googleIcon} className="p-0 " alt="Google Logo" />
        <p className="w-fit h-fit font-manrope text-base font-medium text-[#155eef] leading-[150%]">
          Continue with Google
        </p>
      </div>
    </button>
  );
};

export default GoogleButtonLogin;
