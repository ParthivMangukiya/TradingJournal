CREATE OR REPLACE FUNCTION get_trades_with_transactions(p_user_id UUID)
RETURNS TABLE (
    id INT,
    creation_date DATE,
    account_id INT,
    name TEXT,
    setup_id INT,
    type_id INT,
    market_id INT,
    group_rank TEXT,
    pro_score TEXT,
    one_week_rs NUMERIC,
    one_month_rs NUMERIC,
    risk_percent NUMERIC,
    user_id UUID,
    buy_transactions JSONB,
    sell_transactions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.creation_date,
        t.account_id,
        t.name,
        t.setup_id,
        t.type_id,
        t.market_id,
        t.group_rank,
        t.pro_score,
        t.one_week_rs,
        t.one_month_rs,
        t.risk_percent,
        t.user_id,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', b.id,
                    'trade_id', b.trade_id,
                    'buy_price', b.buy_price,
                    'buy_date', b.buy_date,
                    'quantity', b.quantity,
                    'initial_stop', b.initial_stop,
                    'stop_loss_percent', b.stop_loss_percent,
                    'buy_brokerage', b.buy_brokerage
                )
            ) FILTER (WHERE b.id IS NOT NULL),
            '[]'::jsonb
        ) AS buy_transactions,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'trade_id', s.trade_id,
                    'sell_price', s.sell_price,
                    'sell_date', s.sell_date,
                    'quantity', s.quantity,
                    'sell_brokerage', s.sell_brokerage
                )
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'::jsonb
        ) AS sell_transactions
    FROM 
        trades t
    LEFT JOIN 
        buy_transactions b ON t.id = b.trade_id
    LEFT JOIN 
        sell_transactions s ON t.id = s.trade_id
    WHERE 
        t.user_id = p_user_id
    GROUP BY 
        t.id, t.creation_date, t.account_id, t.name, t.setup_id, t.type_id, t.market_id, 
        t.group_rank, t.pro_score, t.one_week_rs, t.one_month_rs, t.risk_percent, t.user_id;
END;
$$ LANGUAGE plpgsql;
