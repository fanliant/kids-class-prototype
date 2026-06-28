import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resetAllData } from '../utils/storage';

function WyloLogo() {
  return (
    <span style={{ display:'inline-flex', alignItems:'center' }}>
      <img
        src="/wylo-logo.jpeg"
        alt="WYLO"
        style={{ height: 28, width: 'auto', objectFit: 'contain' }}
        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='inline-flex'; }}
      />
      <span style={{ display:'none', alignItems:'center', fontFamily:'Sora, sans-serif', fontWeight:700, fontSize:20, color:'var(--amber)', letterSpacing:'-0.5px' }}>
        WYLO
      </span>
    </span>
  );
}

export default function Nav() {
  const { user, isParent, isOwner, isTeacher, logout, setModalOpen } = useAuth();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  function goToHome() {
    if (isOwner)        navigate('/owner');
    else if (isTeacher) navigate('/teacher');
    else if (isParent)  navigate('/home');
    else                navigate('/');
  }

  function handleReset() {
    if (window.confirm('重置所有示范资料？')) resetAllData();
  }

  // Demo快速入口：不需要登入直接看三个角色
  const demoAccounts = [
    { label: 'Mira Chen', role: 'Owner（工作室老板）', email: 'mira@example.com', password: 'mira1234', path: '/owner' },
    { label: 'Sarah Lin', role: 'Teacher（授课老师）', email: 'sarah@example.com', password: 'sarah1234', path: '/teacher' },
    { label: 'Demo Parent', role: '家长', email: 'demo@parent.com', password: 'demo1234', path: '/home' },
  ];

  return (
    <header className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <button onClick={goToHome} className="nav-brand" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <WyloLogo />
        </button>

        <nav className="nav-links">
          {isOwner && (
            <>
              <NavLink to="/owner"      className={({ isActive }) => isActive ? 'active' : ''}>首页</NavLink>
              <NavLink to="/operations" className={({ isActive }) => isActive ? 'active' : ''}>招生管理</NavLink>
              <NavLink to="/dashboard"  className={({ isActive }) => isActive ? 'active' : ''}>课程管理</NavLink>
              <NavLink to="/teachers"   className={({ isActive }) => isActive ? 'active' : ''}>老师管理</NavLink>
              <NavLink to="/website"    className={({ isActive }) => isActive ? 'active' : ''}>网页管理</NavLink>
              <NavLink to="/finance"    className={({ isActive }) => isActive ? 'active' : ''}>财务管理</NavLink>
            </>
          )}
          {isTeacher && (
            <>
              <NavLink to="/teacher"     className={({ isActive }) => isActive ? 'active' : ''}>首页</NavLink>
              <NavLink to="/dashboard"   className={({ isActive }) => isActive ? 'active' : ''}>课程管理</NavLink>
            </>
          )}
          {isParent && (
            <>
              <NavLink to="/home"        className={({ isActive }) => isActive ? 'active' : ''}>首页</NavLink>
              <NavLink to="/"            className={({ isActive }) => isActive ? 'active' : ''}>搜寻课程</NavLink>
              <NavLink to="/my-calendar" className={({ isActive }) => isActive ? 'active' : ''}>孩子课表</NavLink>
            </>
          )}
          {!user && (
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>搜寻课程</NavLink>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={handleReset} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--line)', borderRadius: 6, padding: '5px 10px', fontSize: 11.5 }}>
            重置资料
          </button>

          {/* Demo 快速切换 */}
          {!user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDemo(!showDemo)}
                style={{ background: '#00C9A7', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                🎯 Demo
              </button>
              {showDemo && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 220, zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>
                    选择角色直接进入 Demo
                  </div>
                  {demoAccounts.map((acc) => (
                    <button key={acc.email}
                      onClick={() => {
                        setShowDemo(false);
                        window.dispatchEvent(new CustomEvent('demo-login', { detail: acc }));
                        setTimeout(() => navigate(acc.path), 100);
                      }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--line)', cursor: 'pointer', fontSize: 13.5 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{acc.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{acc.role}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="nav-account">
            {user ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 2 }}>
                  {isOwner ? '👩‍💼' : isTeacher ? '👩‍🏫' : '👪'}
                </span>
                <span style={{ fontSize: 13.5 }}>{user.name}</span>
                <button onClick={logout}>登出</button>
              </>
            ) : (
              <button onClick={() => setModalOpen(true)} style={{ background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--line)', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>
                登入
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
