import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PATH = 'http://localhost:8081';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${PATH}/Autentication/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Email inviata!',
          text: 'Controlla la tua casella di posta per il link per reimpostare la password.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.message || 'Errore durante l\'invio dell\'email');
      }
    } catch {
      setError('Errore di rete. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Password dimenticata?</h1>

        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center">Reimposta la tua password</CardTitle>
          </CardHeader>

          <CardContent className="pt-6 pb-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-forgot">Email</Label>
                <div className="relative">
                  <Input
                    id="email-forgot"
                    name="email-forgot"
                    type="email"
                    placeholder="nome@azienda.it"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Invio in corso...' : 'Invia link di reset'}
              </Button>
            </form>
          </CardContent>

          <div className="text-center pb-4">
            <Link to="/auth" className="text-primary hover:underline">
              Torna al login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
