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
-- Mock students with comprehensive test data (CS-101 group)
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════════
-- Student 1: Айгерім Сейтова — strong student (70-85), improving trend
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  _uid uuid := 'b1b2c3d4-0000-4000-8000-000000000002';
  _case_id uuid;
BEGIN
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
    'authenticated', 'authenticated',
    'aigerim.seitova@test.kz',
    crypt('testpass123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Айгерім Сейтова"}',
    '', '', '', '', NULL, '', '', false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _uid, _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'aigerim.seitova@test.kz'),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET full_name = 'Айгерім Сейтова', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- Diagnostics: general (18 days ago) — good start
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 70, 72, 68, 71,
    70, '{"_test_type":"general","1":3,"2":3,"3":3,"4":3,"5":2,"6":3,"7":3,"8":3,"9":3,"10":3,"11":3,"12":3,"13":3,"14":2,"15":3,"16":3,"17":2,"18":3,"19":3,"20":2,"21":3,"22":3,"23":2,"24":3,"25":3,"26":3,"27":3,"28":3,"29":2,"30":3,"31":3,"32":3}',
    now() - interval '18 days'
  );

  -- Diagnostics: general (8 days ago) — improved
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 78, 80, 74, 79,
    78, '{"_test_type":"general","1":4,"2":3,"3":3,"4":4,"5":3,"6":3,"7":4,"8":3,"9":3,"10":3,"11":4,"12":3,"13":4,"14":3,"15":3,"16":4,"17":3,"18":3,"19":3,"20":3,"21":3,"22":3,"23":3,"24":3,"25":3,"26":4,"27":3,"28":4,"29":3,"30":3,"31":4,"32":3}',
    now() - interval '8 days'
  );

  -- Diagnostics: physics (4 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 82, 78, 85, 80,
    81, '{"_test_type":"physics","1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":0,"9":1,"10":1,"11":1,"12":1,"13":1,"14":0,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":0,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1,"32":1}',
    now() - interval '4 days'
  );

  -- Trainer: SBI feedback
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'sbi_feedback', 82, 100, 2,
    '{"scores":[{"situation":9,"behavior":8,"impact":9,"total":26},{"situation":8,"behavior":9,"impact":9,"total":26}]}',
    now() - interval '10 days'
  );

  -- Trainer: conflict resolution
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'conflict_resolution', 75, 100, 1,
    '{"scenarioScores":[9,8,8]}',
    now() - interval '6 days'
  );

  -- Case solution (case 1)
  SELECT id INTO _case_id FROM public.cases ORDER BY title LIMIT 1 OFFSET 0;
  IF _case_id IS NOT NULL THEN
    INSERT INTO public.case_solutions (case_id, user_id, solution_text, score, submitted_at)
    VALUES (_case_id, _uid, 'Предложила поэтапную структуру проекта с распределением обязанностей по компетенциям участников. Акцент на peer-review и еженедельных стендапах.', 78, now() - interval '5 days');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Student 2: Данияр Мұратов — average (45-60), stable
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  _uid uuid := 'b1b2c3d4-0000-4000-8000-000000000003';
  _case_id uuid;
