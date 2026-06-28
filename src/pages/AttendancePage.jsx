import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockClassOfferings, mockEnrollments, studioTeachers, mockLevels, mockCurricula, mockLeaveRequests } from '../mockData';

export default function AttendancePage() {
  const { courseId, sessionDate } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === 'owner';
  const studioId = user?.instructorId || 'mira-piano';

  const offering = mockClassOfferings.find(o => o.id === courseId);
  const level = mockLevels.find(l => l.id === offering?.levelId);
  const curriculum = mockCurricula.find(c => c.id === offering?.curriculumId);
  const slot = offering?.slots?.[0];

  // 该班已报名学生
  const enrolled = mockEnrollments.filter(e => e.offeringId === courseId && (e.status === 'confirmed' || e.status === 'pending_payment'));

  // 地点设定（从offering读取，prototype用mock）
  const locationType = offering?.locationType || 'fixed';
  const locationRooms = offering?.locationRooms || ['A教室', 'B教室', 'C教室'];
  const defaultLocation = offering?.locationFixed || offering?.locationDefault || '主教室';

  // 其他班的学生（可能来补课）
  const otherStudents = mockEnrollments.filter(e =>
    e.offeringId !== courseId &&
    e.status === 'confirmed' &&
    mockClassOfferings.find(o => o.id === e.offeringId && o.studioId === studioId)
  );

  const defaultTeacherId = offering?.primaryTeacherId || studioTeachers.find(t => t.studioId === studioId)?.id || '';

  const [attendance, setAttendance] = useState(
    Object.fromEntries(enrolled.map(e => {
      const lr = mockLeaveRequests.find(l => l.enrollmentId === e.id);
      return [e.id, lr ? 'leave' : 'present'];
    }))
  );
  const [teacherId, setTeacherId] = useState(defaultTeacherId);
  const [substituteFor, setSubstituteFor] = useState('');
  const [makeupStudents, setMakeupStudents] = useState([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState(null);
  const [lessonNote, setLessonNote] = useState({ parentNote:'', privateNote:'' });
  const [noteSaved, setNoteSaved] = useState(false);
  const [isListening, setIsListening] = useState(null); // 'parent' | 'private' | null
  const [todayLocation, setTodayLocation] = useState(''); // 今日地点（可覆盖）
  const [showLocationEdit, setShowLocationEdit] = useState(false);

  // 请假记录
  const leaveRequests = mockLeaveRequests.filter(lr => lr.offeringId === courseId);
  const onLeaveIds = new Set(leaveRequests.map(lr => lr.enrollmentId));

  const teachers = studioTeachers.filter(t => t.studioId === studioId);
  const isSubstitute = teacherId !== defaultTeacherId;

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount  = Object.values(attendance).filter(v => v === 'absent').length;
  const leaveCount   = Object.values(attendance).filter(v => v === 'leave').length;

  function toggleAttendance(id) {
    setAttendance(prev => {
      const cur = prev[id];
      const next = cur === 'present' ? 'absent' : cur === 'absent' ? 'leave' : 'present';
      return { ...prev, [id]: next };
    });
  }

  const STATUS_CONFIG = {
    present: { label:'出席', bg:'var(--success-bg)', color:'var(--success)', border:'var(--success)' },
    absent:  { label:'缺席', bg:'#FFF0F0', color:'var(--error)', border:'var(--error)' },
    leave:   { label:'请假', bg:'var(--warn-bg)', color:'var(--warn)', border:'var(--amber)' },
  };

  // 语音辨识（使用浏览器原生 Web Speech API）
  // ⚠️ 注意：此功能依赖浏览器内建语音辨识，效果因浏览器（Chrome效果最佳）
  // 及麦克风权限而异。实际产品建议整合专业语音转文字API（如 Google Speech-to-Text）。
  function startVoice(field) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('您的浏览器不支援语音输入，请改用 Chrome。'); return; }
    const recognition = new SR();
    recognition.lang = 'zh-TW';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(field);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setLessonNote(prev => ({ ...prev, [field]: prev[field] ? prev[field] + '　' + text : text }));
      setIsListening(null);
    };
    recognition.onerror = () => setIsListening(null);
    recognition.onend   = () => setIsListening(null);
    recognition.start();
  }

  function handleSave() {
    const presentList = enrolled.filter(e => attendance[e.id] === 'present');
    const absentList  = enrolled.filter(e => attendance[e.id] === 'absent');
    const leaveList   = enrolled.filter(e => attendance[e.id] === 'leave');
    const makeupList  = leaveList.filter(e => {
      const lr = mockLeaveRequests.find(l => l.enrollmentId === e.id);
      return lr?.status === 'makeup_scheduled';
    });
    const noMakeupList = leaveList.filter(e => {
      const lr = mockLeaveRequests.find(l => l.enrollmentId === e.id);
      return !lr || lr.status === 'no_makeup';
    });
    setSummary({ presentList, absentList, leaveList, makeupList, noMakeupList });
    setSaved(true);
  }

  if (!offering) return (
    <div className="page">
      <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>找不到班级资料</div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4, paddingTop:12 }}>
        <button className="secondary" onClick={() => navigate(-1)} style={{ fontSize:13, padding:'5px 12px' }}>← 返回</button>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>课堂点名</h1>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
            {sessionDate} · {slot?.day} {slot?.time}
          </div>
        </div>
      </div>

      {/* 班级信息 */}
      <div style={{ background: curriculum ? curriculum.color + '15' : 'var(--bg)', border:`1.5px solid ${curriculum?.color || 'var(--line)'}`, borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {level && <span style={{ fontSize:12, padding:'2px 8px', borderRadius:999, background: curriculum?.color || '#888', color:'#fff', fontWeight:700 }}>{level.shortName}</span>}
            <span style={{ fontWeight:700, fontSize:16 }}>{offering.name}</span>
          </div>
          <div style={{ fontSize:13, color:'var(--text-muted)', display:'flex', gap:16 }}>
            <span>⏱ {offering.durationMin}分钟</span>
            <span>名额 {offering.capacity}人</span>
          </div>
        </div>
      </div>

      {/* ── 今日地点 ── */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>📍</span>
            <div>
              <span style={{ fontSize:13, fontWeight:600 }}>今日上课地点</span>
              <span style={{ marginLeft:8, fontSize:14, fontWeight:700, color:'var(--amber)' }}>
                {todayLocation || defaultLocation}
              </span>
            </div>
          </div>
          <button className="secondary" onClick={() => setShowLocationEdit(v => !v)}
            style={{ fontSize:12, padding:'4px 10px' }}>
            {showLocationEdit ? '收起' : '✏️ 修改'}
          </button>
        </div>

        {showLocationEdit && (
          <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--line)' }}>
            {locationType === 'fixed' && (
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>修改今日地点</div>
                <input
                  value={todayLocation}
                  onChange={e => setTodayLocation(e.target.value)}
                  placeholder={defaultLocation}
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
              </div>
            )}
            {locationType === 'multi' && (
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>选择今天用哪间教室</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {locationRooms.map(room => (
                    <button key={room}
                      onClick={() => setTodayLocation(room)}
                      style={{ padding:'7px 16px', fontSize:13, fontWeight:600, borderRadius:8, border:`2px solid ${(todayLocation||defaultLocation) === room ? 'var(--amber)' : 'var(--line)'}`, background:(todayLocation||defaultLocation) === room ? 'var(--warn-bg)' : 'var(--card)', cursor:'pointer', color:(todayLocation||defaultLocation) === room ? 'var(--amber)' : 'var(--ink)' }}>
                      {room}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {locationType === 'flexible' && (
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>今日实际地点</div>
                <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                  {['老师工作室', '学生家中', '第三方教室'].map(opt => (
                    <button key={opt}
                      onClick={() => setTodayLocation(opt)}
                      className={(todayLocation||defaultLocation) === opt ? '' : 'secondary'}
                      style={{ fontSize:12, padding:'5px 12px' }}>
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  value={todayLocation}
                  onChange={e => setTodayLocation(e.target.value)}
                  placeholder="或输入具体地址…"
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
              </div>
            )}
            {todayLocation && todayLocation !== defaultLocation && (
              <div style={{ marginTop:10, padding:'8px 12px', background:'#FFF3CD', border:'1px solid #E0922F', borderRadius:8, fontSize:12, color:'#92610A', display:'flex', gap:6, alignItems:'center' }}>
                <span>⚡</span>
                <span>地点已变更为 <strong>{todayLocation}</strong>，储存点名后系统会自动通知所有家长</span>
              </div>
            )}
            {(!todayLocation || todayLocation === defaultLocation) && (
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>实际产品会在地点变更时自动推播通知家长</div>
            )}
          </div>
        )}
      </div>

      {/* 主教老师 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>今日主教老师</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {teachers.map(t => (
            <button key={t.id}
              onClick={() => { setTeacherId(t.id); if (t.id !== defaultTeacherId) setSubstituteFor(defaultTeacherId); }}
              style={{ padding:'6px 14px', borderRadius:8, border:`2px solid ${teacherId === t.id ? (t.id !== defaultTeacherId ? 'var(--amber)' : 'var(--success)') : 'var(--line)'}`, background: teacherId === t.id ? (t.id !== defaultTeacherId ? 'var(--warn-bg)' : 'var(--success-bg)') : 'var(--card)', fontWeight: teacherId === t.id ? 700 : 400, fontSize:13, cursor:'pointer', color:'var(--ink)' }}>
              {t.name}
              {t.id === defaultTeacherId && <span style={{ fontSize:10, marginLeft:4, color:'var(--text-muted)' }}>（主教）</span>}
            </button>
          ))}
        </div>
        {isSubstitute && (
          <div style={{ marginTop:10, padding:'8px 12px', background:'var(--warn-bg)', borderRadius:8, fontSize:13, color:'var(--warn)' }}>
            🔄 代课模式：{teachers.find(t=>t.id===teacherId)?.name} 代替 {teachers.find(t=>t.id===defaultTeacherId)?.name}
          </div>
        )}
      </div>

      {/* 点名区域 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>学生出席（{enrolled.length}人）</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:12 }}>
            <span style={{ color:'var(--success)' }}>✓ 出席 {presentCount}</span>
            <span style={{ color:'var(--error)' }}>✗ 缺席 {absentCount}</span>
            <span style={{ color:'var(--warn)' }}>△ 请假 {leaveCount}</span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:8 }}>
          {enrolled.map(e => {
            const status = attendance[e.id] || 'present';
            const cfg = STATUS_CONFIG[status];
            const lr = mockLeaveRequests.find(l => l.enrollmentId === e.id);
            return (
              <div key={e.id}
                onClick={() => toggleAttendance(e.id)}
                style={{ padding:'10px 14px', borderRadius:10, border:`2px solid ${cfg.border}`, background:cfg.bg, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.15s' }}>
                <div>
                  <span style={{ fontWeight:600, fontSize:14 }}>{e.childName}</span>
                  {lr && (
                    <div style={{ fontSize:10, color:'#4A6FA5', marginTop:2 }}>
                      {lr.status === 'makeup_scheduled' ? `🔄 已请假·补课${lr.makeupDate}` : '已请假·不补课'}
                    </div>
                  )}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:cfg.color, padding:'2px 8px', borderRadius:999, background:'rgba(255,255,255,0.6)' }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:10, fontSize:11, color:'var(--text-muted)' }}>点击学生卡片切换：出席 → 缺席 → 请假 → 出席</div>
      </div>

      {/* 补课学生 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>补课学生（其他班的学生来补课）</div>
        {otherStudents.length === 0 ? (
          <div style={{ fontSize:13, color:'var(--text-muted)', fontStyle:'italic' }}>今日没有补课学生</div>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {otherStudents.slice(0,10).map(e => {
              const isMakeup = makeupStudents.includes(e.id);
              return (
                <div key={e.id}
                  onClick={() => setMakeupStudents(prev => isMakeup ? prev.filter(id => id !== e.id) : [...prev, e.id])}
                  style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${isMakeup ? '#4A6FA5' : 'var(--line)'}`, background: isMakeup ? '#EEF2F7' : 'var(--bg)', cursor:'pointer', fontSize:13, fontWeight: isMakeup ? 700 : 400, color: isMakeup ? '#4A6FA5' : 'var(--ink)' }}>
                  {e.childName} {isMakeup ? '✓' : ''}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 课堂备注 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>课堂备注</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="例：今天练习了《小星星》，下周继续第3页..."
          rows={3} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
      </div>

      {/* 储存 */}
      {!summary && (
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="secondary" onClick={() => navigate(-1)}>取消</button>
          <button onClick={handleSave}>储存点名记录</button>
        </div>
      )}

      {/* 点名摘要 */}
      {summary && (
        <div style={{ background:'var(--card)', border:'2px solid var(--success)', borderRadius:14, padding:20, marginTop:8 }}>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:14 }}>✓ 点名完成！本堂课摘要</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
            <div style={{ textAlign:'center', padding:'10px 8px', background:'var(--success-bg)', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--success)' }}>{summary.presentList.length}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>出席</div>
            </div>
            <div style={{ textAlign:'center', padding:'10px 8px', background:'#FCEBEB', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--error)' }}>{summary.absentList.length}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>缺席（未请假）</div>
            </div>
            <div style={{ textAlign:'center', padding:'10px 8px', background:'var(--warn-bg)', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--warn)' }}>{summary.noMakeupList.length}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>请假（不补课）</div>
            </div>
            <div style={{ textAlign:'center', padding:'10px 8px', background:'#EEF2F7', borderRadius:10 }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#4A6FA5' }}>{summary.makeupList.length}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>请假（已补课）</div>
            </div>
          </div>

          {/* 收费说明 */}
          <div style={{ background:'var(--bg)', borderRadius:10, padding:'12px 14px', fontSize:12.5, marginBottom:14 }}>
            <div style={{ fontWeight:700, marginBottom:6 }}>💰 本堂费用计算</div>
            <div style={{ color:'var(--text-muted)', lineHeight:2 }}>
              <div>✓ 出席 {summary.presentList.length}人 → 正常计费</div>
              <div>✗ 缺席未请假 {summary.absentList.length}人 → 照常计费（缺席费用不退）</div>
              <div>假(不补) {summary.noMakeupList.length}人 → 照常计费（请假不补课不退费）</div>
              {summary.makeupList.length > 0 && (
                <div style={{ color:'#4A6FA5' }}>🔄 补课 {summary.makeupList.length}人 → 费用转入补课老师那堂课</div>
              )}
            </div>
          </div>

          {summary.absentList.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--error)', marginBottom:6 }}>缺席（未请假）：</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {summary.absentList.map(e => (
                  <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'#FCEBEB', color:'var(--error)', fontWeight:600 }}>{e.childName}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── 课后笔记 ── */}
          <div style={{ marginTop:20, padding:'16px 18px', background:'var(--card)', border:'1.5px solid var(--amber)', borderRadius:12 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📝 课后笔记</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>储存后家长可在「孩子课表」查看课堂内容</div>

            {/* 家长可见 */}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label style={{ fontSize:13, fontWeight:600 }}>
                  课堂内容
                  <span style={{ marginLeft:6, fontSize:11, color:'var(--success)', background:'var(--success-bg)', padding:'1px 7px', borderRadius:999 }}>家长/学生可见</span>
                </label>
                <button
                  onClick={() => startVoice('parentNote')}
                  style={{ fontSize:12, padding:'4px 12px', background: isListening==='parentNote' ? '#EF4444' : 'var(--bg)', color: isListening==='parentNote' ? '#fff' : 'var(--ink)', border:'1.5px solid var(--line)', borderRadius:8, cursor:'pointer' }}>
                  {isListening==='parentNote' ? '🔴 录音中…按停止' : '🎙️ 语音输入'}
                </button>
              </div>
              <textarea
                value={lessonNote.parentNote}
                onChange={e => setLessonNote(p => ({...p, parentNote: e.target.value}))}
                placeholder="例：今天练习了《小星星》前两页，右手旋律很稳定！下周请在家练习第3页，每天10分钟。"
                rows={3}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13.5, resize:'vertical', boxSizing:'border-box', lineHeight:1.8 }} />
            </div>

            {/* 老师私人备注 */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label style={{ fontSize:13, fontWeight:600 }}>
                  老师备注
                  <span style={{ marginLeft:6, fontSize:11, color:'var(--text-muted)', background:'var(--bg)', padding:'1px 7px', borderRadius:999, border:'1px solid var(--line)' }}>仅老师可见</span>
                </label>
                <button
                  onClick={() => startVoice('privateNote')}
                  style={{ fontSize:12, padding:'4px 12px', background: isListening==='privateNote' ? '#EF4444' : 'var(--bg)', color: isListening==='privateNote' ? '#fff' : 'var(--ink)', border:'1.5px solid var(--line)', borderRadius:8, cursor:'pointer' }}>
                  {isListening==='privateNote' ? '🔴 录音中…按停止' : '🎙️ 语音输入'}
                </button>
              </div>
              <textarea
                value={lessonNote.privateNote}
                onChange={e => setLessonNote(p => ({...p, privateNote: e.target.value}))}
                placeholder="例：节奏感需加强，下次用节拍器练习。家长很积极。"
                rows={2}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13.5, resize:'vertical', boxSizing:'border-box', lineHeight:1.8 }} />
            </div>

            {/* 语音限制说明 */}
            <div style={{ fontSize:11, color:'var(--text-muted)', padding:'6px 10px', background:'var(--bg)', borderRadius:6, marginBottom:12, lineHeight:1.7 }}>
              ⚠️ <strong>语音输入注记：</strong>使用浏览器原生语音辨识（Chrome 效果最佳）。辨识结果因麦克风品质、口音及网络状态而异。实际产品将整合专业语音转文字服务提升准确率。
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button
                onClick={() => { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2500); }}
                style={{ background: noteSaved ? 'var(--success)' : 'var(--amber)', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {noteSaved ? '✅ 笔记已储存' : '储存笔记'}
              </button>
              {noteSaved && (
                <span style={{ fontSize:12, color:'var(--success)' }}>📧 实际产品会自动Email通知家长</span>
              )}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
            <button className="secondary" onClick={() => setSummary(null)}>重新点名</button>
            <button onClick={() => navigate(-1)}>完成，返回</button>
          </div>
        </div>
      )}
    </div>
  );
}
