-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: test user + diagnostics results
-- Runs after all migrations on `supabase db reset`
-- ─────────────────────────────────────────────────────────────────────────────

-- Fixed UUID for the test user (stable across resets)
DO $$
DECLARE
  _uid uuid := 'a1b2c3d4-0000-4000-8000-000000000001';
BEGIN
  -- Create auth user directly (password: 81geniyA)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone, phone_change, phone_change_token,
    is_super_admin
  ) VALUES (
    _uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bekarys07kz@gmail.com',
    crypt('81geniyA', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Bekarys"}',
    '', '', '',
    '', NULL, '', '',
    false
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert into auth.identities (required by GoTrue)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    _uid,
    _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'bekarys07kz@gmail.com'),
    'email',
    now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  -- The handle_new_user trigger auto-creates profile + user_roles,
  -- but since we INSERT directly into auth.users the trigger fires.
  -- Update profile with more data:
  UPDATE public.profiles
  SET full_name = 'Bekarys', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- ─── Diagnostics results (3 attempts over time) ───────────────────────────

  -- Attempt 1: General diagnostics (2 weeks ago) — weak first try
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 52, 61, 45, 58,
    54, '{
      "_test_type": "general",
      "1":2,"2":2,"3":1,"4":3,"5":2,"6":1,"7":3,"8":2,
      "9":3,"10":2,"11":3,"12":2,"13":3,"14":2,"15":3,"16":2,
      "17":1,"18":2,"19":2,"20":1,"21":2,"22":2,"23":1,"24":2,
      "25":2,"26":3,"27":2,"28":3,"29":2,"30":2,"31":3,"32":2
    }',
    now() - interval '14 days'
  );

  -- Attempt 2: General diagnostics (1 week ago, improved)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 64, 68, 55, 65,
    63, '{
      "_test_type": "general",
      "1":3,"2":3,"3":2,"4":3,"5":2,"6":3,"7":3,"8":2,
      "9":3,"10":3,"11":3,"12":3,"13":4,"14":2,"15":3,"16":3,
      "17":2,"18":3,"19":2,"20":2,"21":3,"22":2,"23":2,"24":3,
      "25":3,"26":3,"27":3,"28":3,"29":2,"30":3,"31":3,"32":3
    }',
    now() - interval '7 days'
  );

  -- Attempt 3: General diagnostics (yesterday, good scores)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 72, 75, 63, 71,
    70, '{
      "_test_type": "general",
      "1":4,"2":3,"3":3,"4":3,"5":2,"6":3,"7":4,"8":3,
      "9":4,"10":3,"11":3,"12":4,"13":3,"14":3,"15":4,"16":3,
      "17":3,"18":2,"19":3,"20":2,"21":3,"22":3,"23":2,"24":3,
      "25":3,"26":4,"27":3,"28":3,"29":3,"30":3,"31":4,"32":3
    }',
    now() - interval '1 day'
  );

  -- Attempt 4: Physics diagnostics (5 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 68, 55, 72, 60,
    64, '{
      "_test_type": "physics",
      "1":1,"2":1,"3":1,"4":1,"5":0,"6":1,"7":0,"8":0,
      "9":0,"10":0,"11":1,"12":0,"13":1,"14":0,"15":1,"16":0,
      "17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":0,
      "25":1,"26":0,"27":1,"28":0,"29":0,"30":1,"31":0,"32":1
    }',
    now() - interval '5 days'
  );

  -- Attempt 5: InfoComm diagnostics (3 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 78, 70, 65, 73,
    72, '{
      "_test_type": "infocomm",
      "1":4,"2":3,"3":3,"4":4,"5":3,"6":3,"7":4,"8":3,
      "9":3,"10":3,"11":4,"12":3,"13":3,"14":4,"15":3,"16":3,
      "17":3,"18":2,"19":3,"20":3,"21":2,"22":3,"23":3,"24":2,
      "25":3,"26":4,"27":3,"28":3,"29":4,"30":3,"31":3,"32":3,
      "33":3,"34":4,"35":3,"36":3,"37":4,"38":3,"39":3,"40":3
    }',
    now() - interval '3 days'
  );

END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Teacher account
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  _tid uuid := 'a1b2c3d4-0000-4000-8000-000000000002';
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone, phone_change, phone_change_token,
    is_super_admin
  ) VALUES (
    _tid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@skillnav.test',
    crypt('teacher123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Преподаватель"}',
    '', '', '',
    '', NULL, '', '',
    false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    _tid,
    _tid::text,
    jsonb_build_object('sub', _tid::text, 'email', 'teacher@skillnav.test'),
    'email',
    now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  -- Override role from student → teacher
  UPDATE public.user_roles SET role = 'teacher' WHERE user_id = _tid;

  UPDATE public.profiles
  SET full_name = 'Преподаватель', group_name = ''
  WHERE user_id = _tid;

END $$;
