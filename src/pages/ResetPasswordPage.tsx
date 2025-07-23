import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { AlertCircle } from "lucide-react";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Errore durante il reset password");
      }

      await Swal.fire({
        icon: "success",
        title: "Successo",
        text: "Password resettata correttamente!",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      navigate("/auth");
    } catch (err: any) {
      setError(err.message || "Errore durante il reset password");
      await Swal.fire({
        icon: "error",
        title: "Errore",
        text: err.message || "Errore durante il reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Link non valido</h2>
        <p>Il link per il reset della password è mancante o non valido.</p>
        <div className="mt-4">
          <Link to="/auth" className="text-primary hover:underline">
            Torna al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-20 p-4">
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
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
              <Label htmlFor="password">Nuova password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Inserisci la nuova password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma nuova password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Conferma la nuova password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvataggio..." : "Reset Password"}
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
  );
};

export default ResetPasswordPage;
