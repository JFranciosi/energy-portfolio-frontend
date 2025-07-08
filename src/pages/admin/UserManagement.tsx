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

interface Cliente {
  id: number;
  username: string;
  email: string;
  tipologia: string; 
  stato: string;
  telefono?: string;
}

const PATH_DEV = "http://localhost:8081";

const UserManagement = () => {
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PATH_DEV}/cliente/list`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Errore caricamento utenti: ${res.statusText}`);
      }
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

  const openEditDialog = (user: Cliente) => {
    setEditUser(user);
    setEditForm({ ...user }); // clonazione oggetto per sicurezza
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Cliente, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editUser) return;

    try {
      const { id, ...fieldsToUpdate } = editForm;

      if (!editUser.id) {
        throw new Error("ID utente non definito.");
      }

      const res = await fetch(`${PATH_DEV}/cliente/update/${editUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fieldsToUpdate),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Errore aggiornamento utente");
      }

      Swal.fire("Salvato!", "Modifiche salvate con successo.", "success");
      setEditDialogOpen(false);
      setEditUser(null);
      setEditForm({});
      fetchUsers();
    } catch (error: any) {
      Swal.fire("Errore", error.message || "Errore aggiornamento utente", "error");
    }
  };

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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Errore eliminazione utente");
      }
      Swal.fire("Eliminato!", "Utente eliminato con successo.", "success");
      setDeleteDialogOpen(false);
      setDeleteUser(null);
      fetchUsers();
    } catch (error: any) {
      Swal.fire("Errore", error.message || "Errore eliminazione utente", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchEmail = filterEmail.trim()
        ? user.email.toLowerCase().includes(filterEmail.trim().toLowerCase())
        : true;
      const matchUsername = filterUsername.trim()
        ? user.username.toLowerCase().includes(filterUsername.trim().toLowerCase())
        : true;
      const matchTipologia =
        filterTipologia === "Tutti" ? true : user.tipologia === filterTipologia;

      return matchEmail && matchUsername && matchTipologia;
    });
  }, [userList, filterEmail, filterUsername, filterTipologia]);

  return (
    <div className="container mx-auto p-4 max-w-8xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Gestione Utenti</h1>
      <p className="mb-6 text-muted-foreground">
        Visualizza, modifica o elimina gli utenti dal sistema.
      </p>

      <style>{`
        .filter-input {
          height: 44px; /* altezza fissa */
          width: 100%; /* larghezza piena per il container */
          max-width: 380px; /* max larghezza uguale per tutti */
          gap-x: 6px; /* spazio tra label e input */
        }
      `}</style>

      <div className="rounded-lg bg-white shadow-md p-4">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          {/* FILTRO EMAIL */}
          <div className="flex flex-col">
            <Label htmlFor="filterEmail" className="mb-1 text-sm font-medium text-gray-700">
              Filtra per Email
            </Label>
            <Input
              id="filterEmail"
              type="text"
              placeholder="Email utente"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="filter-input rounded-md border border-gray-300 focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          {/* FILTRO USERNAME */}
          <div className="flex flex-col">
            <Label htmlFor="filterUsername" className="mb-1 text-sm font-medium text-gray-700">
              Filtra per Nome Utente
            </Label>
            <Input
              id="filterUsername"
              type="text"
              placeholder="Nome utente"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              className="filter-input rounded-md border border-gray-300 focus:border-black focus:ring-2 focus:ring-black"
            />
          </div>

          {/* FILTRO TIPOLOGIA */}
          <div className="pt-4">
            <Label htmlFor="filterTipologia" className="mb-1 text-sm font-medium text-gray-700">
              Filtra per Tipologia
            </Label>
            <Select
              value={filterTipologia}
              onValueChange={(value) => setFilterTipologia(value)}
            >
              <SelectTrigger
                id="filterTipologia"
                className="filter-input"
              >
                <SelectValue placeholder="Filtra per Tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tutti">Tutti</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p>Caricamento utenti in corso...</p>
        ) : (
          <Table className="border rounded-lg shadow-sm overflow-hidden">
            <TableHeader className="bg-gray-50 rounded-t-lg">
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
                    <TableCell className="py-3 px-4">{user.username}</TableCell>
                    <TableCell className="py-3 px-4">{user.email}</TableCell>
                    <TableCell className="py-3 px-4">{user.tipologia}</TableCell>
                    <TableCell className="py-3 px-4">{user.stato}</TableCell>
                    <TableCell className="py-3 px-4">{user.telefono || "-"}</TableCell>
                    <TableCell className="py-3 px-4 text-center space-x-2">
                      {userRole === "Admin" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            aria-label={`Modifica utente ${user.username}`}
                            className="hover:bg-blue-300 rounded-md"
                          >
                            <Pencil className="h-5 w-5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(user)}
                            aria-label={`Elimina utente ${user.username}`}
                            className="hover:bg-red-300 rounded-md"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400">Nessuna azione</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modale modifica */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Modifica Utente</DialogTitle>
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
                onValueChange={(value) => handleEditChange("tipologia", value)}
                disabled={true}
              >
                <SelectTrigger id="tipologia" className="w-full">
                  <SelectValue placeholder="Seleziona tipologia" />
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
                onValueChange={(value) => handleEditChange("stato", value)}
              >
                <SelectTrigger id="stato" className="w-full">
                  <SelectValue placeholder="Seleziona Stato" />
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

      {/* Modale conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> Conferma Eliminazione
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Sei sicuro di voler eliminare l'utente{" "}
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
