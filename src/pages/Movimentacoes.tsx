import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Produto {
  id: string;
  nome: string;
}

interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  observacao: string | null;
  created_at: string;
  produtos: {
    nome: string;
  };
  profiles: {
    nome: string;
  };
}

const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    observacao: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar produtos
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('id, nome')
        .order('nome');

      if (produtosData) {
        setProdutos(produtosData);
      }

      // Buscar movimentações
      const { data: movimentacoesData, error } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          produtos (nome),
          profiles (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovimentacoes((movimentacoesData || []) as Movimentacao[]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('movimentacoes')
        .insert([{
          produto_id: formData.produto_id,
          usuario_id: user.id,
          tipo: formData.tipo,
          quantidade: parseInt(formData.quantidade),
          observacao: formData.observacao || null
        }]);

      if (error) throw error;
      
      toast.success('Movimentação registrada com sucesso!');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação');
    }
  };

  const resetForm = () => {
    setFormData({
      produto_id: '',
      tipo: 'entrada',
      quantidade: '',
      observacao: ''
    });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Movimentações</h1>
            <p className="text-muted-foreground">Registre entradas e saídas de estoque</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
                <DialogDescription>
                  Registre uma entrada ou saída de estoque
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="produto">Produto *</Label>
                  <Select
                    value={formData.produto_id}
                    onValueChange={(value) => setFormData({ ...formData, produto_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'entrada' | 'saida') => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-sm">
                    {formatDate(mov.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {mov.produtos.nome}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={mov.tipo === 'entrada' ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      {mov.tipo === 'entrada' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {mov.quantidade}
                  </TableCell>
                  <TableCell>{mov.profiles.nome}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {mov.observacao || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Movimentacoes;