BEGIN
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
    'authenticated', 'authenticated',
    'daniyar.muratov@test.kz',
    crypt('testpass123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Данияр Мұратов"}',
    '', '', '', '', NULL, '', '', false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _uid, _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'daniyar.muratov@test.kz'),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET full_name = 'Данияр Мұратов', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- Diagnostics: general (20 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 48, 52, 45, 50,
    49, '{"_test_type":"general","1":2,"2":2,"3":2,"4":2,"5":2,"6":2,"7":2,"8":1,"9":2,"10":2,"11":2,"12":2,"13":2,"14":1,"15":2,"16":2,"17":1,"18":2,"19":2,"20":1,"21":2,"22":2,"23":1,"24":2,"25":2,"26":2,"27":2,"28":2,"29":1,"30":2,"31":2,"32":2}',
    now() - interval '20 days'
  );

  -- Diagnostics: general (10 days ago) — stable, minor improvement
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 52, 55, 48, 53,
    52, '{"_test_type":"general","1":2,"2":2,"3":2,"4":3,"5":2,"6":2,"7":2,"8":2,"9":2,"10":2,"11":3,"12":2,"13":2,"14":2,"15":2,"16":2,"17":2,"18":2,"19":2,"20":2,"21":2,"22":2,"23":2,"24":2,"25":2,"26":3,"27":2,"28":2,"29":2,"30":2,"31":2,"32":2}',
    now() - interval '10 days'
  );

  -- Diagnostics: infocomm (3 days ago)
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 55, 58, 50, 56,
    55, '{"_test_type":"infocomm","1":3,"2":2,"3":2,"4":3,"5":2,"6":2,"7":3,"8":2,"9":2,"10":2,"11":3,"12":2,"13":2,"14":3,"15":2,"16":2,"17":2,"18":2,"19":2,"20":2,"21":2,"22":2,"23":2,"24":2,"25":2,"26":3,"27":2,"28":2,"29":3,"30":2,"31":2,"32":2,"33":2,"34":3,"35":2,"36":2,"37":3,"38":2,"39":2,"40":2}',
    now() - interval '3 days'
  );

  -- Trainer: public speaking
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'public_speaking', 50, 100, 1,
    '{"topicId":1,"outline":{"intro":"Вступление с вопросом","main":"Три ключевых аргумента","conclusion":"Призыв к действию"},"checkedItems":[1,2,3]}',
    now() - interval '12 days'
  );

  -- Trainer: SBI feedback
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'sbi_feedback', 55, 100, 1,
    '{"scores":[{"situation":6,"behavior":5,"impact":6,"total":17},{"situation":5,"behavior":6,"impact":5,"total":16}]}',
    now() - interval '7 days'
  );

  -- Case solution (case 2)
  SELECT id INTO _case_id FROM public.cases ORDER BY title LIMIT 1 OFFSET 1;
  IF _case_id IS NOT NULL THEN
    INSERT INTO public.case_solutions (case_id, user_id, solution_text, score, submitted_at)
    VALUES (_case_id, _uid, 'Выбрал стандартный подход к лабораторной работе. Результаты средние, но все этапы выполнены корректно.', 52, now() - interval '8 days');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Student 3: Мадина Қалиева — excellent (80-95), top performer
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  _uid uuid := 'b1b2c3d4-0000-4000-8000-000000000004';
  _case_id uuid;
