/*
  # Update schema for gaming groups

  1. Changes
    - Remove game field from groups table
    - Add game field to events table
    - Update group_members role to include leader
    - Add leader_id to groups table

  2. Security
    - Update RLS policies for new structure
*/

-- Update groups table
ALTER TABLE groups
DROP COLUMN game,
ADD COLUMN leader_id uuid REFERENCES users(id) NOT NULL;

-- Update events table
ALTER TABLE events
ADD COLUMN game text NOT NULL;

-- Update group_members role type
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_role_check;

ALTER TABLE group_members
ADD CONSTRAINT group_members_role_check 
CHECK (role = ANY (ARRAY['leader'::text, 'member'::text]));

-- Update RLS policies
DROP POLICY IF EXISTS "Group leaders can update groups" ON groups;
CREATE POLICY "Group leaders can update groups"
ON groups
FOR UPDATE
TO authenticated
USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Group leaders can manage members" ON group_members;
CREATE POLICY "Group leaders can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.leader_id = auth.uid()
  )
);