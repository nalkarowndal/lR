import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { api, setAuthToken } from '../services/api';

export type ViewState = 'SHOP_MAIN' | 'SHOP_ADMIN' | 'RECRUIT_APP' | 'SHOP_CATEGORY' | 'SHOP_SELL';
export type Role = 'STORE' | 'ADMIN';
export type OverlayState = 'SEARCH' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | null;

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
}

export interface RecruitRequest {
  id: number;
  storeName: string;
  date: string;
  section: string;
  time: string;
  breakTime: string;
  required: number;
  hired: number;
  status: '채용중' | '완료';
  applicants?: string[];
  partner?: string;
}

export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
}

export interface Worker {
  id: number;
  name: string;
  phone: string;
  exp: string;
  checked?: boolean;
}

export interface Product {
  id: number;
  title: string;
  type: 'RENT' | 'BUY';
  price: number;
  brand?: string;
  category?: string;
  image_url?: string;
}

interface AppContextType {
  currentView: ViewState;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewState>>;
  activeOverlay: OverlayState;
  setActiveOverlay: React.Dispatch<React.SetStateAction<OverlayState>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoutUser: () => Promise<void>;
  checkUserAuth: () => Promise<void>;
  role: Role;
  setRole: React.Dispatch<React.SetStateAction<Role>>;
  requests: RecruitRequest[];
  setRequests: React.Dispatch<React.SetStateAction<RecruitRequest[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  workerDB: Worker[];
  setWorkerDB: React.Dispatch<React.SetStateAction<Worker[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isBackendConnected: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState<ViewState>('SHOP_MAIN');
  const [activeOverlay, setActiveOverlay] = useState<OverlayState>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('STORE');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Fallback initial data
  const [requests, setRequests] = useState<RecruitRequest[]>([
    { id: 1, storeName: '강남본점', date: '2026-10-31', section: '홀 서빙', time: '10:00 - 15:00', breakTime: '30분', required: 2, hired: 1, status: '채용중', applicants: ['김철수'], partner: '' },
    { id: 2, storeName: '홍대점', date: '2026-11-01', section: '카운터', time: '12:00 - 20:00', breakTime: '60분', required: 1, hired: 0, status: '채용중', applicants: [], partner: '김지인' }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: '강남본점', text: '오늘 저녁 구인 급합니다!', time: '10:30 AM', isMine: false }
  ]);

  const [products, setProducts] = useState<Product[]>([]);

  const [workerDB, setWorkerDB] = useState<Worker[]>([
    { id: 1, name: '김철수', phone: '010-1234-5678', exp: '홀 1년', checked: true },
    { id: 2, name: '이영희', phone: '010-8765-4321', exp: '주방 3년', checked: true },
  ]);

  const checkUserAuth = async () => {
    try {
      const res = await api.getMe();
      if (res?.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch {
      setAuthToken(null);
    } finally {
      setUser(null);
    }
  };

  // Load and synchronize data from Node.js backend
  const refreshData = async () => {
    try {
      const health = await api.checkHealth();
      if (!health) {
        setIsBackendConnected(false);
        return;
      }
      setIsBackendConnected(true);

      // 0. Check Auth Session
      await checkUserAuth();

      // 1. Products
      const prodsRes = await api.getProducts();
      if (prodsRes?.success && Array.isArray(prodsRes.data)) {
        setProducts(prodsRes.data.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          price: p.price,
          brand: p.brand,
          category: p.category,
          image_url: p.image_url
        })));
      }

      // 2. Recruit Requests
      const recruitRes = await api.getRecruitRequests();
      if (recruitRes?.success && Array.isArray(recruitRes.data)) {
        setRequests(recruitRes.data);
      }

      // 3. Workers
      const workersRes = await api.getWorkers();
      if (workersRes?.success && Array.isArray(workersRes.data)) {
        setWorkerDB(workersRes.data.map(w => ({ ...w, checked: true })));
      }

      // 4. Messages
      const msgsRes = await api.getMessages();
      if (msgsRes?.success && Array.isArray(msgsRes.data)) {
        setMessages(msgsRes.data);
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppContext.Provider value={{ 
      currentView, setCurrentView, activeOverlay, setActiveOverlay,
      user, setUser, logoutUser, checkUserAuth,
      role, setRole, requests, setRequests, messages, setMessages, 
      workerDB, setWorkerDB, products, setProducts, isBackendConnected, refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
