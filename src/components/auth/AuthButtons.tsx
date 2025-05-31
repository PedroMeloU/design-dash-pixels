import React from 'react';

export const AuthButtons: React.FC = () => {
  const handleLogin = () => {
    // Implement login logic
    console.log('Login clicked');
  };

  const handleSignup = () => {
    // Implement signup logic
    console.log('Signup clicked');
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLogin}
        className="flex w-[201px] h-[57px] justify-center items-center gap-2 bg-[#1F3C88] mb-3 px-4 rounded-lg max-sm:w-full max-sm:max-w-[280px] hover:bg-[#162d66] transition-colors"
        aria-label="Login"
      >
        <span className="font-normal text-2xl text-white leading-[33.6px]">
          Login
        </span>
      </button>
      
      <div className="font-normal text-2xl text-[rgba(28,28,28,0.45)] leading-[33.6px] h-[34px] mb-[3px]">
        or
      </div>
      
      <button
        onClick={handleSignup}
        className="font-normal text-2xl text-[rgba(28,28,28,0.45)] leading-[33.6px] underline hover:text-[rgba(28,28,28,0.65)] transition-colors"
        aria-label="Sign up"
      >
        sing-up
      </button>
    </div>
  );
};
