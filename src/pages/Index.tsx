import React from 'react';
import { Logo } from '@/components/auth/Logo';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { StatusBar } from '@/components/layout/StatusBar';
import { BottomBar } from '@/components/layout/BottomBar';

const Index: React.FC = () => {
  return (
    <main className="w-full min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center relative">
      <StatusBar />
      
      <section className="flex flex-col items-center justify-center flex-1 px-5 max-sm:px-4">
        <div className="mb-16 max-sm:mb-12">
          <Logo />
        </div>
        
        <AuthButtons />
      </section>

      <BottomBar />
    </main>
  );
};

export default Index;
