# Docker & Portainer Configuration - Level Up Live

## 📦 O que foi criado

Para fazer deploy da aplicação Level Up Live no **Portainer do Umbrel**, foram criados os seguintes arquivos:

| Arquivo | Descrição |
|---------|-----------|
| **Dockerfile** | Multi-stage build para criar a imagem Docker |
| **.dockerignore** | Otimiza o build ignorando arquivos desnecessários |
| **docker-compose.portainer.yml** | Stack com 3 serviços (PostgreSQL + Backend + Networks) |
| **.env.portainer** | Variáveis de exemplo para referência |
| **docs/PORTAINER_SETUP.md** | Guia completo de deployment |
| **PORTAINER_QUICK_START.md** | TL;DR - setup em 5 minutos |
| **scripts/portainer-copy.sh** | Helper script para facilitar |

---

## 🏗️ Arquitetura da Stack

```
┌─────────────────────────────────────────────┐
│         Portainer Stack (Docker)            │
│                                             │
│  levelup-network (bridge)                   │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │  PostgreSQL  │  │   Backend    │ │  │
│  │  │  (postgres)  │  │ (Node.js)    │ │  │
│  │  │              │  │              │ │  │
│  │  │ :5432 (int)  │  │ :8881 (API)  │ │  │
│  │  │ :8010 (ext)  │  │ :8020 (live) │ │  │
│  │  │              │  │              │ │  │
│  │  │ vol: db data │  │ v: assets    │ │  │
│  │  └──────────────┘  └──────────────┘ │  │
│  │         ↑              ↓            │  │
│  │         └──────────────┘            │  │
│  │     Database Connection             │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘

Acessos Externos:
- Dashboard: 8881:8881 (API REST + WebSocket + Frontend)
- Live View: 8020:8020 (OBS Capture)
- Database:  8010:5432 (PostgreSQL)
```

---

## 🔌 Portas

### Status Atual do Servidor Umbrel

```bash
# Portas em uso:
22     - SSH
80     - HTTP (nginx/proxy)
2000   - Aplicação interna
7421   - Aplicação interna
8097   - Aplicação interna
8877   - Aplicação interna
9000   - Portainer (manager)
9091   - Aplicação interna
51413  - Transmissão
```

### Portas para Level Up Live ✅

```
┌─────────────┬──────────────────┬─────────────────────┐
│   Serviço   │   Porta Interna  │   Porta Externa     │
├─────────────┼──────────────────┼─────────────────────┤
│ PostgreSQL  │      5432        │   8010 ✅ Livre     │
│ Backend API │      8881        │   8881 ✅ Livre     │
│ Live View   │      8020        │   8020 ✅ Livre     │
└─────────────┴──────────────────┴─────────────────────┘
```

**Todas as portas necessárias estão disponíveis!**

### Se alguma porta estiver em uso

**Opção 1: Portainer Web UI**
- Na Stack, vá para Environment Variables
- Mude: `POSTGRES_PORT_EXTERNAL=8010` para outra porta (ex: `8012`)

**Opção 2: CLI**
```bash
# Verificar portas em uso
sudo ss -tuln | grep LISTEN

# Mudar no arquivo (antes de deploiar)
sed -i 's/8010:5432/8012:5432/g' docker-compose.portainer.yml
```

---

## 🚀 Como Deploiar

### Método Rápido (Recomendado)

1. **Abra o Portainer:**
   ```
   http://umbrel.local:9000
   ```

2. **Clique em Stacks → + Add Stack**

3. **Configure:**
   - Name: `level-up-live`
   - Clique em "Web Editor"

4. **Cole o arquivo:**
   ```bash
   cat docker-compose.portainer.yml
   ```
   Copie todo o conteúdo e cole no editor

5. **Deploy:**
   - Clique em "Deploy the stack"
   - Aguarde 2-3 minutos

6. **Pronto! 🎉**
   ```
   http://umbrel.local:8881
   ```

### Método via CLI (Alternativa)

```bash
cd /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/

# Deploy
docker-compose -f docker-compose.portainer.yml up -d

# Ver status
docker-compose -f docker-compose.portainer.yml ps

# Ver logs
docker-compose -f docker-compose.portainer.yml logs -f levelup-backend
```

---

## 🔧 Variáveis de Ambiente

### Obrigatórias

