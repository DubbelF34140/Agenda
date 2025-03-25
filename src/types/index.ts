export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
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

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface GroupMember {
    group_id: string;
    user_id: string;
    role: Role;
    joined_at: string;
}

export interface Event {
    id: string;
    group: Group;
    title: string;
    description: string;
    gametype: Gametype;
    start_time: string;
    end_time: string;
    created_by: User;
    created_at: string;
}


export interface Gametype {
    id: string;
    game: string;
    NbTeams: number;
}