BEGIN
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
    'authenticated', 'authenticated',
    'madina.kalieva@test.kz',
    crypt('testpass123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Мадина Қалиева"}',
    '', '', '', '', NULL, '', '', false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _uid, _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'madina.kalieva@test.kz'),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET full_name = 'Мадина Қалиева', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- Diagnostics: general (17 days ago) — already strong
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 82, 85, 80, 83,
    83, '{"_test_type":"general","1":4,"2":4,"3":3,"4":4,"5":3,"6":4,"7":4,"8":3,"9":4,"10":3,"11":4,"12":4,"13":4,"14":3,"15":4,"16":3,"17":3,"18":3,"19":4,"20":3,"21":3,"22":4,"23":3,"24":3,"25":4,"26":4,"27":3,"28":4,"29":3,"30":4,"31":4,"32":3}',
    now() - interval '17 days'
  );

  -- Diagnostics: physics (9 days ago) — excellent
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 90, 85, 92, 88,
    89, '{"_test_type":"physics","1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":1,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":0,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":1,"29":1,"30":1,"31":1,"32":1}',
    now() - interval '9 days'
  );

  -- Diagnostics: infocomm (2 days ago) — top scores
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 93, 90, 95, 91,
    92, '{"_test_type":"infocomm","1":5,"2":4,"3":4,"4":5,"5":4,"6":4,"7":5,"8":4,"9":4,"10":4,"11":5,"12":4,"13":4,"14":5,"15":4,"16":4,"17":4,"18":3,"19":4,"20":4,"21":3,"22":4,"23":4,"24":3,"25":4,"26":5,"27":4,"28":4,"29":5,"30":4,"31":4,"32":4,"33":4,"34":5,"35":4,"36":4,"37":5,"38":4,"39":4,"40":4}',
    now() - interval '2 days'
  );

  -- Trainer: SBI feedback — high score
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'sbi_feedback', 92, 100, 3,
    '{"scores":[{"situation":10,"behavior":9,"impact":10,"total":29},{"situation":9,"behavior":10,"impact":10,"total":29}]}',
    now() - interval '11 days'
  );

  -- Trainer: conflict resolution — excellent
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'conflict_resolution', 90, 100, 2,
    '{"scenarioScores":[10,9,10]}',
    now() - interval '5 days'
  );

  -- Case solution (case 3)
  SELECT id INTO _case_id FROM public.cases ORDER BY title LIMIT 1 OFFSET 2;
  IF _case_id IS NOT NULL THEN
    INSERT INTO public.case_solutions (case_id, user_id, solution_text, score, submitted_at)
    VALUES (_case_id, _uid, 'Разработала комплексную программу адаптации с менторской поддержкой, еженедельными чекинами и системой обратной связи. Включила элементы геймификации для повышения вовлечённости.', 91, now() - interval '6 days');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Student 4: Арман Жұмабеков — struggling (25-40), needs attention
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  _uid uuid := 'b1b2c3d4-0000-4000-8000-000000000005';
  _case_id uuid;
BEGIN
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
    'authenticated', 'authenticated',
    'arman.zhumabek@test.kz',
    crypt('testpass123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Арман Жұмабеков"}',
    '', '', '', '', NULL, '', '', false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _uid, _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'arman.zhumabek@test.kz'),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET full_name = 'Арман Жұмабеков', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- Diagnostics: general (19 days ago) — low scores
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 28, 32, 25, 30,
    29, '{"_test_type":"general","1":1,"2":1,"3":1,"4":1,"5":1,"6":1,"7":2,"8":1,"9":1,"10":1,"11":1,"12":1,"13":2,"14":1,"15":1,"16":1,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":1,"26":1,"27":1,"28":2,"29":1,"30":1,"31":1,"32":1}',
    now() - interval '19 days'
  );

  -- Diagnostics: general (7 days ago) — still low
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 33, 38, 30, 35,
    34, '{"_test_type":"general","1":1,"2":2,"3":1,"4":1,"5":1,"6":1,"7":2,"8":1,"9":2,"10":1,"11":1,"12":2,"13":2,"14":1,"15":1,"16":2,"17":1,"18":1,"19":1,"20":1,"21":1,"22":2,"23":1,"24":1,"25":1,"26":2,"27":1,"28":2,"29":1,"30":1,"31":2,"32":1}',
    now() - interval '7 days'
  );

  -- Diagnostics: physics (2 days ago) — struggling
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 35, 40, 28, 37,
    35, '{"_test_type":"physics","1":0,"2":1,"3":0,"4":0,"5":0,"6":1,"7":0,"8":0,"9":1,"10":0,"11":0,"12":1,"13":0,"14":0,"15":1,"16":0,"17":0,"18":0,"19":1,"20":0,"21":0,"22":1,"23":0,"24":0,"25":0,"26":0,"27":1,"28":0,"29":0,"30":1,"31":0,"32":0}',
    now() - interval '2 days'
  );

  -- Trainer: public speaking — low
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'public_speaking', 30, 100, 1,
    '{"topicId":1,"outline":{"intro":"Привет всем","main":"Основная часть","conclusion":"Спасибо"},"checkedItems":[1,3]}',
    now() - interval '14 days'
  );

  -- Case solution (case 4)
  SELECT id INTO _case_id FROM public.cases ORDER BY title LIMIT 1 OFFSET 3;
  IF _case_id IS NOT NULL THEN
    INSERT INTO public.case_solutions (case_id, user_id, solution_text, score, submitted_at)
    VALUES (_case_id, _uid, 'Предложил поговорить с участниками конфликта. Не детализировал шаги решения.', 32, now() - interval '4 days');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Student 5: Сара Нұрланова — improving fast (35→65), best growth
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  _uid uuid := 'b1b2c3d4-0000-4000-8000-000000000006';
  _case_id uuid;
