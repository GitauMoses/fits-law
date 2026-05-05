# SCO307 — Fitts' Law Experiment

A full-stack web application for collecting Fitts' Law experiment data as part of the SCO307 HCI course at Kenyatta University. Students complete two timed clicking trials and submit their results to a shared database. An admin results page auto-generates the full worked CAT answer.

---

## Deployment Steps

### Step 1 — Clone the repository

```bash
git clone https://github.com/GitauMoses/fits-law.git
cd fits-law
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create the Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project (any name, e.g. "fitts-law").
3. On the project dashboard, copy the **connection string** (it looks like `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

### Step 4 — Create `.env.local`

In the project root, create a file named `.env.local`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Replace the value with the connection string you copied from Neon.

### Step 5 — Create the database table

In the Neon dashboard, open the **SQL Editor** and run:

```sql
CREATE TABLE fitts_results (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  device      TEXT NOT NULL,
  mt1         NUMERIC(10,4) NOT NULL,
  mt2         NUMERIC(10,4) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 6 — Test locally (optional)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and verify the experiment works.

### Step 7 — Deploy to Vercel

```bash
npx vercel deploy
```

Follow the prompts. Select your Vercel account, link to a new project, and accept the defaults.

### Step 8 — Add the environment variable in Vercel

1. Go to your Vercel project dashboard → **Settings** → **Environment Variables**.
2. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: your Neon connection string (same as `.env.local`)
   - **Environment**: Production, Preview, Development (tick all three)
3. Click **Save**.

### Step 9 — Redeploy

In the Vercel dashboard, go to **Deployments** → click the three-dot menu on the latest deployment → **Redeploy**. This picks up the new environment variable.

### Step 10 — Share the URL

Share the Vercel deployment URL (e.g. `https://fits-law.vercel.app`) with all group members. Everyone opens it on their **laptop or desktop** and completes both trials. Results accumulate in real time.

View the aggregated results and the full CAT answer at:

```
https://your-vercel-url.vercel.app/results
```

---

## Experiment Configuration

| Config | D (px) | W (px) | ID (bits) |
|--------|--------|--------|-----------|
| 1      | 300    | 60     | 2.5850    |
| 2      | 300    | 15     | 4.3923    |

- **Timer**: `performance.now()` — microsecond precision
- **Trial**: 10 alternating clicks, left target first
- **MT**: total elapsed time in seconds (first click → tenth click)
- **Wrong-click penalty**: brief red flash, click ignored

---

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Database**: Neon Postgres (free tier) via `@neondatabase/serverless`
- **Styling**: Tailwind CSS + IBM Plex Mono/Sans
- **Language**: TypeScript
- **Hosting**: Vercel (free tier)

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/submit` | Insert a new result row |
| `GET` | `/api/results` | Return all rows, newest first |
| `DELETE` | `/api/results/[id]` | Delete a row by ID |
