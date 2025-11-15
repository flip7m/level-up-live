# 🚀 Level Up Live - Portainer Deployment Index

Este é o guia principal para fazer deploy da aplicação **Level Up Live** no **Portainer do Umbrel**.

---

## 📚 Arquivos de Referência Rápida

### Para começar agora:
1. **[SETUP_SUMMARY.txt](SETUP_SUMMARY.txt)** ⭐ **COMECE AQUI**
   - Resumo visual do que foi criado
   - Os 7 passos para deploy
   - Informações das portas

2. **[PORTAINER_QUICK_START.md](PORTAINER_QUICK_START.md)**
   - TL;DR - 5 minutos
   - Passo a passo rápido
   - Problemas comuns

### Para guias completos:
3. **[docs/PORTAINER_SETUP.md](docs/PORTAINER_SETUP.md)**
   - Guia COMPLETO (9.6 KB, 300+ linhas)
   - Troubleshooting detalhado
   - Operações comuns
   - Segurança

4. **[DOCKER_PORTAINER_README.md](DOCKER_PORTAINER_README.md)**
   - Referência técnica
   - Especificações
   - Volumes e persistência
   - Arquitetura da stack

### Para validação após deploy:
5. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
   - Checklist completo
   - Testes a executar
   - Validações de funcionamento
   - Próximas etapas

---

## 🔧 Arquivos de Configuração

### Arquivo Principal (copiar para Portainer):
- **[docker-compose.portainer.yml](docker-compose.portainer.yml)** (3 KB)
  - Stack com 3 serviços: PostgreSQL, Backend, Network
  - Pronto para colar no Portainer Web Editor
  - Healthchecks, volumes, migrações automáticas

### Arquivo de Build:
- **[Dockerfile](Dockerfile)** (1.5 KB)
  - Multi-stage build
  - Frontend build + Backend build
  - Otimizado para produção

### Otimizações:
- **[.dockerignore](.dockerignore)** (224 bytes)
  - Acelera build ignorando arquivos desnecessários

### Variáveis de Ambiente:
- **[.env.portainer](.env.portainer)** (3 KB)
  - Variáveis de exemplo
  - Comentários explicativos
  - Referência para configuração

---

## 🎯 Fluxo de Deploy (7 passos = 5-10 min)

```
1. Ler SETUP_SUMMARY.txt
    ↓
2. Abrir http://umbrel.local:9000 (Portainer)
    ↓
3. Stacks → + Add Stack
    ↓
4. Nome: level-up-live
   Editor: Web Editor
    ↓
5. Copiar conteúdo de docker-compose.portainer.yml
    ↓
6. Deploy the stack
    ↓
7. Aguardar 2-3 minutos
    ↓
8. Acessar http://umbrel.local:8881 🎉
```

---

## 📊 Resumo Técnico

### Stack Components
| Serviço | Imagem | Porta | Função |
|---------|--------|-------|--------|
| **postgres** | postgres:16-alpine | 8010 | Banco de dados |
| **levelup-backend** | node:20-alpine | 8881, 8020 | API + Frontend + Live View |

### Portas (todas disponíveis ✅)
- **8010**: PostgreSQL (externa)
- **8881**: Backend API + Frontend (externa)
- **8020**: Live View para OBS (externa)

### Volumes
- `levelup-postgres-data`: Banco de dados (Docker volume)
- `./assets`: Músicas, imagens, sons (Bind mount local)
- `./data`: Logs da aplicação (Bind mount local)

### Recursos
- **Build time**: ~5-10 minutos (primeira vez)
- **Image size**: ~1.2 GB
- **Runtime RAM**: 200-500 MB (normal)
- **Node.js**: 20.x LTS
- **PostgreSQL**: 16-alpine

---

## 🔐 Segurança

### Padrão (desenvolvimento):
```env
POSTGRES_PASSWORD=levelup_dev_2024
```

