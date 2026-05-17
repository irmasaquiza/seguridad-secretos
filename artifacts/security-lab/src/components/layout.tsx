import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, ShieldAlert, LogOut, LayoutDashboard, Database, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { token, logout } = useAuth();
  
  const { data: profile } = useGetProfile({
    query: {
      enabled: !!token,
      queryKey: getGetProfileQueryKey()
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono selection:bg-primary/30">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ShieldAlert className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight">LAB_SEGURIDAD</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className={`${location === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
              [HOME]
            </Link>
            
            {token ? (
              <>
                <Link href="/dashboard" className={`${location === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors flex items-center gap-2`}>
                  <LayoutDashboard className="w-4 h-4" />
                  [DASHBOARD]
                </Link>
                <Link href="/admin" className={`${location === "/admin" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors flex items-center gap-2`}>
                  <Database className="w-4 h-4" />
                  [ADMIN_PANEL]
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                  {profile && (
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-foreground font-bold">{profile.nombre}</span>
                      <span className="text-[10px] text-primary">{profile.rol}</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={logout} className="border-primary/20 hover:bg-primary/10 hover:text-primary text-xs">
                    <LogOut className="w-3 h-3 mr-2" />
                    SALIR
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={`${location === "/login" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
                  [LOGIN]
                </Link>
                <Link href="/register" className={`${location === "/register" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}>
                  [REGISTER]
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <p>LAB DE SEGURIDAD v1.0.0 // GESTION DE SECRETOS</p>
        <p className="mt-1 opacity-50">STRICTLY FOR EDUCATIONAL PURPOSES</p>
      </footer>
    </div>
  );
}
