// Minimal DB types matching supabase/migrations/001_initial.sql.
// Replace with `supabase gen types typescript` output if you wire the CLI.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          city: string | null;
          country: string | null;
          avatar_url: string | null;
          coins: number;
          is_pro: boolean;
          pro_expires_at: string | null;
          polar_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      games: {
        Row: {
          id: string;
          user_id: string;
          difficulty: "easy" | "medium" | "hard" | "custom" | "daily";
          width: number;
          height: number;
          mines: number;
          status: "won" | "lost" | "abandoned";
          time_ms: number;
          three_bv: number | null;
          flags_correct: number;
          flags_total: number;
          hints_used: number;
          seed: number | null;
          finished_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["games"]["Row"],
          "id" | "finished_at"
        > & { id?: string; finished_at?: string };
        Update: Partial<Database["public"]["Tables"]["games"]["Row"]>;
      };
      daily_challenges: {
        Row: {
          date: string;
          seed: number;
          difficulty: string;
          width: number;
          height: number;
          mines: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_challenges"]["Row"],
          "created_at"
        > & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["daily_challenges"]["Row"]>;
      };
      daily_results: {
        Row: {
          user_id: string;
          date: string;
          status: "won" | "lost";
          time_ms: number;
          three_bv: number | null;
          flags_correct: number;
          flags_total: number;
          hints_used: number;
          finished_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_results"]["Row"],
          "finished_at"
        > & { finished_at?: string };
        Update: Partial<Database["public"]["Tables"]["daily_results"]["Row"]>;
      };
      skins: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          kind: "board" | "background" | "bundle";
          rarity: string;
          price_cents: number;
          price_coins: number;
          polar_product_id: string | null;
          is_pro_only: boolean;
          preview_url: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["skins"]["Row"],
          "created_at"
        > & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["skins"]["Row"]>;
      };
      user_skins: {
        Row: {
          user_id: string;
          skin_id: string;
          acquired_via: "free" | "coins" | "polar" | "pro" | "admin";
          acquired_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_skins"]["Row"],
          "acquired_at"
        > & { acquired_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_skins"]["Row"]>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string | null;
          polar_order_id: string;
          polar_product_id: string | null;
          product_slug: string | null;
          amount_cents: number | null;
          currency: string | null;
          payload: unknown;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["purchases"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Row"]>;
      };
      ai_hint_log: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ai_hint_log"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["ai_hint_log"]["Row"]>;
      };
    };
  };
};
