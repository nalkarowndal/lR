import React, { useState, useEffect, createContext, useContext, type ReactNode, useCallback } from 'react';
import { api, setAuthToken } from '../services/api';

export type ViewState = 
  | 'SHOP_MAIN' 
  | 'SHOP_CATEGORY' 
  | 'SHOP_SELL' 
  | 'SHOP_MY_PAGE' 
  | 'SHOP_SETTINGS' 
  | 'SHOP_ADMIN' 
  | 'RECRUIT_APP';

export type Role = 'STORE' | 'ADMIN';
export type OverlayState = 'SEARCH' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'PASSWORD_RESET' | 'PROFILE_EDIT' | null;
export type TransitionDirection = 'forward' | 'backward' | 'none';

export interface UserSettings {
  service_notifications: boolean;
  marketing_notifications: boolean;
  product_notifications: boolean;
  reduce_animations: boolean;
  theme: 'light' | 'dark';
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar_url?: string;
  oauth_accounts?: string[];
  is_oauth_user?: boolean;
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
  transitionDirection: TransitionDirection;
  navigateTo: (view: ViewState) => void;
  goBack: (fallbackView?: ViewState) => void;
  returnFromAdmin: (fallbackView?: ViewState) => void;
  isNavigating: boolean;
  
  activeOverlay: OverlayState;
  setActiveOverlay: React.Dispatch<React.SetStateAction<OverlayState>>;
  
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthLoading: boolean;
  logoutUser: () => Promise<void>;
  checkUserAuth: () => Promise<User | null>;
  
