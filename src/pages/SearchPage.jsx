import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { instructors, mockClassOfferings, mockPricingPlans, mockLevels, mockCurricula } from '../mockData';

const AGE_GROUPS = [
  { label:'3岁', value:3, ageMin:2, ageMax:4 },
  { label:'4-5岁', value:4, ageMin:4, ageMax:5 },
  { label:'6-8岁', value:6, ageMin:6, ageMax:8 },
  { label:'9-12岁', value:9, ageMin:9, ageMax:12 },
  { label:'13岁+', value:13, ageMin:13, ageMax:99 },
];

const TIME_OPTIONS = [
  { key:'weekday', emoji:'🌅', label:'平日放学后', desc:'周一至周五下午/傍晚' },
  { key:'weekend', emoji:'🌞', label:'周末',       desc:'周六或周日' },
  { key:'summer',  emoji:'☀️', label:'暑假营队',   desc:'密集课程/全日托管' },
  { key:'any',     emoji:'🔄', label:'时间不限',   desc:'都可以' },
];

const SUBJECT_GROUPS = [
  { key:'music',    emoji:'🎵', label:'音乐',  cats:['mira-piano','bella-violin'] },
  { key:'sports',   emoji:'⚽', label:'体育',  cats:['david-swim','coach-tony-soccer'] },
  { key:'language', emoji:'📖', label:'语言',  cats:['lily-chinese'] },
  { key:'arts',     emoji:'🎨', label:'艺术',  cats:['art-studio-emily','dance-studio-grace'] },
  { key:'stem',     emoji:'💡', label:'STEM',  cats:['code-kids-bellevue','math-plus-bellevue','chess-academy-nw'] },
  { key:'any',      emoji:'✨', label:'不限',  cats:[] },
];

const LOCATION_SUGGESTIONS = [
  'Bellevue, WA', 'Seattle, WA', 'Redmond, WA', 'Kirkland, WA',
  'New York, NY', 'Los Angeles, CA', '台北, 台湾', '上海, 中国',
];

const PROMOS = {
  'co-jmc1-sarah-fall26': { label:'🎁 免费试听', color:'#22C55E' },
  'co-summer-camp':        { label:'🏖️ 暑期特价', color:'#E0922F' },
};
const STUDIO_PROMOS = {
  'bella-violin':       { label:'🎻 首堂免费',  color:'#22C55E' },
  'art-studio-emily':   { label:'🎨 暑期优惠',  color:'#E0922F' },
  'code-kids-bellevue': { label:'🆕 新课上线',  color:'#9B59B6' },
  'coach-tony-soccer':  { label:'⚽ 暑期营',    color:'#2196F3' },
  'dance-studio-grace': { label:'🎭 成果演出',  color:'#E91E8C' },
};

function getPromo(studioId, offeringId) {
  return PROMOS[offeringId] || STUDIO_PROMOS[studioId];
}

function matchesTime(offering, timeKey) {
  if (timeKey === 'any') return true;
  const days = offering.slots?.map(s => s.day) || [];
  const isWeekend = days.some(d => d.includes('六') || d.includes('日'));
  const isWeekday = days.some(d => ['一','二','三','四','五'].some(w => d.includes(w)));
  const isCamp = offering.teachingTypeId?.includes('workshop') || offering.name.includes('营') || offering.totalSessions <= 5;
  if (timeKey === 'summer')  return isCamp;
  if (timeKey === 'weekend') return isWeekend && !isCamp;
  if (timeKey === 'weekday') return isWeekday && !isCamp;
  return true;
}

function matchesAge(offering, ageGroup) {
  if (!ageGroup) return true;
  const level = mockLevels.find(l => l.id === offering.levelId);
  if (level) return ageGroup.ageMin <= level.ageMax && ageGroup.ageMax >= level.ageMin;
  return true; // 私教/营队宽松处理
}

function matchesSubject(offering, subjectKey) {
  if (subjectKey === 'any' || !subjectKey) return true;
  const group = SUBJECT_GROUPS.find(g => g.key === subjectKey);
  return group?.cats.includes(offering.studioId);
}

