import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, ShieldCheck, Terminal, AlertTriangle, ArrowRight, Shield } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { 
  useGetProfile, 
  getGetProfileQueryKey, 
  useUpdateProfileUnsafe, 
  useUpdateProfileSafe,
  ProfileUpdateUnsafe,
  ProfileUpdateSafe
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const updateSchema = z.object({
  nombre: z.string().optional(),
  correo: z.string().email().optional(),
  password: z.string().optional(),
});

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const { data: profile, isLoading } = useGetProfile({
    query: {
      enabled: !!token,
      queryKey: getGetProfileQueryKey(),
      retry: false,
    }
  });

  const updateUnsafeMutation = useUpdateProfileUnsafe();
  const updateSafeMutation = useUpdateProfileSafe();

  const [addAdminRole, setAddAdminRole] = useState(false);
  const [safeErrorField, setSafeErrorField] = useState<string | null>(null);

  const unsafeForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: { nombre: "", correo: "", password: "" },
  });

  const safeForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: { nombre: "", correo: "", password: "" },
  });

  // Pre-fill forms when profile loads
  useEffect(() => {
    if (profile) {
      unsafeForm.reset({ nombre: profile.nombre, correo: profile.correo, password: "" });
      safeForm.reset({ nombre: profile.nombre, correo: profile.correo, password: "" });
    }
  }, [profile, unsafeForm, safeForm]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Terminal className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (!profile) return null;

  const onUnsafeSubmit = (values: z.infer<typeof updateSchema>) => {
    const payload: ProfileUpdateUnsafe = { ...values };
    if (!payload.password) delete payload.password;
    if (addAdminRole) {
      payload.rol = "ADMIN";
    }

    updateUnsafeMutation.mutate({ data: payload }, {
      onSuccess: (updatedProfile) => {
        queryClient.setQueryData(getGetProfileQueryKey(), updatedProfile);
        toast({
          title: "Perfil actualizado (Inseguro)",
          description: "La operación se completó exitosamente.",
        });
        if (updatedProfile.rol === "ADMIN" && profile.rol !== "ADMIN") {
          toast({
            title: "PRIVILEGIOS ESCALADOS",
            description: "¡Has obtenido rol de ADMIN explotando Mass Assignment!",
            variant: "destructive",
          });
        }
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.mensaje || "Error al actualizar",
          variant: "destructive",
        });
      }
    });
  };

  const onSafeSubmit = (values: z.infer<typeof updateSchema>) => {
    const payload: ProfileUpdateSafe = { ...values };
    if (!payload.password) delete payload.password;
    setSafeErrorField(null);

    // In a real scenario, to test the safe endpoint, we would need a way to send 'rol'
    // But since the API typing or client might strip it if not in type, let's assume we can cast it
    const maliciousPayload = addAdminRole ? { ...payload, rol: "ADMIN" } : payload;

    updateSafeMutation.mutate({ data: maliciousPayload as any }, {
      onSuccess: (updatedProfile) => {
        queryClient.setQueryData(getGetProfileQueryKey(), updatedProfile);
        toast({
          title: "Perfil actualizado (Seguro)",
          description: "La operación se completó exitosamente.",
        });
      },
      onError: (error: any) => {
        const field = error.response?.data?.campo;
        if (field) {
          setSafeErrorField(field);
        }
        toast({
          title: "Petición Rechazada",
          description: error.response?.data?.mensaje || "Error de validación",
          variant: "destructive",
        });
      }
    });
  };

  const currentUnsafeValues = unsafeForm.watch();
  const unsafePayloadDisplay: any = { ...currentUnsafeValues };
  if (!unsafePayloadDisplay.password) delete unsafePayloadDisplay.password;
  if (addAdminRole) unsafePayloadDisplay.rol = "ADMIN";

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Investigador: {profile.nombre}</h2>
            <p className="text-sm text-muted-foreground">{profile.correo}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Nivel de Acceso</p>
              <Badge variant={profile.rol === "ADMIN" ? "destructive" : "default"} className="text-sm px-3 py-1 font-mono">
                {profile.rol === "ADMIN" && <ShieldAlert className="w-4 h-4 mr-2" />}
                {profile.rol}
              </Badge>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Panel Admin <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* INSECURE MODE */}
        <Card className="border-destructive/50 bg-destructive/5 relative">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Modo Inseguro (Vulnerable)
            </CardTitle>
            <CardDescription>
              Endpoint: PUT /api/users/profile/unsafe<br/>
              Acepta cualquier campo enviado en el JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...unsafeForm}>
              <form onSubmit={unsafeForm.handleSubmit(onUnsafeSubmit)} className="space-y-4">
                <FormField
                  control={unsafeForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input className="bg-background font-mono" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={unsafeForm.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <Input className="bg-background font-mono" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-destructive font-bold">Ataque de Mass Assignment</FormLabel>
                      <p className="text-xs text-destructive/80">Inyectar campo "rol" en el payload</p>
                    </div>
                    <Switch 
                      checked={addAdminRole}
                      onCheckedChange={setAddAdminRole}
                      className="data-[state=checked]:bg-destructive"
                    />
                  </div>
                  
                  <div className="bg-black/50 p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
                    <div className="text-muted-foreground mb-2">// Payload a enviar:</div>
                    <pre>{JSON.stringify(unsafePayloadDisplay, null, 2)}</pre>
                  </div>
                </div>

                <Button type="submit" variant="destructive" className="w-full font-bold" disabled={updateUnsafeMutation.isPending}>
                  ENVIAR PAYLOAD
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* SECURE MODE */}
        <Card className="border-primary/50 bg-primary/5 relative">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Modo Seguro (Protegido)
            </CardTitle>
            <CardDescription>
              Endpoint: PUT /api/users/profile/safe<br/>
              Validación estricta con Zod. Rechaza campos no permitidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...safeForm}>
              <form onSubmit={safeForm.handleSubmit(onSafeSubmit)} className="space-y-4">
                <FormField
                  control={safeForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input className="bg-background font-mono" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={safeForm.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <Input className="bg-background font-mono" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="p-4 border border-primary/30 bg-primary/10 rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-primary font-bold">Intentar inyección de rol</FormLabel>
                      <p className="text-xs text-primary/80">Simula el mismo ataque en la API segura</p>
                    </div>
                    <Switch 
                      checked={addAdminRole}
                      onCheckedChange={setAddAdminRole}
                    />
                  </div>
                  
                  {safeErrorField && (
                    <div className="bg-destructive/20 text-destructive text-xs p-2 rounded border border-destructive/50 flex items-start gap-2">
                      <Shield className="w-4 h-4 shrink-0" />
                      <div>
                        <strong>Ataque Bloqueado:</strong><br/>
                        La API rechazó la petición por el campo no permitido: <code className="bg-destructive/30 px-1 rounded">{safeErrorField}</code>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full font-bold" disabled={updateSafeMutation.isPending}>
                  ENVIAR PAYLOAD
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
