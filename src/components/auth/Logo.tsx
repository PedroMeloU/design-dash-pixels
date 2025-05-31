import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="w-[115px] h-[115px] relative">
      <div 
        className="w-[115px] h-[115px] bg-[#1F3C88] absolute shadow-[0px_8px_14.8px_rgba(0,0,0,0.25)] rounded-xl left-0 top-0"
        role="presentation"
      />
      <div 
        className="w-[103px] h-[103px] bg-[#F5F7FA] absolute rounded-lg left-1.5 top-1.5"
        role="presentation"
      />
      <div 
        className="font-bold text-5xl text-[#1F3C88] leading-normal absolute w-[70px] h-[50px] left-[23px] top-[29px]"
        aria-label="Application Logo"
      >
        SS
      </div>
    </div>
  );
};