```env
PORT=8881
NODE_ENV=production
POSTGRES_HOST=postgres        # ⚠️ NÃO use localhost!
POSTGRES_PORT=5432           # Porta interna (não 8010)
DATABASE_URL=postgresql://...
```

### Recomendadas para mudar

```env
# SEGURANÇA: Mude a senha padrão!
POSTGRES_PASSWORD=levelup_dev_2024
# Para: uma senha forte e aleatória
```

### Opcionais

```env
DEFAULT_MUSIC_VOLUME=0.7
DEFAULT_SFX_VOLUME=0.8
XP_RATE_AUDIO_DROP=2
XP_RATE_AUDIO_BUILD=1
```

### No Portainer

Para sobrescrever variáveis na Stack:

1. Vá para **Stacks → level-up-live → Edit**
2. Scroll para **Environment**
3. Adicione/modifique as variáveis:
   ```
   POSTGRES_PASSWORD=minha_senha_super_segura
   DEFAULT_MUSIC_VOLUME=0.8
   ```
4. Clique **Update the stack**

---

## 📁 Volumes e Persistência

### 1. Banco de Dados PostgreSQL
```
Docker Volume: levelup-postgres-data
Localização:   /var/lib/docker/volumes/levelup-postgres-data/_data
Tipo:          Docker managed volume (auto-backup)
Conteúdo:      Tabelas, dados de usuários, configurações
Backup:        docker exec levelup-postgres pg_dump -U levelup_user levelup_live > backup.sql
```

### 2. Assets (Músicas, Imagens, Sons)
```
Bind Mount:    ./assets → /app/assets
Localização:   /home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1/assets
Tipo:          Acesso direto ao sistema de arquivos
Conteúdo:      Música, imagens de cenas, efeitos sonoros
```

### 3. Logs e Dados
```
Bind Mount:    ./data → /app/data
Localização:   /home/umbrel/umbrel/home/APPS/Level Up/level-up-live-mk1/data
Tipo:          Acesso direto ao sistema de arquivos
Conteúdo:      Logs da aplicação (data/logs/app.log)
```

---

## ✅ Verificação de Status

### No Portainer
1. Vá para **Containers**
2. Procure por `levelup-*`
3. Verifique status (🟢 = rodando):
   - `levelup-postgres` (banco)
   - `levelup-backend` (API + frontend)

### Via CLI
```bash
# Ver containers rodando
docker ps | grep levelup

# Ver logs do backend
docker logs -f levelup-backend

# Ver status do banco
docker exec levelup-postgres pg_isready -U levelup_user
```

### Health Check
```bash
# API está respondendo?
curl http://localhost:8881/health
# Esperado: {"status":"ok"}

# Live View está acessível?
curl http://localhost:8020/live-view -s | head -10
```

---

## 🔄 Operações Comuns

### Parar a Stack
```bash
# No Portainer: Stacks → level-up-live → Stop
# Ou CLI:
docker-compose -f docker-compose.portainer.yml down
```

### Reiniciar
```bash
# Portainer: Stacks → level-up-live → Restart
# Ou CLI:
docker-compose -f docker-compose.portainer.yml restart
```

### Ver Logs em Tempo Real
```bash
# Backend logs
docker logs -f levelup-backend

# PostgreSQL logs
docker logs -f levelup-postgres

# Tudo junto
docker-compose -f docker-compose.portainer.yml logs -f
```

### Atualizar Código
```bash
# 1. Puxe novo código
git pull origin main

# 2. No Portainer, clique "Update" na Stack
# Isso vai:
# - Fazer rebuild da imagem
# - Parar containers antigos
# - Iniciar containers novos
```

### Acessar Banco de Dados
```bash
# CLI PostgreSQL
docker exec -it levelup-postgres psql -U levelup_user -d levelup_live

# Dentro do psql, alguns comandos úteis:
# \dt                    - listar tabelas
# SELECT * FROM levels;  - ver níveis
# \q                     - sair
```

---

## 🐛 Troubleshooting

### Containers não startam
```bash
# Verifique logs
docker logs levelup-backend
docker logs levelup-postgres

# Causas comuns:
# - Porta em uso (POSTGRES_PORT_EXTERNAL ou BACKEND_PORT)
# - Migrations falharam (banco não acessível)
# - Memória insuficiente
```

