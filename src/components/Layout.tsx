import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ArrowLeftRight, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                <div className="p-2 bg-primary rounded-lg">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <span>Sistema de Estoque</span>
              </Link>
              
              <div className="hidden md:flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive(item.path) ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
