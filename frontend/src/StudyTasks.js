import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PRIORITY_LABEL = { high: "↑ High", medium: "→ Medium", low: "↓ Low" };
const PRIORITY_COLORS = {
    high:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    medium: { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' },
    low:    { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0' },
};
const PRIORITY_BORDER = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const StudyTasks = ({ currentUser }) => {
    const [tasks, setTasks]           = useState([]);
    const [filter, setFilter]         = useState('all');
    const [showForm, setShowForm]     = useState(false);
    const [activeTab, setActiveTab]   = useState('tasks');
    const [calDate, setCalDate]       = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', deadline: '', priority: 'medium', plan_name: '' });

    const loadTasks = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/tasks`, { params: { user_id: currentUser.id } });
            setTasks(res.data);
        } catch (err) {
            console.error('Error loading tasks:', err);
        }
    }, [currentUser.id]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    const createTask = async () => {
        if (!form.title.trim()) { alert('Please enter a task title.'); return; }
        try {
            await axios.post(`${API}/tasks`, { ...form, user_id: currentUser.id });
            setForm({ title: '', description: '', deadline: '', priority: 'medium', plan_name: '' });
            setShowForm(false);
            loadTasks();
        } catch (err) { alert('Failed to create task.'); }
    };

    const toggleTask = async (id) => {
        try {
            await axios.put(`${API}/tasks/${id}/toggle`, { user_id: currentUser.id });
            loadTasks();
        } catch (err) { alert('Failed to update task.'); }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await axios.delete(`${API}/tasks/${id}`, { params: { user_id: currentUser.id } });
            loadTasks();
        } catch (err) { alert('Failed to delete task.'); }
    };

    const getFiltered = () => {
        const now = new Date();
        if (filter === 'upcoming')  return tasks.filter(t => !t.is_completed && t.deadline && new Date(t.deadline) >= now);
        if (filter === 'completed') return tasks.filter(t => t.is_completed);
        return tasks;
    };

    const fmtDeadline = (deadline, done) => {
        if (!deadline) return null;
        const d = new Date(deadline), now = new Date(), overdue = !done && d < now;
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        return { label: (overdue ? "Overdue: " : "") + label, overdue };
    };

    // ── Stats ──
    const now = new Date();
    const completed = tasks.filter(t => t.is_completed).length;
    const upcoming  = tasks.filter(t => !t.is_completed && t.deadline && new Date(t.deadline) >= now).length;
    const stats = [
        { label: 'Total',     value: tasks.length,          color: '#00838f' },
        { label: 'Pending',   value: tasks.length - completed, color: '#f59e0b' },
        { label: 'Upcoming',  value: upcoming,               color: '#3f8fe3' },
        { label: 'Completed', value: completed,              color: '#22c55e' },
    ];

    // ── Calendar ──
    const buildCalendarCells = () => {
        const year = calDate.getFullYear(), month = calDate.getMonth();
        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev  = new Date(year, month, 0).getDate();
        const today       = new Date();

        const taskMap = {};
        tasks.forEach(t => {
            if (!t.deadline) return;
            const key = t.deadline.slice(0, 10);
            if (!taskMap[key]) taskMap[key] = [];
            taskMap[key].push(t);
        });

        const cells = [];

        for (let i = firstDay - 1; i >= 0; i--)
            cells.push(<div key={`p${i}`} style={calCell(false, false, true)}><div style={dayNum(false)}>{daysInPrev - i}</div></div>);

        for (let d = 1; d <= daysInMonth; d++) {
            const key     = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayTasks = taskMap[key] || [];
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSel   = selectedDay === key;
            cells.push(
                <div key={key} style={calCell(isToday, isSel, false)} onClick={() => setSelectedDay(key)}>
                    <div style={dayNum(isToday)}>{d}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                        {dayTasks.slice(0, 4).map((t, i) => (
                            <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: t.is_completed ? '#3fc9b4' : PRIORITY_BORDER[t.priority || 'medium'] }} />
                        ))}
                    </div>
                </div>
            );
        }

        const total = firstDay + daysInMonth;
        const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
        for (let i = 1; i <= remaining; i++)
            cells.push(<div key={`n${i}`} style={calCell(false, false, true)}><div style={dayNum(false)}>{i}</div></div>);

        return cells;
    };

    const calCell = (isToday, isSel, faded) => ({
        minHeight: '64px', padding: '6px 4px', borderRadius: '10px',
        border: `1.5px solid ${isSel ? '#64adeb' : isToday ? '#6de0cc' : 'transparent'}`,
        background: isSel ? '#f0f7ff' : isToday ? '#effcf9' : 'transparent',
        cursor: faded ? 'default' : 'pointer',
        opacity: faded ? 0.3 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transition: 'all 0.15s',
    });

    const dayNum = (isToday) => ({
        fontSize: '0.82rem', fontWeight: 600, color: '#4d5b63',
        marginBottom: '4px', width: '24px', height: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%',
        background: isToday ? 'linear-gradient(135deg, #22ab99, #3f8fe3)' : 'transparent',
        color: isToday ? '#fff' : '#4d5b63',
    });

    const filteredTasks = getFiltered();
    const dayTasksList  = selectedDay ? tasks.filter(t => t.deadline && t.deadline.slice(0, 10) === selectedDay) : [];

    const tabBtn = (key, label) => ({
        padding: '8px 18px', borderRadius: '8px', border: '1px solid #b2dfdb', cursor: 'pointer',
        background: activeTab === key ? '#00838f' : '#fff',
        color:      activeTab === key ? '#fff'    : '#00838f',
        fontWeight: 'bold', fontSize: '0.88rem',
    });

    const filterBtn = (key, label) => ({
        padding: '7px 18px', borderRadius: '20px', cursor: 'pointer',
        border: `1.5px solid ${filter === key ? 'transparent' : '#a3efe0'}`,
        background: filter === key ? 'linear-gradient(135deg, #22ab99, #3f8fe3)' : 'transparent',
        color:      filter === key ? '#fff' : '#5e6f78',
        fontWeight: 600, fontSize: '0.81rem',
    });

    return (
        <div style={{ background: '#fff', border: '1px solid #e0f2f1', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 16px rgba(0,168,150,0.06)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: '#00838f', margin: 0, fontSize: '1.3rem' }}>📚 Task Tracker</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={tabBtn('tasks',    'Tasks')}    onClick={() => setActiveTab('tasks')}>Tasks</button>
                    <button style={tabBtn('calendar', 'Calendar')} onClick={() => setActiveTab('calendar')}>Calendar</button>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: '#f8fdfc', border: '1px solid #a3efe0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.7rem', color: '#73858f', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginTop: '5px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── TASKS TAB ── */}
            {activeTab === 'tasks' && (
                <div>
                    {/* Add Task button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', marginBottom: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem', color: '#fff', background: showForm ? '#5e6f78' : 'linear-gradient(135deg, #22ab99, #3f8fe3)' }}
                    >
                        {showForm ? '✕  Cancel' : '+ Add Study Task'}
                    </button>

                    {/* Form */}
                    {showForm && (
                        <div style={{ background: '#f8fdfc', border: '1px solid #a3efe0', borderRadius: '12px', padding: '22px', marginBottom: '18px' }}>
                            <div style={{ fontWeight: 600, color: '#3a464d', marginBottom: '14px' }}>New Study Task</div>

                            {[['Task Title *', 'text', 'title', 'e.g. Study Chapter 5'],
                              ['Study Plan (optional)', 'text', 'plan_name', 'e.g. Midterm Prep']].map(([label, type, field, ph]) => (
                                <div key={field} style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.79rem', fontWeight: 600, color: '#4d5b63', marginBottom: '5px' }}>{label}</label>
                                    <input type={type} placeholder={ph} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #a3efe0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.79rem', fontWeight: 600, color: '#4d5b63', marginBottom: '5px' }}>Description</label>
                                <textarea placeholder="Topics to cover…" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #a3efe0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '65px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.79rem', fontWeight: 600, color: '#4d5b63', marginBottom: '5px' }}>Deadline</label>
                                    <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #a3efe0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.79rem', fontWeight: 600, color: '#4d5b63', marginBottom: '5px' }}>Priority</label>
                                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #a3efe0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <button onClick={createTask} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #22ab99, #178a7e)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                                Add Task
                            </button>
                        </div>
                    )}

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {[['all','All Tasks'],['upcoming','Upcoming'],['completed','Completed']].map(([key, label]) => (
                            <button key={key} style={filterBtn(key)} onClick={() => setFilter(key)}>{label}</button>
                        ))}
                    </div>

                    {/* Task list */}
                    {filteredTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a5b0', fontStyle: 'italic' }}>
                            {filter === 'upcoming' ? "No upcoming tasks — you're all caught up!" : filter === 'completed' ? 'No completed tasks yet.' : 'No tasks yet. Add one above!'}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredTasks.map(t => {
                                const p  = t.priority || 'medium';
                                const pc = PRIORITY_COLORS[p];
                                const dl = fmtDeadline(t.deadline, t.is_completed);
                                return (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: t.is_completed ? '#effcf9' : '#fff', border: '1px solid #dde4e8', borderLeft: `4px solid ${PRIORITY_BORDER[p]}`, borderRadius: '10px', padding: '14px 16px', opacity: t.is_completed ? 0.85 : 1 }}>
                                        <input type="checkbox" checked={!!t.is_completed} onChange={() => toggleTask(t.id)}
                                            style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#22ab99', cursor: 'pointer', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: t.is_completed ? '#94a5b0' : '#3a464d', textDecoration: t.is_completed ? 'line-through' : 'none', marginBottom: '3px' }}>{t.title}</div>
                                            {t.description && <div style={{ fontSize: '0.82rem', color: '#73858f', marginBottom: '7px' }}>{t.description}</div>}
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>{PRIORITY_LABEL[p]}</span>
                                                {dl && <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: dl.overdue ? '#fef2f2' : '#f0f7ff', color: dl.overdue ? '#dc2626' : '#3f8fe3', border: `1px solid ${dl.overdue ? '#fecaca' : '#c2dff8'}` }}>⏰ {dl.label}</span>}
                                                {t.plan_name && <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: '#f5f0ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>📚 {t.plan_name}</span>}
                                                {t.is_completed && <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: '#effcf9', color: '#178a7e', border: '1px solid #a3efe0' }}>✓ Done</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => deleteTask(t.id)} title="Delete"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a5b0', fontSize: '16px', flexShrink: 0, padding: '2px 4px' }}>🗑️</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── CALENDAR TAB ── */}
            {activeTab === 'calendar' && (
                <div>
                    <div style={{ background: '#f8fdfc', border: '1px solid #a3efe0', borderRadius: '12px', padding: '22px', marginBottom: '16px' }}>
                        {/* Month nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid #a3efe0', background: 'transparent', cursor: 'pointer', color: '#178a7e', fontSize: '1.1rem' }}>←</button>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e2a30' }}>{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</span>
                            <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                                style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid #a3efe0', background: 'transparent', cursor: 'pointer', color: '#178a7e', fontSize: '1.1rem' }}>→</button>
                        </div>
                        {/* Day name headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                                <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94a5b0', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
                            ))}
                        </div>
                        {/* Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {buildCalendarCells()}
                        </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {[['#ef4444','High Priority'],['#f59e0b','Medium Priority'],['#22c55e','Low Priority'],['#3fc9b4','Completed']].map(([color, label]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#5e6f78' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />{label}
                            </div>
                        ))}
                    </div>

                    {/* Selected day */}
                    {selectedDay && (
                        <div style={{ background: '#fff', border: '1px solid #a3efe0', borderRadius: '12px', padding: '18px' }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#3a464d', marginBottom: '12px' }}>
                                Tasks for {new Date(selectedDay + 'T00:00:00').toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            {dayTasksList.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a5b0', fontSize: '0.86rem', padding: '16px 0' }}>No tasks due on this day.</div>
                            ) : dayTasksList.map(t => {
                                const p  = t.priority || 'medium';
                                const pc = PRIORITY_COLORS[p];
                                const time = t.deadline ? new Date(t.deadline).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : '';
                                return (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dde4e8', borderLeft: `4px solid ${PRIORITY_BORDER[p]}`, marginBottom: '8px', background: '#f8fdfc', opacity: t.is_completed ? 0.6 : 1 }}>
                                        <div style={{ flex: 1, fontWeight: 600, fontSize: '0.88rem', color: '#3a464d', textDecoration: t.is_completed ? 'line-through' : 'none' }}>{t.title}</div>
                                        <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: pc.bg, color: pc.color }}>{PRIORITY_LABEL[p]}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#73858f' }}>{time}</span>
                                        {t.is_completed && <span style={{ fontSize: '0.71rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: '#effcf9', color: '#178a7e' }}>✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudyTasks;