BEGIN
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
    'authenticated', 'authenticated',
    'sara.nurlanova@test.kz',
    crypt('testpass123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Сара Нұрланова"}',
    '', '', '', '', NULL, '', '', false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), _uid, _uid::text,
    jsonb_build_object('sub', _uid::text, 'email', 'sara.nurlanova@test.kz'),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET full_name = 'Сара Нұрланова', group_name = 'CS-101'
  WHERE user_id = _uid;

  -- Diagnostics: general (21 days ago) — weak start
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 35, 38, 32, 36,
    35, '{"_test_type":"general","1":1,"2":1,"3":1,"4":2,"5":1,"6":1,"7":2,"8":1,"9":1,"10":2,"11":1,"12":1,"13":2,"14":1,"15":1,"16":2,"17":1,"18":1,"19":1,"20":1,"21":1,"22":1,"23":1,"24":1,"25":2,"26":1,"27":1,"28":2,"29":1,"30":1,"31":2,"32":1}',
    now() - interval '21 days'
  );

  -- Diagnostics: general (11 days ago) — significant improvement
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 50, 55, 48, 52,
    51, '{"_test_type":"general","1":2,"2":2,"3":2,"4":3,"5":2,"6":2,"7":3,"8":2,"9":2,"10":2,"11":3,"12":2,"13":3,"14":2,"15":2,"16":3,"17":2,"18":2,"19":2,"20":2,"21":2,"22":2,"23":2,"24":2,"25":2,"26":3,"27":2,"28":3,"29":2,"30":2,"31":3,"32":2}',
    now() - interval '11 days'
  );

  -- Diagnostics: general (1 day ago) — strong improvement!
  INSERT INTO public.diagnostics_results (
    user_id, cognitive_score, soft_score, professional_score, adaptability_score,
    average_score, answers, completed_at
  ) VALUES (
    _uid, 65, 68, 60, 66,
    65, '{"_test_type":"general","1":3,"2":3,"3":3,"4":3,"5":2,"6":3,"7":3,"8":3,"9":3,"10":3,"11":3,"12":3,"13":3,"14":2,"15":3,"16":3,"17":2,"18":3,"19":3,"20":2,"21":3,"22":3,"23":2,"24":3,"25":3,"26":3,"27":3,"28":3,"29":2,"30":3,"31":3,"32":3}',
    now() - interval '1 day'
  );

  -- Trainer: conflict resolution — early attempt
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'conflict_resolution', 45, 100, 1,
    '{"scenarioScores":[5,4,6]}',
    now() - interval '15 days'
  );

  -- Trainer: conflict resolution — improved attempt
  INSERT INTO public.trainer_attempts (user_id, trainer_type, score, max_score, level, answers, completed_at)
  VALUES (
    _uid, 'conflict_resolution', 68, 100, 1,
    '{"scenarioScores":[8,7,8]}',
    now() - interval '3 days'
  );

  -- Case solution (case 5)
  SELECT id INTO _case_id FROM public.cases ORDER BY title LIMIT 1 OFFSET 4;
  IF _case_id IS NOT NULL THEN
    INSERT INTO public.case_solutions (case_id, user_id, solution_text, score, submitted_at)
    VALUES (_case_id, _uid, 'Организовала команду для хакатона с чётким распределением ролей. Предложила MVP-подход и итеративную разработку. Провела ретроспективу после каждого спринта.', 65, now() - interval '2 days');
  END IF;
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
