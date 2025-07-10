# Mercado Livre - Consulta de Produtos

Uma aplicação web completa para consultar informações de produtos do Mercado Livre via API, com autenticação OAuth.

## Funcionalidades

- **Autenticação OAuth 2.0** com Mercado Livre
- **Consulta de produtos** do usuário autenticado
- **Busca de produtos** por termos específicos
- **Visualização detalhada** de produtos com imagens e descrições
- **Interface responsiva** e moderna
- **Estatísticas** de produtos (total, ativos, vendidos, valor total)
- **Paginação** para navegação entre resultados

## Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **Flask-CORS** - Suporte a CORS
- **Requests** - Cliente HTTP para APIs
- **SQLAlchemy** - ORM para banco de dados

### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização moderna com gradientes e animações
- **JavaScript** - Funcionalidades interativas
- **Font Awesome** - Ícones

### API
- **Mercado Livre API** - Integração com OAuth 2.0

## Configuração

### Credenciais da Aplicação
- **Client ID**: 5295789575661998
- **Client Secret**: brSlVq9Z2q9p36647Ve5HsB1wokX6YQK
- **Redirect URI**: https://mercadolivreprodutos.onrender.com/callback

### Variáveis de Ambiente
As credenciais estão configuradas diretamente no código para facilitar o deploy. Em produção, recomenda-se usar variáveis de ambiente.

## Instalação Local

1. Clone o repositório:
```bash
git clone <repository-url>
cd mercado_livre_api
```

2. Ative o ambiente virtual:
```bash
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute a aplicação:
```bash
python src/main.py
```

5. Acesse http://localhost:5000

## Estrutura do Projeto

```
mercado_livre_api/
├── src/
│   ├── models/
│   │   └── user.py          # Modelo de usuário
│   ├── routes/
│   │   ├── user.py          # Rotas de usuário
│   │   └── mercado_livre.py # Rotas da API do Mercado Livre
│   ├── static/
│   │   ├── index.html       # Interface principal
│   │   ├── style.css        # Estilos CSS
│   │   └── script.js        # Funcionalidades JavaScript
│   ├── database/
│   │   └── app.db          # Banco de dados SQLite
│   └── main.py             # Arquivo principal da aplicação
├── venv/                   # Ambiente virtual Python
├── requirements.txt        # Dependências Python
└── README.md              # Documentação
```

## Endpoints da API

### Autenticação
- `GET /api/ml/auth` - Inicia processo de autenticação OAuth
- `GET /api/ml/callback` - Callback para receber código de autorização
- `POST /api/ml/logout` - Fazer logout
- `GET /api/ml/status` - Verificar status da autenticação

### Usuário
- `GET /api/ml/user-info` - Obter informações do usuário autenticado

### Produtos
- `GET /api/ml/my-items` - Obter produtos do usuário
- `GET /api/ml/item/<item_id>` - Obter detalhes de um produto específico
- `GET /api/ml/search` - Buscar produtos

## Funcionalidades da Interface

### Tela de Login
- Interface moderna com gradiente
- Botão para conectar com Mercado Livre
- Redirecionamento automático para OAuth

### Dashboard
- Informações do usuário autenticado
- Estatísticas dos produtos (cards com ícones)
- Busca de produtos com filtros
- Visualização em grid responsivo

### Detalhes do Produto
- Modal com informações completas
- Galeria de imagens
- Descrição detalhada
- Atributos do produto
- Link para visualizar no Mercado Livre

### Recursos Visuais
- Design responsivo para mobile e desktop
- Animações suaves e transições
- Loading overlay durante requisições
- Paginação para navegação
- Cards com hover effects

## Deploy

A aplicação está configurada para deploy no Render com as seguintes características:

- **Servidor**: Flask com CORS habilitado
- **Porta**: 5000 (configurável via variável de ambiente)
- **Host**: 0.0.0.0 para acesso externo
- **Banco**: SQLite (adequado para desenvolvimento)

## Segurança

- Tokens de acesso armazenados em sessão
- Validação de estado OAuth
- CORS configurado adequadamente
- Redirect URI validado pelo Mercado Livre

## Limitações

- Tokens armazenados em sessão (recomenda-se banco de dados em produção)
- Credenciais hardcoded (usar variáveis de ambiente em produção)
- Banco SQLite (considerar PostgreSQL para produção)

## Próximos Passos

1. Implementar refresh token automático
2. Adicionar cache para melhor performance
3. Implementar testes automatizados
4. Adicionar logs estruturados
5. Configurar variáveis de ambiente
6. Implementar rate limiting

## Suporte

Para dúvidas ou problemas, consulte a documentação oficial da API do Mercado Livre:
- https://developers.mercadolivre.com.br/

