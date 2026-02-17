# Deployment Guide: Hosting Your Audiometer App

Since your app uses **React (Vite)** and **Supabase**, the easiest and most robust way to host it is using **Vercel** or **Netlify**. Vercel is optimized for frontend frameworks and requires zero server configuration.

This guide focuses on **Vercel** due to its seamless GitHub integration.

## Prerequisites

1.  **GitHub Account:** [Sign up here](https://github.com/join) if you don't have one.
2.  **Vercel Account:** [Sign up here](https://vercel.com/signup) (Login with GitHub recommended).
3.  **Supabase Credentials:** You will need your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your `.env.local` file.

---

## Step 1: Push Your Code to GitHub

If you haven't already pushed your code to a repository, follow these steps in your terminal (inside `f:\Hear\frontend`):

1.  **Initialize Git** (if not already done):
    ```bash
    git init
    ```

2.  **Add Your Files:**
    ```bash
    git add .
    git commit -m "Initial commit of Audiometer App"
    ```

3.  **Create a Repository on GitHub:**
    *   Go to [GitHub.com/new](https://github.com/new).
    *   Name it `audiometer-app`.
    *   Click "Create repository".

4.  **Connect and Push:**
    *   Copy the commands under **"…or push an existing repository from the command line"** from the GitHub page. They will look like this:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/audiometer-app.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Deploy to Vercel

1.  **Import Project:**
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your `audiometer-app` repository and click **Import**.

2.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect **Vite**. If not, select it manually.
    *   **Root Directory:** If your app is in a subfolder (like `frontend`), verify the Root Directory setting points to it. If it's in the root of the repo, leave it as `./`.

3.  **Environment Variables (CRITICAL):**
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables exactly as they appear in your local project (OPEN YOUR `.env.local` file to get these values):
        *   **Name:** `VITE_SUPABASE_URL`
            **Value:** `your_supabase_url_value`
        *   **Name:** `VITE_SUPABASE_ANON_KEY`
            **Value:** `your_supabase_anon_key_value`

4.  **Deploy:**
    *   Click **Deploy**.
    *   Vercel will build your app. This usually takes about a minute.

---

## Step 3: Verify Deployment

Once deployed, Vercel will give you a live URL (e.g., `audiometer-app.vercel.app`).

1.  **Visit the URL.**
2.  **Login Config:** Ensure you can log in.
    *   *If login fails or redirects wrongly:* Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
    *   Add your new Vercel URL (e.g., `https://audiometer-app.vercel.app`) to the **Site URL** or **Redirect URLs**.
3.  **Run a Test:** Perform a hearing test to ensure the audio engine works and results are saved to the database.

---

## Troubleshooting

*   **"Vite command not found":** Ensure `package.json` is in the root directory you selected in Vercel.
*   **White Screen / 404 on Refresh:** If you navigate to a page like `/dashboard` and refresh, you might get a 404.
    *   **Fix:** Create a file named `vercel.json` in your `frontend` folder with this content:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
    (Push this change to GitHub to redeploy).

**You're live! 🚀**
