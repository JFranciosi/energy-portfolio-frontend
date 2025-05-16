
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Accedi al tuo account</h1>
        
        <Card className="shadow-lg animate-fade-in">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>
            
            <CardContent className="pt-6 pb-4">
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" placeholder="nome@azienda.it" type="email" required />
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
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nome</Label>
                      <Input id="first-name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Cognome</Label>
                      <Input id="last-name" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input id="email-register" placeholder="nome@azienda.it" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password-register" 
                        placeholder="••••••••" 
                        type={showRegisterPassword ? "text" : "password"} 
                        required 
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute right-0 top-0 h-full aspect-square"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Azienda</Label>
                    <Input id="company" placeholder="Nome azienda" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm font-medium leading-none">
                      Accetto i <Link to="/terms-conditions" className="text-primary hover:underline">Termini di servizio</Link> e la <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registrazione in corso..." : "Crea account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="border-t p-6 flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O continua con</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="w-full">
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  Microsoft
                </Button>
              </div>
            </CardFooter>
          </Tabs>
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
