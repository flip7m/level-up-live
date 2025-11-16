# Deploy Level Up Live via GitHub Actions

Este guia explica como fazer deploy automático do Level Up Live em qualquer servidor usando GitHub Actions e Docker.

## 🎯 O que você precisa:

1. **GitHub Account** - Já tem ✅
2. **Docker Hub Account** - Para armazenar imagens (FREE)
3. **Servidor com Docker** - Qualquer servidor (Umbrel, VPS, etc)
4. **SSH Access** ao servidor (para deploy automático)

---

## 📋 Passo 1: Configurar Docker Hub

### 1.1 Criar conta no Docker Hub (se não tiver)
- Acesse: https://hub.docker.com/signup
- Crie uma conta gratuita

### 1.2 Criar token de acesso
1. Acesse: https://hub.docker.com/settings/security
2. Clique em "New Access Token"
3. Nome: `level-up-live-token`
4. Copie o token (você vai usar em breve)

---

## 🔐 Passo 2: Configurar GitHub Secrets

Estes são dados privados que GitHub Actions usa para fazer o deploy.

### No seu repositório GitHub:

1. Vá para: **Settings** → **Secrets and variables** → **Actions**

2. Clique em **New repository secret** e adicione:

#### Secret 1: DOCKER_USERNAME
- **Name:** `DOCKER_USERNAME`
- **Value:** Seu username do Docker Hub (ex: `flip7m`)

#### Secret 2: DOCKER_PASSWORD
- **Name:** `DOCKER_PASSWORD`
- **Value:** O token que você copiou acima

#### Secret 3: DEPLOY_HOST (para deploy automático)
- **Name:** `DEPLOY_HOST`
- **Value:** IP ou domínio do seu servidor (ex: `192.168.1.100`)

#### Secret 4: DEPLOY_USER
- **Name:** `DEPLOY_USER`
- **Value:** Usuário SSH do servidor (ex: `umbrel`)

#### Secret 5: DEPLOY_SSH_KEY
- **Name:** `DEPLOY_SSH_KEY`
- **Value:** Sua chave SSH privada (veja passo 3)

---

## 🔑 Passo 3: Gerar SSH Key (para deploy automático)

Se você quer deploy 100% automático, precisa de uma chave SSH.

**No seu servidor (via terminal):**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""
cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-deploy
```

Copie todo o conteúdo (começa com `-----BEGIN OPENSSH PRIVATE KEY-----`)

Cole em `DEPLOY_SSH_KEY` no GitHub.

---

## 🚀 Passo 4: Fazer seu primeiro deploy

### Opção A: Deploy automático (CI/CD completo)
1. Commit e push qualquer mudança para `main`
2. GitHub Actions vai:
   - ✅ Fazer build da imagem
   - ✅ Publicar no Docker Hub
   - ✅ Fazer deploy automático no servidor

### Opção B: Deploy manual (mais controle)
1. Vá para **Actions** no seu repositório
2. Selecione **"Build and Deploy Level Up Live"**
3. Clique **"Run workflow"**

### Opção C: Deploy manual via CLI

No seu servidor:

```bash
cd /home/umbrel/umbrel/home/APPS/Level\ Up/level-up-live-mk1/
git pull origin main
docker compose -f docker-compose.portainer-clean.yml down || true
docker compose -f docker-compose.portainer-clean.yml up -d --pull always
```

---

## 🌍 Deploy em outro servidor

Para instalar em **outro servidor qualquer**:

```bash
# 1. Clone o repositório
git clone https://github.com/flip7m/level-up-live.git
cd level-up-live

# 2. Puxe a imagem do Docker Hub
docker pull flip7m/level-up-live:latest

# 3. Rode o compose
docker compose -f docker-compose.portainer-clean.yml up -d --pull always
```

---

## 📊 Monitorar Deploy

### Ver logs no GitHub:
- Vá para **Actions** → Clique no workflow
- Veja status de build e deploy em tempo real

### Ver logs do servidor:
```bash
docker compose -f docker-compose.portainer-clean.yml logs -f levelup-backend
docker compose -f docker-compose.portainer-clean.yml logs -f postgres
```

### Ver containers rodando:
```bash
docker compose -f docker-compose.portainer-clean.yml ps
```

---

## 🔧 Troubleshooting

### Erro: "could not find ref main"
- Faça `git push` para enviar commits ao GitHub
- Aguarde 30 segundos para propagação

### Erro: "Docker login failed"
- Verifique se `DOCKER_USERNAME` e `DOCKER_PASSWORD` estão corretos
- Teste locally: `docker login`

### Erro: "SSH connection refused"
- Verifique se `DEPLOY_HOST` está correto
- Teste SSH manualmente: `ssh umbrel@seu-ip`
- Verifique se chave está em `~/.ssh/authorized_keys`

### Containers não iniciam
```bash
docker compose -f docker-compose.portainer-clean.yml logs levelup-backend
# Veja o erro e corrija
```

---

## ✅ Verificar se está funcionando

```bash
# Backend + Frontend (porta 8881)
curl http://localhost:8881/health

# Live View para OBS (porta 8020)
curl http://localhost:8020

# PostgreSQL (porta 8010)
psql -h localhost -p 8010 -U levelup_user -d levelup_live
```

---

## 📈 Próximos passos

1. ✅ Configure os 5 secrets no GitHub
2. ✅ Gere a SSH key e configure
3. ✅ Faça um commit e push
4. ✅ Veja o deploy rodar automaticamente no GitHub Actions
5. ✅ Acesse `http://seu-servidor:8881`

---

**Precisa de ajuda?** Me chama! 🚀
