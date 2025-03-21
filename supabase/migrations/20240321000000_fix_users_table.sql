-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_points CASCADE;
DROP TABLE IF EXISTS public.weekly_scores CASCADE;
DROP TABLE IF EXISTS public.game_states CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT DEFAULT '',
    surname TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create game_states table
CREATE TABLE IF NOT EXISTS public.game_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    progress_bars JSONB DEFAULT '{}'::jsonb,
    completed_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    points INTEGER DEFAULT 0,
    estimated_scores JSONB DEFAULT '{}'::jsonb,
    match_prediction JSONB DEFAULT NULL,
    last_completion_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create weekly_scores table
CREATE TABLE IF NOT EXISTS public.weekly_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    points_earned INTEGER DEFAULT 0,
    prediction JSONB NOT NULL,
    actual_score JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for user_points table
CREATE POLICY "Users can view their own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points
    FOR ALL USING (auth.uid() = user_id);

-- Create policies for game_states table
CREATE POLICY "Users can view their own game states" ON public.game_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game states" ON public.game_states
    FOR ALL USING (auth.uid() = user_id);

-- Create policies for weekly_scores table
CREATE POLICY "Users can view their own weekly scores" ON public.weekly_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly scores" ON public.weekly_scores
    FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, name, surname)
    VALUES (NEW.id, NEW.email, '', '');

    -- Insert into user_points table
    INSERT INTO public.user_points (user_id, total_points)
    VALUES (NEW.id, 0);

    -- Insert initial game state
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 