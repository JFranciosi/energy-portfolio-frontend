import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Cliente {
  id: number;
  username: string;
  email: string;
  tipologia: string; // "Admin" o "Cliente"
  stato: string;
  telefono?: string;
}

const MOCK_USERS: Cliente[] = [
  { id: 1, username: "admin.user", email: "admin@example.com", tipologia: "Admin", stato: "IT" },
  { id: 2, username: "cliente1", email: "cliente1@example.com", tipologia: "Cliente", stato: "IT" },
  { id: 3, username: "cliente2", email: "cliente2@example.com", tipologia: "Cliente", stato: "FR" },
];

const UserManagement = () => {
  // Simuliamo ruolo admin
  const [userRole] = useState<string>("Admin");

  // Usiamo i dati mock come lista utenti
  const [userList] = useState<Cliente[]>(MOCK_USERS);

  const handleDelete = (userId: number) => {
    alert(`Simulazione eliminazione utente con ID ${userId}`);
    // Qui potresti aggiornare lo stato se vuoi simulare la rimozione
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Utenti (Mock)</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tipologia</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nessun utente trovato.
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.tipologia}</TableCell>
                <TableCell>{user.stato}</TableCell>
                <TableCell>
                  {userRole === "Admin" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Elimina
                    </Button>
                  ) : (
                    <span className="text-gray-400">Nessuna azione disponibile</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
