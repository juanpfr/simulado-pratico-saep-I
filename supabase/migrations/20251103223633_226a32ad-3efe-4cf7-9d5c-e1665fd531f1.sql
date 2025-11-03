-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT DEFAULT 'almoxarife',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  material TEXT NOT NULL,
  tamanho TEXT,
  peso DECIMAL(10, 2),
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Todos podem visualizar produtos"
  ON public.produtos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar produtos"
  ON public.produtos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON public.produtos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON public.produtos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Criar tabela de movimentações
CREATE TABLE public.movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para movimentações
CREATE POLICY "Todos podem visualizar movimentações"
  ON public.movimentacoes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar movimentações"
  ON public.movimentacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_estoque()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE public.produtos
    SET quantidade_estoque = quantidade_estoque + NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'saida' THEN
    UPDATE public.produtos
    SET quantidade_estoque = quantidade_estoque - NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.produto_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON public.movimentacoes
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_estoque();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();