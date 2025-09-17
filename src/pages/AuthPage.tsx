import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import SidebarMenu from "@/components/layout/SidebarMenu";
import { Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const PATH = 'http://localhost:8081';

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${PATH}/Autentication/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        if (remember) {
          localStorage.setItem('email', email);
          localStorage.setItem('password', password);
        } else {
          localStorage.removeItem('email');
          localStorage.removeItem('password');
        }
        window.location.href = '/energy-portfolio/dashboard';
      } else {
        setError('Username o password errati');
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.');
      console.error('Errore login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SidebarMenu />
      <section className="bg-gradient-to-r from-primary to-blue-400 py-16 text-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Area Clienti</h1>
          <p className="text-xl text-white/90 mb-8">
            Accedi alla tua dashboard per monitorare consumi, visualizzare report e gestire i progetti.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Accedi al tuo account</CardTitle>
              <p className="text-muted-foreground">
                Inserisci le tue credenziali per accedere alla dashboard
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username-login"
                      type="username"
                      placeholder="nome@azienda.it"
                      className="pl-10"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password-login"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full aspect-square"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={checked => setRemember(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm font-medium leading-none">
                    Ricorda credenziali
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link to="/" className="text-primary hover:underline">
              Torna alla Home Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
import { LogIn, LogOut } from 'lucide-react';