# ARK Packaging Hero (React)

Modern header + hero section for a packaging e-commerce site.

## Run

```bash
npm install
npm run api-server
npm run dev
```

## MongoDB (Compass)

To store **users / products / orders / notifications** in MongoDB (and view/edit them in MongoDB Compass):

1. Start MongoDB locally or use Atlas.
2. Create a `.env` file (you can copy `.env.example`) and set:
   - `MONGODB_URI`
   - `MONGODB_DB` (optional; default: `ark_packaging`)
3. Start the API server with env loaded (Node 20+):

```bash
node --env-file=.env server/apiServer.js
```

Collections created:
`users`, `products`, `orders`, `notifications`.

## Deploy (Vercel)

This project includes Vercel serverless API routes (`/api/*`). To make data **shared across devices** and **permanent**, set these environment variables in Vercel:

- `MONGODB_URI` (required on Vercel)
- `MONGODB_DB` (optional; default: `ark_packaging`)
- `ADMIN_USER` (optional; default: `admin`)
- `ADMIN_PASS` (optional; default: `ark@123`)
- `ADMIN_SESSION_SECRET` (recommended; defaults to `ADMIN_PASS`)
# e-commerce-
