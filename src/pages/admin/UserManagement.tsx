import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* -------------------------------------------------------------------------- */
/*                                  Tipi                                      */
/* -------------------------------------------------------------------------- */
interface Cliente {
  id: number;
  username: string;
  email: string;
  tipologia: string;
  stato: string;
  telefono?: string;
}

/* -------------------------------------------------------------------------- */
/*                           Costanti di ambiente                             */
/* -------------------------------------------------------------------------- */
const PATH_DEV = "http://localhost:8081";

/* -------------------------------------------------------------------------- */
/*                           Componente principale                            */
/* -------------------------------------------------------------------------- */
const UserManagement: React.FC = () => {
  const [userRole] = useState<string>("Admin");

  const [userList, setUserList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filterEmail, setFilterEmail] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterTipologia, setFilterTipologia] = useState("Tutti");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cliente>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<Cliente | null>(null);

  /* --------------------------- FETCH UTENTI --------------------------- */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PATH_DEV}/cliente/list`, { credentials: "include" });
      if (!res.ok) throw new Error(`Errore caricamento utenti: ${res.statusText}`);
      const data: Cliente[] = await res.json();
      setUserList(data);
    } catch (error: any) {
      Swal.fire("Errore", error.message || "Errore nel caricamento utenti", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* --------------------------- DIALOG EDIT --------------------------- */
  const openEditDialog = (user: Cliente) => {
    setEditUser(user);
    setEditForm({ ...user });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Cliente, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const { id, ...fieldsToUpdate } = editForm;
      const res = await fetch(`${PATH_DEV}/cliente/update/${editUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldsToUpdate),
      });
      if (!res.ok) throw new Error((await res.text()) || "Errore aggiornamento utente");

      Swal.fire("Salvato!", "Modifiche salvate con successo.", "success");
      setEditDialogOpen(false);
      setEditUser(null);
      setEditForm({});
      fetchUsers();
    } catch (error: any) {
      Swal.fire("Errore", error.message || "Errore aggiornamento utente", "error");
    }
  };

  /* ------------------------- DIALOG DELETE --------------------------- */
  const openDeleteDialog = (user: Cliente) => {
    setDeleteUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`${PATH_DEV}/cliente/delete/${deleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Errore eliminazione utente");

      Swal.fire("Eliminato!", "Utente eliminato con successo.", "success");
      setDeleteDialogOpen(false);
      setDeleteUser(null);
      fetchUsers();
    } catch (error: any) {
      Swal.fire("Errore", error.message || "Errore eliminazione utente", "error");
    }
  };

  /* ---------------------------- FILTRI ------------------------------- */
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchEmail = filterEmail
        ? user.email.toLowerCase().includes(filterEmail.toLowerCase())
        : true;
      const matchUsername = filterUsername
        ? user.username.toLowerCase().includes(filterUsername.toLowerCase())
        : true;
      const matchTipologia =
        filterTipologia === "Tutti" ? true : user.tipologia === filterTipologia;
      return matchEmail && matchUsername && matchTipologia;
    });
  }, [userList, filterEmail, filterUsername, filterTipologia]);

  /* ------------------------------------------------------------------ */
  /*                               RENDER                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold text-primary mb-2">Gestione Utenti</h1>
      <p className="mb-6 text-muted-foreground">
        Visualizza, filtra, modifica o elimina gli utenti dal sistema.
      </p>

      {/* --------------------------- Sezione filtri --------------------------- */}
      <div className="mb-8 rounded-lg bg-white shadow p-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email */}
          <div className="flex flex-col">
            <Label htmlFor="filterEmail" className="mb-1 text-sm font-medium">
              Email
            </Label>
            <Input
              id="filterEmail"
              placeholder="es. mario@azienda.it"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col">
            <Label htmlFor="filterUsername" className="mb-1 text-sm font-medium">
              Nome utente
            </Label>
            <Input
              id="filterUsername"
              placeholder="es. mariorossi"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Tipologia */}
          <div className="flex flex-col">
            <Label htmlFor="filterTipologia" className="mb-1 text-sm font-medium">
              Tipologia
            </Label>
            <Select value={filterTipologia} onValueChange={setFilterTipologia}>
              <SelectTrigger id="filterTipologia" className="h-10">
                <SelectValue placeholder="Seleziona tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutti">Tutte</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --------------------------- Tabella utenti --------------------------- */}
      <div className="rounded-lg bg-white shadow p-6">
        {loading ? (
          <p>Caricamento utenti…</p>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipologia</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-center">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Nessun utente trovato.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.tipologia}</TableCell>
                    <TableCell>{user.stato}</TableCell>
                    <TableCell>{user.telefono || "-"}</TableCell>
                    <TableCell className="text-center space-x-2">
                      {userRole === "Admin" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            aria-label={`Modifica ${user.username}`}
                            className="hover:bg-blue-200"
                          >
                            <Pencil className="h-5 w-5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(user)}
                            aria-label={`Elimina ${user.username}`}
                            className="hover:bg-red-200"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/*                         Modale modifica                               */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editForm.username || ""}
                onChange={(e) => handleEditChange("username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => handleEditChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipologia">Tipologia</Label>
              <Select
                value={editForm.tipologia || "Cliente"}
                onValueChange={(v) => handleEditChange("tipologia", v)}
                disabled
              >
                <SelectTrigger id="tipologia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stato">Stato</Label>
              <Select
                value={editForm.stato || "IT"}
                onValueChange={(v) => handleEditChange("stato", v)}
              >
                <SelectTrigger id="stato">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">Italia</SelectItem>
                  <SelectItem value="FR">Francia</SelectItem>
                  <SelectItem value="ES">Spagna</SelectItem>
                  <SelectItem value="RU">Russia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={editForm.telefono || ""}
                onChange={(e) => handleEditChange("telefono", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEditSave}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/*                      Modale conferma eliminazione                     */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Conferma Eliminazione
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            Sei sicuro di voler eliminare{" "}
            <strong>{deleteUser?.username}</strong>?
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
