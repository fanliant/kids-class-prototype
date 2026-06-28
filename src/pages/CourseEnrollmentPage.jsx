import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CoursesContext';
import { useBookings } from '../context/BookingsContext';
import { instructors } from '../mockData';

const statusLabel = {
  confirmed:       { text: '已确认', bg: 'var(--success-bg)', color: 'var(--success)' },
  pending_payment: { text: '待付款', bg: 'var(--warn-bg)',    color: 'var(--warn)'    },
  waitlisted:      { text: '候补中', bg: '#EEF2F7',           color: '#4A6FA5'        },
  cancelled:       { text: '已取消', bg: 'var(--line)',        color: 'var(--text-muted)' },
};

// Mock pipeline data - 感兴趣但尚未报名的潜在学生
const mockPipeline = [
  { id: 'p1', name: '林小华', parentName: '林妈妈', email: 'lin@example.com', phone: '425-111-2222', source: '朋友介绍', interest: '高', lastContact: '2026-06-20', note: '询问过价格,说要跟先生讨论' },
  { id: 'p2', name: '王大明', parentName: '王爸爸', email: 'wang@example.com', phone: '206-333-4444', source: '网站询问', interest: '中', lastContact: '2026-06-15', note: '参加过试课,觉得时间有点冲突' },
  { id: 'p3', name: '陈雅婷', parentName: '陈妈妈', email: 'chen@example.com', phone: '425-555-6666', source: 'Instagram', interest: '高', lastContact: '2026-06-10', note: '非常有兴趣,等暑假结束再报名' },
];

const interestColor = { 高: { bg:'#E8F5E9', color:'#2E7D32' }, 中: { bg:'var(--warn-bg)', color:'var(--warn)' }, 低: { bg:'var(--line)', color:'var(--text-muted)' } };

