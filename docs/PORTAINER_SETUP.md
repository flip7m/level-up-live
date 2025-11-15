# Portainer Stack Setup - Level Up Live

Este guia descreve como fazer deploy da aplicação Level Up Live como uma Stack no Portainer do Umbrel.

## 📋 Visão Geral

A Stack consiste em **3 serviços**:

| Serviço | Porta Interna | Porta Externa | Descrição |
|---------|--------------|--------------|-----------|
| **postgres** | 5432 | 8010 | Banco de dados PostgreSQL 16 |
| **levelup-backend** | 8881 | 8881 | API REST + WebSocket + Frontend estático |
| **levelup-backend (live)** | 8020 | 8020 | Servidor Live View para OBS |

**Sem pgAdmin** - Acesso ao banco é via linha de comando quando necessário.

---

## 🚀 Passo 1: Preparar o arquivo docker-compose

Você já tem o arquivo `docker-compose.portainer.yml` no repositório.

### Opção A: Copiar o arquivo completo
```bash
cd /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/
cat docker-compose.portainer.yml
```

### Opção B: Usar o conteúdo abaixo
Veja o arquivo `docker-compose.portainer.yml` para copiar o conteúdo completo.

---

## 🔧 Passo 2: Acessar o Portainer

1. Abra seu navegador
2. Acesse: **`http://umbrel.local:9000`** (ou o IP do seu servidor)
3. Faça login com suas credenciais do Portainer

---

## 📦 Passo 3: Criar a Stack

### Na interface do Portainer:

1. **Clique em "Stacks"** (no menu lateral esquerdo)
2. **Clique em "+ Add Stack"** (botão azul no topo)

### Configure a Stack:

**Name:**
```
level-up-live
```

**Ambiente:** Deixe o padrão (Docker)

**Build Method:** Escolha uma opção:
- **Web Editor** - Cole o conteúdo do arquivo aqui (recomendado para primeira vez)
- **Upload** - Faça upload do arquivo `docker-compose.portainer.yml`
- **Git Repository** - Se estiver em um repositório Git

### Se usar Web Editor:

1. Clique na área de texto
2. Abra o arquivo `docker-compose.portainer.yml`
3. **Copie todo o conteúdo** (Ctrl+A, Ctrl+C)
4. **Cole** na área de texto do Portainer (Ctrl+V)

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

Na seção **Environment Variables** da Stack, você pode sobrescrever as variáveis padrão:

### Variáveis Disponíveis:

```env
# Portas (se quiser usar diferentes das padrões)
POSTGRES_PORT_EXTERNAL=8010      # Porto externo do PostgreSQL
BACKEND_PORT=8881                # Porto externo da API
LIVE_VIEW_PORT=8020              # Porto externo da Live View

# Database (mudar as credenciais padrão)
POSTGRES_DB=levelup_live         # Nome do banco
POSTGRES_USER=levelup_user       # Usuário do banco
POSTGRES_PASSWORD=levelup_dev_2024  # Senha (MUDE ISTO!)

# Environment
NODE_ENV=production

# Audio
DEFAULT_MUSIC_VOLUME=0.7
DEFAULT_SFX_VOLUME=0.8

# XP Rates
XP_RATE_AUDIO_DROP=2
XP_RATE_AUDIO_BUILD=1
```

### ⚠️ IMPORTANTE - Mudar Senha do Banco:

Por segurança, mude a `POSTGRES_PASSWORD`:

1. Na seção "Environment Variables" do Portainer, adicione:
   ```
   POSTGRES_PASSWORD=sua_senha_super_segura_aqui
   ```

2. A senha deve ter pelo menos 8 caracteres e incluir maiúsculas, minúsculas e números

---

## 🚀 Passo 5: Deploy da Stack

1. **Scroll para baixo** até encontrar o botão **"Deploy the stack"**
2. **Clique no botão azul** "Deploy the stack"
3. O Portainer vai:
   - Fazer build da imagem Docker
   - Criar os containers
   - Iniciar os serviços
   - Executar as migrações do banco de dados

### Acompanhando o Progress:

1. Clique em "Stacks" novamente
2. Clique em "level-up-live"
3. Veja os containers:
   - 🟢 **levelup-postgres** (verde = rodando)
   - 🟢 **levelup-backend** (verde = rodando)

---

## ✅ Passo 6: Verificar Status

### Verificar se está tudo rodando:

```bash
# Via terminal SSH no Umbrel
docker ps | grep levelup
```

### Verificar logs do backend:

No Portainer:
1. Vá para **Containers**
2. Procure por **levelup-backend**
3. Clique em **Logs** para ver o status

Você verá algo como:
```
✓ Database migrated successfully
✓ Backend server running on port 8881
✓ Live View server running on port 8020
✓ Socket.IO initialized
```

### Verificar conexão do banco:

```bash
# Do servidor Umbrel
docker exec levelup-postgres psql -U levelup_user -d levelup_live -c "SELECT 1;"
```

---

## 🌐 Passo 7: Acessar a Aplicação

### Interface de Controle (Dashboard):
```
http://umbrel.local:8881
```

### Live View (para OBS):
```
http://umbrel.local:8020/live-view
```

### API Base:
```
http://umbrel.local:8881/api
```

---

## 📊 Volumes e Persistência

