import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // URL base per le API
  const PATH = 'http://localhost:8081';

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Utilizza gli ID corretti dei campi form
      const username = event.target['email-login'] ? event.target['email-login'].value : undefined;
      const password = event.target['password-login'] ? event.target['password-login'].value : undefined;

      const response = await fetch(`${PATH}/Autentication/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
      });

      if (response.ok) {
        // Reindirizza alla home page dopo il login
        window.location.href = "/";
      } else {
        setError('Username o password errati');
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.');
      console.error('Errore durante il login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Accedi al tuo account</h1>

          <Card className="shadow-lg animate-fade-in">
            <CardContent className="pt-6 pb-4">
              {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" name="email-login" placeholder="nome@azienda.it" type="text" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                      Password dimenticata?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                        id="password-login"
                        name="password-login"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        required
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
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ricorda credenziali
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Accesso in corso..." : "Accedi"}
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
      </div>
  );
};

export default AuthPage;