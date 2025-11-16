-- ChefConnect Database Schema
-- Run this SQL in your Supabase SQL Editor to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'chef', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chefs Table
CREATE TABLE IF NOT EXISTS chefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    location TEXT,
    portfolio_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chef_id UUID REFERENCES chefs(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    special_requests TEXT,
    cuisine_type TEXT,
    number_of_guests INTEGER NOT NULL,
    location TEXT NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chef_id UUID REFERENCES chefs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_chefs_user_id ON chefs(user_id);
CREATE INDEX IF NOT EXISTS idx_chefs_rating ON chefs(rating DESC);
CREATE INDEX IF NOT EXISTS idx_chefs_available ON chefs(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_chef ON bookings(chef_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_chef ON reviews(chef_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chefs_updated_at BEFORE UPDATE ON chefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update chef rating when a new review is added
CREATE OR REPLACE FUNCTION update_chef_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chefs
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE chef_id = NEW.chef_id
    )
    WHERE id = NEW.chef_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update chef rating on new review
CREATE TRIGGER trigger_update_chef_rating
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_chef_rating();

-- Function to increment total bookings for chef
CREATE OR REPLACE FUNCTION increment_chef_bookings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE chefs
        SET total_bookings = total_bookings + 1
        WHERE id = NEW.chef_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment bookings count
CREATE TRIGGER trigger_increment_chef_bookings
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION increment_chef_bookings();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

-- Chefs table policies
CREATE POLICY "Anyone can view chef profiles" ON chefs
    FOR SELECT USING (true);

CREATE POLICY "Chefs can update own profile" ON chefs
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    );

CREATE POLICY "Users can create chef profile" ON chefs
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    );

-- Bookings table policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        customer_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
        OR chef_id IN (SELECT id FROM chefs WHERE user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text))
    );

CREATE POLICY "Customers can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    );

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (
        customer_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
        OR chef_id IN (SELECT id FROM chefs WHERE user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text))
    );

-- Reviews table policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON reviews
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
        AND booking_id IN (SELECT id FROM bookings WHERE customer_id = customer_id)
    );

CREATE POLICY "Customers can update own reviews" ON reviews
    FOR UPDATE USING (
        customer_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text)
    );
