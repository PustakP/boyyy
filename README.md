# GDG Cryptic Hunt :3

Dark-mode Vite + React + TypeScript experience for the “GDG Cryptic Hunt :3” with Supabase auth, level progression, and leaderboard views. Everything is fitted with a grid-and-glow aesthetic, square edges, and subtle Google-color accents.

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy the `.env.example` snippet below into a new `.env` (or `.env.local`) file at the project root and fill in your Supabase values.
3. Run the dev server
   ```bash
   npm run dev
   ```

## Environment Variables

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

Tables:
- `profiles`
  - `id uuid primary key references auth.users`
  - `display_name text`
  - `current_level int`
  - `updated_at timestamptz default now()`
- `levels`
  - `id bigint primary key`
  - `level_number int unique`
  - `title text`
  - `question_text text`
  - `question_image_url text`
  - `answer_key text`
  - `updated_at timestamptz default now()`

RPC helper (Postgres function) used by the app:

```sql
create or replace function verify_answer(
  p_level_number int,
  p_attempt text
) returns TABLE (is_correct boolean, next_level int)
security definer
as $$
declare
  target_level levels%rowtype;
begin
  select * into target_level from levels where level_number = p_level_number;
  if target_level is null then
    return query select false, null;
  end if;

  if trim(lower(target_level.answer_key)) = trim(lower(p_attempt)) then
    update profiles
       set current_level = p_level_number + 1,
           updated_at = now()
     where id = auth.uid()
     returning current_level into next_level;

    return query select true, coalesce(next_level, p_level_number + 1);
  end if;

  return query select false, null;
end;
$$ language plpgsql;
```

Make sure to expose `verify_answer` through Supabase’s PostgREST and enable Google OAuth in the Supabase dashboard with the appropriate redirect URL (e.g. `http://localhost:5173/hunt` during development).

## Available Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – type-check and build for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

## Project Structure

- `src/providers/SupabaseProvider.tsx` – auth/session wiring
- `src/pages/SignIn.tsx` – Google OAuth entry
- `src/pages/Hunt.tsx` – level display and answer submission
- `src/pages/Leaderboard.tsx` – public standings
- `src/components/Layout.tsx` – shared navigation shell
- `src/index.css` – dark grid theme with Google glows
