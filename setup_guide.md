# Clerk & Supabase Integration Setup Guide

Since you are using **React** with Vite, when Clerk asks for your framework, select **React**.

## 1. Clerk Dashboard Setup
1.  **Create Application**: If you haven't already, create a new application in the [Clerk Dashboard](https://dashboard.clerk.com/).
2.  **Select Framework**: Choose **React**.
3.  **Create JWT Template**:
    *   Go to **Configure** > **JWT Templates** in the sidebar.
    *   Click **New template**.
    *   Select **Supabase**.
    *   **Name**: Ensure the name is set to `supabase` (lowercase). This is critical as the code expects this exact name.
    *   **Signing Key**: You will see a "Signing key" (likely in PEM format) or a "JWKS Endpoint". For Supabase, we need the **Signing Secret** (often accessible after creation or by creating a custom token if the default Supabase template behaves differently, but usually the default Supabase template in Clerk works fine).
    *   *Actually, for the standard integration:*
        *   Copy the **Signing Key** (it might be in the "Claims" section or you might need to copy the Public Key from Supabase to Clerk? No, Clerk signs the token, Supabase verifies it).
        *   **Action**: Copy the **Signing Key** from the Clerk JWT Template screen. You will need to put this into Supabase.

## 2. Supabase Dashboard Setup
1.  **Create Project**: Create a new project in [Supabase](https://supabase.com/).
2.  **Authentication Config**:
    *   Go to **Project Settings** > **API**.
    *   Scroll down to the **JWT Settings** section.
    *   Find the **JWT Secret** (this is *Supabase's* secret).
    *   *Wait, the integration works by giving Supabase the Clerk signing key.*
    *   Go to **Authentication** > **Providers**.
    *   Enable **Phone** or **Email** if you want, but for the actual JWT validation:
    *   You actually need to update the **JWT Secret** in Supabase to match Clerk's, OR add Clerk's signing key to Supabase.
    *   *Recommended "modern" way (StackOverflow/Docs)*:
        1.  In Clerk, open your `supabase` JWT template.
        2.  Find the **Signing Key** (it's a long string).
        3.  In Supabase, go to **Project Settings** > **API**.
        4.  **Note**: Supabase now supports Third-Party Auth providers more natively, but the JWT route is standard.
        5.  There isn't a direct "Paste Clerk Key" field in standard settings. You usually have to set the Supabase **JWT Secret** to match the one you generate, OR (easier) **Copy the JWT Secret from Supabase and paste it into Clerk**.
        
    *   **Let's do the "Clerk Signs with Supabase Secret" method (Easiest)**:
        1.  In **Supabase Project Settings** > **API**, copy the **JWT Secret**.
        2.  In **Clerk Dashboard** > **JWT Templates** > **Supabase**:
            *   Edit the template.
            *   Look for a "Signing Key" or "Sign using" option. If Clerk forces its own key, you must use that.
            *   *Correction*: Clerk standard Supabase template uses a specific format.
            *   **Official Docs Method**:
                1.  In Clerk, create the `supabase` template.
                2.  Copy the **Signing Key** from Clerk (JWT Key).
                3.  In Supabase, go to **Settings** > **API**.
                4.  This is tricky - Supabase projects have a *fixed* JWT secret usually. 
                5.  **ACTUALLY**: The standard way now is: 
                    *   In Clerk, generate the template.
                    *   Get the **JWKS URL** from Clerk (`https://<your-clerk-domain>/.well-known/jwks.json`).
                    *   This is for advanced setups.
                    *   **The common "Hobby" way**:
                        1.  Get the **JWT Secret** from **Supabase** (Settings -> API).
                        2.  In **Clerk**, delete the old template if you made one. Create a **New Template** -> **Blank**.
                        3.  Name it `supabase`.
                        4.  In the "Claims" section, add:
                            ```json
                            {
                              "aud": "authenticated",
                              "role": "authenticated",
                              "email": "{{user.primary_email_address}}",
                              "user_id": "{{user.id}}"
                            }
                            ```
                        5.  **Signing Key**: Users *HS256* algorithm.
                        6.  Paste the **Supabase JWT Secret** into the "Signing Key" field in Clerk.
                        7.  Save.

    *   **Why this method?** It allows Supabase to verify the token because they share the same secret key.

## 3. Environment Variables (.env.local)
Ensure your `.env.local` file has the correct keys from both platforms.

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # From Clerk
VITE_SUPABASE_URL=https://...supabase.co  # From Supabase
VITE_SUPABASE_ANON_KEY=eyJ...             # From Supabase
```

## 4. Database Setup (SQL)
Run this SQL in the **Supabase SQL Editor** to create the table and policies.

```sql
-- Create the table
create table saved_recipes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Verified by Clerk
  recipe_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table saved_recipes enable row level security;

-- Create Policy: Users can only see their own recipes
create policy "Users can see their own recipes"
on saved_recipes for select
using (
  auth.jwt() ->> 'user_id' = user_id
);

-- Create Policy: Users can insert their own recipes
create policy "Users can insert their own recipes"
on saved_recipes for insert
with check (
  auth.jwt() ->> 'user_id' = user_id
);

-- Create Policy: Users can delete their own recipes
create policy "Users can delete their own recipes"
on saved_recipes for delete
using (
  auth.jwt() ->> 'user_id' = user_id
);
```
