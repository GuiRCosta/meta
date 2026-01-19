'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get form data directly for browser automation compatibility
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string || email;
    const passwordValue = formData.get('password') as string || password;

    try {
      const result = await signIn('credentials', {
        email: emailValue,
        password: passwordValue,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <Card className="relative w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Meta Campaign Manager
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie suas campanhas do Meta com inteligência artificial
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="current-password"
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="h-11 w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Credenciais de demonstração:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Email:</span> admin@metacampaigns.com</p>
              <p><span className="font-medium text-foreground">Senha:</span> admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-muted-foreground">
        &copy; 2024 Meta Campaign Manager. Todos os direitos reservados.
      </p>
    </div>
  );
}
