# Email/password auth setup (Supabase)

Owner email locked: **educationg26@gmail.com**  
Google: later (abhi only email + password)

Tumhare paas Supabase account hai, project abhi banana hai. Yeh steps ek baar follow karo.

---

## Step 1 — Naya project banao

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) login  
2. **New project**  
   - Name: `pratibha-graphics-studio`  
   - Database password: strong password (save kar lo)  
   - Region: nearest (Mumbai / Singapore)  
3. Create → 1–2 min wait  

## Step 2 — Keys copy → `.env`

**Project Settings → API** se copy:

- Project URL  
- `anon` `public` key  

Project folder (`graphics-library`) mein file banao: **`.env`**

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Phir terminal:

```bash
npm run dev
```

Login page pe “Demo mode” hat jana chahiye.

## Step 3 — Database tables

1. Supabase → **SQL Editor** → New query  
2. File kholo: `supabase/migrations/001_initial.sql`  
3. Sara content paste → **Run**  

Phir yeh bhi run karo (owner email pehle se fix):

```sql
alter database postgres set app.owner_email = 'educationg26@gmail.com';
```

(Note: agar `alter database` permission error aaye to skip — Step 5 mein manually owner set karenge.)

## Step 4 — Email login on

**Authentication → Providers → Email**

- Email enabled  
- Abhi testing ke liye: **Confirm email = OFF** (warna har signup pe mail verify chahiye)

**Authentication → URL Configuration**

- Site URL: `http://localhost:8083` (jo port tum use kar rahi ho)  
- Redirect URLs: `http://localhost:8083/**`

## Step 5 — Owner account banao

1. App → **Sign up**  
2. Name: `Pratibha Agrawal`  
3. Email: `educationg26@gmail.com`  
4. Password: jo tum set karo (yaad rakhna)  

Phir SQL Editor:

```sql
update public.profiles
set role = 'owner'
where email = 'educationg26@gmail.com';
```

Sign out → Sign in again → **Admin** + **Visitors** dikhne chahiye.

## Step 6 — Visitor test

Doosre email se Sign up (kisi friend / second Gmail se) → sirf Home + Library dikhe, Admin nahi.

---

## Mujhe kya bhejna hai

Jab Step 1–2 ho jaye, yahan paste karo:

1. `EXPO_PUBLIC_SUPABASE_URL=...`  
2. `EXPO_PUBLIC_SUPABASE_ANON_KEY=...`  

(Anon key public hoti hai — theek hai chat mein bhejni.)  
Main verify kar dunga ke app real auth pe switch ho gayi.

Google baad mein add karenge jab email/password stable ho.
