export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface Event {
  id: string;
  group_id: string;
  title: string;
  description: string;
  game: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
}