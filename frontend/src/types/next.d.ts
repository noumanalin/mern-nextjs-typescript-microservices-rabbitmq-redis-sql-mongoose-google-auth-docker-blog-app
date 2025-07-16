import { ReactNode } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedIn: string;
  github: string;
  bio: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcountent: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}
