# Google Authentication (enable now)

Live site: https://pratibha-graphics-studio.vercel.app  
Owner email: educationg26@gmail.com

## Step A — Google Cloud OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project (e.g. `pratibha-graphics-studio`)
3. **APIs & Services → OAuth consent screen**
   - User type: External
   - App name: Pratibha Graphics Studio
   - Support email: educationg26@gmail.com
   - Save
4. **Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: Pratibha Studio Web
   - Authorized JavaScript origins:
     - `http://localhost:8084`
     - `https://pratibha-graphics-studio.vercel.app`
   - Authorized redirect URIs:
     - `https://dbbrtelvztvwjlpxylys.supabase.co/auth/v1/callback`
5. Copy **Client ID** + **Client Secret**

## Step B — Supabase Google provider

1. [Supabase Auth Providers](https://supabase.com/dashboard/project/dbbrtelvztvwjlpxylys/auth/providers)
2. Open **Google** → Enable
3. Paste Client ID + Client Secret → Save

## Step C — URL configuration

[URL Configuration](https://supabase.com/dashboard/project/dbbrtelvztvwjlpxylys/auth/url-configuration)

- Site URL: `https://pratibha-graphics-studio.vercel.app`
- Redirect URLs:
  - `https://pratibha-graphics-studio.vercel.app/**`
  - `https://pratibha-graphics-studio.vercel.app/login`
  - `http://localhost:8084/**`
  - `http://localhost:8084/login`

## Step D — Test

1. Open live site login
2. Click **Continue with Google**
3. Pick Google account → should return to studio logged in

If a visitor uses Google with a new email, they become a visitor automatically.  
To make yourself owner after Google login (if needed):

```sql
update public.profiles
set role = 'owner'
where email = 'educationg26@gmail.com';
```
