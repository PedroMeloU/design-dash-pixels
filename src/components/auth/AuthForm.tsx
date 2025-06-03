
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Chrome, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao SigaSeguro."
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta."
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Erro de autenticação",
        description: error instanceof Error ? error.message : "Ocorreu um erro.",
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
          redirectTo: window.location.origin
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
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1F3C88] mb-2">
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </h2>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Entre na sua conta para acessar o SigaSeguro'
            : 'Crie sua conta para começar a usar o SigaSeguro'
          }
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Senha</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
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

        {mode === 'signup' && (
          <div>
            <label className="text-sm font-medium mb-2 block">Confirmar Senha</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-[#1F3C88] hover:bg-[#1a3470]"
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
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
        className="w-full"
      >
        <Chrome size={20} className="mr-2" />
        Continuar com Google
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[#1F3C88] hover:underline text-sm"
        >
          {mode === 'login' 
            ? 'Não tem uma conta? Criar conta'
            : 'Já tem uma conta? Entrar'
          }
        </button>
      </div>
    </div>
  );
};
