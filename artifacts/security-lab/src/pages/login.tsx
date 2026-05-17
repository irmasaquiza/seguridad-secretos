import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Terminal, ArrowRight, Loader2 } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          setToken(res.token);
          toast({
            title: "Acceso concedido",
            description: `Bienvenido, ${res.usuario.nombre}`,
          });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            title: "Acceso denegado",
            description: error.response?.data?.mensaje || "Credenciales incorrectas",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md border-border/50 bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Terminal className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">AUTENTICACIÓN</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al laboratorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@lab.local" type="email" className="font-mono bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input placeholder="********" type="password" className="font-mono bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold mt-6" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Terminal className="mr-2 h-4 w-4" />
                )}
                INICIAR SESIÓN
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm border-t border-border pt-6">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/register" className="text-primary hover:underline font-bold inline-flex items-center gap-1">
              Regístrate aquí <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
