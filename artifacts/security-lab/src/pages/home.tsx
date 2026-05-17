import { Link } from "wouter";
import { ShieldAlert, Lock, Unlock, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export default function Home() {
  const { data: health } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey() }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 py-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <ShieldAlert className="h-24 w-24 text-primary relative z-10" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
          Gestión de Secretos &<br />Escalamiento de Privilegios
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Entorno de laboratorio para investigar vulnerabilidades en APIs REST. 
          Aprende cómo configuraciones inseguras pueden permitir a un atacante 
          elevar sus privilegios de usuario a administrador.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-6">
          <Link href="/login">
            <Button size="lg" className="font-bold">
              INICIAR LABORATORIO
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10">
              REGISTRARSE
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-destructive/50 bg-destructive/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Unlock className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Modo Inseguro
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Vulnerabilidad de Asignación Masiva (Mass Assignment)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10 text-sm">
            <p>
              El endpoint <code className="text-destructive bg-destructive/10 px-1 py-0.5 rounded">PUT /api/users/profile/unsafe</code> acepta 
              cualquier campo enviado en el payload JSON.
            </p>
            <p>
              Un atacante puede interceptar la petición e inyectar el campo <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">"rol": "ADMIN"</code> para 
              modificar sus propios privilegios.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Modo Seguro
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Validación Estricta de Esquemas (Zod)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10 text-sm">
            <p>
              El endpoint <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">PUT /api/users/profile/safe</code> utiliza 
              un esquema estricto que rechaza campos no permitidos.
            </p>
            <p>
              Cualquier intento de enviar campos adicionales como <code className="text-destructive bg-destructive/10 px-1 py-0.5 rounded">"rol"</code> resultará 
              en un error 400 Bad Request, protegiendo la aplicación.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-12 flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${health ? 'bg-primary' : 'bg-destructive'}`}></div>
        API Status: {health ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );
}
