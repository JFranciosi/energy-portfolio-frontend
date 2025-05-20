import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.ts';
import { Eye, EyeOff, Lock, User, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils.ts';

// URL base per le API
const PATH_DEV = 'http://localhost:8081';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password strength indicator
  const getPasswordStrength = (password: string): {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
  } => {
    if (!password) return { strength: 'weak', score: 0 };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'medium', score };
    return { strength: 'strong', score };
  };

  const passwordStrength = getPasswordStrength(formState.password);
  const passwordsMatch = formState.password === formState.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear relevant error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear confirm password error if passwords now match
    if (name === 'password' && formState.confirmPassword && errors.confirmPassword) {
      if (value === formState.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: {
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formState.username.trim()) {
      newErrors.username = "Il nome utente è obbligatorio";
    } else if (formState.username.length < 3) {
      newErrors.username = "Il nome utente deve contenere almeno 3 caratteri";
    }

    if (!formState.password) {
      newErrors.password = "La password è obbligatoria";
    } else if (formState.password.length < 8) {
      newErrors.password = "La password deve contenere almeno 8 caratteri";
    }

    if (!formState.confirmPassword) {
      newErrors.confirmPassword = "Conferma la password";
    } else if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = "Le password non corrispondono";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsCreating(true);

    try {
      const response = await fetch(`${PATH_DEV}/Autentication/Register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formState.username,
          password: formState.password
        })
      });

      if (response.ok) {
        setCreationSuccess(true);

        await Swal.fire({
          icon: "success",
          title: "Successo",
          text: "Operazione andata a buon fine",
        });

        // Reset form after success
        setTimeout(() => {
          setFormState({
            username: '',
            password: '',
            confirmPassword: '',
          });
          setCreationSuccess(false);
        }, 1000);

      } else {
        await Swal.fire({
          icon: "error",
          title: "Errore",
          text: "Si è verificato un errore durante la creazione dell'utente",
        });
      }
    } catch (error) {
      console.error('Errore durante la creazione dell\'utente:', error);

      await Swal.fire({
        icon: "error",
        title: "Errore di connessione",
        text: "Impossibile contattare il server. Riprova più tardi.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-primary">Crea Nuovo Utente</CardTitle>
              <CardDescription className="text-center">
                Inserisci le credenziali per creare un nuovo utente nel sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Username field */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome Utente</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                          id="username"
                          name="username"
                          className={cn(
                              "pl-10",
                              errors.username ? "border-red-500" : "",
                              formState.username && !errors.username ? "border-green-500" : ""
                          )}
                          value={formState.username}
                          onChange={handleChange}
                          placeholder="nome.cognome"
                      />
                      {formState.username && !errors.username && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                      )}
                    </div>
                    {errors.username && (
                        <p className="text-sm text-red-500">{errors.username}</p>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      {formState.password && (
                          <div className="flex items-center space-x-2">
                            <div className="text-xs">
                              {passwordStrength.strength === 'weak' && "Debole"}
                              {passwordStrength.strength === 'medium' && "Media"}
                              {passwordStrength.strength === 'strong' && "Forte"}
                            </div>
                            <div className="flex space-x-1">
                              <div
                                  className={cn(
                                      "h-1 w-2 rounded",
                                      passwordStrength.score >= 1
                                          ? "bg-red-500"
                                          : "bg-gray-200"
                                  )}
                              />
                              <div
                                  className={cn(
                                      "h-1 w-2 rounded",
                                      passwordStrength.score >= 3
                                          ? "bg-yellow-500"
                                          : "bg-gray-200"
                                  )}
                              />
                              <div
                                  className={cn(
                                      "h-1 w-2 rounded",
                                      passwordStrength.score >= 5
                                          ? "bg-green-500"
                                          : "bg-gray-200"
                                  )}
                              />
                            </div>
                          </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={cn(
                              "pl-10 pr-10",
                              errors.password ? "border-red-500" : ""
                          )}
                          value={formState.password}
                          onChange={handleChange}
                          placeholder="Inserisci password"
                      />
                      <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                    {formState.password && !errors.password && passwordStrength.strength !== 'strong' && (
                        <p className="text-xs text-muted-foreground">
                          Suggerimento: usa lettere maiuscole, minuscole, numeri e simboli per aumentare la sicurezza.
                        </p>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={cn(
                              "pl-10 pr-10",
                              errors.confirmPassword ? "border-red-500" : "",
                              formState.confirmPassword && passwordsMatch && !errors.confirmPassword ? "border-green-500" : ""
                          )}
                          value={formState.confirmPassword}
                          onChange={handleChange}
                          placeholder="Conferma password"
                      />
                      <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                    {formState.confirmPassword && passwordsMatch && !errors.confirmPassword && (
                        <p className="text-xs text-green-500 flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Le password corrispondono
                        </p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    className="w-full mt-8"
                    disabled={isCreating || creationSuccess}
                >
                  {isCreating ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin mr-2" />
                        Creazione in corso...
                      </div>
                  ) : creationSuccess ? (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Utente Creato
                      </div>
                  ) : (
                      "Crea Utente"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/energy-portfolio')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla gestione utenti
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  );
};

export default CreateUserPage;