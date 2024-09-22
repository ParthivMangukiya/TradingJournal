-- Generate a new user ID and create a user
DO $$
DECLARE
    user_id uuid;
    provider_id uuid;
BEGIN
    -- Generate a new UUID for the user and provider
    user_id := gen_random_uuid();
    provider_id := gen_random_uuid();

    -- Insert the new user into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        'parthivm20@gmail.com',
        crypt('Chang3d!', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}',
        '{}',
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    );

    -- Insert the user's email identity
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        provider_id
    ) VALUES (
        gen_random_uuid(),
        user_id,
        jsonb_build_object('sub', user_id::text, 'email', 'parthivm20@gmail.com'),
        'email',
        current_timestamp,
        current_timestamp,
        current_timestamp,
        provider_id
    );

    -- -- Insert accounts
    -- INSERT INTO public.accounts (account_name, user_id) VALUES
    -- ('AKASH', user_id),
    -- ('JANKI', user_id);

    -- -- Insert market
    -- INSERT INTO public.market (market_name, user_id) VALUES
    -- ('Uptrend', user_id),
    -- ('Downtrend', user_id);

    -- -- Insert setup
    -- INSERT INTO public.setup (setup_name, user_id) VALUES
    -- ('PullBack', user_id),
    -- ('BreakOut', user_id),
    -- ('Anticipation', user_id);

    -- -- Insert type (now including setup_id)
    -- INSERT INTO public.type (type_name, setup_id, user_id)
    -- SELECT t.type_name, setup.id, setup.user_id
    -- FROM (VALUES
    --     ('50MA-PB', 'PullBack'),
    --     ('BO-50MA', 'BreakOut'),
    --     ('Cheat', 'Anticipation'),
    --     ('Tightness-ACP', 'Anticipation'),
    --     ('21MA-PB', 'PullBack'),
    --     ('VCP', 'BreakOut')
    -- ) AS t(type_name, setup_name)
    -- JOIN public.setup ON setup.setup_name = t.setup_name;

    -- -- Insert trades and transactions
    -- DECLARE
    --     akash_id INTEGER;
    --     janki_id INTEGER;
    --     uptrend_id INTEGER;
    --     pullback_id INTEGER;
    --     breakout_id INTEGER;
    --     anticipation_id INTEGER;
    --     ma50_pb_id INTEGER;
    --     bo_50ma_id INTEGER;
    --     cheat_id INTEGER;
    --     tightness_acp_id INTEGER;
    --     ma21_pb_id INTEGER;
    --     vcp_id INTEGER;
    --     trade_id INTEGER;
    -- BEGIN
    --     -- Get account IDs
    --     SELECT id INTO akash_id FROM public.accounts WHERE account_name = 'AKASH';
    --     SELECT id INTO janki_id FROM public.accounts WHERE account_name = 'JANKI';
        
    --     -- Get market ID
    --     SELECT id INTO uptrend_id FROM public.market WHERE market_name = 'Uptrend';
        
    --     -- Get setup IDs
    --     SELECT id INTO pullback_id FROM public.setup WHERE setup_name = 'PullBack';
    --     SELECT id INTO breakout_id FROM public.setup WHERE setup_name = 'BreakOut';
    --     SELECT id INTO anticipation_id FROM public.setup WHERE setup_name = 'Anticipation';
        
    --     -- Get type IDs (now associated with setups)
    --     SELECT id INTO ma50_pb_id FROM public.type WHERE type_name = '50MA-PB' AND setup_id = pullback_id;
    --     SELECT id INTO bo_50ma_id FROM public.type WHERE type_name = 'BO-50MA' AND setup_id = breakout_id;
    --     SELECT id INTO cheat_id FROM public.type WHERE type_name = 'Cheat' AND setup_id = anticipation_id;
    --     SELECT id INTO tightness_acp_id FROM public.type WHERE type_name = 'Tightness-ACP' AND setup_id = anticipation_id;
    --     SELECT id INTO ma21_pb_id FROM public.type WHERE type_name = '21MA-PB' AND setup_id = pullback_id;
    --     SELECT id INTO vcp_id FROM public.type WHERE type_name = 'VCP' AND setup_id = breakout_id;

    --     -- Insert trades and transactions
    --     -- FOSECO
    --     INSERT INTO public.trades (account_id, name, setup_id, type_id, market_id, risk_percent, user_id)
    --     VALUES (akash_id, 'FOSECO', pullback_id, ma50_pb_id, uptrend_id, 0.25, user_id)
    --     RETURNING id INTO trade_id;

    --     INSERT INTO public.buy_transactions (trade_id, buy_price, buy_date, quantity, initial_stop, stop_loss_percent, buy_brokerage, user_id)
    --     VALUES (trade_id, 2184, '2023-04-03', 30, 2094, 4, 78.62, user_id);

    --     INSERT INTO public.sell_transactions (trade_id, sell_price, sell_date, quantity, sell_brokerage, user_id)
    --     VALUES (trade_id, 2365.09, '2023-05-02', 30, 85.14, user_id);

    --     -- RAJRATAN
    --     INSERT INTO public.trades (account_id, name, setup_id, type_id, market_id, risk_percent, user_id)
    --     VALUES (akash_id, 'RAJRATAN', breakout_id, bo_50ma_id, uptrend_id, 0.25, user_id)
    --     RETURNING id INTO trade_id;

    --     INSERT INTO public.buy_transactions (trade_id, buy_price, buy_date, quantity, initial_stop, stop_loss_percent, buy_brokerage, user_id)
    --     VALUES (trade_id, 823, '2023-04-05', 60, 762, 7, 59.26, user_id);

    --     INSERT INTO public.sell_transactions (trade_id, sell_price, sell_date, quantity, sell_brokerage, user_id)
    --     VALUES (trade_id, 771.24, '2023-04-26', 60, 55.53, user_id);

    --     -- Add more trades here as needed
    -- END;
END $$;