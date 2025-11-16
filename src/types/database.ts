/**
 * Database Type Definitions
 * Auto-generated types for Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          firebase_uid: string;
          phone_number: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'customer' | 'chef' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firebase_uid: string;
          phone_number: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'chef' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firebase_uid?: string;
          phone_number?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'chef' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      chefs: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          specialties: string[];
          experience_years: number;
          hourly_rate: number;
          rating: number;
          total_bookings: number;
          is_verified: boolean;
          is_available: boolean;
          location: string | null;
          portfolio_images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          specialties?: string[];
          experience_years?: number;
          hourly_rate?: number;
          rating?: number;
          total_bookings?: number;
          is_verified?: boolean;
          is_available?: boolean;
          location?: string | null;
          portfolio_images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          specialties?: string[];
          experience_years?: number;
          hourly_rate?: number;
          rating?: number;
          total_bookings?: number;
          is_verified?: boolean;
          is_available?: boolean;
          location?: string | null;
          portfolio_images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          chef_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          special_requests: string | null;
          cuisine_type: string | null;
          number_of_guests: number;
          location: string;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          chef_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          special_requests?: string | null;
          cuisine_type?: string | null;
          number_of_guests: number;
          location: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          chef_id?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount?: number;
          special_requests?: string | null;
          cuisine_type?: string | null;
          number_of_guests?: number;
          location?: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          chef_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          chef_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          chef_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'customer' | 'chef' | 'admin';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_status: 'pending' | 'paid' | 'refunded';
    };
  };
}
