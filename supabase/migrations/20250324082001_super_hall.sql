/*
  # Initial Schema Setup for Gaming Group Manager

  1. New Tables
    - users
      - Custom user profile data
    - groups
      - Gaming groups information
    - group_members
      - Group membership and roles
    - events
      - Calendar events for groups

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table for additional profile information
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Gaming groups
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  game text NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Group members and their roles
CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Calendar events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Anyone can read groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Group members policies
CREATE POLICY "Members can see group membership"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage group membership"
  ON group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_members.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Group members can read events"
  ON events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = events.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = events.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = events.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );