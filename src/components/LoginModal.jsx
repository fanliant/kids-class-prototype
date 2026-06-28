import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { modalOpen, setModalOpen, login, registerParent, registerInstructor, handleAuthSuccess } = useAuth();
  const navigate = useNavigate();

  // step 1: 'choice'(登入 or 注册)
  // step 2a: 'login'
  // step 2b: 'register_role'(選家長 or 老師)
  // step 3a: 'register_parent'
  // step 3b: 'register_instructor'
  const [step, setStep] = useState('choice');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  if (!modalOpen) return null;

  function reset() {
    setStep('choice');
    setEmail(''); setPassword(''); setName(''); setPhone(''); setInviteCode(''); setError('');
  }

  function handleClose() { setModalOpen(false); reset(); }

  function afterAuth(role) {
    reset();
    handleAuthSuccess();
    if (role === 'owner')   navigate('/owner');
    else if (role === 'teacher') navigate('/teacher');
    else if (role === 'parent')  navigate('/home');
  }

  function handleLogin(e) {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.error) { setError(result.error); return; }
    afterAuth(result.role);
  }

  function handleRegisterParent(e) {
    e.preventDefault();
    setError('');
    const result = registerParent(email, password, name, phone);
    if (result.error) { setError(result.error); return; }
    afterAuth(result.role);
  }

  function handleRegisterInstructor(e) {
    e.preventDefault();
    setError('');
    const result = registerInstructor(email, password, name, phone, inviteCode);
    if (result.error) { setError(result.error); return; }
    afterAuth(result.role);
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* ── Step 1:选择登入或注册 ── */}
        {step === 'choice' && (
          <>
            <h2 style={{ marginBottom: 4 }}>欢迎</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 20 }}>
              请问您是第一次使用,还是已经有帐号?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="full" onClick={() => setStep('login')}>我已有帐号,直接登入</button>
              <button className="secondary full" onClick={() => setStep('register_role')}>第一次使用,建立帐号</button>
            </div>
          </>
        )}

        {/* ── Step 2a:登入 ── */}
        {step === 'login' && (
          <>
            <h2 style={{ marginBottom: 4 }}>登入</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
              家长与老师使用同一个登入入口,系统会自动识别您的身份。
            </p>
            {error && <div className="banner banner-error">{error}</div>}
            <form onSubmit={handleLogin}>
              <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>密码<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <button className="full" type="submit">登入</button>
            </form>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>测试帐号</div>
              <div>家长:demo@parent.com / demo1234</div>
              <div>老师(Mira):mira@example.com / mira1234</div>
              <div>老师(David):david@example.com / david1234</div>
            </div>
            <button className="secondary full" onClick={() => setStep('choice')} style={{ marginTop: 14 }}>← 返回</button>
          </>
        )}

        {/* ── Step 2b:选择角色 ── */}
        {step === 'register_role' && (
          <>
            <h2 style={{ marginBottom: 4 }}>建立帐号</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 20 }}>
              请问您是以什么身份使用这个平台?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="full" onClick={() => setStep('register_parent')}>
                👪 我是家长,帮孩子报名课程
              </button>
              <button className="secondary full" onClick={() => setStep('register_instructor')}>
                👩‍🏫 我是老师/机构,要管理课程
              </button>
            </div>
            <button className="secondary full" onClick={() => setStep('choice')} style={{ marginTop: 14 }}>← 返回</button>
          </>
        )}

        {/* ── Step 3a:家长注册 ── */}
        {step === 'register_parent' && (
          <>
            <h2 style={{ marginBottom: 4 }}>建立家长帐号</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
              建立后即可帮孩子建档、搜寻并报名课程。
            </p>
            {error && <div className="banner banner-error">{error}</div>}
            <form onSubmit={handleRegisterParent}>
              <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>姓名<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>电话<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="425-555-0100" /></label>
              <label>密码<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <button className="full" type="submit">建立帐号并继续</button>
            </form>
            <button className="secondary full" onClick={() => setStep('register_role')} style={{ marginTop: 10 }}>← 返回</button>
          </>
        )}

        {/* ── Step 3b:老师注册 ── */}
        {step === 'register_instructor' && (
          <>
            <h2 style={{ marginBottom: 4 }}>建立老师帐号</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
              建立老师帐号需要平台提供的邀请码。如果您还没有邀请码,请联络平台取得。
            </p>
            {error && <div className="banner banner-error">{error}</div>}
            <form onSubmit={handleRegisterInstructor}>
              <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>姓名<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>电话<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="425-555-0100" /></label>
              <label>密码<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <label>
                老师邀请码
                <input required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="例如:LILY2026" style={{ letterSpacing: '0.05em' }} />
              </label>
              <button className="full" type="submit">建立帐号并继续</button>
            </form>
            <button className="secondary full" onClick={() => setStep('register_role')} style={{ marginTop: 10 }}>← 返回</button>
          </>
        )}

      </div>
    </div>
  );
}
