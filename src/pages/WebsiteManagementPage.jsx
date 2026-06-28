import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { instructors, studioTeachers, mockCurricula, mockLevels, mockClassOfferings, mockPricingPlans, mockTeachingTypes, mockSubjects } from '../mockData';

const defaultAnnouncements = [
  { id: 'a1', date: '2026-06-20', title: '🎹 秋季班报名开始！', body: '2026秋季钢琴课程现已开放报名，名额有限，欢迎尽早预约试课。', pinned: true },
  { id: 'a2', date: '2026-06-15', title: '🏆 学生参赛成果', body: 'JXC班的谢宗翰同学在6月RCM考级中获得Honors，恭喜！', pinned: false },
  { id: 'a3', date: '2026-06-01', title: '☀️ 暑期钢琴集训营', body: '7月14-25日，每天90分钟，还有3个名额！报名连结在课程页面。', pinned: false },
];

export default function WebsiteManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructor = instructors.find((i) => i.id === user?.instructorId);
  const studioUrl = `${window.location.origin}${window.location.pathname}#/school/${user?.instructorId}`;
  const myTeachers = studioTeachers.filter((t) => t.studioId === user?.instructorId);

  const [activeTab, setActiveTab] = useState('announcements');
  const [bio, setBio] = useState(instructor?.bio || '');
  const [highlights, setHighlights] = useState((instructor?.highlights || []).join('\n'));
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [bioSaved, setBioSaved] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPinned, setNewPinned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teacherProfiles, setTeacherProfiles] = useState(
    Object.fromEntries(myTeachers.map((t) => [t.id, { bio: t.bio || '', title: t.title || '' }]))
  );
  const [teacherSaved, setTeacherSaved] = useState({});

  // 工作室联络资讯
  const [studioContact, setStudioContact] = useState(() => {
    const defaults = {
      phone:    '425-555-0201',
      email:    'info@mirapianobellevue.com',
      address:  '1234 Main St, Suite 201, Bellevue, WA 98004',
      parking:  '停车场位于大楼B栋地下一层，前30分钟免费',
      hours:    '周一至周六 10:00–19:00，周日休息',
      website:  '',
      instagram:'',
      facebook: '',
      xiaohongshu: '',
      wechat:   '',
      youtube:  '',
      line:     '',
    };
    try {
      const saved = JSON.parse(localStorage.getItem('kcp_studio_contact') || 'null');
      return saved ? { ...defaults, ...saved } : defaults;
    } catch(e) { return defaults; }
  });
  const [contactSaved, setContactSaved] = useState(false);
  const [publicSearch, setPublicSearch] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kcp_public_search') ?? 'true'); } catch(e) { return true; }
  });

  function copyLink() {
    navigator.clipboard.writeText(studioUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  function addAnnouncement() {
    if (!newTitle.trim()) return;
    const a = { id: `a-${Date.now()}`, date: new Date().toISOString().slice(0, 10), title: newTitle, body: newBody, pinned: newPinned };
    const updated = [a, ...announcements];
    setAnnouncements(updated);
    try { localStorage.setItem('kcp_announcements', JSON.stringify(updated)); } catch(e) {}
    setNewTitle(''); setNewBody(''); setNewPinned(false); setShowNewForm(false);
  }

  function deleteAnnouncement(id) {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    try { localStorage.setItem('kcp_announcements', JSON.stringify(updated)); } catch(e) {}
  }

  function togglePin(id) {
    const updated = announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a);
    setAnnouncements(updated);
    try { localStorage.setItem('kcp_announcements', JSON.stringify(updated)); } catch(e) {}
  }

  function saveTeacher(id) {
    try {
      const stored = JSON.parse(localStorage.getItem('kcp_teacher_profiles') || '{}');
      stored[id] = teacherProfiles[id];
      localStorage.setItem('kcp_teacher_profiles', JSON.stringify(stored));
    } catch(e) {}
    setTeacherSaved(p => ({ ...p, [id]: true }));
    setTimeout(() => setTeacherSaved(p => ({ ...p, [id]: false })), 2000);
  }

  const pinned   = announcements.filter(a => a.pinned);
  const unpinned = announcements.filter(a => !a.pinned);
  const studioId = user?.instructorId || 'mira-piano';

  return (
    <div className="page">
      <div style={{ paddingTop: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>网页管理</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{instructor?.name} · 管理对外的工作室页面</p>
      </div>

      {/* 工作室网址 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'18px 20px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>工作室公开页面</div>
          <div style={{ fontSize:13, color:'#4A6FA5', fontFamily:'monospace', wordBreak:'break-all' }}>{studioUrl}</div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <button className="secondary" style={{ fontSize:13.5, padding:'8px 16px' }} onClick={() => navigate(`/school/${user?.instructorId}`)}>
            👁 预览家长视角
          </button>
          <button style={{ fontSize:13.5, padding:'8px 16px', background: copied ? 'var(--success)' : 'var(--ink)', color:'white', border:'none', borderRadius:8, cursor:'pointer' }} onClick={copyLink}>
            {copied ? '✅ 已复制！' : '🔗 复制分享连结'}
          </button>

          {/* 公开搜寻开关 */}
          <div
            onClick={() => {
              const next = !publicSearch;
              setPublicSearch(next);
              try { localStorage.setItem('kcp_public_search', JSON.stringify(next)); } catch(e) {}
            }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', borderRadius:10, border:`1.5px solid ${publicSearch ? 'var(--success)' : '#CBD5E1'}`, background: publicSearch ? 'var(--success-bg)' : 'var(--bg)', cursor:'pointer', userSelect:'none' }}>
            <div style={{ width:36, height:20, borderRadius:99, background: publicSearch ? 'var(--success)' : '#CBD5E1', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:2, left: publicSearch ? 18 : 2, width:16, height:16, borderRadius:50, background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color: publicSearch ? 'var(--success)' : 'var(--text-muted)' }}>
                {publicSearch ? '✓ 允许公开搜寻' : '已隐藏'}
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>
                {publicSearch ? '家长可在搜寻页找到你的机构' : '仅限直接连结访问'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:28, borderBottom:'2px solid var(--line)' }}>
        {[
          { key:'announcements', label:'最新活动公告' },
          { key:'profile',       label:'工作室资讯' },
          { key:'curriculum',    label:'课程体系' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding:'10px 24px', fontSize:14, border:'none', background:'none', cursor:'pointer',
            borderBottom: activeTab === key ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom:-2,
            fontWeight: activeTab === key ? 700 : 400,
            color: activeTab === key ? 'var(--ink)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {/* ── 公告 ── */}
      {activeTab === 'announcements' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:17, fontWeight:700, margin:0 }}>最新活动公告</h2>
            <button onClick={() => setShowNewForm(!showNewForm)} style={{ fontSize:13.5, padding:'8px 16px' }}>
              {showNewForm ? '取消' : '+ 新增公告'}
            </button>
          </div>

          {showNewForm && (
            <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'20px 24px', marginBottom:20 }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:6 }}>标题</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="例如：🎹 秋季班报名开始！"
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:6 }}>内容</label>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={3}
                  placeholder="公告内容..."
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box', resize:'vertical' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                  <input type="checkbox" checked={newPinned} onChange={e => setNewPinned(e.target.checked)} />
                  📌 置顶公告
                </label>
                <button onClick={addAnnouncement} disabled={!newTitle.trim()}>发布公告</button>
              </div>
            </div>
          )}

          {pinned.map(a => (
            <div key={a.id} style={{ background:'var(--warn-bg)', border:'1px solid var(--amber)', borderRadius:12, padding:'16px 20px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <span style={{ fontSize:10, background:'var(--amber)', color:'#fff', padding:'1px 8px', borderRadius:999, marginRight:8 }}>📌 置顶</span>
                  <span style={{ fontWeight:700, fontSize:15 }}>{a.title}</span>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{a.date}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="secondary" style={{ fontSize:12, padding:'3px 10px' }} onClick={() => togglePin(a.id)}>取消置顶</button>
                  <button className="secondary" style={{ fontSize:12, padding:'3px 10px', color:'var(--error)' }} onClick={() => deleteAnnouncement(a.id)}>删除</button>
                </div>
              </div>
              {a.body && <p style={{ fontSize:13.5, color:'var(--text-muted)', margin:0 }}>{a.body}</p>}
            </div>
          ))}
          {unpinned.map(a => (
            <div key={a.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'16px 20px', marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{a.date}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="secondary" style={{ fontSize:12, padding:'3px 10px' }} onClick={() => togglePin(a.id)}>📌 置顶</button>
                  <button className="secondary" style={{ fontSize:12, padding:'3px 10px', color:'var(--error)' }} onClick={() => deleteAnnouncement(a.id)}>删除</button>
                </div>
              </div>
              {a.body && <p style={{ fontSize:13.5, color:'var(--text-muted)', margin:0 }}>{a.body}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── 工作室资讯 ── */}
      {activeTab === 'profile' && (
        <div>
          {/* 工作室简介 */}
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>工作室简介</div>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
            <button style={{ marginTop:12 }} onClick={() => { setBioSaved(true); setTimeout(() => setBioSaved(false), 2000); }}>
              {bioSaved ? '✅ 已储存' : '储存简介'}
            </button>
          </div>

          {/* 联络资讯 */}
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>📍 联络资讯</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              {[
                { label:'联络电话', key:'phone',   placeholder:'例：425-555-0201', icon:'📞' },
                { label:'Email',    key:'email',   placeholder:'例：info@studio.com', icon:'✉️' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>{f.icon} {f.label}</label>
                  <input value={studioContact[f.key]} onChange={e => setStudioContact(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>📍 地址</label>
              <input value={studioContact.address} onChange={e => setStudioContact(p => ({...p, address: e.target.value}))}
                placeholder="例：1234 Main St, Bellevue, WA 98004"
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>🅿️ 停车/交通说明</label>
              <input value={studioContact.parking} onChange={e => setStudioContact(p => ({...p, parking: e.target.value}))}
                placeholder="例：停车场位于大楼B栋地下一层，前30分钟免费"
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>🕐 营业时间</label>
              <input value={studioContact.hours} onChange={e => setStudioContact(p => ({...p, hours: e.target.value}))}
                placeholder="例：周一至周六 10:00–19:00，周日休息"
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>🌐 官方网站</label>
              <input value={studioContact.website} onChange={e => setStudioContact(p => ({...p, website: e.target.value}))}
                placeholder="例：https://mirapianobellevue.com"
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
            </div>
            <button onClick={() => {
                try { localStorage.setItem('kcp_studio_contact', JSON.stringify(studioContact)); } catch(e) {}
                setContactSaved(true); setTimeout(() => setContactSaved(false), 2000);
              }}>
              {contactSaved ? '✅ 已储存，已同步到工作室页面' : '储存联络资讯'}
            </button>
          </div>

          {/* 社群媒体 */}
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📱 社群媒体 / 行销渠道</div>
            <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:16 }}>填写后会显示在工作室公开页面，家长可以直接点击前往追踪</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[
                { label:'Instagram',  key:'instagram',    placeholder:'@yourstudio', icon:'📸', color:'#E1306C', hint:'@帐号名称' },
                { label:'Facebook',   key:'facebook',     placeholder:'页面网址或名称', icon:'👍', color:'#1877F2', hint:'页面URL或名称' },
                { label:'小红书',     key:'xiaohongshu',  placeholder:'帐号名或主页链接', icon:'📕', color:'#FF2442', hint:'帐号名或主页链接' },
                { label:'WeChat公众号',key:'wechat',      placeholder:'公众号ID', icon:'💬', color:'#07C160', hint:'公众号ID' },
                { label:'YouTube',    key:'youtube',      placeholder:'频道名称或链接', icon:'▶️', color:'#FF0000', hint:'频道名称或链接' },
                { label:'LINE 官方帐号',key:'line',       placeholder:'帐号ID', icon:'💚', color:'#00B900', hint:'LINE帐号ID' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>
                    <span style={{ marginRight:4 }}>{f.icon}</span>
                    <span style={{ color: f.color }}>{f.label}</span>
                  </label>
                  <input value={studioContact[f.key]} onChange={e => setStudioContact(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{f.hint}</div>
                </div>
              ))}
            </div>

            {/* 预览 */}
            {Object.entries({ instagram: studioContact.instagram, facebook: studioContact.facebook, xiaohongshu: studioContact.xiaohongshu, wechat: studioContact.wechat, youtube: studioContact.youtube, line: studioContact.line }).some(([,v]) => v) && (
              <div style={{ padding:'10px 14px', background:'var(--bg)', borderRadius:8, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:8 }}>家长看到的样子：</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {[
                    { key:'instagram', label:'Instagram', color:'#E1306C', icon:'📸' },
                    { key:'facebook',  label:'Facebook',  color:'#1877F2', icon:'👍' },
                    { key:'xiaohongshu',label:'小红书',   color:'#FF2442', icon:'📕' },
                    { key:'wechat',    label:'微信',      color:'#07C160', icon:'💬' },
                    { key:'youtube',   label:'YouTube',   color:'#FF0000', icon:'▶️' },
                    { key:'line',      label:'LINE',      color:'#00B900', icon:'💚' },
                  ].filter(s => studioContact[s.key]).map(s => (
                    <span key={s.key} style={{ fontSize:12, padding:'4px 12px', borderRadius:999, background: s.color + '15', color: s.color, fontWeight:600, border:`1px solid ${s.color}40` }}>
                      {s.icon} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => {
                try { localStorage.setItem('kcp_studio_contact', JSON.stringify(studioContact)); } catch(e) {}
                setContactSaved(true); setTimeout(() => setContactSaved(false), 2000);
              }}>
              {contactSaved ? '✅ 已储存，已同步到工作室页面' : '储存社群资讯'}
            </button>
          </div>

          {myTeachers.map(t => (
            <div key={t.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>👤 {t.name}</div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:6 }}>职称</label>
                <input value={teacherProfiles[t.id]?.title || ''} onChange={e => setTeacherProfiles(p => ({ ...p, [t.id]: { ...p[t.id], title: e.target.value } }))}
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:6 }}>个人简介</label>
                <textarea value={teacherProfiles[t.id]?.bio || ''} onChange={e => setTeacherProfiles(p => ({ ...p, [t.id]: { ...p[t.id], bio: e.target.value } }))} rows={3}
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
              </div>
              <button onClick={() => saveTeacher(t.id)}>{teacherSaved[t.id] ? '✅ 已储存' : '储存'}</button>
            </div>
          ))}
        </div>
      )}

      {/* ── 课程体系 ── */}
      {activeTab === 'curriculum' && (
        <div>
          <div style={{ background:'var(--warn-bg)', border:'1px solid var(--amber)', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:13 }}>
            💡 此页面内容由「课程管理 → 课程设定」自动同步，家长在工作室页面会看到相同内容。
          </div>

          {mockSubjects.filter(s => s.studioId === studioId).map(subj => {
            const myCurricula = mockCurricula.filter(c => c.studioId === studioId);
            const myLevels    = mockLevels.filter(l => l.studioId === studioId);
            const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
            return (
              <div key={subj.id}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>🎹 {subj.name}</h3>

                {/* 团体课路径 */}
                {myCurricula.length > 0 && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:12 }}>📚 团体课学习路径</div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      {myCurricula.map(cur => {
                        const curLevels   = myLevels.filter(l => l.curriculumId === cur.id).sort((a,b) => a.levelIndex - b.levelIndex);
                        const curOfferings = myOfferings.filter(o => o.curriculumId === cur.id);
                        return (
                          <div key={cur.id} style={{ flex:'1', minWidth:150, border:`2px solid ${cur.color}`, borderRadius:12, overflow:'hidden' }}>
                            <div style={{ padding:'8px 14px', background:cur.color }}>
                              <div style={{ fontWeight:700, fontSize:13, color:'#fff' }}>{cur.name}</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>{cur.ageRange} · {cur.totalYears}年</div>
                            </div>
                            <div style={{ padding:'10px 14px', background:'var(--card)' }}>
                              {curLevels.map(lv => {
                                const hasOffering = curOfferings.some(o => o.levelId === lv.id);
                                return (
                                  <div key={lv.id} style={{ fontSize:12, display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                    <span style={{ width:6, height:6, borderRadius:50, background: hasOffering ? cur.color : 'var(--line)', display:'inline-block', flexShrink:0 }} />
                                    <span style={{ color: hasOffering ? 'var(--ink)' : 'var(--text-muted)', fontWeight: hasOffering ? 600 : 400 }}>
                                      {lv.name} <span style={{ color:'var(--text-muted)', fontWeight:400 }}>{lv.ageMin}-{lv.ageMax}岁</span>
                                    </span>
                                    {hasOffering && <span style={{ fontSize:10, background:cur.color, color:'#fff', padding:'1px 5px', borderRadius:999, marginLeft:'auto' }}>报名中</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 私教 */}
                {myOfferings.filter(o => { const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'private_lesson'; }).length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:10 }}>👤 一对一私教</div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      {myOfferings.filter(o => { const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'private_lesson'; }).map(o => {
                        const teacher   = studioTeachers.find(t => t.id === o.primaryTeacherId);
                        const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                        return (
                          <div key={o.id} style={{ padding:'10px 16px', background:'var(--card)', border:'1px solid var(--line)', borderRadius:10 }}>
                            <div style={{ fontWeight:600, fontSize:13 }}>{teacher?.name}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{o.durationMin}分钟/堂</div>
                            <div style={{ fontSize:13, fontWeight:700, color:'var(--amber)', marginTop:4 }}>${pricePlan?.amount}/{pricePlan?.unit}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 营队 */}
                {myOfferings.filter(o => { const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'workshop'; }).length > 0 && (
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:10 }}>🎪 工作坊/营队</div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      {myOfferings.filter(o => { const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'workshop'; }).map(o => {
                        const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                        const seatsLeft = o.capacity - o.booked;
                        return (
                          <div key={o.id} style={{ padding:'10px 16px', background:'var(--card)', border:'1px solid var(--amber)', borderRadius:10 }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{o.name}</div>
                            {o.startDate && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>📅 {o.startDate} — {o.endDate}</div>}
                            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                              <span style={{ fontSize:13, fontWeight:700, color:'var(--amber)' }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
                              <span style={{ fontSize:11, background: seatsLeft <= 0 ? 'var(--error)' : 'var(--success-bg)', color: seatsLeft <= 0 ? '#fff' : 'var(--success)', padding:'2px 8px', borderRadius:999 }}>
                                {seatsLeft <= 0 ? '已额满' : `剩${seatsLeft}位`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
