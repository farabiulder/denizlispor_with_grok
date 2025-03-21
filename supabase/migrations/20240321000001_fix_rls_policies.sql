-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can view their own game states" ON public.game_states;
DROP POLICY IF EXISTS "Users can update their own game states" ON public.game_states;
DROP POLICY IF EXISTS "Users can view their own weekly scores" ON public.weekly_scores;
DROP POLICY IF EXISTS "Users can update their own weekly scores" ON public.weekly_scores;

-- Create new policies for users table
CREATE POLICY "Enable read access for authenticated users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for user_points table
CREATE POLICY "Enable read access for own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own points" ON public.user_points
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own points" ON public.user_points
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for game_states table
CREATE POLICY "Enable read access for own game states" ON public.game_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own game states" ON public.game_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own game states" ON public.game_states
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for weekly_scores table
CREATE POLICY "Enable read access for own weekly scores" ON public.weekly_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own weekly scores" ON public.weekly_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own weekly scores" ON public.weekly_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions to the postgres role
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_points TO authenticated;
GRANT ALL ON public.game_states TO authenticated;
GRANT ALL ON public.weekly_scores TO authenticated;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _email text;
BEGIN
    -- Get email from the NEW record
    _email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');

    -- Insert into users table with error handling
    BEGIN
        INSERT INTO public.users (id, email, name, surname)
        VALUES (NEW.id, _email, '', '');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    END;

    -- Insert into user_points table with error handling
    BEGIN
        INSERT INTO public.user_points (user_id, total_points)
        VALUES (NEW.id, 0);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user points: %', SQLERRM;
    END;

    -- Insert initial game state with error handling
    BEGIN
        INSERT INTO public.game_states (
            user_id,
            progress_bars,
            completed_categories,
            points,
            estimated_scores
        )
        VALUES (
            NEW.id,
            '{"Finance": 50, "TechnicalTeam": 50, "Sponsors": 50, "Fans": 50}'::jsonb,
            ARRAY[]::TEXT[],
            0,
            '{}'::jsonb
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating game state: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 