export default function CourseEnrollmentPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { courses } = useCourses();
  const { bookings } = useBookings();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [msgTarget, setMsgTarget]   = useState(null);
  const [msgText, setMsgText]       = useState('');
  const [msgSent, setMsgSent]       = useState(false);
  const [activeTab, setActiveTab]   = useState(searchParams.get('tab') || 'enrolled');

  const course = courses.find((c) => c.id === courseId);
  const instructor = instructors.find((i) => i.id === (course?.instructorId || user?.instructorId));

  if (!course) {
    return (
      <div className="page">
        <div className="flow-card">
          <h2>找不到这门课程</h2>
          <button className="secondary" onClick={() => navigate(-1)}>← 返回</button>
        </div>
      </div>
    );
  }

  const allBookings = bookings.filter((b) => b.classId === courseId);
  const enrolled    = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending_payment');
  const confirmed   = allBookings.filter((b) => b.status === 'confirmed');
  const pendingPay  = allBookings.filter((b) => b.status === 'pending_payment');
  const waitlisted  = allBookings.filter((b) => b.status === 'waitlisted');
  const seatsLeft   = Math.max(0, course.capacity - enrolled.length);

  function openMsg(target, defaultText) {
    setMsgTarget(target);
    setMsgText(defaultText);
    setMsgSent(false);
  }

  function sendMsg() {
    setMsgSent(true);
    setTimeout(() => setMsgTarget(null), 1800);
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ paddingTop: 12, marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="secondary" style={{ fontSize: 12.5, padding: '5px 12px', marginBottom: 12 }}>← 返回</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>{course.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
              {instructor?.name} · {course.ageRange} · ${course.price}/{course.priceUnit === 'monthly' ? '月' : course.priceUnit === 'per_term' ? '期' : '次'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="secondary" style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => openMsg('all-enrolled',
                `您好！感谢您报名「${course.title}」。\n\n课程相关事项如有更新，我们会尽快通知您。如有任何问题请随时联系我们。\n\n${instructor?.name}`)}>
              ✉️ 群发给已报名学生
            </button>
            <button style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => {
                const link = `${window.location.origin}${window.location.pathname}#/class/${course.instructorId}/${course.id}`;
                navigator.clipboard.writeText(link).then(() => alert('课程连结已复制！'));
              }}>
              🔗 复制招生连结
            </button>
          </div>
        </div>
      </div>

      {/* 招生进度条 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'16px 20px', marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontWeight:700, fontSize:14 }}>招生进度</span>
          <span style={{ fontSize:13.5, fontWeight:700, color: enrolled.length >= course.capacity ? 'var(--success)' : 'var(--text-muted)' }}>
            {enrolled.length} / {course.capacity} 位
          </span>
        </div>
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          {Array.from({ length: course.capacity }).map((_, i) => (
            <div key={i} style={{
              flex:1, height:10, borderRadius:4,
              background: i < confirmed.length ? 'var(--success)'
                        : i < enrolled.length  ? 'var(--amber)'
                        : 'var(--line)',
            }} />
          ))}
        </div>
        <div style={{ display:'flex', gap:16, fontSize:12.5 }}>
          {[['var(--success)','已付款',confirmed.length],['var(--amber)','待付款',pendingPay.length],['var(--line)','空位',seatsLeft]].map(([bg,label,n]) => (
            <span key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:3, background:bg, display:'inline-block' }} />
              {label} {n} 位
            </span>
          ))}
          {waitlisted.length > 0 && (
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:3, background:'#4A6FA5', display:'inline-block' }} />
              候补 {waitlisted.length} 位
            </span>
          )}
        </div>
      </div>

      {/* Tab切换 */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--line)', borderRadius:10, padding:4, width:'fit-content' }}>
        {[
          { key:'enrolled',  label:`已报名 (${enrolled.length})` },
          { key:'waitlist',  label:`候补 (${waitlisted.length})` },
          { key:'pipeline',  label:`潜在学生 (${mockPipeline.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding:'7px 16px', fontSize:13.5, borderRadius:8, border:'none', cursor:'pointer',
              background: activeTab === key ? 'var(--card)' : 'transparent',
              fontWeight: activeTab === key ? 700 : 400,
              color: activeTab === key ? 'var(--ink)' : 'var(--text-muted)',
              boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, alignItems:'start' }}>
        <div>
          {/* 已报名学生 */}
          {activeTab === 'enrolled' && (
            <div>
              {enrolled.length === 0 ? (
                <div className="banner banner-info">还没有学生报名这门课。</div>
              ) : (
                <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
                  <table className="dash-table" style={{ margin:0 }}>
                    <thead>
                      <tr><th>#</th><th>学生</th><th>时段</th><th>付款</th><th>请假</th><th></th></tr>
                    </thead>
                    <tbody>
                      {enrolled.map((b, i) => {
                        const slot = (course.slots || []).find((s) => s.id === b.slotId);
                        const st = statusLabel[b.status] || statusLabel.confirmed;
                        return (
                          <tr key={b.id}>
                            <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i+1}</td>
                            <td>
                              <div style={{ fontWeight:600 }}>{b.childName}</div>
                              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{b.parentEmail}</div>
                            </td>
                            <td style={{ fontSize:13 }}>{slot ? `${slot.day} ${slot.time}` : '—'}</td>
                            <td>
                              <span style={{ fontSize:12, background:st.bg, color:st.color, padding:'3px 8px', borderRadius:999, fontWeight:600 }}>{st.text}</span>
                            </td>
                            <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                              {b.leaveStatus === 'no_makeup' ? '请假中' : b.leaveStatus === 'makeup_scheduled' ? '补课已排' : '—'}
                            </td>
                            <td>
                              <button className="secondary" style={{ fontSize:11.5, padding:'3px 8px' }}
                                onClick={() => openMsg({ name:b.childName, email:b.parentEmail },
                                  `您好 ${b.childName} 的家长！\n\n这里是关于「${course.title}」的通知：\n\n（请在此输入您想告知的事项）\n\n如有任何问题请随时联系我们。\n\n${instructor?.name}`)}>
                                联系
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 候补名单 */}
          {activeTab === 'waitlist' && (
            <div>
              {waitlisted.length === 0 ? (
                <div className="banner banner-info">目前没有候补学生。</div>
              ) : (
                <div style={{ background:'var(--card)', border:'1.5px solid #4A6FA5', borderRadius:12, overflow:'hidden' }}>
                  <table className="dash-table" style={{ margin:0 }}>
                    <thead>
                      <tr><th>顺序</th><th>学生</th><th>时段偏好</th><th></th></tr>
                    </thead>
                    <tbody>
                      {waitlisted.map((b, i) => {
                        const slot = (course.slots || []).find((s) => s.id === b.slotId);
                        return (
                          <tr key={b.id}>
                            <td style={{ fontWeight:700, color:'#4A6FA5' }}>#{i+1}</td>
                            <td>
                              <div style={{ fontWeight:600 }}>{b.childName}</div>
                              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{b.parentEmail}</div>
                            </td>
                            <td style={{ fontSize:13 }}>{slot ? `${slot.day} ${slot.time}` : '—'}</td>
                            <td style={{ display:'flex', gap:6 }}>
                              <button className="secondary" style={{ fontSize:11.5, padding:'3px 8px' }}
                                onClick={() => openMsg({ name:b.childName, email:b.parentEmail },
                                  `您好 ${b.childName} 的家长！\n\n好消息！「${course.title}」目前有空位开放，您可以点击以下连结完成报名：\n\n（报名连结）\n\n名额有限，欢迎尽快确认！\n\n${instructor?.name}`)}>
                                通知有空位
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {seatsLeft > 0 && (
                <div style={{ marginTop:16, padding:'12px 16px', background:'var(--card)', borderRadius:12, border:'1px dashed var(--line)', fontSize:13.5, color:'var(--text-muted)' }}>
                  🪑 目前还有 <strong style={{ color:'var(--ink)' }}>{seatsLeft} 个空位</strong>，可以优先通知候补学生报名。
                </div>
              )}
            </div>
          )}

          {/* 潜在学生 Pipeline */}
          {activeTab === 'pipeline' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <p style={{ fontSize:13.5, color:'var(--text-muted)', margin:0 }}>
                  这些是曾经询问过但尚未报名的潜在学生，可以发送课程资讯提醒他们报名。
                </p>
                <button style={{ fontSize:13, padding:'7px 14px', whiteSpace:'nowrap' }}
                  onClick={() => openMsg('all-pipeline',
                    `您好！\n\n感谢您之前对「${course.title}」的关注！\n\n目前课程还有 ${seatsLeft} 个名额，欢迎把握机会报名。点击以下连结了解课程详情：\n\n（课程连结）\n\n如有任何问题欢迎随时联系，期待和您的孩子一起学习！\n\n${instructor?.name}`)}>
                  📣 群发招生通知
                </button>
              </div>
              <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
                <table className="dash-table" style={{ margin:0 }}>
                  <thead>
                    <tr><th>学生</th><th>来源</th><th>兴趣</th><th>最后联系</th><th>备注</th><th></th></tr>
                  </thead>
                  <tbody>
                    {mockPipeline.map((p) => {
                      const ic = interestColor[p.interest] || interestColor['中'];
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight:600 }}>{p.name}</div>
                            <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{p.parentName} · {p.email}</div>
                          </td>
                          <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{p.source}</td>
                          <td>
                            <span style={{ fontSize:12, background:ic.bg, color:ic.color, padding:'2px 8px', borderRadius:999, fontWeight:600 }}>{p.interest}</span>
                          </td>
                          <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{p.lastContact}</td>
                          <td style={{ fontSize:12.5, color:'var(--text-muted)', maxWidth:180 }}>{p.note}</td>
                          <td>
                            <button className="secondary" style={{ fontSize:11.5, padding:'3px 8px' }}
                              onClick={() => openMsg({ name:p.name, email:p.email },
                                `您好 ${p.name} 的家长！\n\n感谢您之前对「${course.title}」的关注！\n\n目前课程仍有名额，欢迎报名。如有任何问题欢迎随时联系。\n\n${instructor?.name}`)}>
                              发送邀请
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 右侧边栏 */}
        <div>
          {/* 各时段 */}
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)', fontWeight:700, fontSize:13.5 }}>各时段报名</div>
            {(course.slots || []).map((slot) => {
              const slotStudents = enrolled.filter((b) => b.slotId === slot.id);
              return (
                <div key={slot.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{slot.day}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{slot.time}</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{slotStudents.length} 位</div>
                  </div>
                  {slotStudents.length > 0 && (
                    <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                      {slotStudents.map((b) => b.childName).join('、')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 课程资讯 */}
          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 16px', fontSize:13.5 }}>
            <div style={{ fontWeight:700, marginBottom:10 }}>课程资讯</div>
            {[
              { label:'总容量', value:`${course.capacity} 位` },
              { label:'空位', value:`${seatsLeft} 位` },
              { label:'候补人数', value:`${waitlisted.length} 位` },
              { label:'补课政策', value: course.allowsMakeup ? '支援补课' : '不支援补课' },
              { label:'上架状态', value: course.status === 'published' ? '公开招生' : '草稿' },
              course.termStartDate && { label:'开课日期', value: course.termStartDate },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--line)' }}>
                <span style={{ color:'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight:600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 发讯息 Modal */}
      {msgTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'var(--card)', borderRadius:16, width:'100%', maxWidth:500, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
            {msgSent ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <h3 style={{ marginBottom:4 }}>讯息已发送！</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
                  {msgTarget === 'all-enrolled' ? '已群发给所有已报名学生'
                   : msgTarget === 'all-pipeline' ? '已群发给所有潜在学生'
                   : `已发送给 ${msgTarget.name} 的家长`}
                </p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h3 style={{ margin:0, fontSize:17 }}>
                    {msgTarget === 'all-enrolled' ? '群发给已报名学生'
                     : msgTarget === 'all-pipeline' ? '群发招生通知'
                     : `联系 ${msgTarget.name} 的家长`}
                  </h3>
                  <button onClick={() => setMsgTarget(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
                </div>
                {msgTarget.email && (
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>
                    收件人：{msgTarget.email}
                  </div>
                )}
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  rows={9}
                  style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid var(--line)', fontSize:13.5, fontFamily:'inherit', lineHeight:1.7, resize:'vertical', background:'var(--bg)', color:'var(--ink)', boxSizing:'border-box' }}
                />
                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:14 }}>
                  <button className="secondary" onClick={() => setMsgTarget(null)}>取消</button>
                  <button onClick={sendMsg}>发送讯息</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
