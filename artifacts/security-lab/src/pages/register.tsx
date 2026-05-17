import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Terminal, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";
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

const registerSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  correo: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      correo: "",
      password: "",
    },
  });

  const registerMutation = useRegister();

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          setToken(res.token);
          toast({
            title: "Registro exitoso",
            description: "Cuenta creada correctamente.",
          });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            title: "Error de registro",
            description: error.response?.data?.mensaje || "No se pudo crear la cuenta",
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
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">NUEVO INVESTIGADOR</CardTitle>
          <CardDescription>
            Crea una cuenta para acceder al laboratorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="hacker99" className="font-mono bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="hacker@lab.local" type="email" className="font-mono bg-background" {...field} />
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
              <Button type="submit" className="w-full font-bold mt-6" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Terminal className="mr-2 h-4 w-4" />
                )}
                REGISTRARSE
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm border-t border-border pt-6">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-bold inline-flex items-center gap-1">
              Inicia sesión aquí <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
