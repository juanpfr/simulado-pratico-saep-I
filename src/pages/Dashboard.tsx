import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Produto {
  id: string;
  nome: string;
  quantidade_estoque: number;
  estoque_minimo: number;
}

const Dashboard = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    abaixoMinimo: 0,
    entradas: 0,
    saidas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar produtos
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (produtosData) {
        setProdutos(produtosData);
        
        const abaixoMinimo = produtosData.filter(
          p => p.quantidade_estoque < p.estoque_minimo
        ).length;
        
        setStats(prev => ({
          ...prev,
          total: produtosData.length,
          abaixoMinimo
        }));
      }

      // Buscar movimentações do mês atual
      const hoje = new Date();
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      const { data: movimentacoes } = await supabase
        .from('movimentacoes')
        .select('tipo, quantidade')
        .gte('created_at', primeiroDia.toISOString());

      if (movimentacoes) {
        const entradas = movimentacoes
          .filter(m => m.tipo === 'entrada')
          .reduce((sum, m) => sum + m.quantidade, 0);
        
        const saidas = movimentacoes
          .filter(m => m.tipo === 'saida')
          .reduce((sum, m) => sum + m.quantidade, 0);
        
        setStats(prev => ({ ...prev, entradas, saidas }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const produtosAlerta = produtos.filter(p => p.quantidade_estoque < p.estoque_minimo);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do estoque</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.abaixoMinimo}</div>
              <p className="text-xs text-muted-foreground">abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas (mês)</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.entradas}</div>
              <p className="text-xs text-muted-foreground">unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas (mês)</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.saidas}</div>
              <p className="text-xs text-muted-foreground">unidades</p>
            </CardContent>
          </Card>
        </div>

        {produtosAlerta.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção: Estoque Baixo!</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {produtosAlerta.map(produto => (
                  <div key={produto.id} className="flex items-center justify-between">
                    <span className="font-medium">{produto.nome}</span>
                    <Badge variant="destructive">
                      {produto.quantidade_estoque} / {produto.estoque_minimo} unidades
                    </Badge>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
