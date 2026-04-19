export interface UserFolder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  is_trashed: boolean;
}

export interface UserFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  user_id: string;
  folder_id: string | null;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  is_trashed: boolean;
  version: number;
  permission: 'view' | 'edit';
  updated_at?: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  file_url: string;
  version_number: number;
  created_at: string;
  created_by: string;
}

export interface AuthUser {
  id: string;
  email?: string;
}
