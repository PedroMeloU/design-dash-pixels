
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao SigaSeguro."
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google auth error details:', error);
        throw error;
      }
    } catch (error) {
      console.error('Google auth error:', error);
      
      let errorMessage = "Não foi possível fazer login com Google.";
      
      if (error instanceof Error) {
        if (error.message.includes('provider is not enabled')) {
          errorMessage = "O provedor Google não está configurado. Verifique as configurações no painel do Supabase.";
        } else if (error.message.includes('validation_failed')) {
          errorMessage = "Erro de validação. Verifique as configurações de OAuth no Google Cloud Console.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro no login com Google",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false);
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
            Login
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <Button
              type="submit"
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-normal text-lg h-[57px] rounded-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Login'}
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
            className="w-full border-gray-300 hover:bg-gray-50 h-[48px]"
            disabled={isGoogleLoading}
          >
            <Chrome size={20} className="mr-2" />
            {isGoogleLoading ? 'Conectando...' : 'Continuar com Google'}
          </Button>
          
          <div className="text-center mt-6">
            <span className="text-[rgba(28,28,28,0.45)] text-lg">
              Não tem uma conta?{' '}
            </span>
            <Link 
              to="/signup" 
              className="text-[rgba(28,28,28,0.45)] text-lg underline hover:text-[rgba(28,28,28,0.65)] transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
