
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Chrome, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/auth/Logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta."
      });

      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Erro no login com Google",
        description: "Não foi possível fazer login com Google.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 text-[#1F3C88] hover:bg-white/50 rounded-lg transition-colors"
        aria-label="Voltar"
      >
        <ArrowLeft size={24} />
      </button>
      
      <section className="flex flex-col items-center justify-center flex-1 px-5 max-sm:px-4 w-full max-w-md">
        <div className="mb-12 max-sm:mb-8">
          <Logo />
        </div>
        
        <div className="w-full bg-white rounded-xl shadow-lg p-8 max-sm:p-6">
          <h1 className="text-2xl font-bold text-[#1F3C88] text-center mb-6">
            Cadastro
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1F3C88] font-medium">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
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
                placeholder="Digite seu email"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1F3C88] font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1F3C88] font-medium">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className="border-gray-300 focus:border-[#1F3C88] focus:ring-[#1F3C88]"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Cadastrar'}
            </Button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <Button 
            onClick={handleGoogleAuth}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            <Chrome size={20} className="mr-2" />
            Continuar com Google
          </Button>
          
          <div className="text-center mt-6">
            <span className="text-[rgba(28,28,28,0.45)] text-lg">
              Já tem uma conta?{' '}
            </span>
            <Link 
              to="/login" 
              className="text-[rgba(28,28,28,0.45)] text-lg underline hover:text-[rgba(28,28,28,0.65)] transition-colors"
            >
              Fazer login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
