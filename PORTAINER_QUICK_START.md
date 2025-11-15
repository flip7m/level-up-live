# 🚀 Level Up Live - Portainer Quick Start

## TL;DR - Deploy em 5 minutos

### 1. Prepare o arquivo
```bash
cat docker-compose.portainer.yml
```

### 2. No Portainer (http://umbrel.local:9000)
- **Stacks** → **+ Add Stack**
- **Name:** `level-up-live`
- **Web Editor:** Cole o conteúdo de `docker-compose.portainer.yml`
- **Deploy the stack**

### 3. Aguarde (~2-3 min)
Portainer faz o build da imagem e inicia os containers.

### 4. Pronto! 🎉
- **Dashboard:** http://umbrel.local:8881
- **Live View (OBS):** http://umbrel.local:8020/live-view

---

## 📋 Arquivo para copiar

### `docker-compose.portainer.yml`

Este arquivo define:
- ✅ PostgreSQL 16 (porta 8010)
- ✅ Backend API (porta 8881)
- ✅ Live View (porta 8020)
- ✅ Migrações automáticas
- ✅ Healthchecks
- ✅ Volumes para persistência

**Não precisa de pgAdmin** - apenas os 3 serviços essenciais.

---

## ⚙️ Variáveis importantes

Se quiser customizar:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `POSTGRES_PASSWORD` | `levelup_dev_2024` | ⚠️ Mude para produção! |
| `POSTGRES_PORT_EXTERNAL` | `8010` | Porta PostgreSQL externa |
| `BACKEND_PORT` | `8881` | Porta da API |
| `LIVE_VIEW_PORT` | `8020` | Porta Live View |
| `NODE_ENV` | `production` | Ambiente |

---

## 🔍 Verificar Status

### Via Portainer:
- Stacks → level-up-live
- Veja os 2 containers:
  - 🟢 levelup-postgres (banco)
  - 🟢 levelup-backend (API + frontend)

### Via CLI:
```bash
docker ps | grep levelup
docker logs -f levelup-backend
```

---

## 🌐 Acessar

| Serviço | URL |
|---------|-----|
| **Control Panel** | http://umbrel.local:8881 |
| **Live View (OBS)** | http://umbrel.local:8020/live-view |
| **API Health** | http://umbrel.local:8881/health |

---

## 📁 Estrutura

```
level-up-live-mk1/
├── Dockerfile              ← Build da imagem
├── docker-compose.portainer.yml ← Stack config
├── .dockerignore          ← Otimização build
├── .env.portainer         ← Variáveis de referência
├── docs/PORTAINER_SETUP.md ← Guia completo
├── src/
│   ├── server/            ← API REST + WebSocket
│   ├── client/            ← React frontend
│   └── shared/            ← Tipos compartilhados
├── assets/                ← Músicas, imagens, sons
└── data/                  ← Logs
```

---

## ⚠️ Problemas Comuns

### Porta já em uso?
- Mude `POSTGRES_PORT_EXTERNAL` em Environment Variables (ex: 8012)

### Backend não sobe?
- Verifique logs: Containers → levelup-backend → Logs
- Espere 30-40s (migrações + healthcheck inicial)

### Frontend não abre?
- Backend precisa estar 🟢 verde no Portainer
- Tente http://umbrel.local:8881 (não 8882)

---

## 🔐 Segurança

Para produção, mude a senha:

**Em Environment Variables da Stack:**
```
POSTGRES_PASSWORD=SenhaForte123!@#
```

Ou via CLI:
```bash
docker exec levelup-postgres psql -U levelup_user \
  -c "ALTER USER levelup_user WITH PASSWORD 'NovaSenha123!@#';"
```

---

## 📚 Mais Informações

- **Guia Completo:** `docs/PORTAINER_SETUP.md`
- **Arquitetura:** `docs/CLAUDE.md`
- **Especificação:** `docs/PRD.md`

---

## 🎯 Próximos Passos

1. ✅ Stack rodando
2. Acesse http://umbrel.local:8881
3. Configure música em `assets/music/`
4. Crie os 2 níveis iniciais
5. Configure OBS com Live View

---

**Time:** Level Up Development
**Última atualização:** 2025-11-10