Os dados importantes são armazenados em:

### 1. Banco de Dados PostgreSQL
- **Volume:** `levelup-postgres-data`
- **Localização no Umbrel:** `/var/lib/docker/volumes/levelup-postgres-data/_data`
- **Conteúdo:** Tabelas, índices, dados de usuários, configurações

### 2. Assets e Dados da Aplicação
- **Bind Mount:** `./assets` → `/app/assets`
- **Localização no Umbrel:** `/home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1/assets`
- **Conteúdo:** Músicas, imagens de cenas, efeitos sonoros

- **Bind Mount:** `./data` → `/app/data`
- **Localização no Umbrel:** `/home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1/data`
- **Conteúdo:** Logs da aplicação

### Backups:

Para fazer backup dos dados:

```bash
# Backup do banco
docker exec levelup-postgres pg_dump -U levelup_user levelup_live > backup_db.sql

# Backup dos assets
cp -r /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/assets backup_assets/
```

---

## 🔄 Operações Comuns

### Parar a Stack

No Portainer:
1. Vá para **Stacks**
2. Clique em **level-up-live**
3. Clique em **Stop** (botão vermelho)

Via CLI:
```bash
docker-compose -f /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/docker-compose.portainer.yml down
```

### Reiniciar a Stack

No Portainer:
1. Vá para **Stacks**
2. Clique em **level-up-live**
3. Clique em **Restart**

### Atualizar a Stack (novo código)

1. Atualize o repositório:
   ```bash
   cd /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/
   git pull origin main
   ```

2. No Portainer, vá para a Stack e clique em **Update** para fazer rebuild

3. Os containers vão:
   - Fazer build da nova imagem
   - Parar os containers antigos
   - Iniciar os novos

### Ver Logs em Tempo Real

No Portainer:
1. Vá para **Containers**
2. Clique em **levelup-backend**
3. Clique em **Logs**
4. Marque "Auto scroll"

Via CLI:
```bash
docker logs -f levelup-backend
```

---

## 🐛 Troubleshooting

### Erro: "failed to create service postgres: port already in use"

**Solução:** A porta 8010 já está em uso. Escolha outra porta:

No Portainer, ao editar a Stack:
- Mude `POSTGRES_PORT_EXTERNAL=8010` para `POSTGRES_PORT_EXTERNAL=8012` (ou outra porta livre)

### Erro: "Backend can't connect to database"

**Verificar:**
1. PostgreSQL está rodando? `docker ps | grep levelup-postgres`
2. Os logs do PostgreSQL mostram erro? Clique em Logs no Portainer
3. Reinicie o backend no Portainer

### Erro: "Health check failing"

**Significa:** O backend não conseguiu iniciar corretamente

**Verificar logs:**
- No Portainer, vá para levelup-backend → Logs
- Procure por mensagens de erro

**Causas comuns:**
- Migrations falharam (erro de banco)
- Porta 8881 já em uso
- Memória insuficiente

### Frontend não carrega

**Verificar:**
1. Backend está rodando? `docker ps | grep levelup-backend`
2. Acesse http://umbrel.local:8881/health na API
3. Verifique em Logs se há erro de compilação

---

## 🔐 Segurança

### Recomendações para Produção:

1. **Mude as credenciais padrão:**
   - `POSTGRES_PASSWORD` (mínimo 16 caracteres aleatórios)
   - Regenere em um gerenciador de senhas

2. **HTTPS/SSL:**
   - Configure reverse proxy (nginx/Caddy) na frente do Portainer
   - Use certificados Let's Encrypt

3. **Firewall:**
   - Bloqueie as portas externamente, acesse via VPN
   - Ou use um proxy reverso autenticado

4. **Backups:**
   - Faça backups regulares do banco
   - Teste restaurações periodicamente

5. **Monitoramento:**
   - Configure alertas no Portainer
   - Monitore uso de CPU/memória

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   - Portainer → Containers → levelup-backend → Logs

2. **Reinicie os serviços:**
   - Portainer → Stacks → level-up-live → Restart

3. **Verifique as portas:**
   ```bash
   sudo netstat -tuln | grep LISTEN
   ```

4. **Consulte a documentação do projeto:**
   - `docs/CLAUDE.md` - Visão geral técnica
   - `docs/PRD.md` - Especificação completa

---

## 🎉 Próximos Passos

Após a Stack estar rodando:

1. **Acesse a interface:** http://umbrel.local:8881
2. **Configure OBS:** Aponte a Live View para http://umbrel.local:8020/live-view
3. **Adicione músicas:** Copie arquivos MP3 para `./assets/music/`
4. **Crie níveis:** Use a interface do dashboard para criar os 2 níveis iniciais
5. **Teste a transmissão:** Comece uma sessão live de teste

---

## 📝 Notas Finais

- **Bind Mounts vs Volumes:** Assets/data usam bind mounts (acesso direto), banco usa volume Docker gerenciado (melhor performance)
- **Node Environment:** Configurado como `production` (remova para `development` se quiser mais logs)
- **Build Context:** Build acontece localmente no seu servidor Umbrel, não em cloud
- **Imagem Size:** ~1.2GB (Node 20 + node_modules + built assets)

---

**Version:** 1.0
**Last Updated:** 2025-11-10
**Author:** Level Up Development Team
