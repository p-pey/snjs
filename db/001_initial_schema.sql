-- ============================================================
-- MIGRATION: 001_initial_schema.sql
-- Description: Full schema for TaskFlow Todo Application
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search on todos


-- ─────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE todo_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE activity_action AS ENUM (
  'todo_created',
  'todo_updated',
  'todo_completed',
  'todo_archived',
  'todo_deleted',
  'todo_restored',
  'tag_created',
  'tag_deleted',
  'category_created',
  'category_deleted'
);


-- ─────────────────────────────────────────────
-- 2. PROFILES TABLE (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  preferences   JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "defaultPriority": "medium",
    "emailNotifications": true
  }'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profile lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);


-- ─────────────────────────────────────────────
-- 3. CATEGORIES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366f1', -- tailwind indigo-500
  icon        TEXT,                             -- lucide icon name
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT categories_name_user_unique UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);


-- ─────────────────────────────────────────────
-- 4. TAGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#10b981', -- tailwind emerald-500
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tags_name_user_unique UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);


-- ─────────────────────────────────────────────
-- 5. TODOS TABLE (core)
-- ─────────────────────────────────────────────
CREATE TABLE public.todos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  title           TEXT NOT NULL,
  description     TEXT,
  status          todo_status NOT NULL DEFAULT 'active',
  priority        todo_priority NOT NULL DEFAULT 'medium',

  due_date        TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,

  sort_order      INTEGER NOT NULL DEFAULT 0,  -- for manual ordering
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb, -- extensible extra fields

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Full-text search vector (auto-maintained by trigger below)
  search_vector   TSVECTOR
);

-- Performance indexes
CREATE INDEX idx_todos_user_id          ON public.todos(user_id);
CREATE INDEX idx_todos_status           ON public.todos(user_id, status);
CREATE INDEX idx_todos_priority         ON public.todos(user_id, priority);
CREATE INDEX idx_todos_due_date         ON public.todos(user_id, due_date);
CREATE INDEX idx_todos_created_at       ON public.todos(user_id, created_at DESC);
CREATE INDEX idx_todos_category_id      ON public.todos(category_id);
CREATE INDEX idx_todos_search_vector    ON public.todos USING GIN(search_vector);
CREATE INDEX idx_todos_title_trgm       ON public.todos USING GIN(title gin_trgm_ops);


-- ─────────────────────────────────────────────
-- 6. TODO_TAGS (junction table)
-- ─────────────────────────────────────────────
CREATE TABLE public.todo_tags (
  todo_id   UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);

CREATE INDEX idx_todo_tags_tag_id  ON public.todo_tags(tag_id);
CREATE INDEX idx_todo_tags_todo_id ON public.todo_tags(todo_id);


-- ─────────────────────────────────────────────
-- 7. ACTIVITY_LOGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  todo_id     UUID REFERENCES public.todos(id) ON DELETE SET NULL,
  action      activity_action NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb, -- stores before/after state diffs
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dashboard charts (date-grouped queries)
CREATE INDEX idx_activity_logs_user_id    ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action     ON public.activity_logs(user_id, action);
CREATE INDEX idx_activity_logs_todo_id    ON public.activity_logs(todo_id);


-- ─────────────────────────────────────────────
-- 8. FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────

-- 8a. Auto-update `updated_at` on any row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 8b. Auto-create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 8c. Maintain full-text search vector on todos
CREATE OR REPLACE FUNCTION public.todos_update_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_todos_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.todos_update_search_vector();


-- 8d. Auto-log activity on todo INSERT / UPDATE / DELETE
CREATE OR REPLACE FUNCTION public.log_todo_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_action activity_action;
  v_meta   JSONB := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'todo_created';
    v_meta   := jsonb_build_object('title', NEW.title, 'priority', NEW.priority);

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status = 'completed' THEN
      v_action := 'todo_completed';
    ELSIF NEW.status = 'archived' AND OLD.status != 'archived' THEN
      v_action := 'todo_archived';
    ELSIF OLD.status = 'archived' AND NEW.status != 'archived' THEN
      v_action := 'todo_restored';
    ELSE
      v_action := 'todo_updated';
    END IF;
    v_meta := jsonb_build_object(
      'title',    NEW.title,
      'changes',  jsonb_build_object(
        'status',   CASE WHEN OLD.status   != NEW.status   THEN jsonb_build_object('from', OLD.status,   'to', NEW.status)   END,
        'priority', CASE WHEN OLD.priority != NEW.priority THEN jsonb_build_object('from', OLD.priority, 'to', NEW.priority) END,
        'title',    CASE WHEN OLD.title    != NEW.title    THEN jsonb_build_object('from', OLD.title,    'to', NEW.title)    END
      )
    );

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'todo_deleted';
    v_meta   := jsonb_build_object('title', OLD.title);
    INSERT INTO public.activity_logs (user_id, todo_id, action, metadata)
    VALUES (OLD.user_id, OLD.id, v_action, v_meta);
    RETURN OLD;
  END IF;

  INSERT INTO public.activity_logs (user_id, todo_id, action, metadata)
  VALUES (NEW.user_id, NEW.id, v_action, v_meta);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_todos_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.log_todo_activity();


-- ─────────────────────────────────────────────
-- 9. USEFUL VIEWS
-- ─────────────────────────────────────────────

-- 9a. todos with joined tags array and category name (avoids N+1 on client)
CREATE OR REPLACE VIEW public.todos_with_details AS
SELECT
  t.*,
  c.name        AS category_name,
  c.color       AS category_color,
  c.icon        AS category_icon,
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)
    ) FILTER (WHERE tg.id IS NOT NULL),
    '[]'::jsonb
  ) AS tags
FROM public.todos t
LEFT JOIN public.categories c  ON c.id = t.category_id
LEFT JOIN public.todo_tags  tt ON tt.todo_id = t.id
LEFT JOIN public.tags       tg ON tg.id = tt.tag_id
GROUP BY t.id, c.name, c.color, c.icon;


-- 9b. daily activity summary per user (used by the activity chart)
CREATE OR REPLACE VIEW public.activity_daily_summary AS
SELECT
  user_id,
  DATE(created_at AT TIME ZONE 'UTC') AS activity_date,
  action,
  COUNT(*)                             AS count
FROM public.activity_logs
GROUP BY user_id, activity_date, action;


-- ─────────────────────────────────────────────
-- 10. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs  ENABLE ROW LEVEL SECURITY;

-- profiles: users can only see/edit their own row
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- categories
CREATE POLICY "categories_all_own" ON public.categories USING (auth.uid() = user_id);

-- tags
CREATE POLICY "tags_all_own" ON public.tags USING (auth.uid() = user_id);

-- todos
CREATE POLICY "todos_all_own" ON public.todos USING (auth.uid() = user_id);

-- todo_tags: allow if the user owns the todo
CREATE POLICY "todo_tags_all_own" ON public.todo_tags
  USING (
    EXISTS (
      SELECT 1 FROM public.todos t
      WHERE t.id = todo_id AND t.user_id = auth.uid()
    )
  );

-- activity_logs: read-only, own user
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 11. SEED: default categories for new users
--     (Called manually or via Edge Function after signup)
-- ─────────────────────────────────────────────
-- Example: INSERT INTO categories (user_id, name, color, icon)
-- VALUES ($user_id, 'Personal', '#6366f1', 'user'),
--        ($user_id, 'Work',     '#f59e0b', 'briefcase'),
--        ($user_id, 'Shopping', '#10b981', 'shopping-cart');
