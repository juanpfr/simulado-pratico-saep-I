import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Package, BarChart3, Shield, Zap } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-2xl">
              <Package className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Sistema de Gestão de Estoque
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Controle completo do estoque de ferramentas e equipamentos da sua empresa
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Acessar Sistema
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Controle Total</h3>
            <p className="text-muted-foreground">
              Acompanhe em tempo real a quantidade de cada produto no estoque
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Alertas Inteligentes</h3>
            <p className="text-muted-foreground">
              Receba notificações quando produtos atingirem o estoque mínimo
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Movimentação Ágil</h3>
            <p className="text-muted-foreground">
              Registre entradas e saídas com histórico completo de operações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
