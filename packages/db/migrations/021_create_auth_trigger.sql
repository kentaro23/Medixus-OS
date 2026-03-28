-- ============================================================
-- 021: 新規ユーザー登録時に profiles + patients を自動作成
-- Supabase Auth の on_auth_user_created トリガー
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, role, display_name, is_active)
  VALUES (NEW.id, v_role, v_name, true)
  ON CONFLICT (id) DO NOTHING;

  IF v_role = 'patient' THEN
    INSERT INTO public.patients (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_role = 'doctor' THEN
    INSERT INTO public.doctors (id, license_number)
    VALUES (NEW.id, 'PENDING-' || NEW.id::TEXT)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
