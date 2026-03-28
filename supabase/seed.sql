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
    '', '', '', '',
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

  -- Attempt 1: General diagnostics (2 weeks ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 52, 61, 45, 58,
    54, '{"_test_type": "general"}',
    now() - interval '14 days'
  );

  -- Attempt 2: General diagnostics (1 week ago, improved)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 64, 68, 55, 65,
    63, '{"_test_type": "general"}',
    now() - interval '7 days'
  );

  -- Attempt 3: General diagnostics (today, further improvement)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 72, 75, 63, 71,
    70, '{"_test_type": "general"}',
    now() - interval '1 day'
  );

  -- Attempt 4: Physics diagnostics (5 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 68, 55, 72, 60,
    64, '{"_test_type": "physics"}',
    now() - interval '5 days'
  );

  -- Attempt 5: InfoComm diagnostics (3 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 78, 70, 65, 73,
    72, '{"_test_type": "infocomm"}',
    now() - interval '3 days'
  );

END $$;