### Para produção, MUDE para:
```env
POSTGRES_PASSWORD=SenhaForte123!@#Randomica
```

**Mude em:** Portainer → Stack → Environment Variables

---

## 📱 Acessos Após Deploy

| Serviço | URL | Propósito |
|---------|-----|----------|
| **Control Panel** | http://umbrel.local:8881 | Dashboard + gerenciamento |
| **Live View** | http://umbrel.local:8020/live-view | Para configurar em OBS |
| **API Health** | http://umbrel.local:8881/health | Status da API |

---

## 🆘 Problemas Rápidos

### "Porta já em uso"
→ [DOCKER_PORTAINER_README.md#se-alguma-porta-estiver-em-uso](DOCKER_PORTAINER_README.md)

### "Backend não sobe"
→ [DEPLOYMENT_CHECKLIST.md#backend-não-sobe](DEPLOYMENT_CHECKLIST.md)

### "Frontend não abre"
→ [DEPLOYMENT_CHECKLIST.md#frontend-não-abre](DEPLOYMENT_CHECKLIST.md)

### "Banco não conecta"
→ [DEPLOYMENT_CHECKLIST.md#banco-não-conecta](DEPLOYMENT_CHECKLIST.md)

---

## 🚀 Script Helper

Para facilitar o setup:
```bash
bash scripts/portainer-copy.sh
```

Este script:
- ✅ Verifica arquivos necessários
- ✅ Copia arquivo para clipboard (se xclip disponível)
- ✅ Mostra instruções passo a passo

---

## 📖 Documentação Adicional

Se precisar entender mais sobre a aplicação:

- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Arquitetura técnica do projeto
- **[docs/PRD.md](docs/PRD.md)** - Especificação completa
- **[docs/LEVEL_EDITOR_MODULE.md](docs/LEVEL_EDITOR_MODULE.md)** - Editor de níveis
- **[docs/EVENTS_SYSTEM.md](docs/EVENTS_SYSTEM.md)** - Sistema de eventos
- **[docs/OBS_SETUP.md](docs/OBS_SETUP.md)** - Configuração do OBS

---

## ✅ Checklist de Início

- [ ] Li o SETUP_SUMMARY.txt
- [ ] Verifiquei as portas (8010, 8881, 8020 livres)
- [ ] Tenho acesso ao Portainer
- [ ] Copiei o docker-compose.portainer.yml
- [ ] Estou pronto para fazer o deploy!

---

## 📞 Próximas Etapas (Após Stack Rodando)

1. Acesse http://umbrel.local:8881
2. Adicione músicas em `assets/music/`
3. Configure OBS com Live View
4. Crie/edite os 2 níveis iniciais
5. Comece a transmitir!

---

## 📝 Notas Importantes

- ⚠️ Use `postgres` (não `localhost`) como hostname no .env
- ⚠️ POSTGRES_PORT deve ser `5432` (interna), não `8010`
- ✅ Migrações rodam automaticamente no startup
- ✅ Healthchecks ajudam a detectar problemas
- ✅ Bind mounts para acesso direto aos assets

---

## 🎯 Status

✅ **PRONTO PARA PORTAINER**

Todos os arquivos necessários foram criados.
Você pode fazer o deploy agora!

---

**Versão:** 1.0
**Data:** 2025-11-10
**Status:** Production Ready
**Autor:** Level Up Development Team

---

## 🔗 Quick Links

| Link | Descrição |
|------|-----------|
| [SETUP_SUMMARY.txt](SETUP_SUMMARY.txt) | Comece aqui! |
| [PORTAINER_QUICK_START.md](PORTAINER_QUICK_START.md) | TL;DR - 5 min |
| [docs/PORTAINER_SETUP.md](docs/PORTAINER_SETUP.md) | Guia completo |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Validação após deploy |
| [docker-compose.portainer.yml](docker-compose.portainer.yml) | Arquivo para Portainer |
| [http://umbrel.local:9000](http://umbrel.local:9000) | Acessar Portainer |
