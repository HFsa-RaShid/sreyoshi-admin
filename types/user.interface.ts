export interface IUserPreferences {
  language: string;
  orderNotifications: boolean;
  promotionalAlerts: boolean;
  smsAlerts: boolean;
  marketingEmails: boolean;
}

export interface IActiveSession {
  _id?: string;
  device: string;
  location: string;
  lastActive: string | Date;
}

export interface IUser {
  _id?: string;
  name: string;
  phone: string; 
  email?: string; 
  role: 'user' | 'admin';
  status: 'active' | 'blocked'
  profileImage?: string;
  isSocialLogin?: boolean;
  preferences: IUserPreferences;
  activeSessions: IActiveSession[];
  accessToken?: string;  
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
}