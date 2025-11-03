import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  material: string;
  tamanho: string | null;
  peso: number | null;
  quantidade_estoque: number;
  estoque_minimo: number;
}

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    material: '',
    tamanho: '',
    peso: '',
    estoque_minimo: '10'
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        categoria: formData.categoria,
        material: formData.material,
        tamanho: formData.tamanho || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        estoque_minimo: parseInt(formData.estoque_minimo)
      };

      if (editingProduto) {
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', editingProduto.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([produtoData]);

        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      categoria: produto.categoria,
      material: produto.material,
      tamanho: produto.tamanho || '',
      peso: produto.peso?.toString() || '',
      estoque_minimo: produto.estoque_minimo.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      material: '',
      tamanho: '',
      peso: '',
      estoque_minimo: '10'
    });
    setEditingProduto(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
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
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do produto
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Martelos, Chaves, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="material">Material *</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="Ex: Aço, Plástico, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tamanho">Tamanho</Label>
                    <Input
                      id="tamanho"
                      value={formData.tamanho}
                      onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                      placeholder="Ex: Médio, 10cm, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.01"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estoque_minimo">Estoque Mínimo *</Label>
                    <Input
                      id="estoque_minimo"
                      type="number"
                      value={formData.estoque_minimo}
                      onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes adicionais do produto..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduto ? 'Atualizar' : 'Cadastrar'}
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
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {produto.nome}
                      {produto.quantidade_estoque < produto.estoque_minimo && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{produto.categoria}</TableCell>
                  <TableCell>{produto.material}</TableCell>
                  <TableCell>{produto.tamanho || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={produto.quantidade_estoque < produto.estoque_minimo ? 'destructive' : 'secondary'}
                    >
                      {produto.quantidade_estoque}
                    </Badge>
                    <span className="text-muted-foreground text-xs ml-2">
                      / {produto.estoque_minimo}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(produto)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(produto.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Produtos;
