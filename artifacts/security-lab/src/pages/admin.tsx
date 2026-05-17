import { useEffect } from "react";
import { useLocation } from "wouter";
import { ShieldAlert, Users, Database, ShieldCheck, Terminal } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  useGetProfile, 
  getGetProfileQueryKey,
  useListAllUsers,
  getListAllUsersQueryKey,
  useGetAdminStats,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const { data: profile, isLoading: profileLoading } = useGetProfile({
    query: {
      enabled: !!token,
      queryKey: getGetProfileQueryKey(),
      retry: false,
    }
  });

  const isAdmin = profile?.rol === "ADMIN";

  const { data: users, isLoading: usersLoading } = useListAllUsers({
    query: {
      enabled: isAdmin,
      queryKey: getListAllUsersQueryKey(),
    }
  });

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: {
      enabled: isAdmin,
      queryKey: getGetAdminStatsQueryKey(),
    }
  });

  if (profileLoading) {
    return <div className="flex justify-center py-12"><Terminal className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (!profile) return null;

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center py-20">
        <Card className="w-full max-w-lg border-destructive/50 bg-destructive/10">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <ShieldAlert className="w-20 h-20 text-destructive" />
            </div>
            <CardTitle className="text-3xl text-destructive font-bold">403 FORBIDDEN</CardTitle>
            <CardDescription className="text-base text-foreground/80">
              ACCESO DENEGADO AL PANEL DE ADMINISTRACIÓN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/50 p-4 rounded font-mono text-sm text-destructive">
              <p>{">"} USER_ROLE: {profile.rol}</p>
              <p>{">"} REQUIRED_ROLE: ADMIN</p>
              <p>{">"} ACTION: BLOCK</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Tu token actual solo tiene privilegios de USUARIO. Regresa al dashboard y utiliza la vulnerabilidad de Mass Assignment en el Modo Inseguro para escalar tus privilegios a ADMIN.
            </p>
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setLocation("/dashboard")} className="border-destructive text-destructive hover:bg-destructive/20">
                VOLVER AL DASHBOARD
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Centro de Control
        </h1>
        <p className="text-muted-foreground mt-2">Acceso concedido. Privilegios de administrador verificados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {statsLoading ? "-" : stats?.totalUsuarios}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              {statsLoading ? "-" : stats?.totalAdmins}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              {statsLoading ? "-" : stats?.registrosRecientes}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Directorio de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Terminal className="animate-spin text-primary w-6 h-6 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{user.correo}</TableCell>
                      <TableCell>
                        <Badge variant={user.rol === "ADMIN" ? "destructive" : "secondary"} className="text-xs">
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