### Backend com health check falhando
```bash
# Esperado no início (migrations rodando):
# Health check será OK após 30-40 segundos

# Se falhar após isso:
docker logs levelup-backend
# Procure por "Error" ou "Connection refused"
```

### Banco de dados não conecta
```bash
# Verificar se postgres está rodando
docker ps | grep levelup-postgres

# Testar conexão
docker exec levelup-postgres pg_isready -U levelup_user

# Verificar logs
docker logs levelup-postgres
```

### Frontend não abre
```bash
# Verificar se backend está rodando
docker ps | grep levelup-backend

# Teste a API
curl http://localhost:8881/health

# Verifique em Logs se há erro de compilação
# Se vir "ERR!" em Logs, o build falhou
```

---

## 🔐 Segurança

### Para Produção

1. **Mude senhas padrão:**
   ```env
   POSTGRES_PASSWORD=SenhaForte123!@#Randomica
   ```
   Recomendação: 16+ caracteres, com números, símbolos, maiúsculas/minúsculas

2. **Configure HTTPS:**
   - Use reverse proxy (nginx/Caddy) na frente
   - Configure certificados Let's Encrypt
   - Redirecione HTTP → HTTPS

3. **Firewall:**
   - Bloqueie portas 8881, 8020, 8010 externamente
   - Acesse via VPN ou proxy autenticado

4. **Backups:**
   ```bash
   # Backup do banco
   docker exec levelup-postgres pg_dump -U levelup_user levelup_live > backup_$(date +%Y%m%d).sql

   # Backup dos assets
   tar -czf assets_$(date +%Y%m%d).tar.gz assets/
   ```

5. **Monitoramento:**
   - Configure alertas no Portainer
   - Monitore uso de CPU/memória/disco
   - Revise logs regularmente

---

## 📊 Especificações da Imagem

```
Base Image:      node:20-alpine
Size:            ~1.2 GB (built)
Build Time:      ~5-10 minutos (primeira vez)
Runtime Memory:  ~200-500 MB (normal)
Disk Space:      ~5 GB (com volumes)

Incluído:
- Node.js 20.x
- npm 10.x
- TypeScript compilado
- React frontend built
- PostgreSQL client (psql)
- dumb-init (signal handling)
```

---

## 📚 Documentação Adicional

| Documento | Propósito |
|-----------|-----------|
| **docs/PORTAINER_SETUP.md** | Guia completo com screenshots |
| **PORTAINER_QUICK_START.md** | TL;DR - passo a passo rápido |
| **docs/CLAUDE.md** | Arquitetura técnica do projeto |
| **docs/PRD.md** | Especificação completa |
| **.env.portainer** | Variáveis de exemplo |

---

## 🎯 Próximos Passos

Após Stack rodando:

1. **Acesse a interface:** http://umbrel.local:8881
2. **Configure músicas:** Copie MP3 para `assets/music/`
3. **Crie níveis:** Use o editor na interface
4. **Configure OBS:** Live View em http://umbrel.local:8020/live-view
5. **Teste a transmissão:** Comece uma sessão live

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique logs:**
   ```bash
   docker logs levelup-backend
   docker logs levelup-postgres
   ```

2. **Reinicie os serviços:**
   - Portainer: Stacks → level-up-live → Restart

3. **Verifique conectividade:**
   ```bash
   docker exec levelup-backend \
     curl http://postgres:5432 -v
   ```

4. **Consulte a documentação:**
   - docs/PORTAINER_SETUP.md - Troubleshooting completo
   - docs/CLAUDE.md - Detalhes técnicos

---

## 📝 Notas Importantes

- ⚠️ **POSTGRES_HOST deve ser `postgres`**, não `localhost`
  - Containers se comunicam via Docker network

- ⚠️ **POSTGRES_PORT deve ser `5432`** (porta interna)
  - 8010 é apenas a porta externa mapeada

- ✅ **Migrações rodam automaticamente** no startup do backend
  - Veja em `docker logs levelup-backend`

- ✅ **Healthchecks configurados** para ambos serviços
  - Portainer sabe quando algo está errado

- ✅ **Bind mounts** para assets e dados
  - Acesso direto aos arquivos do Umbrel

---

**Versão:** 1.0
**Última atualização:** 2025-11-10
**Autores:** Level Up Development Team
