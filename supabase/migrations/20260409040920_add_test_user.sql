-- Insert a local test user for Development Mode mock sign-in
-- Only runs on local environment; should be ignored in production if handled correctly
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test User","avatar_url":"https://bananiraw.s3.us-west-2.amazonaws.com/avatar-mock.png"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Also ensure the identity is created for the user
-- auth.identities requires provider_id (the sub/id from provider)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '{"sub":"00000000-0000-0000-0000-000000000000", "email":"test@example.com"}',
    'email',
    '00000000-0000-0000-0000-000000000000',
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
