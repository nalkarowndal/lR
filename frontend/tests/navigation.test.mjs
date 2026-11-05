import test from 'node:test';
import assert from 'node:assert/strict';

// Navigation state machine simulator replicating AppContext logic exactly
class NavigationManager {
  constructor(initialView = 'SHOP_MAIN') {
    this.currentView = initialView;
    this.viewHistory = [initialView];
  }

  navigateTo(view) {
    if (view === this.currentView) return;
    this.currentView = view;
    
    // Exact logic from AppContext.tsx
    if (view === 'SHOP_ADMIN') {
      const cleaned = this.viewHistory.filter(v => v !== 'SHOP_ADMIN');
      this.viewHistory = [...cleaned, 'SHOP_ADMIN'];
    } else {
      const cleaned = this.viewHistory.filter(v => v !== 'SHOP_ADMIN');
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] === view) {
        this.viewHistory = cleaned;
      } else {
        this.viewHistory = [...cleaned, view];
      }
    }
  }

  returnFromAdmin(fallbackView = 'SHOP_SETTINGS') {
    // Exact logic from AppContext.tsx
    const cleaned = this.viewHistory.filter(v => v !== 'SHOP_ADMIN');
    if (cleaned.length > 0) {
      const lastView = cleaned[cleaned.length - 1];
      this.currentView = lastView;
      this.viewHistory = cleaned;
      return;
    }
    this.currentView = fallbackView;
    this.viewHistory = fallbackView === 'SHOP_MAIN' ? ['SHOP_MAIN'] : ['SHOP_MAIN', fallbackView];
  }

  goBack(fallbackView = 'SHOP_MAIN') {
    // Exact logic from AppContext.tsx
    let validHistory = this.viewHistory.filter(v => v !== 'SHOP_ADMIN');

    if (validHistory.length > 0 && validHistory[validHistory.length - 1] === this.currentView) {
      validHistory.pop();
    } else if (validHistory.length > 1) {
      validHistory.pop();
    }

    while (validHistory.length > 0 && validHistory[validHistory.length - 1] === this.currentView) {
      validHistory.pop();
    }

    if (validHistory.length === 0) {
      this.currentView = fallbackView;
      this.viewHistory = [fallbackView];
      return;
    }

    const targetView = validHistory[validHistory.length - 1];
    this.currentView = targetView;
    this.viewHistory = validHistory;
  }
}

test('Bug Fix: Super Admin settings -> dashboard -> return to app -> back button goes to SHOP_MAIN (NOT SHOP_ADMIN)', () => {
  const nav = new NavigationManager('SHOP_MAIN');
  assert.equal(nav.currentView, 'SHOP_MAIN');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN']);

  // 1. 최고 관리자가 메인 화면에서 설정을 클릭
  nav.navigateTo('SHOP_SETTINGS');
  assert.equal(nav.currentView, 'SHOP_SETTINGS');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN', 'SHOP_SETTINGS']);

  // 2. 설정 화면에서 대시보드 진입 버튼 클릭
  nav.navigateTo('SHOP_ADMIN');
  assert.equal(nav.currentView, 'SHOP_ADMIN');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN', 'SHOP_SETTINGS', 'SHOP_ADMIN']);

  // 3. 관리자 대시보드에서 '앱으로 돌아가기' 클릭
  nav.returnFromAdmin('SHOP_SETTINGS');
  assert.equal(nav.currentView, 'SHOP_SETTINGS');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN', 'SHOP_SETTINGS']);
  assert.ok(!nav.viewHistory.includes('SHOP_ADMIN'), 'SHOP_ADMIN must not pollute history');

  // 4. 설정 화면에서 좌측 상단 뒤로가기 버튼 클릭 (<ArrowLeft size={22} />)
  nav.goBack('SHOP_MAIN');
  assert.equal(nav.currentView, 'SHOP_MAIN', 'Must return to SHOP_MAIN, NOT SHOP_ADMIN!');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN']);
});

test('Safety: Even if legacy navigateTo was invoked, goBack never returns to SHOP_ADMIN', () => {
  const nav = new NavigationManager('SHOP_MAIN');
  nav.navigateTo('SHOP_SETTINGS');
  nav.navigateTo('SHOP_ADMIN');

  // Simulated legacy navigateTo call instead of returnFromAdmin
  nav.navigateTo('SHOP_SETTINGS');
  assert.equal(nav.currentView, 'SHOP_SETTINGS');
  assert.ok(!nav.viewHistory.includes('SHOP_ADMIN'), 'navigateTo cleanly stripped SHOP_ADMIN');

  // Back button in settings
  nav.goBack('SHOP_MAIN');
  assert.equal(nav.currentView, 'SHOP_MAIN', 'Directly lands on SHOP_MAIN');
});

test('Navigation from MyPage: MyPage -> Admin -> returnFromAdmin -> goBack -> Main', () => {
  const nav = new NavigationManager('SHOP_MAIN');
  nav.navigateTo('SHOP_MY_PAGE');
  nav.navigateTo('SHOP_ADMIN');
  assert.equal(nav.currentView, 'SHOP_ADMIN');

  nav.returnFromAdmin('SHOP_SETTINGS');
  assert.equal(nav.currentView, 'SHOP_MY_PAGE', 'Restores to prior page user came from');
  
  nav.goBack('SHOP_MAIN');
  assert.equal(nav.currentView, 'SHOP_MAIN');
});

test('Direct entry to Admin fallback: Admin -> returnFromAdmin -> goBack', () => {
  const nav = new NavigationManager('SHOP_ADMIN');
  nav.returnFromAdmin('SHOP_SETTINGS');
  assert.equal(nav.currentView, 'SHOP_SETTINGS');
  assert.deepEqual(nav.viewHistory, ['SHOP_MAIN', 'SHOP_SETTINGS']);

  nav.goBack('SHOP_MAIN');
  assert.equal(nav.currentView, 'SHOP_MAIN');
});
