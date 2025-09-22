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
  username: string;          // campo principale per nome+cognome
  email: string;
  tipologia: string;
  telefono?: string;         // campo telefono unificato (da backend)
  // lato frontend split prefisso e numero:
  telefonoPrefisso?: string;
  telefonoNumero?: string;

  sedeLegale?: string;
  pIva?: string;
  paese?: string;
  classeAgevolazione?: string;
  codiceAteco?: string;
  codiceAtecoSecondario?: string;
  consumoAnnuoEnergia?: number;
  fatturatoAnnuo?: number;

  nome?: string; // campo temporaneo per modificare username
}

const PATH_DEV = "http://localhost:8081";

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

  // Fetch utenti e prepara split telefono (prefisso e numero)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PATH_DEV}/cliente/list`, { credentials: "include" });
      if (!res.ok) throw new Error(`Errore caricamento utenti: ${res.statusText}`);
      const data: Cliente[] = await res.json();

      // Split telefono in prefisso + numero per ogni user (esempio: "+39 3481234567")
      const usersWithTelSplit = data.map(user => {
        if (user.telefono) {
          const parts = user.telefono.trim().split(" ");
          if (parts.length >= 2) {
            user.telefonoPrefisso = parts[0];
            user.telefonoNumero = parts.slice(1).join(" ");
          } else {
            // fallback, se non è presente prefisso
            user.telefonoPrefisso = "+39";
            user.telefonoNumero = user.telefono;
          }
        }
        // nome (form field) = username (campo backend)
        user.nome = user.username;
        return user;
      });

      setUserList(usersWithTelSplit);
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
    setEditForm({ ...user });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Cliente, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      // Concateno prefisso + numero per campo telefono come stringa unica
      const telefonoCompleto = (editForm.telefonoPrefisso ?? "+39") + " " + (editForm.telefonoNumero ?? "");

      // Preparo payload mapping 'nome' -> 'username' e 'telefono' unificato
      const { id, nome, telefonoPrefisso, telefonoNumero, ...rest } = editForm;
      const payload = {
        ...rest,
        username: nome,
        telefono: telefonoCompleto.trim(),
      };

      const res = await fetch(`${PATH_DEV}/cliente/update/${editUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Gestione Utenti</h1>
      <p className="mb-6 text-muted-foreground">
        Visualizza, filtra, modifica o elimina gli utenti dal sistema.
      </p>

      <div className="mb-8 rounded-lg bg-white shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <TableHead>Telefono</TableHead>
                <TableHead className="text-center">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
                    <TableCell>{user.telefono ?? "-"}</TableCell>
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

      {/* Modale modifica */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="sm:max-w-4xl max-h-[80vh] overflow-y-auto rounded-lg shadow-lg"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <DialogHeader className="border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold">Modifica Utente</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6 px-6 flex-grow">
            {/* Username come nome e cognome unificato */}
            <div>
              <Label htmlFor="nome" className="mb-2 font-semibold text-gray-700">
                Nome e Cognome
              </Label>
              <Input
                id="nome"
                placeholder="es. mariorossi"
                value={editForm.nome || ""}
                onChange={(e) => handleEditChange("nome", e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => handleEditChange("email", e.target.value)}
              />
            </div>

            {/* Telefono: prefisso + numero */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="telefonoPrefisso" className="mb-2 font-semibold text-gray-700">
                  Prefisso Telefonico
                </Label>
                <Select
                  value={editForm.telefonoPrefisso || "+39"}
                  onValueChange={(v) => handleEditChange("telefonoPrefisso", v)}
                >
                  <SelectTrigger id="telefonoPrefisso">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+39">Italia (+39)</SelectItem>
                    <SelectItem value="+34">Spagna (+34)</SelectItem>
                    <SelectItem value="+33">Francia (+33)</SelectItem>
                    <SelectItem value="+7">Russia (+7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-2 flex-grow">
                <Label htmlFor="telefonoNumero" className="mb-2 font-semibold text-gray-700">
                  Numero Telefonico
                </Label>
                <Input
                  id="telefonoNumero"
                  value={editForm.telefonoNumero || ""}
                  onChange={(e) => handleEditChange("telefonoNumero", e.target.value)}
                />
              </div>
            </div>

            {/* Campi extra solo per Cliente */}
            {editForm.tipologia === "Cliente" && (
              <>
                <div>
                  <Label htmlFor="sedeLegale" className="mb-2 font-semibold text-gray-700">
                    Sede legale
                  </Label>
                  <Input
                    id="sedeLegale"
                    value={editForm.sedeLegale || ""}
                    onChange={(e) => handleEditChange("sedeLegale", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pIva" className="mb-2 font-semibold text-gray-700">
                    P.IVA
                  </Label>
                  <Input
                    id="pIva"
                    value={editForm.pIva || ""}
                    onChange={(e) => handleEditChange("pIva", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paese" className="mb-2 font-semibold text-gray-700">
                    Paese
                  </Label>
                  <Select
                    value={editForm.paese || "IT"}
                    onValueChange={(v) => handleEditChange("paese", v)}
                  >
                    <SelectTrigger id="paese" className="mb-1 h-10">
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
                  <Label htmlFor="classeAgevolazione" className="mb-2 font-semibold text-gray-700">
                    Classe Agevolazione
                  </Label>
                  <Select
                    value={editForm.classeAgevolazione || "No Agevolazioni"}
                    onValueChange={(v) => handleEditChange("classeAgevolazione", v)}
                  >
                    <SelectTrigger id="classeAgevolazione" className="mb-1 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No Agevolazioni">No Agevolazioni</SelectItem>
                      <SelectItem value="Fat1">Fat1</SelectItem>
                      <SelectItem value="Fat2">Fat2</SelectItem>
                      <SelectItem value="Fat3">Fat3</SelectItem>
                      <SelectItem value="Val">Val</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="codiceAteco" className="mb-2 font-semibold text-gray-700">
                    Codice Ateco
                  </Label>
                  <Input
                    id="codiceAteco"
                    value={editForm.codiceAteco || ""}
                    onChange={(e) => handleEditChange("codiceAteco", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="codiceAtecoSecondario" className="mb-2 font-semibold text-gray-700">
                    Codice Ateco Secondario
                  </Label>
                  <Input
                    id="codiceAtecoSecondario"
                    value={editForm.codiceAtecoSecondario || ""}
                    onChange={(e) => handleEditChange("codiceAtecoSecondario", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="consumoAnnuoEnergia" className="mb-2 font-semibold text-gray-700">
                    Consumo Annuo Energia (kWh)
                  </Label>
                  <Input
                    id="consumoAnnuoEnergia"
                    type="number"
                    value={editForm.consumoAnnuoEnergia ?? ""}
                    onChange={(e) => handleEditChange("consumoAnnuoEnergia", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="fatturatoAnnuo" className="mb-2 font-semibold text-gray-700">
                    Fatturato Annuo (€)
                  </Label>
                  <Input
                    id="fatturatoAnnuo"
                    type="number"
                    value={editForm.fatturatoAnnuo ?? ""}
                    onChange={(e) => handleEditChange("fatturatoAnnuo", Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-white sticky bottom-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEditSave}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-lg shadow-lg">
          <DialogHeader className="border-b border-gray-200">
            <DialogTitle className="flex items-center text-red-600 font-semibold text-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              Conferma Eliminazione
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6 text-gray-700 text-center">
            Sei sicuro di voler eliminare <strong>{deleteUser?.username}</strong>?
          </div>

          <DialogFooter className="border-t border-gray-200 px-6 py-3 bg-white flex justify-end gap-3">
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
