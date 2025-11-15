# ✅ Checklist de Deployment - Level Up Live no Portainer

## 📋 Antes de Começar

- [ ] Você tem acesso ao Portainer (http://umbrel.local:9000)
- [ ] Você está conectado ao Umbrel via SSH ou CLI
- [ ] Verificou as portas (8010, 8881, 8020 estão livres?)

**Verificar portas:**
```bash
sudo ss -tuln | grep -E "8010|8881|8020"
```
Se não retornar nada = portas estão livres ✅


## 🚀 Deploy da Stack (5-10 minutos)

### Passo 1: Preparar o arquivo
- [ ] Copie o conteúdo de `docker-compose.portainer.yml`
  ```bash
  cat docker-compose.portainer.yml
  ```

### Passo 2: Acessar Portainer
- [ ] Abra http://umbrel.local:9000
- [ ] Faça login
- [ ] Clique em **Stacks** (menu esquerdo)

### Passo 3: Criar Stack
- [ ] Clique em **+ Add Stack**
- [ ] Em **Name**: `level-up-live`
- [ ] Selecione **Web Editor**
- [ ] Cole o conteúdo do docker-compose.portainer.yml
- [ ] (Opcional) Em **Environment**, configure senhas personalizadas

### Passo 4: Deploy
- [ ] Scroll para baixo
- [ ] Clique em **Deploy the stack**
- [ ] Aguarde a mensagem "Stack deployed successfully"

**Tempo esperado: 2-3 minutos**


## 🔍 Verificação Inicial (Após Deploy)

### Status dos Containers
- [ ] No Portainer, vá para **Containers**
- [ ] Verifique `levelup-postgres`:
  - [ ] Status: 🟢 **Running**
  - [ ] Healthcheck: ✅ **Healthy** (espere 30s)

- [ ] Verifique `levelup-backend`:
  - [ ] Status: 🟢 **Running**
  - [ ] Healthcheck: ✅ **Healthy** (espere 40s após postgres)

### Via CLI
```bash
# Listar containers rodando
docker ps | grep levelup

# Verificar logs do backend (esperado: mensagens de migração)
docker logs levelup-backend | head -20

# Teste de conexão com banco
docker exec levelup-postgres pg_isready -U levelup_user
```

**O que esperar:**
```
✓ Database migrated successfully
✓ Backend server listening on port 8881
✓ Live View server running on port 8020
✓ Socket.IO initialized
```

- [ ] Logs mostram sucesso (sem Error)


## 🌐 Testes de Conectividade

### API Health Check
```bash
curl http://localhost:8881/health
# Esperado: {"status":"ok"}
```
- [ ] Retorna status ok

### Frontend Acessível
```bash
curl -s http://localhost:8881/ | head -20
# Esperado: HTML com <html>, <head>, <body>, etc
```
- [ ] Retorna HTML (não erro)

### Live View Acessível
```bash
curl -s http://localhost:8020/live-view | head -20
# Esperado: HTML com <html>, <body>, conteúdo da transmissão
```
- [ ] Retorna HTML

### WebSocket Conectando
- [ ] Abra http://umbrel.local:8881 no navegador
- [ ] Abra DevTools (F12)
- [ ] Vá para **Network** e procure por `socket.io`
- [ ] Deve ter status **101 Switching Protocols** (ou similar)
- [ ] Chat/logs devem aparecer


## 📊 Verificação do Banco de Dados

### Testar Conexão
```bash
docker exec -it levelup-postgres psql -U levelup_user -d levelup_live -c "SELECT 1;"
# Esperado: (1 row)
```
- [ ] Conexão bem-sucedida

### Verificar Tabelas Criadas
```bash
docker exec levelup-postgres psql -U levelup_user -d levelup_live -c "\dt"
```
- [ ] Deve listar as tabelas:
  - [ ] `levels`
  - [ ] `events`
  - [ ] `songs`
  - [ ] `live_sessions`
  - [ ] `xp_history`
  - [ ] `config`

### Verificar Dados Seed
```bash
docker exec levelup-postgres psql -U levelup_user -d levelup_live -c "SELECT COUNT(*) FROM levels;"
# Esperado: 2 (dois níveis iniciais)
```
- [ ] Deve retornar 2 níveis


## 🎮 Testes da Interface

### Acessar Dashboard
- [ ] Abra http://umbrel.local:8881
- [ ] Você deve ver:
  - [ ] Menu lateral com navegação
  - [ ] Tema escuro (roxo/indigo)
  - [ ] Seção de status/XP
  - [ ] Controles de reprodução

### Testar Funcionalidades Básicas
- [ ] **Clique em "Level Editor"**
  - [ ] Você vê a lista de 2 níveis?
  - [ ] Consegue abrir um nível?
  - [ ] Visualização do nível aparece?

- [ ] **Clique em "Playlist"**
  - [ ] Interface de playlist abre?
  - [ ] Consegue adicionar uma música?

- [ ] **Clique em "Live Control"**
  - [ ] Controles de áudio aparecem?
  - [ ] XP bar aparece?
  - [ ] Indicador de nível aparece?


## 📁 Volumes e Persistência

### Assets Verificados
```bash
ls -la /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/assets/
```
- [ ] Pasta `assets` existe
- [ ] Subpastas criadas:
  - [ ] `music/`
  - [ ] `images/` ou `imagens/`
  - [ ] `sounds/`

### Logs Gerando
```bash
ls -la /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/data/
```
- [ ] Pasta `data` existe
- [ ] `logs/` criada
- [ ] `app.log` existe

### Volume do Banco
```bash
docker volume ls | grep levelup
# Esperado: levelup-postgres-data
```
- [ ] Volume Docker criado


## 🔐 Segurança (Checklist de Produção)

- [ ] **IMPORTANTE:** Senha do banco alterada?
  ```bash
  docker exec levelup-postgres psql -U levelup_user -d levelup_live \
    -c "ALTER USER levelup_user WITH PASSWORD 'NOVA_SENHA_FORTE';"
  ```

- [ ] **HTTPS/SSL** configurado (se aplicável)?

- [ ] **Firewall** restringindo acesso às portas?

- [ ] **Backup** do banco fazendo programado?
  ```bash
  docker exec levelup-postgres pg_dump -U levelup_user levelup_live \
    > backup_$(date +%Y%m%d_%H%M%S).sql
  ```


## 📝 Logs e Troubleshooting

### Esperado nos Logs
```bash
docker logs levelup-backend
```

Você deve ver:
```
[INFO] Database connected successfully
[INFO] Running migrations...
[INFO] Migrations completed
[INFO] Backend server listening on port 8881
[INFO] Live View server running on port 8020
[INFO] Socket.IO initialized
```

- [ ] Nenhuma mensagem de erro (Error/Fatal)

### Se houver Problemas

**Backend não sobe:**
- [ ] Verifique porta 8881 não está em uso
- [ ] Verifique PostgreSQL está rodando (docker ps)
- [ ] Verifique logs: `docker logs levelup-backend | grep -i error`

**Banco não conecta:**
- [ ] Verifique PostgreSQL container está rodando
- [ ] Verifique healthcheck: `docker ps | grep levelup-postgres`
- [ ] Tente reconectar: `docker exec levelup-postgres pg_isready`

**Frontend não abre:**
- [ ] Backend está 🟢 verde?
- [ ] Tente: curl http://localhost:8881/health
- [ ] Limpe cache do navegador (Ctrl+Shift+Del)
- [ ] Tente em abas anônimas


## 🎉 Deployment Completo!

Se todos os checkboxes acima estão marcados ✅, sua Stack está:

- ✅ **Rodando** em produção
- ✅ **Saudável** (healthchecks passando)
- ✅ **Acessível** via web
- ✅ **Persistente** (volumes configurados)
- ✅ **Testada** (funcionalidades básicas ok)


## 📞 Próximas Etapas

1. **Adicione Conteúdo:**
   - [ ] Copie arquivos MP3 para `assets/music/`
   - [ ] Copie imagens para `assets/imagens/`
   - [ ] Copie sons para `assets/sounds/`

2. **Configure OBS:**
   - [ ] Browser Source: http://umbrel.local:8020/live-view
   - [ ] Scene Layout conforme desejado

3. **Crie Níveis:**
   - [ ] Acesse Dashboard → Level Editor
   - [ ] Crie/edite os 2 níveis iniciais
   - [ ] Configure layers, sons, animações

4. **Comece a Transmitir:**
   - [ ] Abra Live Control
   - [ ] Carregue uma música
   - [ ] Pressione Play
   - [ ] Veja eventos aparecerem em OBS!


## 📋 Informações Úteis

**Comandos Rápidos:**
```bash
# Ver status
docker-compose -f docker-compose.portainer.yml ps

# Logs em tempo real
docker logs -f levelup-backend

# Reiniciar stack
docker-compose -f docker-compose.portainer.yml restart

# Parar stack
docker-compose -f docker-compose.portainer.yml down

# Iniciar stack
docker-compose -f docker-compose.portainer.yml up -d
```

**Documentação:**
- PORTAINER_QUICK_START.md - Visão geral
- docs/PORTAINER_SETUP.md - Guia completo
- DOCKER_PORTAINER_README.md - Referência técnica


---

**Status:** ✅ Pronto para produção
**Versão:** 1.0
**Data:** 2025-11-10
