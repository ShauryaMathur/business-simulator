CREATE OR REPLACE FUNCTION public.reset_game()
RETURNS void AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  UPDATE public.games
  SET 
    cash = 1000000,
    engineers = 4,
    sales_staff = 2,
    product_quality = 50,
    current_quarter = 1,
    updated_at = NOW()
  WHERE user_id = v_user_id;
  
  UPDATE public.game_history 
  SET is_deleted = true
  WHERE game_id = (SELECT id FROM games WHERE user_id = v_user_id)
    AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.advance_turn(
  p_unit_price numeric,
  p_new_engineers integer,
  p_new_sales integer,
  p_salary_pct numeric,
  p_max_capacity integer DEFAULT 24
) RETURNS jsonb AS $$ 
DECLARE
  v_user_id UUID := auth.uid();
  v_game games%ROWTYPE;
  v_salary_cost NUMERIC;
  v_total_payroll NUMERIC;
  v_market_demand NUMERIC;
  v_units_sold INTEGER;
  v_revenue NUMERIC;
  v_net_income NUMERIC;
  v_new_hire_cost NUMERIC;
  v_new_cash NUMERIC;
  v_cumulative_profit NUMERIC := 0;
  v_is_win BOOLEAN := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT * INTO v_game FROM games WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No game found for current user.';
  END IF;

  IF p_unit_price IS NULL OR p_unit_price <= 0 THEN
    RAISE EXCEPTION 'Unit price must be greater than zero.';
  END IF;

  IF p_new_engineers IS NULL OR p_new_engineers < 0 OR p_new_sales IS NULL OR p_new_sales < 0 THEN
    RAISE EXCEPTION 'New hires must be zero or positive.';
  END IF;

  IF p_salary_pct IS NULL OR p_salary_pct <= 0 THEN
    RAISE EXCEPTION 'Salary percentage must be greater than zero.';
  END IF;

  IF p_max_capacity IS NULL OR p_max_capacity <= 0 THEN
    RAISE EXCEPTION 'Max capacity must be greater than zero.';
  END IF;

  IF (v_game.engineers + v_game.sales_staff + p_new_engineers + p_new_sales) > p_max_capacity THEN
    RAISE EXCEPTION 'Office capacity exceeded. Max % desks available.', p_max_capacity;
  END IF;

  IF v_game.cash <= 0 THEN
    RAISE EXCEPTION 'Startup is bankrupt. Please reset the simulation.';
  END IF;

  v_salary_cost := (p_salary_pct / 100.0) * 30000;
  v_total_payroll := v_salary_cost * (v_game.engineers + v_game.sales_staff);
  v_new_hire_cost := (p_new_engineers + p_new_sales) * 5000;

  v_game.product_quality := LEAST(100, v_game.product_quality + (v_game.engineers * 0.5));
  v_market_demand := GREATEST(0, (v_game.product_quality * 10.0) - (p_unit_price * 0.0001));
  v_units_sold := FLOOR(v_market_demand * v_game.sales_staff * 0.5)::INTEGER;
  v_revenue := p_unit_price * v_units_sold;
  v_net_income := v_revenue - v_total_payroll;
  
  v_new_cash := v_game.cash + v_net_income - v_new_hire_cost;

  INSERT INTO game_history (game_id, quarter, cash, revenue, net_income, engineers, sales_staff, is_deleted)
  VALUES (v_game.id, v_game.current_quarter, v_new_cash, v_revenue, v_net_income, v_game.engineers, v_game.sales_staff, false);

  IF v_game.current_quarter >= 40 AND v_new_cash > 0 THEN
    v_is_win := true;

    SELECT SUM(net_income) INTO v_cumulative_profit 
    FROM game_history 
    WHERE game_id = v_game.id AND is_deleted = false;
  END IF;

  UPDATE games SET
    current_quarter = current_quarter + 1,
    cash = v_new_cash,
    engineers = engineers + p_new_engineers,
    sales_staff = sales_staff + p_new_sales,
    product_quality = v_game.product_quality,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'is_win', v_is_win,
    'cumulative_profit', v_cumulative_profit,
    'new_cash', v_new_cash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
