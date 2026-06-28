import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockClassOfferings, mockEnrollments, mockLevels, mockCurricula } from '../mockData';

// Mock历史笔记
const MOCK_PAST_NOTES = [
  { date:'2026-06-17', parentNote:'今天练习了《小星星》前两页，右手旋律非常稳定！下周请在家每天练习第3页10分钟，特别注意第5小节的节奏。', privateNote:'节奏感需加强，考虑下次引入节拍器。' },
  { date:'2026-06-10', parentNote:'第一堂课！学生适应得很快，认识了5个白键音名（C D E F G），可以弹简单的5指音阶。', privateNote:'家长很积极，孩子专注力好，潜力不错。' },
  { date:'2026-06-03', parentNote:'今天学习了正确的坐姿和手型，以及键盘上的位置感。很棒的开始！', privateNote:'' },
];

export default function LessonNotePage() {
  const { courseId, sessionDate } = useParams();
  const navigate = useNavigate();
  const offering = mockClassOfferings.find(o => o.id === courseId);
  const level = mockLevels.find(l => l.id === offering?.levelId);
  const cur = mockCurricula.find(c => c.id === offering?.curriculumId);
  const enrolled = mockEnrollments.filter(e => e.offeringId === courseId && e.status === 'confirmed');

  const [note, setNote] = useState({ parentNote:'', privateNote:'' });
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  function startVoice(field) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('您的浏览器不支援语音输入，请改用 Chrome。'); return; }
    const recognition = new SR();
    recognition.lang = 'zh-TW';
    recognition.interimResults = false;
    setIsListening(field);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setNote(prev => ({ ...prev, [field]: prev[field] ? prev[field] + '　' + text : text }));
      setIsListening(null);
    };
    recognition.onerror = () => setIsListening(null);
    recognition.onend   = () => setIsListening(null);
    recognition.start();
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!offering) return <div className="page"><div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>找不到班级资料</div></div>;

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4, paddingTop:12 }}>
        <button className="secondary" onClick={() => navigate(-1)} style={{ fontSize:13, padding:'5px 12px' }}>← 返回</button>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>课堂笔记</h1>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{sessionDate}</div>
        </div>
      </div>

      {/* 班级信息 */}
      <div style={{ background: cur ? cur.color + '15' : 'var(--bg)', border:`1.5px solid ${cur?.color || 'var(--line)'}`, borderRadius:12, padding:'12px 18px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {level && <span style={{ fontSize:12, padding:'2px 8px', borderRadius:999, background: cur?.color || '#888', color:'#fff', fontWeight:700 }}>{level.shortName}</span>}
            <span style={{ fontWeight:700, fontSize:15 }}>{offering.name}</span>
          </div>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>{enrolled.length}位学生</span>
        </div>
      </div>

      {/* 这堂课的学生名单（提醒老师写笔记时参考） */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'12px 18px', marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>今日学生</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {enrolled.map(e => (
            <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'var(--success-bg)', color:'var(--success)', fontWeight:600 }}>
              {e.childName}
            </span>
          ))}
        </div>
      </div>

      {/* 笔记输入 */}
      <div style={{ background:'var(--card)', border:'1.5px solid var(--amber)', borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>📝 本堂课笔记</div>

        {/* 家长可见 */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div>
              <span style={{ fontSize:13, fontWeight:600 }}>课堂内容</span>
              <span style={{ marginLeft:8, fontSize:11, color:'var(--success)', background:'var(--success-bg)', padding:'2px 8px', borderRadius:999 }}>家长/学生可见</span>
            </div>
            <button
              onClick={() => startVoice('parentNote')}
              style={{ fontSize:13, padding:'5px 14px', background: isListening==='parentNote' ? '#EF4444' : 'var(--bg)', color: isListening==='parentNote' ? '#fff' : 'var(--ink)', border:'1.5px solid var(--line)', borderRadius:8, cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
              {isListening==='parentNote' ? '🔴 录音中…' : '🎙️ 语音输入'}
            </button>
          </div>
          <textarea
            value={note.parentNote}
            onChange={e => setNote(p => ({...p, parentNote: e.target.value}))}
            placeholder={`例：今天${enrolled[0]?.childName || '同学'}练习了…，表现很好！下周请在家每天练习…`}
            rows={4}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box', lineHeight:1.9 }} />
        </div>

        {/* 老师私人备注 */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div>
              <span style={{ fontSize:13, fontWeight:600 }}>老师备注</span>
              <span style={{ marginLeft:8, fontSize:11, color:'var(--text-muted)', background:'var(--bg)', padding:'2px 8px', borderRadius:999, border:'1px solid var(--line)' }}>仅老师可见</span>
            </div>
            <button
              onClick={() => startVoice('privateNote')}
              style={{ fontSize:13, padding:'5px 14px', background: isListening==='privateNote' ? '#EF4444' : 'var(--bg)', color: isListening==='privateNote' ? '#fff' : 'var(--ink)', border:'1.5px solid var(--line)', borderRadius:8, cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
              {isListening==='privateNote' ? '🔴 录音中…' : '🎙️ 语音输入'}
            </button>
          </div>
          <textarea
            value={note.privateNote}
            onChange={e => setNote(p => ({...p, privateNote: e.target.value}))}
            placeholder="例：节奏感需加强，下次引入节拍器。家长很积极。"
            rows={2}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box', lineHeight:1.9 }} />
        </div>

        {/* 语音限制说明 */}
        <div style={{ fontSize:11.5, color:'var(--text-muted)', padding:'8px 12px', background:'var(--bg)', borderRadius:8, marginBottom:16, lineHeight:1.8 }}>
          ⚠️ <strong>语音输入注记：</strong>使用浏览器原生语音辨识（Chrome 效果最佳，需麦克风权限）。辨识结果因麦克风品质、口音及网络环境而有所不同。实际产品将整合专业语音转文字服务（如 Google Speech-to-Text）以提升准确率。
        </div>

        {/* 储存 */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button
            onClick={handleSave}
            disabled={!note.parentNote && !note.privateNote}
            style={{ padding:'9px 28px', background: saved ? 'var(--success)' : 'var(--amber)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor: (!note.parentNote && !note.privateNote) ? 'not-allowed' : 'pointer', opacity: (!note.parentNote && !note.privateNote) ? 0.5 : 1 }}>
            {saved ? '✅ 笔记已储存！' : '储存笔记'}
          </button>
          {saved && (
            <div style={{ fontSize:13, color:'var(--success)' }}>
              📧 实际产品会自动Email通知家长
            </div>
          )}
        </div>
      </div>

      {/* 历史笔记 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', borderBottom: showHistory ? '1px solid var(--line)' : 'none' }}
          onClick={() => setShowHistory(v => !v)}>
          <span style={{ fontWeight:700, fontSize:14 }}>📚 历史课堂笔记（{MOCK_PAST_NOTES.length}堂）</span>
          <span style={{ color:'var(--text-muted)', fontSize:14 }}>{showHistory ? '▲' : '▼'}</span>
        </div>
        {showHistory && MOCK_PAST_NOTES.map((n, i) => (
          <div key={i} style={{ padding:'14px 20px', borderBottom: i < MOCK_PAST_NOTES.length-1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6 }}>{n.date}</div>
            <div style={{ fontSize:14, lineHeight:1.8, marginBottom: n.privateNote ? 8 : 0 }}>{n.parentNote}</div>
            {n.privateNote && (
              <div style={{ fontSize:12.5, color:'var(--text-muted)', padding:'6px 10px', background:'var(--bg)', borderRadius:6, fontStyle:'italic', borderLeft:'3px solid var(--amber)' }}>
                🔒 {n.privateNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
