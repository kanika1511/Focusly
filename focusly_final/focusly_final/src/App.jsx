import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
//  Utilities
// ─────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const STORAGE_KEY = "focusly_tasks_v2";
const FILTERS = ["All", "Pending", "Completed"];

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}
function saveTasks(t) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch {}
}

// ─────────────────────────────────────────────
//  CSS injected once into <head>
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0d1a; font-family: 'Inter', system-ui, sans-serif; }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn {
    0%   { transform: scale(0.85) translateX(-50%); opacity: 0; }
    70%  { transform: scale(1.05) translateX(-50%); }
    100% { transform: scale(1) translateX(-50%); opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes checkPop {
    0%   { transform: scale(0); }
    60%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .task-item { animation: slideDown 0.22s ease both; }
  .add-btn:hover  { background: #9585f8 !important; transform: scale(1.07); }
  .add-btn:active { transform: scale(0.96); }
  .filter-btn:hover:not([aria-pressed="true"]) { border-color: #4a4a6a !important; color: #c8c6e8 !important; }
  .task-check:hover { border-color: #7c6af5 !important; }
  .action-btn:hover { color: #c8c6e8 !important; background: #2a2a44 !important; }
  .delete-btn:hover  { color: #f56a6a !important; background: #2a1a1a !important; }
  .clear-btn:hover { border-color: #f56a6a !important; color: #f56a6a !important; }
  input:focus { border-color: #7c6af5 !important; box-shadow: 0 0 0 3px rgba(124,106,245,0.15) !important; }
  .toast { animation: popIn 0.3s ease both; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2e2e4a; border-radius: 99px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; }
  }
`;

// ─────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="toast" style={{
      position: "fixed", bottom: "2rem", left: "50%",
      background: "#7c6af5", color: "#fff", padding: "0.65rem 1.25rem",
      borderRadius: "99px", fontSize: "0.82rem", fontWeight: 600,
      boxShadow: "0 8px 30px rgba(124,106,245,0.45)", zIndex: 999, whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Progress Ring
// ─────────────────────────────────────────────
function Ring({ pct }) {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <svg width="68" height="68" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#1e1e3a" strokeWidth="6"/>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#7c6af5" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 32 32)"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x="32" y="37" textAnchor="middle" fill="#e8e6ff" fontSize="12" fontWeight="700">{pct}%</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Header
// ─────────────────────────────────────────────
function Header({ total, completed }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <header style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "1.5rem" }}>✦</span>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#e8e6ff", letterSpacing: "-0.04em" }}>
              Focusly
            </h1>
          </div>
          <p style={{ color: "#5a5a80", fontSize: "0.78rem", letterSpacing: "0.06em" }}>
            YOUR TASKS, YOUR PACE
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
          <Ring pct={pct} />
          <span style={{ fontSize: "0.72rem", color: "#5a5a80" }}>
            <span style={{ color: "#7c6af5", fontWeight: 700 }}>{completed}</span>/{total} done
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
        {[
          { label: "Total",   val: total,             col: "#7c6af5" },
          { label: "Pending", val: total - completed, col: "#f5a623" },
          { label: "Done",    val: completed,          col: "#4cca7e" },
        ].map(({ label, val, col }) => (
          <div key={label} style={{ flex: 1, background: "#131320", border: "1.5px solid #1e1e32", borderRadius: "12px", padding: "0.7rem 0.9rem" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: col, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: "0.68rem", color: "#5a5a80", marginTop: "0.2rem", letterSpacing: "0.05em" }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
//  Task Input
// ─────────────────────────────────────────────
function TaskInput({ onAdd }) {
  const [value, setValue]     = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const submit = async () => {
    const text = value.trim();
    if (!text) { ref.current?.focus(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 180));
    onAdd(text, priority);
    setValue(""); setPriority("normal"); setLoading(false);
    ref.current?.focus();
  };

  const PRIS = [
    { key: "low", label: "Low", color: "#4cca7e" },
    { key: "normal", label: "Normal", color: "#7c6af5" },
    { key: "high", label: "High", color: "#f56a6a" },
  ];

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.6rem" }}>
        <input ref={ref} value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="What needs to be done?" aria-label="New task"
          style={{ flex: 1, background: "#131320", border: "1.5px solid #1e1e32", borderRadius: "12px", padding: "0.85rem 1rem", color: "#e8e6ff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
        />
        <button className="add-btn" onClick={submit} disabled={loading} aria-label="Add task"
          style={{ width: "50px", height: "50px", flexShrink: 0, background: "#7c6af5", border: "none", borderRadius: "12px", color: "#fff", fontSize: "1.6rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, transform 0.15s" }}>
          {loading
            ? <span style={{ width: 18, height: 18, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
            : "+"}
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <span style={{ color: "#5a5a80", fontSize: "0.7rem", letterSpacing: "0.06em" }}>PRIORITY</span>
        {PRIS.map(p => (
          <button key={p.key} onClick={() => setPriority(p.key)} aria-pressed={priority === p.key}
            style={{ padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", border: `1.5px solid ${p.color}`, background: priority === p.key ? p.color : "transparent", color: priority === p.key ? "#fff" : p.color, transition: "all 0.15s" }}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Search Bar
// ─────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", marginBottom: "0.9rem" }}>
      <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#3e3e60", fontSize: "0.85rem", pointerEvents: "none" }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search tasks…" aria-label="Search tasks"
        style={{ width: "100%", background: "#131320", border: "1.5px solid #1e1e32", borderRadius: "10px", padding: "0.6rem 2.2rem 0.6rem 2.4rem", color: "#e8e6ff", fontSize: "0.85rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search"
          style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#5a5a80", cursor: "pointer", fontSize: "0.8rem" }}>
          ✕
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Filter Bar
// ─────────────────────────────────────────────
function FilterBar({ active, counts, onChange, sort, onSort }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.1rem", flexWrap: "wrap", alignItems: "center" }}>
      {FILTERS.map(f => (
        <button key={f} className="filter-btn" onClick={() => onChange(f)} aria-pressed={active === f}
          style={{ background: active === f ? "#1e1340" : "#131320", border: `1.5px solid ${active === f ? "#7c6af5" : "#1e1e32"}`, borderRadius: "8px", padding: "0.4rem 0.8rem", color: active === f ? "#e8e6ff" : "#5a5a80", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.18s" }}>
          {f}
          <span style={{ background: active === f ? "#7c6af5" : "#1e1e32", color: active === f ? "#fff" : "#5a5a80", borderRadius: "99px", padding: "0 0.38rem", fontSize: "0.68rem", minWidth: "16px", textAlign: "center" }}>
            {counts[f]}
          </span>
        </button>
      ))}
      <select value={sort} onChange={e => onSort(e.target.value)} aria-label="Sort tasks"
        style={{ marginLeft: "auto", background: "#131320", border: "1.5px solid #1e1e32", borderRadius: "8px", padding: "0.38rem 0.6rem", color: "#5a5a80", fontSize: "0.75rem", cursor: "pointer", outline: "none" }}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="priority">By priority</option>
        <option value="alpha">A → Z</option>
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Task Item
// ─────────────────────────────────────────────
const PRIORITY_COLORS = { high: "#f56a6a", normal: "#7c6af5", low: "#4cca7e" };
const PRIORITY_ICONS  = { high: "🔴", normal: "🟣", low: "🟢" };

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(task.text);
  const editRef = useRef();
  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  const commit = () => {
    const t = draft.trim();
    if (t && t !== task.text) onEdit(task.id, t);
    else setDraft(task.text);
    setEditing(false);
  };

  const col = PRIORITY_COLORS[task.priority ?? "normal"];

  return (
    <li className="task-item" style={{ background: "#131320", border: `1.5px solid ${task.done ? "#1a1a28" : "#1e1e32"}`, borderLeft: `3px solid ${task.done ? "#252535" : col}`, borderRadius: "12px", padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", opacity: task.done ? 0.55 : 1, transition: "opacity 0.3s, border-color 0.2s" }}>
      
      <button className="task-check" onClick={() => onToggle(task.id)} aria-label={task.done ? "Mark pending" : "Mark complete"}
        style={{ width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${task.done ? col : "#2e2e4a"}`, background: task.done ? col : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {task.done && <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800, animation: "checkPop 0.25s ease" }}>✓</span>}
      </button>

      {editing ? (
        <input ref={editRef} value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(task.text); setEditing(false); } }}
          aria-label="Edit task"
          style={{ flex: 1, background: "#0d0d1a", border: "1.5px solid #7c6af5", borderRadius: "6px", padding: "0.3rem 0.6rem", color: "#e8e6ff", fontSize: "0.9rem", outline: "none" }}
        />
      ) : (
        <div style={{ flex: 1, minWidth: 0 }}>
          <span onDoubleClick={() => !task.done && setEditing(true)} title={task.done ? undefined : "Double-click to edit"}
            style={{ color: task.done ? "#4a4a68" : "#dddaff", textDecoration: task.done ? "line-through" : "none", fontSize: "0.9rem", lineHeight: 1.45, wordBreak: "break-word", cursor: task.done ? "default" : "text", display: "block", transition: "color 0.2s" }}>
            {task.text}
          </span>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.2rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.65rem" }}>{PRIORITY_ICONS[task.priority ?? "normal"]}</span>
            <span style={{ fontSize: "0.68rem", color: "#3e3e5a" }}>
              {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
          {!task.done && (
            <button className="action-btn" onClick={() => setEditing(true)} title="Edit" aria-label="Edit task"
              style={{ background: "transparent", border: "none", color: "#3e3e60", cursor: "pointer", padding: "0.3rem", borderRadius: "6px", fontSize: "1rem", transition: "all 0.15s" }}>
              ✎
            </button>
          )}
          <button className="action-btn delete-btn" onClick={() => onDelete(task.id)} title="Delete" aria-label="Delete task"
            style={{ background: "transparent", border: "none", color: "#3e3e60", cursor: "pointer", padding: "0.3rem 0.4rem", borderRadius: "6px", fontSize: "0.8rem", transition: "all 0.15s" }}>
            ✕
          </button>
        </div>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────
//  Empty State
// ─────────────────────────────────────────────
function EmptyState({ filter }) {
  const map = {
    All:       { icon: "☁️", title: "No tasks yet",      body: "Add your first task above to get started." },
    Pending:   { icon: "🎯", title: "Nothing pending",   body: "All done — or add a new task." },
    Completed: { icon: "🎉", title: "Nothing completed", body: "Finish a task to see it here." },
  };
  const m = map[filter] ?? map["All"];
  return (
    <div style={{ textAlign: "center", padding: "3.5rem 1rem", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.75rem" }}>{m.icon}</div>
      <p style={{ color: "#e8e6ff", fontWeight: 700, marginBottom: "0.4rem" }}>{m.title}</p>
      <p style={{ color: "#3e3e60", fontSize: "0.85rem" }}>{m.body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  App
// ─────────────────────────────────────────────
export default function App() {
  const [tasks,  setTasks]  = useState(loadTasks);
  const [filter, setFilter] = useState("All");
  const [sort,   setSort]   = useState("newest");
  const [search, setSearch] = useState("");
  const [toast,  setToast]  = useState(null);

  useEffect(() => {
    const id = "focusly-css";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id; tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => saveTasks(tasks), [tasks]);

  const showToast = useCallback(msg => setToast(msg), []);

  const addTask    = (text, priority) => { setTasks(p => [{ id: uid(), text, priority, done: false, createdAt: Date.now() }, ...p]); showToast("Task added ✓"); };
  const toggleTask = id  => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id  => { setTasks(p => p.filter(t => t.id !== id)); showToast("Task deleted"); };
  const editTask   = (id, text) => { setTasks(p => p.map(t => t.id === id ? { ...t, text } : t)); showToast("Task updated ✓"); };
  const clearCompleted = () => { const n = tasks.filter(t => t.done).length; setTasks(p => p.filter(t => !t.done)); showToast(`Cleared ${n} task${n === 1 ? "" : "s"}`); };

  const completed = tasks.filter(t => t.done).length;
  const pending   = tasks.length - completed;
  const counts    = { All: tasks.length, Pending: pending, Completed: completed };
  const PO        = { high: 0, normal: 1, low: 2 };

  const visible = tasks
    .filter(t => {
      const mf = filter === "All" || (filter === "Completed" ? t.done : !t.done);
      const ms = !search || t.text.toLowerCase().includes(search.toLowerCase());
      return mf && ms;
    })
    .sort((a, b) => {
      if (sort === "newest")   return b.createdAt - a.createdAt;
      if (sort === "oldest")   return a.createdAt - b.createdAt;
      if (sort === "priority") return (PO[a.priority ?? "normal"] - PO[b.priority ?? "normal"]);
      if (sort === "alpha")    return a.text.localeCompare(b.text);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0d0d1a 0%,#12121f 60%,#0f1422 100%)", padding: "2.5rem 1rem 5rem", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <Header total={tasks.length} completed={completed} />
        <main>
          <TaskInput onAdd={addTask} />
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar active={filter} counts={counts} onChange={setFilter} sort={sort} onSort={setSort} />
          {tasks.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#3e3e60" }}>
                {visible.length} task{visible.length !== 1 ? "s" : ""} {search ? "found" : "shown"}
              </span>
              {completed > 0 && (
                <button className="clear-btn" onClick={clearCompleted}
                  style={{ background: "transparent", border: "1px solid #2e2e4a", borderRadius: "8px", padding: "0.3rem 0.75rem", color: "#5a5a80", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.18s" }}>
                  Clear {completed} completed
                </button>
              )}
            </div>
          )}
          {visible.length === 0
            ? <EmptyState filter={search ? "All" : filter} />
            : (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }} aria-label="Task list">
                {visible.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
                ))}
              </ul>
            )
          }
        </main>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
