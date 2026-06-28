import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockEnrollments } from '../mockData';
import { load, save, KEYS } from '../utils/storage';

const AuthContext = createContext(null);

const INVITE_CODES = {
  'MIRA2026':  'mira-piano',
  'DAVID2026': 'david-swim',
  'LILY2026':  'lily-chinese',
};

const seedAccounts = {
  'demo@parent.com':  { password: 'demo1234',  name: 'Grace',      phone: '425-555-0101', role: 'parent',  children: [{ id: 'c1', name: '林小美', age: 6 }, { id: 'c17', name: '小宇', age: 10 }] },
  'mira@example.com': { password: 'mira1234',  name: 'Mira Chen',  phone: '425-555-0201', role: 'owner',   instructorId: 'mira-piano'  },
  'david@example.com':{ password: 'david1234', name: 'David Park', phone: '425-555-0301', role: 'owner',   instructorId: 'david-swim'  },
  'sarah@example.com':{ password: 'sarah1234', name: 'Sarah Lin',  phone: '425-555-0401', role: 'teacher', instructorId: 'mira-piano'  },
};

const ACCOUNTS_VERSION = 5;

export function AuthProvider({ children: appChildren }) {
  const [accounts, setAccounts] = useState(() => {
    const v = load('kcp_accounts_version', 0);
    if (v < ACCOUNTS_VERSION) {
      save('kcp_accounts_version', ACCOUNTS_VERSION);
      save(KEYS.ACCOUNTS, seedAccounts);
      return seedAccounts;
    }
    const stored = load(KEYS.ACCOUNTS, seedAccounts);
    // 确保每个owner/teacher账户都有instructorId
    const merged = { ...seedAccounts };
    Object.entries(stored).forEach(([email, acct]) => {
      if (seedAccounts[email]) {
        merged[email] = { ...seedAccounts[email], ...acct, instructorId: seedAccounts[email].instructorId };
      } else {
        merged[email] = acct;
      }
    });
    return merged;
  });
  const [currentEmail, setCurrentEmail] = useState(() => load(KEYS.CURRENT_USER, null));
  const [modalOpen,    setModalOpen]    = useState(false);
  const [pendingAction,setPendingAction]= useState(null);

  useEffect(() => { save(KEYS.ACCOUNTS, accounts); }, [accounts]);
  useEffect(() => { save(KEYS.CURRENT_USER, currentEmail); }, [currentEmail]);

  const user         = currentEmail ? { email: currentEmail, ...accounts[currentEmail] } : null;
  const isParent     = user?.role === 'parent';
  const isOwner      = user?.role === 'owner';
  const isTeacher    = user?.role === 'teacher';
  const isInstructor = isOwner || isTeacher;
  const parent       = isParent ? user : null;
  const instructor   = isInstructor ? user : null;

  // Demo快速登入：监听Nav发出的事件
  useEffect(() => {
    function handleDemoLogin(e) {
      const { email, password } = e.detail;
      const acct = accounts[email];
      if (acct && acct.password === password) {
        setCurrentEmail(email);
      }
    }
    window.addEventListener('demo-login', handleDemoLogin);
    return () => window.removeEventListener('demo-login', handleDemoLogin);
  }, [accounts]);

  function login(email, password) {
    const acct = accounts[email];
    if (!acct) return { error: '找不到这个帐号,请先注册。' };
    if (acct.password !== password) return { error: '密码不正确。' };
    setCurrentEmail(email);
    return { success: true, role: acct.role };
  }

  function registerParent(email, password, name, phone) {
    if (!email || !password || !name || !phone) return { error: '请完整填写所有栏位。' };
    if (accounts[email]) return { error: '这个Email已注册,请直接登入。' };
    setAccounts((prev) => ({ ...prev, [email]: { password, name, phone, role: 'parent', children: [] } }));
    setCurrentEmail(email);
    return { success: true, role: 'parent' };
  }

  function registerInstructor(email, password, name, phone, inviteCode) {
    if (!email || !password || !name || !phone || !inviteCode) return { error: '请完整填写所有栏位,包含邀请码。' };
    if (accounts[email]) return { error: '这个Email已注册,请直接登入。' };
    const instructorId = INVITE_CODES[inviteCode.trim().toUpperCase()];
    if (!instructorId) return { error: '邀请码不正确,请联络平台取得有效邀请码。' };
    const alreadyUsed = Object.values(accounts).some((a) => (a.role === 'owner' || a.role === 'teacher') && a.instructorId === instructorId);
    if (alreadyUsed) return { error: '这组邀请码已被使用,请联络平台。' };
    setAccounts((prev) => ({ ...prev, [email]: { password, name, phone, role: 'owner', instructorId } }));
    setCurrentEmail(email);
    return { success: true, role: 'owner' };
  }

  function logout() { setCurrentEmail(null); }

  function addChild(child) {
    if (!isParent) return;
    setAccounts((prev) => ({
      ...prev,
      [currentEmail]: { ...prev[currentEmail], children: [...(prev[currentEmail].children || []), child] },
    }));
  }

  function updateChild(childId, updates) {
    if (!isParent) return;
    setAccounts((prev) => ({
      ...prev,
      [currentEmail]: {
        ...prev[currentEmail],
        children: (prev[currentEmail].children || []).map(ch =>
          ch.id === childId ? { ...ch, ...updates } : ch
        ),
      },
    }));
  }

  function requireAuth(action) {
    if (user) { action(); } else { setPendingAction(() => action); setModalOpen(true); }
  }

  function handleAuthSuccess() {
    setModalOpen(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }

  return (
    <AuthContext.Provider value={{ user, parent, instructor, isParent, isOwner, isTeacher, isInstructor, login, registerParent, registerInstructor, logout, addChild, updateChild, requireAuth, modalOpen, setModalOpen, handleAuthSuccess }}>
      {appChildren}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
