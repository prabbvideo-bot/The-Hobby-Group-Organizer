# Deploying The Hobby Group Organizer to Render.com

This application is fully configured and ready to deploy on [Render](https://render.com). You can choose between two deployment methods on Render:

---

## Method 1: Deploy as a Static Site (Recommended & Fastest)

Render offers free hosting for static sites with global CDN and automated SSL certificates.

1. **Push your code to GitHub / GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Static Site**.
3. Connect your repository.
4. Configure the settings:
   - **Name**: `hobby-group-organizer` (or your choice)
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. **Configure SPA Rewrite Rule** (Important for client-side navigation):
   - Scroll down to the **Redirects/Rewrites** section.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
6. Click **Create Static Site**.
7. Render will build your application and provide a public URL (e.g., `https://hobby-group-organizer.onrender.com`).

---

## Method 2: Deploy as a Node.js Web Service (Full-Stack)

If you prefer running the bundled Express production server (`server.ts` / `server.js`):

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the settings:
   - **Name**: `hobby-group-organizer`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_VERSION`: `20`
   - `PORT`: `3000` (Render will automatically inject its own port if needed)
5. Set **Health Check Path** (under Advanced):
   - `/healthz`
6. Click **Create Web Service**.

---

## Method 3: 1-Click Infrastructure via Blueprint (`render.yaml`)

We have included a pre-configured `render.yaml` blueprint file in the repository root.

1. In Render, click **New +** → **Blueprint**.
2. Select your repository.
3. Render will read `render.yaml` and configure the service automatically.
4. Click **Apply**.

---

## Verifying Deployment

Once deployed:
- Visit your Render URL.
- Test switching communities (The Tabletop Guild, Metro Urban Sketchers, Pine Ridge Trail Crew).
- Create a test meetup or record a shared expense.
- Export a `.ics` calendar file or CSV ledger to verify download functionality.