  userSettings: UserSettings;
  updateUserSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  
  favorites: number[];
  toggleFavorite: (productId: number) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;

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
  const [viewHistory, setViewHistory] = useState<ViewState[]>(['SHOP_MAIN']);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('none');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const [activeOverlay, setActiveOverlay] = useState<OverlayState>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [role, setRole] = useState<Role>('STORE');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    service_notifications: true,
    marketing_notifications: false,
    product_notifications: true,
    reduce_animations: false,
    theme: 'light'
  });

  const [favorites, setFavorites] = useState<number[]>([]);

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

  // Navigate with directional animation & debounce lock
  const navigateTo = useCallback((view: ViewState) => {
    if (view === currentView) return;
    setIsNavigating(true);
    setTransitionDirection('forward');
    setCurrentView(view);
    setViewHistory(prev => {
      // If entering SHOP_ADMIN, record it while preserving the prior consumer navigation stack
      if (view === 'SHOP_ADMIN') {
        const cleaned = prev.filter(v => v !== 'SHOP_ADMIN');
        return [...cleaned, 'SHOP_ADMIN'];
      }
      // If navigating to a consumer view, purge SHOP_ADMIN from history
      const cleaned = prev.filter(v => v !== 'SHOP_ADMIN');
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] === view) {
        return cleaned;
      }
      return [...cleaned, view];
    });

    setTimeout(() => {
      setIsNavigating(false);
    }, 280);
  }, [currentView]);

  // Return from Admin dashboard to the consumer app cleanly without leaving SHOP_ADMIN in back-history
  const returnFromAdmin = useCallback((fallbackView: ViewState = 'SHOP_SETTINGS') => {
    setIsNavigating(true);
    setTransitionDirection('backward');

    setViewHistory(prev => {
      // Filter out all SHOP_ADMIN occurrences
      const cleaned = prev.filter(v => v !== 'SHOP_ADMIN');
      if (cleaned.length > 0) {
        const lastView = cleaned[cleaned.length - 1];
        setCurrentView(lastView);
        return cleaned;
      }
      // Fallback if history had no previous views
      setCurrentView(fallbackView);
      return fallbackView === 'SHOP_MAIN' ? ['SHOP_MAIN'] : ['SHOP_MAIN', fallbackView];
    });

    setTimeout(() => {
      setIsNavigating(false);
    }, 250);
  }, []);

  // Go back with reverse animation (never navigate back into administrative views)
  const goBack = useCallback((fallbackView: ViewState = 'SHOP_MAIN') => {
    setIsNavigating(true);
    setTransitionDirection('backward');

    setViewHistory(prev => {
      // 1. Remove all admin views from history stack - back button in consumer app must never open admin
      let validHistory = prev.filter(v => v !== 'SHOP_ADMIN');

      // 2. Remove currentView from the top of the stack to navigate to the previous view
      if (validHistory.length > 0 && validHistory[validHistory.length - 1] === currentView) {
        validHistory.pop();
      } else if (validHistory.length > 1) {
        validHistory.pop();
      }

      // 3. Remove consecutive duplicate of currentView if any
      while (validHistory.length > 0 && validHistory[validHistory.length - 1] === currentView) {
        validHistory.pop();
      }

      // If no valid history remains, land on fallbackView
      if (validHistory.length === 0) {
        setCurrentView(fallbackView);
        return [fallbackView];
      }

      const targetView = validHistory[validHistory.length - 1];
      setCurrentView(targetView);
      return validHistory;
    });

    setTimeout(() => {
      setIsNavigating(false);
    }, 250);
  }, [currentView]);

  const checkUserAuth = async (): Promise<User | null> => {
    try {
      setIsAuthLoading(true);
      const res = await api.getMyProfile();
      if (res?.success && res.profile) {
        const authedUser: User = {
          id: res.profile.id,
          email: res.profile.email,
          name: res.profile.name,
          role: res.profile.role,
          phone: res.profile.phone,
          avatar_url: res.profile.avatar_url,
          oauth_accounts: res.profile.oauth_accounts,
          is_oauth_user: res.profile.is_oauth_user
        };
        setUser(authedUser);
        if (res.profile.settings) {
          setUserSettings(res.profile.settings);
        }
        return authedUser;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      // Fallback: check basic session
      try {
        const basicRes = await api.getMe();
        if (basicRes?.success && basicRes.user) {
          setUser(basicRes.user);
          return basicRes.user;
        } else {
          setUser(null);
          return null;
        }
      } catch {
        setUser(null);
        return null;
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch {
      setAuthToken(null);
    } finally {
      setUser(null);
      setFavorites([]);
    }
  };

  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    const previous = { ...userSettings };
    setUserSettings(prev => ({ ...prev, ...newSettings }));
    if (user) {
      try {
        const res = await api.updateMySettings(newSettings);
        if (res?.success && res.settings) {
          setUserSettings(res.settings);
        }
      } catch (err) {
        console.warn('[AppContext] Failed to persist user settings:', err);
        // Rollback to previous state on persistence failure
        setUserSettings(previous);
        throw err;
      }
    }
  };

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await api.getMyFavorites();
      if (res?.success && Array.isArray(res.favorites)) {
        setFavorites(res.favorites.map(f => f.id));
      }
    } catch {
      // Offline fallback
    }
  };

  const toggleFavorite = async (productId: number): Promise<boolean> => {
    if (!user) {
      setActiveOverlay('LOGIN');
      return false;
    }

    const isFav = favorites.includes(productId);
    const previousFavorites = [...favorites];
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== productId));
      try {
        await api.removeFavorite(productId);
        return false;
      } catch (err) {
        setFavorites(previousFavorites); // Revert on error
        console.error('[AppContext] Failed to remove favorite:', err);
        throw err;
      }
    } else {
      setFavorites(prev => [...prev, productId]);
      try {
        await api.addFavorite(productId);
        return true;
      } catch (err) {
        setFavorites(previousFavorites); // Revert on error
        console.error('[AppContext] Failed to add favorite:', err);
        throw err;
      }
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.includes(productId);
  };

  // Load and synchronize data from Node.js backend
  const refreshData = async () => {
    try {
      const health = await api.checkHealth();
      if (!health) {
        setIsBackendConnected(false);
        setIsAuthLoading(false);
        return;
      }
      setIsBackendConnected(true);

      // 0. Check Auth Session
      const currentUser = await checkUserAuth();

      // 1. Products (Publicly accessible)
      try {
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
      } catch (err) {
        console.warn('[AppContext] Failed to fetch products:', err);
      }

      // 2. Admin Datasets: only fetch when logged in as ADMIN
      // This strictly prevents 403 Forbidden errors for regular customers or guests
      if (currentUser?.role === 'ADMIN') {
        try {
          const recruitRes = await api.getRecruitRequests();
          if (recruitRes?.success && Array.isArray(recruitRes.data)) {
            setRequests(recruitRes.data);
          }
        } catch (err) {
          console.warn('[AppContext] Admin recruit fetch notice:', err);
        }

        try {
          const workersRes = await api.getWorkers();
          if (workersRes?.success && Array.isArray(workersRes.data)) {
            setWorkerDB(workersRes.data.map(w => ({ ...w, checked: true })));
          }
        } catch (err) {
          console.warn('[AppContext] Admin workers fetch notice:', err);
        }

        try {
          const msgsRes = await api.getMessages();
          if (msgsRes?.success && Array.isArray(msgsRes.data)) {
            setMessages(msgsRes.data);
          }
        } catch (err) {
          console.warn('[AppContext] Admin messages fetch notice:', err);
        }
      }
    } catch (err: any) {
      console.warn('[AppContext] refreshData error:', err);
      // Only set backend disconnected if health check fails or a network connection failure occurs
      const isConnectionIssue = !navigator.onLine || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError');
      if (isConnectionIssue) {
        setIsBackendConnected(false);
      }
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__lrNavigate = navigateTo;
      (window as any).__lrReturnFromAdmin = returnFromAdmin;
      (window as any).__lrGoBack = goBack;
      (window as any).__lrSetOverlay = (overlay: any) => {
        if (overlay === 'PASSWORD_RESET') {
          setActiveOverlay('FORGOT_PASSWORD');
        } else {
          setActiveOverlay(overlay);
        }
      };
      (window as any).__lrSetUser = setUser;
    }
  }, [navigateTo, returnFromAdmin, goBack, setActiveOverlay]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ 
      currentView, setCurrentView, transitionDirection, navigateTo, goBack, returnFromAdmin, isNavigating,
      activeOverlay, setActiveOverlay,
      user, setUser, isAuthLoading, logoutUser, checkUserAuth,
      userSettings, updateUserSettings,
      favorites, toggleFavorite, isFavorite,
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