// 进度条
function StepDots({ current, total }) {
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:28 }}>
      {Array.from({length:total}).map((_, i) => (
        <div key={i} style={{ width: i === current-1 ? 20 : 8, height:8, borderRadius:99, background: i < current ? 'var(--amber)' : 'var(--line)', transition:'all 0.2s' }} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [step, setStep]               = useState(1);
  const [location, setLocation]       = useState('Bellevue, WA');
  const [locInput, setLocInput]       = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [ageGroup, setAgeGroup]       = useState(null);
  const [timeKey, setTimeKey]         = useState(null);
  const [subjectKey, setSubjectKey]   = useState(null);
  const [sortBy, setSortBy]           = useState('match');
  const inputRef = useRef(null);

  // 结果计算
  const results = (() => {
    if (step < 4) return [];
    let list = mockClassOfferings.filter(o => o.status === 'published');
    list = list.filter(o => matchesAge(o, ageGroup));
    if (timeKey) list = list.filter(o => matchesTime(o, timeKey));
    if (subjectKey && subjectKey !== 'any') list = list.filter(o => matchesSubject(o, subjectKey));
    return list.sort((a, b) => {
      if (sortBy === 'distance') {
        return (instructors.find(i=>i.id===a.studioId)?.distanceMiles||99) - (instructors.find(i=>i.id===b.studioId)?.distanceMiles||99);
      }
      if (sortBy === 'rating') {
        return (instructors.find(i=>i.id===b.studioId)?.rating||0) - (instructors.find(i=>i.id===a.studioId)?.rating||0);
      }
      if (sortBy === 'price_asc') {
        return (mockPricingPlans.find(p=>p.id===a.pricingPlanId)?.amount||999) - (mockPricingPlans.find(p=>p.id===b.pricingPlanId)?.amount||999);
      }
      // match: 促销 > 有名额 > 其他
      const pa = getPromo(a.studioId, a.id) ? 2 : 0;
      const pb = getPromo(b.studioId, b.id) ? 2 : 0;
      const sa = (a.capacity-(a.booked||0)) > 0 ? 1 : 0;
      const sb = (b.capacity-(b.booked||0)) > 0 ? 1 : 0;
      return (pb+sb)-(pa+sa);
    });
  })();

  // 已选条件的标签（可移除）
  const chips = [];
  if (location) chips.push({ label:`📍 ${location}`, onRemove: null }); // 地点不能移除
  if (ageGroup) chips.push({ label:`👶 ${ageGroup.label}`, onRemove:() => setAgeGroup(null) });
  if (timeKey && timeKey !== 'any') chips.push({ label: TIME_OPTIONS.find(t=>t.key===timeKey)?.label, onRemove:() => setTimeKey(null) });
  if (subjectKey && subjectKey !== 'any') chips.push({ label: SUBJECT_GROUPS.find(s=>s.key===subjectKey)?.emoji+' '+SUBJECT_GROUPS.find(s=>s.key===subjectKey)?.label, onRemove:() => setSubjectKey(null) });

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(s => s.toLowerCase().includes(locInput.toLowerCase()));

  // ── Step 1：地点 ────────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="page">
      <div style={{ maxWidth:480, margin:'32px auto 0', padding:'0 16px' }}>
        <StepDots current={1} total={3} />
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📍</div>
          <h1 style={{ fontSize:26, marginBottom:8 }}>在哪里找课？</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>我们会推荐这个地区的课程</p>
        </div>

        {/* 使用目前位置 */}
        <button
          onClick={() => { setLocation('Bellevue, WA'); setStep(2); }}
          style={{ width:'100%', padding:'14px 18px', fontSize:15, fontWeight:600, borderRadius:12, border:'2px solid var(--amber)', background:'var(--warn-bg)', cursor:'pointer', display:'flex', alignItems:'center', gap:12, marginBottom:12, color:'var(--ink)' }}>
          <span style={{ fontSize:22 }}>📱</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontWeight:700 }}>使用目前位置</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400, marginTop:1 }}>Bellevue, WA（系统侦测）</div>
          </div>
          <span style={{ marginLeft:'auto', color:'var(--amber)' }}>→</span>
        </button>

        {/* 手动输入 */}
        <div style={{ position:'relative', marginBottom:20 }}>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18, pointerEvents:'none' }}>🔍</span>
            <input
              ref={inputRef}
              value={locInput}
              onChange={e => { setLocInput(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              placeholder="输入城市或地区，例：Seattle, WA"
              style={{ width:'100%', padding:'13px 14px 13px 44px', borderRadius:12, border:'2px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
            />
          </div>
          {showSuggest && locInput && filteredSuggestions.length > 0 && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--card)', border:'1px solid var(--line)', borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', zIndex:10, overflow:'hidden', marginTop:4 }}>
              {filteredSuggestions.map(s => (
                <div key={s} onClick={() => { setLocation(s); setLocInput(''); setShowSuggest(false); setStep(2); }}
                  style={{ padding:'11px 16px', cursor:'pointer', fontSize:14, borderBottom:'1px solid var(--line)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  📍 {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {locInput && (
          <button onClick={() => { setLocation(locInput); setLocInput(''); setStep(2); }}
            style={{ width:'100%', padding:'12px', fontSize:14, fontWeight:600, borderRadius:12, border:'2px solid var(--line)', background:'var(--card)', cursor:'pointer', marginBottom:12 }}>
            搜寻「{locInput}」→
          </button>
        )}

        <div style={{ textAlign:'center' }}>
          <button className="secondary" onClick={() => setStep(2)} style={{ fontSize:13, color:'var(--text-muted)' }}>
            跳过，不限地点
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 2：年龄 + 时间 ─────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="page">
      <div style={{ maxWidth:520, margin:'32px auto 0', padding:'0 16px' }}>
        <StepDots current={2} total={3} />
        <button className="secondary" onClick={() => setStep(1)} style={{ fontSize:12, marginBottom:20, display:'flex', alignItems:'center', gap:4 }}>← 返回</button>

        {location && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--warn-bg)', border:'1.5px solid var(--amber)', borderRadius:999, fontSize:13, fontWeight:600, color:'var(--amber)', marginBottom:20 }}>
            📍 {location}
          </div>
        )}

        {/* 年龄 */}
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>孩子几岁？</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:14 }}>帮我们过滤适合年龄的课程</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {AGE_GROUPS.map(ag => (
              <button key={ag.value} onClick={() => setAgeGroup(ag)}
                style={{ padding:'9px 16px', fontSize:14, fontWeight: ageGroup?.value === ag.value ? 700 : 500, borderRadius:10, border:`2px solid ${ageGroup?.value === ag.value ? 'var(--amber)' : 'var(--line)'}`, background: ageGroup?.value === ag.value ? 'var(--warn-bg)' : 'var(--card)', cursor:'pointer', color: ageGroup?.value === ag.value ? 'var(--amber)' : 'var(--ink)' }}>
                {ag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 时间 */}
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>什么时候上课？</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:14 }}>帮你排除时间不合的课</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {TIME_OPTIONS.map(t => (
              <button key={t.key} onClick={() => setTimeKey(t.key)}
                style={{ padding:'12px 16px', fontSize:14, borderRadius:10, border:`2px solid ${timeKey === t.key ? 'var(--amber)' : 'var(--line)'}`, background: timeKey === t.key ? 'var(--warn-bg)' : 'var(--card)', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                <span style={{ fontSize:22 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontWeight: timeKey === t.key ? 700 : 600 }}>{t.label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{t.desc}</div>
                </div>
                {timeKey === t.key && <span style={{ marginLeft:'auto', color:'var(--amber)', fontWeight:700 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep(3)}
          disabled={!ageGroup && !timeKey}
          style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, borderRadius:12, border:'none', background: (!ageGroup && !timeKey) ? 'var(--line)' : 'var(--amber)', color: (!ageGroup && !timeKey) ? 'var(--text-muted)' : '#fff', cursor: (!ageGroup && !timeKey) ? 'not-allowed' : 'pointer' }}>
          下一步 →
        </button>
        <div style={{ textAlign:'center', marginTop:10 }}>
          <button className="secondary" onClick={() => setStep(3)} style={{ fontSize:12, color:'var(--text-muted)' }}>跳过，直接看结果</button>
        </div>
      </div>
    </div>
  );

  // ── Step 3：类别 ────────────────────────────────────────────────────────────
  if (step === 3) return (
    <div className="page">
      <div style={{ maxWidth:520, margin:'32px auto 0', padding:'0 16px' }}>
        <StepDots current={3} total={3} />
        <button className="secondary" onClick={() => setStep(2)} style={{ fontSize:12, marginBottom:20 }}>← 返回</button>

        {/* 已选条件预览 */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {location && <span style={{ fontSize:12, padding:'3px 10px', background:'var(--warn-bg)', border:'1.5px solid var(--amber)', borderRadius:999, color:'var(--amber)', fontWeight:700 }}>📍 {location}</span>}
          {ageGroup  && <span style={{ fontSize:12, padding:'3px 10px', background:'#EEF2F7', border:'1.5px solid #4A6FA5', borderRadius:999, color:'#4A6FA5', fontWeight:700 }}>👶 {ageGroup.label}</span>}
          {timeKey && timeKey !== 'any' && <span style={{ fontSize:12, padding:'3px 10px', background:'var(--success-bg)', border:'1.5px solid var(--success)', borderRadius:999, color:'var(--success)', fontWeight:700 }}>{TIME_OPTIONS.find(t=>t.key===timeKey)?.emoji} {TIME_OPTIONS.find(t=>t.key===timeKey)?.label}</span>}
        </div>

        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>想学什么？</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>选一个大类，或直接看全部</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
          {SUBJECT_GROUPS.map(sg => (
            <button key={sg.key} onClick={() => { setSubjectKey(sg.key); setStep(4); }}
              style={{ padding:'16px 14px', borderRadius:12, border:`2px solid ${subjectKey === sg.key ? 'var(--amber)' : 'var(--line)'}`, background:'var(--card)', cursor:'pointer', textAlign:'center', transition:'all 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--amber)'; e.currentTarget.style.background='var(--warn-bg)'; }}
              onMouseLeave={e => { if (subjectKey !== sg.key) { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.background='var(--card)'; }}}>
              <div style={{ fontSize:30, marginBottom:6 }}>{sg.emoji}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{sg.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 4：结果 ────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* 标题 */}
      <div style={{ paddingTop:8, marginBottom:16 }}>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>
          找到 {results.length} 个课程
        </h1>

        {/* 条件chips（可移除） */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          {chips.map((c, i) => (
            <span key={i} style={{ fontSize:12, padding:'4px 10px', background:'var(--card)', border:'1.5px solid var(--line)', borderRadius:999, fontWeight:600, display:'inline-flex', alignItems:'center', gap:5 }}>
              {c.label}
              {c.onRemove && (
                <span onClick={c.onRemove} style={{ cursor:'pointer', color:'var(--text-muted)', fontWeight:400, fontSize:13, lineHeight:1 }}>✕</span>
              )}
            </span>
          ))}
          <button className="secondary" onClick={() => { setStep(1); setAgeGroup(null); setTimeKey(null); setSubjectKey(null); }} style={{ fontSize:11, padding:'3px 8px' }}>重新搜寻</button>
        </div>
      </div>

      {/* 排序 + 快速类别 */}
      <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:5 }}>
          {SUBJECT_GROUPS.map(sg => (
            <button key={sg.key} onClick={() => setSubjectKey(sg.key)}
              className={subjectKey === sg.key ? '' : 'secondary'}
              style={{ fontSize:12, padding:'4px 10px' }}>
              {sg.emoji}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ marginLeft:'auto', padding:'6px 10px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:13, background:'var(--card)' }}>
          <option value="match">最佳匹配</option>
          <option value="distance">距离最近</option>
          <option value="rating">评分最高</option>
          <option value="price_asc">价格由低到高</option>
        </select>
      </div>

      {/* 无结果 */}
      {results.length === 0 && (
        <div style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🔍</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>没有找到符合条件的课程</div>
          <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>试试放宽年龄或时间限制</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
            <button className="secondary" onClick={() => { setAgeGroup(null); setTimeKey(null); }}>清除筛选</button>
            <button onClick={() => setStep(1)}>重新搜寻</button>
          </div>
        </div>
      )}

      {/* 课程卡片 */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {results.map(o => {
          const studio    = instructors.find(i => i.id === o.studioId);
          const pp        = mockPricingPlans.find(p => p.id === o.pricingPlanId);
          const level     = mockLevels.find(l => l.id === o.levelId);
          const cur       = mockCurricula.find(c => c.id === o.curriculumId);
          const promo     = getPromo(o.studioId, o.id);
          const seatsLeft = o.capacity - (o.booked || 0);
          const isFull    = seatsLeft <= 0;
          const ageMatch  = ageGroup && level && ageGroup.ageMin <= level.ageMax && ageGroup.ageMax >= level.ageMin;

          return (
            <Link key={o.id} to={`/school/${o.studioId}`} style={{ textDecoration:'none' }}>
              <div style={{ background:'var(--card)', border:`1.5px solid ${promo ? promo.color : 'var(--line)'}`, borderRadius:14, overflow:'hidden' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>

                {promo && (
                  <div style={{ padding:'4px 16px', background:promo.color, fontSize:12, fontWeight:700, color:'#fff' }}>
                    {promo.label}
                  </div>
                )}

                <div style={{ padding:'14px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                      {level && <span style={{ fontSize:11, padding:'1px 7px', borderRadius:999, background:cur?.color||'var(--amber)', color:'#fff', fontWeight:700, flexShrink:0 }}>{level.shortName}</span>}
                      <span style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>{o.name}</span>
                    </div>

                    <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:7, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontWeight:600, color:'var(--ink)' }}>{studio?.name}</span>
                      <span>📍 {studio?.distanceMiles} mi</span>
                      <span>⭐ {studio?.rating}</span>
                    </div>

                    <div style={{ display:'flex', gap:8, fontSize:12, color:'var(--text-muted)', flexWrap:'wrap', marginBottom: (ageMatch || o.enrollmentSettings?.allowTrial) ? 6 : 0 }}>
                      {o.slots?.map(s => (
                        <span key={s.id} style={{ background:'var(--bg)', padding:'2px 8px', borderRadius:6 }}>📅 {s.day} {s.time}</span>
                      ))}
                      <span>⏱ {o.durationMin}分钟</span>
                      {o.totalSessions && <span>共{o.totalSessions}堂</span>}
                      {o.startDate && <span>🗓 {o.startDate.slice(5)}开课</span>}
                    </div>

                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {ageMatch && <span style={{ fontSize:11, color:'var(--success)', fontWeight:700 }}>✓ 符合年龄</span>}
                      {!ageMatch && level && ageGroup && <span style={{ fontSize:11, color:'var(--text-muted)' }}>适合{level.ageMin}-{level.ageMax}岁</span>}
                      {o.enrollmentSettings?.allowTrial && <span style={{ fontSize:11, color:'#22C55E', fontWeight:700 }}>🎁 可免费试听</span>}
                      {o.enrollmentSettings?.allowWaitlist && isFull && <span style={{ fontSize:11, color:'#4A6FA5', fontWeight:600 }}>📋 可候补</span>}
                    </div>
                  </div>

                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    {pp && (
                      <div style={{ fontWeight:800, fontSize:19, color:promo ? promo.color : 'var(--amber)' }}>
                        ${pp.amount}<span style={{ fontSize:11, fontWeight:400, color:'var(--text-muted)' }}>/{pp.unit}</span>
                      </div>
                    )}
                    <div style={{ fontSize:12, marginTop:4 }}>
                      {isFull
                        ? <span style={{ color:'var(--success)', fontWeight:600 }}>额满</span>
                        : seatsLeft <= 2
                          ? <span style={{ color:'var(--error)', fontWeight:700 }}>⚡仅剩{seatsLeft}位</span>
                          : <span style={{ color:'var(--text-muted)' }}>剩{seatsLeft}位</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop:24, padding:'16px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:12, textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
          没找到想要的课？
          <button className="secondary" onClick={() => setStep(1)} style={{ marginLeft:10, fontSize:12 }}>重新搜寻</button>
          <button className="secondary" style={{ marginLeft:6, fontSize:12 }}>📧 有新课通知我</button>
        </div>
      )}
    </div>
  );
}
