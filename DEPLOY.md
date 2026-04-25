# Actualização no VPS

## Requisitos no servidor
- Node.js 20+
- PM2 (`npm i -g pm2`)
- Git

## Passos de actualização

### 1. Entra na pasta do projecto
```bash
cd /caminho/para/cv-gen-ai
```

### 2. Puxa a última versão
```bash
git pull origin main
```

### 3. Instala dependências (se package.json mudou)
```bash
npm ci
```

### 4. Verifica o `.env.local`
Confirma que `NEXT_PUBLIC_GEMINI_API_KEY` está definido.

### 5. Build
```bash
npm run build
```

### 6. Reinicia com PM2
```bash
pm2 restart cv-gen-ai
# ou, se ainda não existe:
pm2 start npm --name cv-gen-ai -- run start -- -p 3001
```

### 7. Verifica estado
```bash
pm2 status
pm2 logs cv-gen-ai --lines 20
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta 3000 ocupada | Usa `-p 3001` no start ou define `PORT=3001` no `.env.local` |
| Variáveis `.env.local` não carregam | Garante que o ficheiro existe na raiz do projecto; PM2 lê o CWD correcto |
| Erro de memória no build | `NODE_OPTIONS="--max-old-space-size=2048" npm run build` |

## Configuração PM2 (ecosystem)
Podes criar `ecosystem.config.js` na raiz para não dependeres de argumentos:

```js
module.exports = {
  apps: [{
    name: 'cv-gen-ai',
    script: './node_modules/next/dist/bin/next',
    args: 'start -p 3001',
    env: {
      NODE_ENV: 'production',
    },
    env_file: '.env.local',
    instances: 1,
    autorestart: true,
  }],
};
```

Depois usa `pm2 start ecosystem.config.js` e `pm2 save`.
