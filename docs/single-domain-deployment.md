# Single Domain Deployment

Recommended public paths for one domain:

- `/` - landing page
- `/store/` - store owner and store admin app
- `/platform/` - platform owner app
- `/api/` - backend API reverse proxy

Frontend production defaults:

```env
VITE_API_URL=/api
VITE_STORE_LOGIN_URL=/store/auth/login
```

Backend production settings for the same domain:

```env
NODE_ENV=production
PORT=3000
TRUST_PROXY=1
ALLOWED_ORIGINS=https://example.uz,https://www.example.uz
PUBLIC_UPLOAD_BASE_URL=/api/uploads
UPLOAD_ROOT=/var/lib/store-management/uploads
```

`UPLOAD_ROOT` must be on a persistent disk and included in backups. Product
images are stored there; payment receipts are stored in PostgreSQL.

Build outputs:

```bash
pnpm --filter @store/landing build
pnpm --filter @store/store build
pnpm --filter @store/platform build
```

Upload or serve the generated folders like this:

```text
apps/landing/dist   -> /
apps/store/dist     -> /store/
apps/platform/dist  -> /platform/
```

Example Nginx shape:

```nginx
server {
  server_name example.uz www.example.uz;

  root /var/www/store-management/landing;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location /store/ {
    alias /var/www/store-management/store/;
    try_files $uri $uri/ /store/index.html;
  }

  location /platform/ {
    alias /var/www/store-management/platform/;
    try_files $uri $uri/ /platform/index.html;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

For local development, the Vite apps proxy `/api` to `http://localhost:3000`.
