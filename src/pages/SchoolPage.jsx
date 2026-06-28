import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructors, studioTeachers, mockCurricula, mockLevels, mockClassOfferings, mockPricingPlans, mockTeachingTypes, mockStudioAnnouncements, mockOpenHouses } from '../mockData';
import CategoryIcon from '../components/CategoryIcon';

const categoryToIconType = { 鋼琴: 'piano', 游泳: 'swim', 中文: 'chinese' };

export default function SchoolPage() {
  const { instructorId } = useParams();
  const instructor = instructors.find((i) => i.id === instructorId);
  if (!instructor) return <div className="page">找不到这间机构。</div>;

  const iconType = categoryToIconType[instructor.category] || 'piano';
  const studioId = instructor.id;
  const [modal, setModal] = useState(null); // { type: 'openhouse'|'trial'|'enroll', offering, openHouse }
  const [form, setForm] = useState({ parentName:'', parentEmail:'', parentPhone:'', childName:'', childAge:'', preferredDate:'', childCount:1, note:'' });
  const [submitted, setSubmitted] = useState(false);

  function openModal(type, offering, openHouse) {
    setModal({ type, offering, openHouse });
    setForm({ parentName:'', parentEmail:'', parentPhone:'', childName:'', childAge:'', preferredDate:'', childCount:1, note:'' });
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!form.parentName || !form.parentEmail) return;
    setSubmitted(true);
  }
  const myCurricula = mockCurricula.filter(c => c.studioId === studioId);
  const myLevels = mockLevels.filter(l => l.studioId === studioId);
  const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myOpenHouses = mockOpenHouses.filter(oh => oh.studioId === studioId && new Date(oh.date) >= new Date());
  const myTeachingTypes = mockTeachingTypes.filter(t => t.studioId === studioId);
  const groupOfferings = myOfferings.filter(o => { const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'group_class'; });
  const privateOfferings = myOfferings.filter(o => { const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'private_lesson'; });
  const workshopOfferings = myOfferings.filter(o => { const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId); return tt?.type === 'workshop'; });

  // 公告
  let announcements = [];
  try { announcements = JSON.parse(localStorage.getItem('kcp_announcements') || '[]'); } catch(e) {}

  // 联络资讯 & 社群媒体
  const defaultContact = {
    phone: '425-555-0201', email: 'info@mirapianobellevue.com',
    address: '1234 Main St, Suite 201, Bellevue, WA 98004',
    parking: '停车场位于大楼B栋地下一层，前30分钟免费',
    hours: '周一至周六 10:00–19:00，周日休息',
    website: '', instagram: '', facebook: '', xiaohongshu: '', wechat: '', youtube: '', line: '',
  };
  let studioContact = defaultContact;
  try { studioContact = { ...defaultContact, ...JSON.parse(localStorage.getItem('kcp_studio_contact') || '{}') }; } catch(e) {}
  if (announcements.length === 0) {
    announcements = [
      { id:'a1', date:'2026-06-20', title:'🎹 秋季班报名开始！', body:'2026秋季钢琴课程现已开放报名，名额有限，欢迎尽早预约试课。', pinned:true },
      { id:'a2', date:'2026-06-15', title:'🏆 学生参赛成果', body:'JXC班的谢宗翰同学在6月RCM考级中获得Honors，恭喜！', pinned:false },
      { id:'a3', date:'2026-06-01', title:'☀️ 暑期钢琴集训营', body:'7月14-25日，每天90分钟，还有3个名额！', pinned:false },
    ];
  }
  const pinnedAnnouncements = announcements.filter(a => a.pinned);
  const otherAnnouncements = announcements.filter(a => !a.pinned).slice(0, 2);

  return (
    <div className="page">
      <div className="detail-hero">
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-icon"><CategoryIcon type={iconType} size={28} /></div>
          <div>
            <h1 className="detail-hero-title">{instructor.name}</h1>
            <div className="detail-hero-meta">
              {instructor.location} · {instructor.yearsExperience} 年教学经验 · ★ {instructor.rating}({instructor.reviewCount} 则评价)
            </div>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        {/* 主内容区 */}
        <div>
          <div className="instructor-strip">
            <div className="instructor-avatar"><CategoryIcon type={iconType} size={26} /></div>
            <div className="instructor-info">
              <div className="instructor-name">{instructor.name}</div>
              <div className="instructor-loc">{instructor.location}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {instructor.highlights?.map((h, i) => (
                <span key={i} className="tag-pill">{h}</span>
              ))}
            </div>
          </div>

          {/* 公告 */}
          {[...pinnedAnnouncements, ...otherAnnouncements].length > 0 && (
            <div className="detail-section">
              <h2>📢 最新公告</h2>
              {[...pinnedAnnouncements, ...otherAnnouncements].map(a => (
                <div key={a.id} style={{ padding:'12px 16px', background: a.pinned ? 'var(--warn-bg)' : 'var(--card)', border:`1px solid ${a.pinned ? 'var(--amber)' : 'var(--line)'}`, borderRadius:10, marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>{a.title}</span>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {a.pinned && <span style={{ fontSize:10, background:'var(--amber)', color:'#fff', padding:'1px 6px', borderRadius:999 }}>置顶</span>}
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{a.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>{a.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* 简介 */}
          <div className="detail-section">
            <h2>机构简介</h2>
            <p>{instructor.bio}</p>
          </div>

          {/* 课程体系 — 团体课按课纲分组 */}
          {groupOfferings.length > 0 && (
            <div className="detail-section">
              <h2>课程体系</h2>
              <p style={{ marginBottom:16, color:'var(--text-muted)', fontSize:13.5 }}>
                课程按程度循序渐进，完成前一级才能报下一级。
              </p>
              {myCurricula.map(cur => {
                const curOfferings = groupOfferings.filter(o => o.curriculumId === cur.id);
                const curLevels = myLevels.filter(l => l.curriculumId === cur.id).sort((a,b) => a.levelIndex - b.levelIndex);
                if (curOfferings.length === 0) return null;
                return (
                  <div key={cur.id} style={{ marginBottom:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'8px 14px', background:cur.color, borderRadius:10 }}>
                      <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{cur.name}</span>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>{cur.nameEn} · {cur.ageRange}</span>
                      {cur.requiresPrivateLesson && <span style={{ fontSize:11, background:'rgba(255,255,255,0.25)', color:'#fff', padding:'1px 8px', borderRadius:999 }}>须同时修私教</span>}
                    </div>
                    {/* 级别路径图 */}
                    <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:0, marginBottom:14, paddingLeft:4 }}>
                      {curLevels.map((lv, i) => {
                        const lvOfferings = curOfferings.filter(o => o.levelId === lv.id);
                        const hasOpen = lvOfferings.some(o => o.booked < o.capacity);
                        const noOffering = lvOfferings.length === 0;
                        return (
                          <React.Fragment key={lv.id}>
                            <div style={{ padding:'8px 12px', borderRadius:10, textAlign:'center', minWidth:80, background: noOffering ? 'var(--bg)' : hasOpen ? 'var(--success-bg)' : 'var(--line)', border:`2px solid ${noOffering ? 'var(--line)' : hasOpen ? 'var(--success)' : 'var(--text-muted)'}` }}>
                              <div style={{ fontWeight:700, fontSize:12, color: noOffering ? 'var(--text-muted)' : 'var(--ink)' }}>{lv.shortName}</div>
                              <div style={{ fontSize:10, color:'var(--text-muted)' }}>{lv.ageMin}-{lv.ageMax}岁</div>
                              {!noOffering && <div style={{ fontSize:10, fontWeight:700, color: hasOpen ? 'var(--success)' : 'var(--text-muted)', marginTop:2 }}>{hasOpen ? '报名中' : '已满'}</div>}
                            </div>
                            {i < curLevels.length - 1 && <div style={{ fontSize:16, color:'var(--text-muted)', padding:'0 4px' }}>→</div>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* 班级列表 */}
                    {curOfferings.map(o => {
                      const seatsLeft = o.capacity - o.booked;
                      const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                      const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                      const level = myLevels.find(l => l.id === o.levelId);
                      const es = o.enrollmentSettings || {};
                      return (
                        <div key={o.id} className="class-option" style={{ display:'block', borderLeft:`3px solid ${cur.color}` }}>
                          <div className="class-option-head">
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              {level && <span style={{ fontSize:11, padding:'1px 7px', borderRadius:999, background:cur.color, color:'#fff', fontWeight:700 }}>{level.shortName}</span>}
                              <span className="class-option-title">{o.name}</span>
                            </div>
                            <span className="class-option-price">${pricePlan?.amount}/{pricePlan?.unit}</span>
                          </div>
                          <div className="class-option-desc">
                            {teacher?.name} · 每堂{o.durationMin}分钟
                            {o.startDate && ` · ${o.startDate} – ${o.endDate}`}
                            {o.totalSessions && ` · 共${o.totalSessions}堂`}
                            {o.slots?.map(s => ` · ${s.day} ${s.time}`).join('')}
                          </div>
                          <div style={{ display:'flex', gap:6, marginTop:10, alignItems:'center', flexWrap:'wrap' }}>
                            <span style={{ fontSize:12, fontWeight:700, color: seatsLeft <= 0 ? 'var(--error)' : seatsLeft <= 2 ? 'var(--warn)' : 'var(--success)' }}>
                              {seatsLeft <= 0 ? '⚡ 已额满' : seatsLeft <= 2 ? `⚡ 仅剩 ${seatsLeft} 个名额` : `✓ 剩 ${seatsLeft} 个名额`}
                            </span>
                            {(() => {
                              const openHouse = myOpenHouses.find(oh => oh.offeringIds?.includes(o.id));
                              const isFull = seatsLeft <= 0;
                              return (
                                <>
                                  {openHouse && (
                                    <button onClick={() => openModal('openhouse', o, openHouse)}
                                      style={{ fontSize:12, padding:'4px 12px', background:'#E91E8C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                      🎪 参加 Open House
                                    </button>
                                  )}
                                  {es.allowTrial && !isFull && (
                                    <button onClick={() => openModal('trial', o, null)}
                                      style={{ fontSize:12, padding:'4px 12px', background:'#22C55E', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                      🎁 申请试听
                                    </button>
                                  )}
                                  {!isFull && (
                                    <button onClick={() => openModal('enroll', o, null)}
                                      style={{ fontSize:12, padding:'4px 12px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                      ✍️ 立即报名
                                    </button>
                                  )}
                                  {isFull && es.allowWaitlist && (
                                    <button onClick={() => openModal('waitlist', o, null)}
                                      style={{ fontSize:12, padding:'4px 12px', background:'#4A6FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                      📋 加入候补
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* 一对一私教 */}
          {privateOfferings.length > 0 && (
            <div className="detail-section">
              <h2>一对一私教</h2>
              <p style={{ marginBottom:14, color:'var(--text-muted)', fontSize:13.5 }}>依学生程度量身订制，进度完全灵活，需先预约咨询。</p>
              {privateOfferings.map(o => {
                const seatsLeft = o.capacity - o.booked;
                const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                const es = o.enrollmentSettings || {};
                return (
                  <div key={o.id} className="class-option" style={{ display:'block', borderLeft:'3px solid #4A6FA5' }}>
                    <div className="class-option-head">
                      <span className="class-option-title">{o.name}</span>
                      <span className="class-option-price">${pricePlan?.amount}/{pricePlan?.unit}</span>
                    </div>
                    <div className="class-option-desc">
                      {teacher?.name} · 每堂{o.durationMin}分钟
                      {o.slots?.map(s => ` · ${s.day} ${s.time}（剩${s.seatsLeft}位）`).join('')}
                    </div>
                    {/* 三种入口按钮 */}
                    {(() => {
                      const openHouse = myOpenHouses.find(oh => oh.offeringIds?.includes(o.id));
                      const seatsLeft = o.capacity - (o.booked || 0);
                      const isFull = seatsLeft <= 0;
                      return (
                        <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                          {openHouse && (
                            <button onClick={() => openModal('openhouse', o, openHouse)}
                              style={{ fontSize:12, padding:'6px 14px', background:'#E91E8C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                              🎪 参加 Open House
                            </button>
                          )}
                          {es.allowTrial && !isFull && (
                            <button onClick={() => openModal('trial', o, null)}
                              style={{ fontSize:12, padding:'6px 14px', background:'var(--success)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                              🎁 申请旁听一堂
                            </button>
                          )}
                          {!isFull ? (
                            <button onClick={() => openModal('enroll', o, null)}
                              style={{ fontSize:12, padding:'6px 14px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                              ✍️ 立即报名
                            </button>
                          ) : es.allowWaitlist && (
                            <button onClick={() => openModal('waitlist', o, null)}
                              style={{ fontSize:12, padding:'6px 14px', background:'#4A6FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                              📋 加入候补名单
                            </button>
                          )}
                        </div>
                      );
                    })()}
                    {es.requireConsultation && <div style={{ fontSize:12, color:'#4A6FA5', marginTop:5 }}>📋 请先填写咨询表，老师将与您联络安排时间。</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* 工作坊/营队 */}
          {workshopOfferings.length > 0 && (
            <div className="detail-section">
              <h2>🌟 工作坊 / 营队</h2>
              <p style={{ marginBottom:14, color:'var(--text-muted)', fontSize:13.5 }}>限时特别活动，不需先修，报名从速。</p>
              {workshopOfferings.map(o => {
                const seatsLeft = o.capacity - o.booked;
                const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                const es = o.enrollmentSettings || {};
                return (
                  <div key={o.id} className="class-option" style={{ display:'block', borderLeft:'3px solid var(--amber)', background:'#FFFBF5' }}>
                    <div className="class-option-head">
                      <span className="class-option-title">{o.name}</span>
                      <span className="class-option-price">${pricePlan?.amount}/{pricePlan?.unit}</span>
                    </div>
                    <div className="class-option-desc">
                      {teacher?.name} · {o.durationMin}分钟/天 · 共{o.totalSessions}天
                      {o.startDate && ` · ${o.startDate} – ${o.endDate}`}
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:6, alignItems:'center' }}>
                      <span style={{ fontSize:12, fontWeight:700, color: seatsLeft <= 0 ? 'var(--error)' : seatsLeft <= 2 ? 'var(--warn)' : 'var(--success)' }}>
                        {seatsLeft <= 0 ? '⚡ 已额满' : seatsLeft <= 2 ? `⚡ 仅剩 ${seatsLeft} 个名额` : `✓ 剩 ${seatsLeft} 个名额`}
                      </span>
                      {(() => {
                        const openHouse2 = myOpenHouses.find(oh => oh.offeringIds?.includes(o.id));
                        const isFull2 = seatsLeft <= 0;
                        return (
                          <>
                            {openHouse2 && (
                              <button onClick={() => openModal('openhouse', o, openHouse2)}
                                style={{ fontSize:12, padding:'4px 12px', background:'#E91E8C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                🎪 参加 Open House
                              </button>
                            )}
                            {es.allowTrial && !isFull2 && (
                              <button onClick={() => openModal('trial', o, null)}
                                style={{ fontSize:12, padding:'4px 12px', background:'#22C55E', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                🎁 申请试听
                              </button>
                            )}
                            {!isFull2 && (
                              <button onClick={() => openModal('enroll', o, null)}
                                style={{ fontSize:12, padding:'4px 12px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                ✍️ 立即报名
                              </button>
                            )}
                            {isFull2 && es.allowWaitlist && (
                              <button onClick={() => openModal('waitlist', o, null)}
                                style={{ fontSize:12, padding:'4px 12px', background:'#4A6FA5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                                📋 加入候补
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 老师介绍 */}
          {(() => {
            const teachers = studioTeachers.filter(t => t.studioId === instructor.id);
            if (teachers.length === 0) return null;
            let savedProfiles = {};
            try { savedProfiles = JSON.parse(localStorage.getItem('kcp_teacher_profiles') || '{}'); } catch(e) {}
            return (
              <div className="detail-section">
                <h2>老师介绍</h2>
                <div className="stack gap-md">
                  {teachers.map(t => {
                    const saved = savedProfiles[t.id] || {};
                    return (
                      <div key={t.id} style={{ display:'flex', gap:16, padding:'16px', background:'var(--bg)', borderRadius:12, border:'1px solid var(--line)' }}>
                        <div style={{ width:52, height:52, borderRadius:50, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:20, flexShrink:0 }}>
                          {t.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{t.name}</div>
                          <div style={{ fontSize:12.5, color:'var(--text-muted)', marginTop:2 }}>{saved.title || t.title}</div>
                          <p style={{ fontSize:13, marginTop:6, marginBottom:6 }}>{saved.bio || t.bio}</p>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {(t.specialties || []).map((s, i) => <span key={i} className="tag-pill">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 家长评价 */}
          <div className="detail-section">
            <h2>家长评价</h2>
            {instructor.reviews.map((r, i) => (
              <div className="review-card" key={i}>
                <div className="review-stars">{'★'.repeat(r.rating)}</div>
                <p style={{ margin: 0 }}>{r.text}</p>
                <div className="review-author">{r.author}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 侧边快速资讯 */}
        <div className="sticky-side">
          <div style={{ fontWeight:700, color:'var(--ink)', marginBottom:8 }}>快速资讯</div>
          <div className="summary-row"><span className="label">类别</span><span>{instructor.category}</span></div>
          <div className="summary-row"><span className="label">距离</span><span>约 {instructor.distanceMiles} 英里</span></div>
          <div className="summary-row"><span className="label">评分</span><span>★ {instructor.rating}({instructor.reviewCount})</span></div>
          <div className="summary-row"><span className="label">经验</span><span>{instructor.yearsExperience} 年</span></div>
          <div className="summary-row"><span className="label">班级数</span><span>{myOfferings.length} 个</span></div>
          <div style={{ borderTop:'1px solid var(--line)', marginTop:12, paddingTop:12 }}>
            {workshopOfferings.length > 0 && (
              <div style={{ background:'var(--warn-bg)', border:'1px solid var(--amber)', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>🌟 暑期营</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  {workshopOfferings[0].name} · 剩{workshopOfferings[0].capacity - workshopOfferings[0].booked}位
                </div>
              </div>
            )}
            <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
              {instructor.location}
            </div>
          </div>
        </div>
      </div>

      {/* ── 报名/试听/Open House 弹窗 ── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, zIndex:300 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setModal(null)} />
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'var(--card)', borderRadius:18, padding:28, width:460, maxWidth:'92vw', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>
                  {modal.type === 'openhouse' ? '🎪' : modal.type === 'trial' ? '🎁' : modal.type === 'waitlist' ? '📋' : '✅'}
                </div>
                <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>
                  {modal.type === 'openhouse' ? '报名成功！' : modal.type === 'trial' ? '申请已送出！' : modal.type === 'waitlist' ? '已加入候补！' : '报名成功！'}
                </div>
                <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8, marginBottom:20 }}>
                  {modal.type === 'openhouse' && `我们将发送确认Email到 ${form.parentEmail}，期待在 ${modal.openHouse?.date} 见到您！`}
                  {modal.type === 'trial' && `老师收到申请后会尽快联络您（${form.parentEmail}）确认旁听时间。`}
                  {modal.type === 'enroll' && `老师将与您联络确认报名细节，并发送学费信息到 ${form.parentEmail}。`}
                  {modal.type === 'waitlist' && `有名额释出时，我们会第一时间通知 ${form.parentEmail}。`}
                </div>
                <button onClick={() => setModal(null)}>关闭</button>
              </div>
            ) : (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:17 }}>
                      {modal.type === 'openhouse' ? '🎪 报名 Open House' : modal.type === 'trial' ? '🎁 申请旁听一堂' : modal.type === 'waitlist' ? '📋 加入候补名单' : '✍️ 立即报名'}
                    </div>
                    <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>
                      {modal.type === 'openhouse' ? modal.openHouse?.title : modal.offering?.name}
                    </div>
                  </div>
                  <button className="secondary" onClick={() => setModal(null)} style={{ fontSize:12, padding:'4px 8px' }}>✕</button>
                </div>

                {/* Open House 活动信息 */}
                {modal.type === 'openhouse' && modal.openHouse && (
                  <div style={{ padding:'12px 14px', background:'#FDF0F8', border:'1.5px solid #E91E8C', borderRadius:10, marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#E91E8C', marginBottom:4 }}>{modal.openHouse.title}</div>
                    <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.7 }}>
                      📅 {modal.openHouse.date} {modal.openHouse.time}<br/>
                      📍 {modal.openHouse.location}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{modal.openHouse.desc}</div>
                    <div style={{ fontSize:12, color:'#E91E8C', marginTop:6, fontWeight:600 }}>
                      剩余名额：{modal.openHouse.maxAttendees - modal.openHouse.registeredCount} 位
                    </div>
                  </div>
                )}

                {/* 试听说明 */}
                {modal.type === 'trial' && (
                  <div style={{ padding:'10px 14px', background:'var(--success-bg)', border:'1px solid var(--success)', borderRadius:10, marginBottom:16, fontSize:13, color:'var(--ink)', lineHeight:1.7 }}>
                    旁听申请会送给老师审核，老师确认后会Email通知您上课时间。
                    <br/>
                    <span style={{ color:'var(--success)', fontWeight:600 }}>免费旁听，不收任何费用。</span>
                  </div>
                )}

                {/* 表单字段 */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>家长姓名 *</div>
                      <input value={form.parentName} onChange={e => setForm(f=>({...f,parentName:e.target.value}))}
                        placeholder="例：王妈妈"
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>联络电话</div>
                      <input value={form.parentPhone} onChange={e => setForm(f=>({...f,parentPhone:e.target.value}))}
                        placeholder="425-xxx-xxxx"
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>Email *</div>
                    <input value={form.parentEmail} onChange={e => setForm(f=>({...f,parentEmail:e.target.value}))}
                      placeholder="your@email.com" type="email"
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                  </div>

                  {modal.type === 'openhouse' ? (
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>参加人数（大人+小孩）</div>
                      <select value={form.childCount} onChange={e => setForm(f=>({...f,childCount:e.target.value}))}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14 }}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} 人</option>)}
                      </select>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>孩子姓名</div>
                        <input value={form.childName} onChange={e => setForm(f=>({...f,childName:e.target.value}))}
                          placeholder="例：王小明"
                          style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>孩子年龄</div>
                        <select value={form.childAge} onChange={e => setForm(f=>({...f,childAge:e.target.value}))}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14 }}>
                          <option value="">请选择</option>
                          {[3,4,5,6,7,8,9,10,11,12,13,14].map(a => <option key={a} value={a}>{a} 岁</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {modal.type === 'trial' && (
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>希望旁听日期</div>
                      <input type="date" value={form.preferredDate} onChange={e => setForm(f=>({...f,preferredDate:e.target.value}))}
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>备注（选填）</div>
                    <textarea value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
                      placeholder={modal.type === 'trial' ? '例：孩子没有钢琴基础，想了解是否适合JMC1' : '任何想让老师知道的事'}
                      rows={2}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
                  </div>
                </div>

                <div style={{ marginTop:20, display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button className="secondary" onClick={() => setModal(null)}>取消</button>
                  <button
                    disabled={!form.parentName || !form.parentEmail}
                    onClick={handleSubmit}
                    style={{ opacity: (!form.parentName || !form.parentEmail) ? 0.5 : 1,
                      background: modal.type === 'openhouse' ? '#E91E8C' : modal.type === 'trial' ? 'var(--success)' : 'var(--amber)',
                      color:'#fff', border:'none', borderRadius:8, padding:'9px 22px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    {modal.type === 'openhouse' ? '确认报名 Open House' : modal.type === 'trial' ? '送出旁听申请' : modal.type === 'waitlist' ? '加入候补' : '送出报名申请'}
                  </button>
                </div>

                <div style={{ marginTop:12, fontSize:11.5, color:'var(--text-muted)', textAlign:'center' }}>
                  提交后您会收到确认Email · 实际产品将整合自动通知系统
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 联络资讯 ── */}
      <div style={{ marginTop:40, paddingTop:32, borderTop:'2px solid var(--line)' }}>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>联络我们</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          {[
            { icon:'📞', label:'电话', value: studioContact.phone, href: `tel:${studioContact.phone}` },
            { icon:'✉️', label:'Email', value: studioContact.email, href: `mailto:${studioContact.email}` },
            { icon:'🕐', label:'营业时间', value: studioContact.hours },
            { icon:'🌐', label:'官方网站', value: studioContact.website, href: studioContact.website },
          ].filter(f => f.value).map(f => (
            <div key={f.label} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:10 }}>
              <span style={{ fontSize:20 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:2 }}>{f.label}</div>
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer" style={{ fontSize:14, color:'var(--amber)', fontWeight:600, textDecoration:'none' }}>{f.value}</a>
                ) : (
                  <div style={{ fontSize:14, fontWeight:500 }}>{f.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {studioContact.address && (
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom: studioContact.parking ? 10 : 0 }}>
              <span style={{ fontSize:20 }}>📍</span>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:2 }}>地址</div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(studioContact.address)}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:14, color:'var(--amber)', fontWeight:600, textDecoration:'none' }}>
                  {studioContact.address}
                </a>
              </div>
            </div>
            {studioContact.parking && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', paddingTop:10, borderTop:'1px solid var(--line)' }}>
                <span style={{ fontSize:16 }}>🅿️</span>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>{studioContact.parking}</div>
              </div>
            )}
          </div>
        )}

        {/* 社群媒体 */}
        {[
          { key:'instagram', label:'Instagram', color:'#E1306C', icon:'📸', prefix:'https://instagram.com/' },
          { key:'facebook',  label:'Facebook',  color:'#1877F2', icon:'👍', prefix:'' },
          { key:'xiaohongshu',label:'小红书',   color:'#FF2442', icon:'📕', prefix:'https://xiaohongshu.com/user/profile/' },
          { key:'wechat',    label:'WeChat',     color:'#07C160', icon:'💬', prefix:'' },
          { key:'youtube',   label:'YouTube',    color:'#FF0000', icon:'▶️', prefix:'https://youtube.com/@' },
          { key:'line',      label:'LINE',       color:'#00B900', icon:'💚', prefix:'' },
        ].some(s => studioContact[s.key]) && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', marginBottom:10 }}>追踪我们</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {[
                { key:'instagram', label:'Instagram', color:'#E1306C', icon:'📸' },
                { key:'facebook',  label:'Facebook',  color:'#1877F2', icon:'👍' },
                { key:'xiaohongshu',label:'小红书',   color:'#FF2442', icon:'📕' },
                { key:'wechat',    label:'WeChat',     color:'#07C160', icon:'💬' },
                { key:'youtube',   label:'YouTube',    color:'#FF0000', icon:'▶️' },
                { key:'line',      label:'LINE',       color:'#00B900', icon:'💚' },
              ].filter(s => studioContact[s.key]).map(s => (
                <a key={s.key}
                  href={studioContact[s.key].startsWith('http') ? studioContact[s.key] : `#`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, padding:'7px 16px', borderRadius:999, background: s.color + '15', color: s.color, fontWeight:700, border:`1.5px solid ${s.color}40`, textDecoration:'none' }}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
