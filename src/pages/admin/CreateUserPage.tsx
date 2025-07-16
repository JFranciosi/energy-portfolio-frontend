import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.ts";
import { Eye, EyeOff, Lock, User, Check, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils.ts";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const stati = [
  { label: "Italia", value: "IT" },
  { label: "Francia", value: "FR" },
  { label: "Spagna", value: "ES" },
  { label: "Russia", value: "RU" },
];

const allowedCountries = [
  { code: "it", prefix: "39" },
  { code: "fr", prefix: "33" },
  { code: "es", prefix: "34" },
  { code: "ru", prefix: "7" },
];

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: "weak", score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { strength: "weak", score };
  if (score <= 4) return { strength: "medium", score };
  return { strength: "strong", score };
};

const PATH_DEV = "http://localhost:8081";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    tipologia: "Cliente",  // default a Cliente
    username: "",
    email: "",
    sedeLegale: "",
    partitaIva: "",
    telefono: "",
    telefonoPrefisso: "39",
    stato: "",
    classeAgevolazione: "",
    codiceAtecoPrimario: "",
    codiceAtecoSecondario: "",
    consumoAnnoEnergia: "",
    fatturatoAnnuo: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const passwordStrength = getPasswordStrength(formState.password);
  const passwordsMatch = formState.password === formState.confirmPassword;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (
      name === "password" &&
      formState.confirmPassword &&
      errors.confirmPassword &&
      value === formState.confirmPassword
    ) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  // Cambia tipologia e reset campi non usati da admin
  const handleTipologiaChange = (val: string) => {
    setFormState((prev) => ({
      ...prev,
      tipologia: val,
      // se admin resetta tutti gli altri campi tranne username, password e confirmPassword
      ...(val === "Admin"
        ? {
            email: "",
            sedeLegale: "",
            partitaIva: "",
            telefono: "",
            telefonoPrefisso: "39",
            stato: "",
            classeAgevolazione: "",
            codiceAtecoPrimario: "",
            codiceAtecoSecondario: "",
            consumoAnnoEnergia: "",
            fatturatoAnnuo: "",
          }
        : {}),
    }));
    if (errors.tipologia) setErrors((prev) => ({ ...prev, tipologia: "" }));
  };

  // Funzione di validazione aggiornata per Admin vs Cliente
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formState.tipologia) newErrors.tipologia = "La tipologia è obbligatoria";

    if (formState.tipologia === "Admin") {
      if (!formState.username.trim())
        newErrors.username = "Il nome utente è obbligatorio";
      else if (formState.username.length < 3)
        newErrors.username = "Minimo 3 caratteri";

      if (!formState.password) newErrors.password = "La password è obbligatoria";
      else if (formState.password.length < 8)
        newErrors.password = "Minimo 8 caratteri";

      if (!formState.confirmPassword)
        newErrors.confirmPassword = "Conferma la password";
      else if (formState.password !== formState.confirmPassword)
        newErrors.confirmPassword = "Le password non corrispondono";

    } else {
      // Validazione completa Cliente
      if (!formState.username.trim())
        newErrors.username = "Il nome utente è obbligatorio";
      else if (formState.username.length < 3)
        newErrors.username = "Minimo 3 caratteri";

      if (!formState.email.trim()) newErrors.email = "L'email è obbligatoria";
      else if (!/\S+@\S+\.\S+/.test(formState.email))
        newErrors.email = "Email non valida";

      if (!formState.sedeLegale.trim())
        newErrors.sedeLegale = "La sede legale è obbligatoria";

      if (!formState.partitaIva.trim())
        newErrors.partitaIva = "La partita IVA è obbligatoria";
      else if (!/^\d{11}$/.test(formState.partitaIva))
        newErrors.partitaIva = "Deve contenere 11 cifre";

      if (!formState.telefono.trim()) newErrors.telefono = "Il telefono è obbligatorio";

      if (!formState.stato) newErrors.stato = "Lo stato è obbligatorio";

      if (!formState.classeAgevolazione) newErrors.classeAgevolazione = "La classe di agevolazione è obbligatoria";

      if (!formState.codiceAtecoPrimario.trim())
        newErrors.codiceAtecoPrimario = "Il codice Ateco primario è obbligatorio";

      if (!formState.consumoAnnoEnergia.trim())
        newErrors.consumoAnnoEnergia = "Il consumo annuo energia è obbligatorio";
      else if (
        isNaN(Number(formState.consumoAnnoEnergia)) ||
        Number(formState.consumoAnnoEnergia) < 0
      )
        newErrors.consumoAnnoEnergia = "Numero valido richiesto";

      if (!formState.fatturatoAnnuo.trim())
        newErrors.fatturatoAnnuo = "Il fatturato annuo è obbligatorio";
      else if (
        isNaN(Number(formState.fatturatoAnnuo)) ||
        Number(formState.fatturatoAnnuo) < 0
      )
        newErrors.fatturatoAnnuo = "Numero valido richiesto";

      if (!formState.password) newErrors.password = "La password è obbligatoria";
      else if (formState.password.length < 8)
        newErrors.password = "Minimo 8 caratteri";

      if (!formState.confirmPassword)
        newErrors.confirmPassword = "Conferma la password";
      else if (formState.password !== formState.confirmPassword)
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
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formState.username,
          email: formState.tipologia === "Admin" ? null : formState.email,
          sedeLegale: formState.tipologia === "Admin" ? null : formState.sedeLegale,
          pIva: formState.tipologia === "Admin" ? null : formState.partitaIva,
          telefono:
            "+" + formState.telefonoPrefisso + formState.telefono.replace(/\D/g, ""),
          stato: formState.tipologia === "Admin" ? null : formState.stato,
          tipologia: formState.tipologia,
          classeAgevolazione:
            formState.tipologia === "Admin" ? null : formState.classeAgevolazione,
          codiceAteco:
            formState.tipologia === "Admin" ? null : formState.codiceAtecoPrimario,
          codiceAtecoSecondario:
            formState.tipologia === "Admin" ? null : formState.codiceAtecoSecondario || null,
          consumoAnnuoEnergia:
            formState.tipologia === "Admin" ? null : Number(formState.consumoAnnoEnergia),
          fatturatoAnnuo:
            formState.tipologia === "Admin" ? null : Number(formState.fatturatoAnnuo),
          password: formState.password,
        }),
      });

      if (response.ok) {
        setCreationSuccess(true);
        await Swal.fire({
          icon: "success",
          title: "Successo",
          text: "Utente creato con successo",
        });
        setTimeout(() => {
          setFormState({
            tipologia: "Cliente",
            username: "",
            email: "",
            sedeLegale: "",
            partitaIva: "",
            telefono: "",
            telefonoPrefisso: "39",
            stato: "",
            classeAgevolazione: "",
            codiceAtecoPrimario: "",
            codiceAtecoSecondario: "",
            consumoAnnoEnergia: "",
            fatturatoAnnuo: "",
            password: "",
            confirmPassword: "",
          });
          setCreationSuccess(false);
        }, 1000);
      } else {
        let errMsg = "Si è verificato un errore durante la creazione dell'utente";
        let errJson = null;
        try {
          errJson = await response.json();
        } catch (_) {}

        // Se il backend restituisce 409 Conflict
        if (response.status === 409) {
          errMsg = "Esiste già un utente con questo nome utente";
        }
        // Se nel messaggio del backend troviamo 'Duplicate entry'
        else if (errJson?.message && errJson.message.includes("Duplicate entry")) {
          errMsg = "Esiste già un utente con questo nome utente";
        }
        // Altri errori
        else if (errJson?.message) {
          errMsg = errJson.message;
        }

        // Mostra l'errore sotto il campo username
        setErrors((prev) => ({ ...prev, username: errMsg }));

        // Alert visivo
        await Swal.fire({
          icon: "error",
          title: "Errore",
          text: errMsg,
        });
      }
    } catch (error) {
      console.error("Errore durante la creazione dell'utente:", error);
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
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      <div className="flex justify-center items-start min-h-[calc(100vh-160px)]">
        <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-extrabold text-center text-primary mb-1">
              Crea Nuovo Utente
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground text-base">
              Inserisci i dati per creare un nuovo utente nel sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipologia primo campo */}
              <div className="space-y-1">
                <Label htmlFor="tipologia" className="text-base font-semibold">
                  Tipologia
                </Label>
                <Select value={formState.tipologia} onValueChange={handleTipologiaChange}>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-md border",
                      errors.tipologia ? "border-red-500" : "border-gray-300"
                    )}
                  >
                    {formState.tipologia || "Seleziona tipologia..."}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipologia && (
                  <p className="text-sm text-red-600">{errors.tipologia}</p>
                )}
              </div>

              {/* Se Admin mostro solo username e password */}
              {formState.tipologia === "Admin" ? (
                <>
                  {/* Username */}
                  <div className="space-y-1 mt-6">
                    <Label htmlFor="username" className="text-base font-semibold">
                      Nome Utente
                    </Label>
                    <div className="relative">
                      <div
                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                        aria-hidden="true"
                      >
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="username"
                        name="username"
                        className={cn(
                          "pl-11 h-11 rounded-md",
                          errors.username
                            ? "border-red-500"
                            : formState.username
                            ? "border-green-500"
                            : ""
                        )}
                        value={formState.username}
                        onChange={handleInputChange}
                        placeholder="nome.cognome"
                      />
                      {!errors.username && formState.username && (
                        <Check className="absolute inset-y-0 right-3 my-auto h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mt-8 space-y-6">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-base font-semibold">
                          Password
                        </Label>
                        {formState.password && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span>
                              {passwordStrength.strength === "weak" && "Debole"}
                              {passwordStrength.strength === "medium" && "Media"}
                              {passwordStrength.strength === "strong" && "Forte"}
                            </span>
                            <div className="flex space-x-1">
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 1
                                    ? "bg-red-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 3
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 5
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div
                          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                          aria-hidden="true"
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={cn(
                            "pl-11 pr-11 h-11 rounded-md",
                            errors.password ? "border-red-500" : ""
                          )}
                          value={formState.password}
                          onChange={handleInputChange}
                          placeholder="Inserisci password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                      {formState.password &&
                        !errors.password &&
                        passwordStrength.strength !== "strong" && (
                          <p className="text-xs text-muted-foreground">
                            Suggerimento: usa lettere maiuscole, minuscole, numeri e
                            simboli per aumentare la sicurezza.
                          </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-base font-semibold">
                        Conferma Password
                      </Label>
                      <div className="relative">
                        <div
                          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                          aria-hidden="true"
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={cn(
                            "pl-11 pr-11 h-11 rounded-md",
                            errors.confirmPassword ? "border-red-500" : "",
                            formState.confirmPassword &&
                              passwordsMatch &&
                              !errors.confirmPassword
                              ? "border-green-500"
                              : ""
                          )}
                          value={formState.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Conferma password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                      {formState.confirmPassword &&
                        passwordsMatch &&
                        !errors.confirmPassword && (
                          <p className="text-xs text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" /> Le password corrispondono
                          </p>
                        )}
                    </div>
                  </div>
                </>
              ) : (
                // Se Cliente, mostra tutti i campi (inclusi username e password)
                <>
                  {/* Username */}
                  <div className="space-y-1 mt-6">
                    <Label htmlFor="username" className="text-base font-semibold">
                      Nome Utente
                    </Label>
                    <div className="relative">
                      <div
                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                        aria-hidden="true"
                      >
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="username"
                        name="username"
                        className={cn(
                          "pl-11 h-11 rounded-md",
                          errors.username
                            ? "border-red-500"
                            : formState.username
                            ? "border-green-500"
                            : ""
                        )}
                        value={formState.username}
                        onChange={handleInputChange}
                        placeholder="nome.cognome"
                      />
                      {!errors.username && formState.username && (
                        <Check className="absolute inset-y-0 right-3 my-auto h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email
                    </Label>
                    <div className="relative">
                      <div
                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                        aria-hidden="true"
                      >
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className={cn(
                          "pl-11 h-11 rounded-md",
                          errors.email
                            ? "border-red-500"
                            : formState.email
                            ? "border-green-500"
                            : ""
                        )}
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="esempio@mail.com"
                      />
                      {!errors.email && formState.email && (
                        <Check className="absolute inset-y-0 right-3 my-auto h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Sede Legale */}
                  <div className="space-y-1">
                    <Label htmlFor="sedeLegale" className="text-base font-semibold">
                      Sede Legale
                    </Label>
                    <Input
                      id="sedeLegale"
                      name="sedeLegale"
                      value={formState.sedeLegale}
                      onChange={handleInputChange}
                      placeholder="Via Roma 123, Milano"
                      className={cn(
                        "h-11 rounded-md",
                        errors.sedeLegale ? "border-red-500" : ""
                      )}
                    />
                    {errors.sedeLegale && (
                      <p className="text-sm text-red-600">{errors.sedeLegale}</p>
                    )}
                  </div>

                  {/* Partita IVA */}
                  <div className="space-y-1">
                    <Label htmlFor="partitaIva" className="text-base font-semibold">
                      Partita IVA
                    </Label>
                    <Input
                      id="partitaIva"
                      name="partitaIva"
                      value={formState.partitaIva}
                      onChange={handleInputChange}
                      placeholder="12345678901"
                      maxLength={11}
                      className={cn(
                        "h-11 rounded-md",
                        errors.partitaIva ? "border-red-500" : ""
                      )}
                    />
                    {errors.partitaIva && (
                      <p className="text-sm text-red-600">{errors.partitaIva}</p>
                    )}
                  </div>

                  {/* Telefono */}
                  <div className="space-y-1">
                    <Label htmlFor="telefono" className="text-base font-semibold">
                      Telefono
                    </Label>
                    <div className="flex space-x-2">
                      <Select
                        value={formState.telefonoPrefisso}
                        onValueChange={(val) =>
                          setFormState((prev) => ({ ...prev, telefonoPrefisso: val }))
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-28 h-11 rounded-md border",
                            errors.telefono ? "border-red-500" : "border-gray-300"
                          )}
                        >
                          +{formState.telefonoPrefisso || "39"}
                        </SelectTrigger>
                        <SelectContent>
                          {allowedCountries.map(({ code, prefix }) => (
                            <SelectItem key={code} value={prefix}>
                              +{prefix} ({code.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="telefonoInput"
                        name="telefono"
                        type="tel"
                        value={formState.telefono}
                        onChange={handleInputChange}
                        placeholder="345 123 4567"
                        className={cn(
                          "flex-grow h-11 rounded-md border px-3",
                          errors.telefono
                            ? "border-red-500"
                            : formState.telefono
                            ? "border-green-500"
                            : "border-gray-300"
                        )}
                      />
                    </div>
                    {errors.telefono && (
                      <p className="text-sm text-red-600">{errors.telefono}</p>
                    )}
                  </div>

                  {/* Stato */}
                  <div className="space-y-1">
                    <Label htmlFor="stato" className="text-base font-semibold">
                      Stato
                    </Label>
                    <Select
                      value={formState.stato}
                      onValueChange={(val) =>
                        setFormState((prev) => ({ ...prev, stato: val }))
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 rounded-md border",
                          errors.stato ? "border-red-500" : "border-gray-300"
                        )}
                      >
                        {formState.stato
                          ? stati.find((s) => s.value === formState.stato)?.label
                          : "Seleziona stato..."}
                      </SelectTrigger>
                      <SelectContent>
                        {stati.map((stato) => (
                          <SelectItem key={stato.value} value={stato.value}>
                            {stato.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stato && (
                      <p className="text-sm text-red-600">{errors.stato}</p>
                    )}
                  </div>

                  {/* Classe di Agevolazione */}
                  <div className="space-y-1">
                    <Label htmlFor="classeAgevolazione" className="text-base font-semibold">
                      Classe di Agevolazione
                    </Label>
                    <Select
                      value={formState.classeAgevolazione}
                      onValueChange={(val) =>
                        setFormState((prev) => ({ ...prev, classeAgevolazione: val }))
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-11 rounded-md border",
                          errors.classeAgevolazione ? "border-red-500" : "border-gray-300"
                        )}
                      >
                        {formState.classeAgevolazione || "Seleziona classe..."}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No Agevolazioni">No Agevolazioni</SelectItem>
                        <SelectItem value="Fat1">Fat1</SelectItem>
                        <SelectItem value="Fat2">Fat2</SelectItem>
                        <SelectItem value="Fat3">Fat3</SelectItem>
                        <SelectItem value="Val">Val</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.classeAgevolazione && (
                      <p className="text-sm text-red-600">{errors.classeAgevolazione}</p>
                    )}
                  </div>

                  {/* Codice Ateco Primario */}
                  <div className="space-y-1">
                    <Label htmlFor="codiceAtecoPrimario" className="text-base font-semibold">
                      Codice Ateco Primario
                    </Label>
                    <Input
                      id="codiceAtecoPrimario"
                      name="codiceAtecoPrimario"
                      value={formState.codiceAtecoPrimario}
                      onChange={handleInputChange}
                      placeholder="es. 47.11.00"
                      className={cn(
                        "h-11 rounded-md",
                        errors.codiceAtecoPrimario ? "border-red-500" : ""
                      )}
                    />
                    {errors.codiceAtecoPrimario && (
                      <p className="text-sm text-red-600">{errors.codiceAtecoPrimario}</p>
                    )}
                  </div>

                  {/* Codice Ateco Secondario */}
                  <div className="space-y-1">
                    <Label htmlFor="codiceAtecoSecondario" className="text-base font-semibold">
                      Codice Ateco Secondario (facoltativo)
                    </Label>
                    <Input
                      id="codiceAtecoSecondario"
                      name="codiceAtecoSecondario"
                      value={formState.codiceAtecoSecondario}
                      onChange={handleInputChange}
                      placeholder="es. 47.19.00"
                      className="h-11 rounded-md"
                    />
                  </div>

                  {/* Consumo Anno Energia */}
                  <div className="space-y-1">
                    <Label htmlFor="consumoAnnoEnergia" className="text-base font-semibold">
                      Consumo Anno Energia (kWh)
                    </Label>
                    <Input
                      id="consumoAnnoEnergia"
                      name="consumoAnnoEnergia"
                      type="number"
                      value={formState.consumoAnnoEnergia}
                      onChange={handleInputChange}
                      placeholder="10000"
                      min={0}
                      className={cn(
                        "h-11 rounded-md",
                        errors.consumoAnnoEnergia ? "border-red-500" : ""
                      )}
                    />
                    {errors.consumoAnnoEnergia && (
                      <p className="text-sm text-red-600">{errors.consumoAnnoEnergia}</p>
                    )}
                  </div>

                  {/* Fatturato Annuo */}
                  <div className="space-y-1">
                    <Label htmlFor="fatturatoAnnuo" className="text-base font-semibold">
                      Fatturato Annuo (€)
                    </Label>
                    <Input
                      id="fatturatoAnnuo"
                      name="fatturatoAnnuo"
                      type="number"
                      value={formState.fatturatoAnnuo}
                      onChange={handleInputChange}
                      placeholder="500000"
                      min={0}
                      className={cn(
                        "h-11 rounded-md",
                        errors.fatturatoAnnuo ? "border-red-500" : ""
                      )}
                    />
                    {errors.fatturatoAnnuo && (
                      <p className="text-sm text-red-600">{errors.fatturatoAnnuo}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mt-8 space-y-6">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-base font-semibold">
                          Password
                        </Label>
                        {formState.password && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span>
                              {passwordStrength.strength === "weak" && "Debole"}
                              {passwordStrength.strength === "medium" && "Media"}
                              {passwordStrength.strength === "strong" && "Forte"}
                            </span>
                            <div className="flex space-x-1">
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 1
                                    ? "bg-red-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 3
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1 w-3 rounded",
                                  passwordStrength.score >= 5
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div
                          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                          aria-hidden="true"
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={cn(
                            "pl-11 pr-11 h-11 rounded-md",
                            errors.password ? "border-red-500" : ""
                          )}
                          value={formState.password}
                          onChange={handleInputChange}
                          placeholder="Inserisci password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                      {formState.password &&
                        !errors.password &&
                        passwordStrength.strength !== "strong" && (
                          <p className="text-xs text-muted-foreground">
                            Suggerimento: usa lettere maiuscole, minuscole, numeri e
                            simboli per aumentare la sicurezza.
                          </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-base font-semibold">
                        Conferma Password
                      </Label>
                      <div className="relative">
                        <div
                          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
                          aria-hidden="true"
                        >
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={cn(
                            "pl-11 pr-11 h-11 rounded-md",
                            errors.confirmPassword ? "border-red-500" : "",
                            formState.confirmPassword &&
                              passwordsMatch &&
                              !errors.confirmPassword
                              ? "border-green-500"
                              : ""
                          )}
                          value={formState.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Conferma password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                      {formState.confirmPassword &&
                        passwordsMatch &&
                        !errors.confirmPassword && (
                          <p className="text-xs text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" /> Le password corrispondono
                          </p>
                        )}
                    </div>
                  </div>
                </>
              )}
              <Button
                type="submit"
                className="w-full mt-10 py-3 text-lg font-semibold rounded-md transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isCreating || creationSuccess}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                    <span>Creazione in corso...</span>
                  </div>
                ) : creationSuccess ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="h-5 w-5" />
                    <span>Utente Creato</span>
                  </div>
                ) : (
                  "Crea Utente"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/user-management")}
            >
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
