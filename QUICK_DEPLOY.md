# Deploy Rápido Level Up Live - Docker Hub Edition

## 🎯 Como funciona:

1. **GitHub Actions** faz build automático da imagem
2. **Publica no Docker Hub** (seu registry privado/público)
3. **Você faz deploy de qualquer lugar** puxando a imagem pronta

---

## 📋 Passo 1: Setup no Docker Hub (uma vez)

### Criar conta Docker Hub (FREE)
- Acesse: https://hub.docker.com/signup
- Crie uma conta

### Gerar token de acesso
1. Acesse: https://hub.docker.com/settings/security
2. Clique **"New Access Token"**
3. Dê um nome: `github-actions`
4. Copie o token (você usa em breve)

---

## 🔐 Passo 2: Configurar GitHub Secrets (uma vez)

No seu repositório GitHub:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique **"New repository secret"**
3. Adicione:
   - **Name:** `DOCKER_USERNAME`
     **Value:** seu username do Docker Hub (ex: `flip7m`)

   - **Name:** `DOCKER_PASSWORD`
     **Value:** o token que você copiou

---

## 🚀 Passo 3: Fazer deploy (sempre que quiser)

### No seu servidor (Umbrel ou outro):

```bash
# 1. Entre na pasta do projeto
cd /caminho/para/level-up-live

# 2. Faça um commit e push (dispara GitHub Actions)
git add .
git commit -m "Update something"
git push origin main

# 3. Aguarde GitHub Actions fazer o build (~2-5 min)
# Vá para: https://github.com/flip7m/level-up-live/actions

# 4. Depois que terminar, no seu servidor rode:
docker compose -f docker-compose.prod.yml down || true
docker compose -f docker-compose.prod.yml up -d --pull always
```

Pronto! Os containers estarão rodando com a imagem mais recente! 🎉

---

## 📊 Verificar status

### Ver logs do build no GitHub:
- https://github.com/flip7m/level-up-live/actions

### Ver containers rodando:
```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs da aplicação:
```bash
docker compose -f docker-compose.prod.yml logs -f levelup-backend
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

## ✅ Verificar se está funcionando

```bash
# Backend + Frontend
curl http://localhost:8881/health

# Live View para OBS
curl http://localhost:8020

# PostgreSQL
psql -h localhost -p 8010 -U levelup_user -d levelup_live
```

---

## 🌍 Deploy em outro servidor

Em qualquer outro servidor com Docker:

```bash
git clone https://github.com/flip7m/level-up-live.git
cd level-up-live
docker compose -f docker-compose.prod.yml up -d --pull always
```

Pronto! A imagem será puxada do Docker Hub e iniciada! 🚀

---

## 📝 Notas

- **docker-compose.prod.yml** - Usa imagem pré-built do Docker Hub
- **docker-compose.portainer-clean.yml** - Faz build local (antigo, pode desconsiderar)
- GitHub Actions roda automaticamente a cada push em `main`
- A imagem fica versionada: `flip7m/level-up-live:latest` e com commit SHA

---

**Dúvidas?** Me chama! 🎯
