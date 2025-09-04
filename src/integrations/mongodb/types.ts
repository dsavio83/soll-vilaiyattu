// MongoDB types that replace Supabase types

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          admission_number: string;
          name: string;
          class: string;
          division?: string;
          gender?: 'male' | 'female' | 'other';
          social_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          admission_number: string;
          name: string;
          class: string;
          division?: string;
          gender?: 'male' | 'female' | 'other';
          social_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          admission_number?: string;
          name?: string;
          class?: string;
          division?: string;
          gender?: 'male' | 'female' | 'other';
          social_score?: number;
          created_at?: string;
        };
      };
      word_puzzle: {
        Row: {
          id: string;
          game_date: string;
          center_letter: string;
          surrounding_letters: string[];
          words_2_letter: string[];
          words_3_letter: string[];
          words_4_letter: string[];
          words_5_letter: string[];
          words_6_letter: string[];
          words_7_letter: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          game_date?: string;
          center_letter: string;
          surrounding_letters: string[];
          words_2_letter?: string[];
          words_3_letter?: string[];
          words_4_letter?: string[];
          words_5_letter?: string[];
          words_6_letter?: string[];
          words_7_letter?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          game_date?: string;
          center_letter?: string;
          surrounding_letters?: string[];
          words_2_letter?: string[];
          words_3_letter?: string[];
          words_4_letter?: string[];
          words_5_letter?: string[];
          words_6_letter?: string[];
          words_7_letter?: string[];
          created_at?: string;
        };
      };
      leaderboard_score: {
        Row: {
          id: string;
          student_id: string;
          admission_number: string;
          name: string;
          class: string;
          score: number;
          time_taken: number;
          words_found: number;
          found_words?: string;
          found_words_time?: string;
          complete_game: boolean;
          attempt_count: number;
          game_date: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          admission_number: string;
          name: string;
          class: string;
          score?: number;
          time_taken: number;
          words_found?: number;
          found_words?: string;
          found_words_time?: string;
          complete_game?: boolean;
          attempt_count?: number;
          game_date?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          admission_number?: string;
          name?: string;
          class?: string;
          score?: number;
          time_taken?: number;
          words_found?: number;
          found_words?: string;
          found_words_time?: string;
          complete_game?: boolean;
          attempt_count?: number;
          game_date?: string;
          completed_at?: string;
        };
      };
      user_scores: {
        Row: {
          id: string;
          student_id: string;
          total_score: number;
          last_played_date?: string;
          streak_days: number;
          found_words_time?: string;
          attempt_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          total_score?: number;
          last_played_date?: string;
          streak_days?: number;
          found_words_time?: string;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          total_score?: number;
          last_played_date?: string;
          streak_days?: number;
          found_words_time?: string;
          attempt_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ads_config: {
        Row: {
          id: string;
          google_ads_id: string;
          banner_enabled: boolean;
          interstitial_enabled: boolean;
          rewarded_enabled: boolean;
          ads_frequency: number;
          show_ads_after_login: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          google_ads_id: string;
          banner_enabled?: boolean;
          interstitial_enabled?: boolean;
          rewarded_enabled?: boolean;
          ads_frequency?: number;
          show_ads_after_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          google_ads_id?: string;
          banner_enabled?: boolean;
          interstitial_enabled?: boolean;
          rewarded_enabled?: boolean;
          ads_frequency?: number;
          show_ads_after_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];