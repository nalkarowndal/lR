import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { AppProvider, useApp } from '../src/context/AppContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ProtectedAdminView } from '../src/components/navigation/ProtectedAdminView';
import { ShopMyPage } from '../src/components/ShopMyPage';
import { ShopAdmin } from '../src/components/ShopAdmin';
import {
  D1SplashCrownIcon, D1RentIcon, D1BuyIcon, D1SellIcon
} from '../src/components/icons/BoutiqueD1Icons';
import { D2Icon, D2_ICONOIR_PATHS, type D2Glyph } from '../src/components/icons/BoutiqueD2Icons';
import { D22Icon, type D22Glyph } from '../src/components/icons/BoutiqueD22Icons';

/**
 * DEVELOPMENT ONLY: isolated visual QA for UI components, not a login route.
 * No backend credentials or authentication bypass. This standalone entry is
 * never imported by src/main.tsx and is excluded from production Vite entry.
 */
const parameters = new URLSearchParams(window.location.search);
const view = parameters.get('view') || 'gallery';

const shades = {
  graphite: '#302D29', ivory: '#F8F6F2',
  gold: '#AA8250', black: '#101215',
};

const d1: { id: string; title: string; component: React.ComponentType<{ size?: number }> }[] = [
  { id: 'crown', title: 'D1 · 스플래시', component: D1SplashCrownIcon },
  { id: 'shirt', title: 'D1 · 렌트', component: D1RentIcon },
  { id: 'handbag', title: 'D1 · 구매', component: D1BuyIcon },
  { id: 'shopping-bag-arrow-up', title: 'D1 · 판매', component: D1SellIcon },
];

const d22Glyphs: D22Glyph[] = [
  'nav-arrow-left', 'nav-arrow-right', 'search', 'settings', 'heart',
  'chat-bubble', 'cart', 'shopping-bag', 'warning-circle', 'check-circle',
  'lock', 'bell', 'user-circle', 'package', 'badge-check', 'medal',
  'trash', 'edit-pencil', 'plus-circle', 'refresh-double',
];
const opticalSizes = [16, 20, 24, 32, 48, 72];

function OpticalGallery() {
  const totalD2 = useMemo(() => Object.keys(D2_ICONOIR_PATHS) as D2Glyph[], []);
  return (
    <main id="qa-gallery" style={{ background: shades.ivory, padding: 24, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 25, fontWeight: 800, color: shades.graphite }}>luxuryRental · D2-3</h1>
      <p style={{ fontSize: 13, color: '#72675A', margin: '12px 0 24px' }}>
        Actual D1/D2-1/D2-2 React SVG components · 16 / 20 / 24 / 32 / 48 / 72 px · no re-drawn samples
      </p>
      <div id="qa-optical-table" style={{ minWidth: 850 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', gap: 4, fontSize: 12, marginBottom: 8 }}>
          <b>ICON</b>{opticalSizes.map(size => <b key={size} style={{ textAlign: 'center' }}>{size}px</b>)}
        </div>
        {d1.map(({id,title,component: Component}) => (
          <div key={id} data-qa-row={id} style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', gap: 4, marginBottom: 5 }}>
            <div style={{ alignSelf: 'center', fontSize: 12, fontWeight: 700 }}>{title}</div>
            {opticalSizes.map(size => (
              <div key={size} style={{ background: id === 'crown' ? shades.black : '#FFFFFF', minHeight: 100, display: 'grid', placeItems: 'center', border: '1px solid #E8E4DD' }}>
                <Component size={size}/>
              </div>
            ))}
          </div>
        ))}
        {totalD2.map(glyph => (
          <div key={glyph} data-qa-row={glyph} style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', gap: 4, marginBottom: 5 }}>
            <div style={{ alignSelf: 'center', fontSize: 12, fontWeight: 700 }}>D2 · {glyph}</div>
            {opticalSizes.map(size => (
              <div key={size} style={{ background: glyph==='gift'||glyph==='crown' ? shades.black : '#FFFFFF', minHeight: 100, display: 'grid', placeItems: 'center', border: '1px solid #E8E4DD' }}>
                <D2Icon glyph={glyph} size={size} finish={glyph==='gift'||glyph==='crown'?'atelier':'boutique'}/>
              </div>
            ))}
          </div>
        ))}
        {d22Glyphs.map(glyph => (
          <div key={glyph} data-qa-row={glyph} style={{ display: 'grid', gridTemplateColumns: '160px repeat(6, 1fr)', gap: 4, marginBottom: 5 }}>
            <div style={{ alignSelf: 'center', fontSize: 12, fontWeight: 700 }}>D2-2 · {glyph}</div>
            {opticalSizes.map(size => (
              <div key={size} style={{ background: glyph==='badge-check'||glyph==='medal'?shades.black:'#FFFFFF', minHeight: 100, display: 'grid', placeItems: 'center', border: '1px solid #E8E4DD' }}>
                <D22Icon glyph={glyph} size={size} finish={glyph==='badge-check'||glyph==='medal'?'atelier':'boutique'} style={{ color:shades.graphite }}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

function MockIdentity() {
  const {isAppReady,isAuthLoading,setUser,user} = useApp();
  useEffect(() => {
    if (isAppReady) setUser({id:-93182,name:'디자인 QA 사용자',email:'visual-qa@example.invalid',role:view==='admin'?'ADMIN':'USER'});
  }, [isAppReady,setUser]);
  if (!isAppReady || isAuthLoading || !user) {
    return <div id="qa-booting" style={{ padding:24 }}>격리된 시각 QA 구성 중…</div>;
  }
  return (
    <main id="qa-authenticated-component" data-qa-view={view} style={{ minHeight:'100vh', background:view==='admin'?'#101215':'#FFFFFF' }}>
      {view==='admin'
        ? <ProtectedAdminView><ShopAdmin /></ProtectedAdminView>
        : <div style={{ maxWidth:430, width:'100%', margin:'auto',height:'100vh',overflow:'hidden' }}><ShopMyPage /></div>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  view === 'gallery' ? <OpticalGallery /> :
  <AppProvider><ToastProvider><MockIdentity /></ToastProvider></AppProvider>
);
