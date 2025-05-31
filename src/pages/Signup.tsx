
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/auth/Logo';
import { StatusBar } from '@/components/layout/StatusBar';
import { BottomBar } from '@/components/layout/BottomBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Signup attempt with:', { name, email, password });
    // Implement signup logic here
  };

  return (
    <main className="w-full min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center relative">
      <StatusBar />
      
      <section className="flex flex-col items-center justify-center flex-1 px-5 max-sm:px-4 w-full max-w-md">
        <div className="mb-12 max-sm:mb-8">
          <Logo />
        </div>
        
        <div className="w-full bg-white rounded-xl shadow-lg p-8 max-sm:p-6">
          <h1 className="text-2xl font-bold text-[#1F3C88] text-center mb-6">
            Sign Up
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1F3C88] font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1F3C88] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1F3C88] font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1F3C88] font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg mt-6"
            >
              Sign Up
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <span className="text-[rgba(28,28,28,0.45)] text-lg">
              Already have an account?{' '}
            </span>
            <Link 
              to="/login" 
              className="text-[rgba(28,28,28,0.45)] text-lg underline hover:text-[rgba(28,28,28,0.65)] transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <BottomBar />
    </main>
  );
};

export default Signup;
