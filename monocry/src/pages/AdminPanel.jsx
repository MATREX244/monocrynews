import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, ADMIN_WALLET, SITE_URL } from '../lib/supabase'
import { sanitizeText, sanitizeUrl, sanitizeHtml, isValidUUID, detectInjection, safeErrorMsg } from '../lib/security'

const TABS = [
  { id: 'articles',       label: '📰 Articles',      icon: '📰' },
  { id: 'predictions',    label: '🔮 Predictions',   icon: '🔮' },
  { id: 'notifications',  label: '🔔 Notifications', icon: '🔔' },
  { id: 'directory',      label: '📂 Directory',     icon: '📂' },
  { id: 'categories',     label: '🏷️ Categories',   icon: '🏷️' },
  { id: 'users',          label: '👥 Users',         icon: '👥' },
  { id: 'security',       label: '🛡️ Security',     icon: '🛡️' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('articles')
  const [wallet, setWallet] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('mono_admin_token')
    const w = sessionStorage.getItem('mono_admin_wallet')
    if (token !== 'verified' || !w) {
      navigate('/admin', { replace: true })
      return
    }
    setWallet(w)
  }, [])

  const logout = () => {
    sessionStorage.removeItem('mono_admin_token')
    sessionStorage.removeItem('mono_admin_wallet')
    sessionStorage.removeItem('mono_admin_nonce')
    navigate('/admin', { replace: true })
  }

  const panelStyle = {
    minHeight: '100vh',
    background: '#111',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e8e8e8',
    display: 'flex'
  }

  return (
    <div style={panelStyle}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#0e0e0e',
        borderRight: '1px solid #1f1f1f',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s'
      }}
        className="hidden md:flex"
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <img src="/logo-192.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>MONOCRY</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.1em' }}>ADMIN PANEL</span>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
              background: tab === t.id ? '#0079C1' : 'transparent',
              color: tab === t.id ? '#fff' : '#888',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              marginBottom: 2, textAlign: 'left', transition: 'all 0.15s'
            }}>
              <span>{t.icon}</span> {t.label.replace(/.\s/, '')}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #1f1f1f' }}>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: 8, wordBreak: 'break-all' }}>
            {wallet.slice(0,6)}...{wallet.slice(-4)}
          </div>
          <button onClick={logout} style={{
            width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #333',
            background: 'transparent', color: '#888', fontSize: '0.8rem', cursor: 'pointer'
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px', overflowX: 'auto' }}
            className="md:ml-[220px] ml-0">
        <div style={{ maxWidth: 1000 }}>
          {tab === 'articles'      && <ArticlesTab wallet={wallet} />}
          {tab === 'predictions'   && <PredictionsTab wallet={wallet} />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'directory'     && <DirectoryTab />}
          {tab === 'categories'    && <CategoriesTab />}
          {tab === 'users'         && <UsersTab />}
          {tab === 'security'      && <SecurityTab />}
        </div>
      </main>
    </div>
  )
}

// ── Reusable UI atoms ──────────────────────────────────────────────
const Btn = ({ onClick, children, variant = 'primary', disabled, className = '', ...rest }) => {
  const bg = { primary: '#0079C1', danger: '#ef4444', ghost: 'transparent', success: '#22c55e' }[variant]
  const brd = { ghost: '1px solid #333' }[variant] || 'none'
  return (
    <button onClick={onClick} disabled={disabled} {...rest} style={{
      padding: '7px 14px', borderRadius: 8, border: brd,
      background: disabled ? '#222' : bg,
      color: disabled ? '#555' : '#fff', fontSize: '0.8rem', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s',
      opacity: disabled ? 0.7 : 1
    }} className={className}>
      {children}
    </button>
  )
}

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>}
    <input {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 8,
      background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e8e8e8',
      fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
      ...(props.style || {})
    }} onFocus={e => e.target.style.borderColor = '#0079C1'}
       onBlur={e => e.target.style.borderColor = '#2a2a2a'}
    />
  </div>
)

const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>}
    <textarea {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 8,
      background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e8e8e8',
      fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
      minHeight: 100, ...(props.style || {})
    }} onFocus={e => e.target.style.borderColor = '#0079C1'}
       onBlur={e => e.target.style.borderColor = '#2a2a2a'}
    />
  </div>
)

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>}
    <select {...props} style={{
      width: '100%', padding: '9px 12px', borderRadius: 8,
      background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e8e8e8',
      fontSize: '0.85rem', outline: 'none', ...(props.style || {})
    }}>
      {children}
    </select>
  </div>
)

const SectionHeader = ({ title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{title}</h2>
    {action}
  </div>
)

const Table = ({ headers, children }) => (
  <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #1f1f1f' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
      <thead>
        <tr style={{ background: '#161616', borderBottom: '1px solid #1f1f1f' }}>
          {headers.map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#666', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

const TR = ({ children, style = {} }) => (
  <tr style={{ borderBottom: '1px solid #1a1a1a', transition: 'background 0.1s', ...style }}
      onMouseEnter={e => e.currentTarget.style.background = '#181818'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {children}
  </tr>
)
const TD = ({ children, style = {} }) => (
  <td style={{ padding: '10px 14px', color: '#ccc', verticalAlign: 'middle', ...style }}>{children}</td>
)

// ── Toast ──────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])
  const Toast = toast ? (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
      background: toast.type === 'error' ? '#7f1d1d' : '#14532d',
      border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
      color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
    }}>
      {toast.msg}
    </div>
  ) : null
  return { show, Toast }
}

// ══════════════════════════════════════════════════════════════════
//  ARTICLES TAB
// ══════════════════════════════════════════════════════════════════
function ArticlesTab({ wallet }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | article object
  const { show, Toast } = useToast()

  const blank = {
    title: '', excerpt: '', content: '', category: 'NEWS',
    image_url: '', source_url: '', is_published: false
  }
  const [form, setForm] = useState(blank)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(50)
    setArticles(data || [])
    setLoading(false)
  }

  function startNew() { setForm(blank); setEditing('new') }
  function startEdit(a) { setForm({ ...a }); setEditing(a) }
  function cancel() { setEditing(null); setForm(blank) }

  function setField(k, v) {
    if (detectInjection(v)) { show('Unsafe content detected', 'error'); return }
    setForm(f => ({ ...f, [k]: v }))
  }

  async function save() {
    if (!form.title?.trim()) { show('Title is required', 'error'); return }
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
    const payload = {
      title: sanitizeText(form.title, 300),
      excerpt: sanitizeText(form.excerpt, 500),
      content: form.content?.slice(0, 50000) || '',
      category: sanitizeText(form.category, 30),
      image_url: sanitizeUrl(form.image_url),
      source_url: sanitizeUrl(form.source_url),
      slug,
      is_published: !!form.is_published,
      published_at: form.is_published ? (form.published_at || new Date().toISOString()) : null,
      author_wallet: wallet,
      author_name: 'MONOCRY Staff',
    }

    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('articles').insert(payload))
    } else {
      if (!isValidUUID(editing.id)) { show('Invalid article ID', 'error'); return }
      ;({ error } = await supabase.from('articles').update(payload).eq('id', editing.id))
    }

    if (error) { show(safeErrorMsg(error), 'error'); return }
    show(editing === 'new' ? 'Article created!' : 'Article updated!')
    cancel()
    load()
  }

  async function del(id) {
    if (!isValidUUID(id)) return
    if (!confirm('Delete this article?')) return
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show('Deleted')
    load()
  }

  if (editing) return (
    <div>
      {Toast}
      <SectionHeader title={editing === 'new' ? 'New Article' : 'Edit Article'} action={<Btn variant="ghost" onClick={cancel}>Cancel</Btn>} />
      <div style={{ background: '#161616', borderRadius: 12, padding: 24, border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Title *" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Article title" style={{ gridColumn: '1 / -1' }} />
          <Select label="Category" value={form.category} onChange={e => setField('category', e.target.value)}>
            {['NEWS', 'OPINION', 'INTERVIEWS', 'FOLLOW-UP', 'LEARN', 'PARTNER'].map(c => <option key={c}>{c}</option>)}
          </Select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <input type="checkbox" id="pub" checked={!!form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            <label htmlFor="pub" style={{ fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>Published</label>
          </div>
        </div>
        <Input label="Excerpt" value={form.excerpt} onChange={e => setField('excerpt', e.target.value)} placeholder="Short summary..." />
        <Input label="Image URL" value={form.image_url} onChange={e => setField('image_url', e.target.value)} placeholder="https://..." type="url" />
        <Input label="Source URL" value={form.source_url} onChange={e => setField('source_url', e.target.value)} placeholder="https://..." type="url" />
        <Textarea label="Content (HTML allowed)" value={form.content} onChange={e => setField('content', e.target.value)} style={{ minHeight: 300 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save}>{editing === 'new' ? 'Create Article' : 'Save Changes'}</Btn>
          <Btn variant="ghost" onClick={cancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {Toast}
      <SectionHeader title="Articles" action={<Btn onClick={startNew}>+ New Article</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Title', 'Category', 'Status', 'Date', 'Actions']}>
          {articles.map(a => (
            <TR key={a.id}>
              <TD><span style={{ color: '#e8e8e8', fontWeight: 600 }}>{a.title?.slice(0, 50)}{a.title?.length > 50 ? '…' : ''}</span></TD>
              <TD><span style={{ fontSize: '0.7rem', background: '#1f2937', color: '#7dd3fc', padding: '2px 8px', borderRadius: 99 }}>{a.category}</span></TD>
              <TD><span style={{ color: a.is_published ? '#22c55e' : '#888', fontSize: '0.75rem', fontWeight: 600 }}>{a.is_published ? '● Live' : '○ Draft'}</span></TD>
              <TD style={{ color: '#666', fontSize: '0.75rem' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => startEdit(a)}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(a.id)}>Del</Btn>
                  <a href={`${SITE_URL}/news/${a.slug || a.id}`} target="_blank" rel="noopener noreferrer">
                    <Btn variant="ghost">View</Btn>
                  </a>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  PREDICTIONS TAB
// ══════════════════════════════════════════════════════════════════
function PredictionsTab({ wallet }) {
  const [preds, setPreds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const { show, Toast } = useToast()
  const blank = { title: '', description: '', category: 'MARKETS', image_url: '', deadline: '', is_published: false, is_resolved: false, resolution: '', resolution_note: '' }
  const [form, setForm] = useState(blank)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(50)
    setPreds(data || [])
    setLoading(false)
  }

  function startNew() { setForm(blank); setEditing('new') }
  function startEdit(p) { setForm({ ...p, deadline: p.deadline ? p.deadline.slice(0, 16) : '' }); setEditing(p) }
  function cancel() { setEditing(null) }

  async function save() {
    if (!form.title?.trim()) { show('Title required', 'error'); return }
    const payload = {
      title: sanitizeText(form.title, 300),
      description: sanitizeText(form.description, 1000),
      category: sanitizeText(form.category, 30),
      image_url: sanitizeUrl(form.image_url),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      is_published: !!form.is_published,
      is_resolved: !!form.is_resolved,
      resolution: form.resolution || null,
      resolution_note: sanitizeText(form.resolution_note, 500),
      creator_wallet: wallet,
    }
    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('predictions').insert(payload))
    } else {
      if (!isValidUUID(editing.id)) return
      ;({ error } = await supabase.from('predictions').update(payload).eq('id', editing.id))
    }
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show(editing === 'new' ? 'Prediction created!' : 'Updated!')
    cancel(); load()
  }

  async function del(id) {
    if (!isValidUUID(id) || !confirm('Delete?')) return
    await supabase.from('predictions').delete().eq('id', id)
    show('Deleted'); load()
  }

  if (editing) return (
    <div>
      {Toast}
      <SectionHeader title={editing === 'new' ? 'New Prediction' : 'Edit Prediction'} action={<Btn variant="ghost" onClick={cancel}>Cancel</Btn>} />
      <div style={{ background: '#161616', borderRadius: 12, padding: 24, border: '1px solid #1f1f1f' }}>
        <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {['MARKETS', 'POLICY', 'POLITICS', 'TECH'].map(c => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Deadline" type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </div>
        <Input label="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} type="url" />
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /> Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.is_resolved} onChange={e => setForm(f => ({ ...f, is_resolved: e.target.checked }))} /> Resolved
          </label>
        </div>
        {form.is_resolved && (
          <>
            <Select label="Resolution" value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}>
              <option value="">— Select —</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Input label="Resolution Note" value={form.resolution_note} onChange={e => setForm(f => ({ ...f, resolution_note: e.target.value }))} placeholder="Optional explanation..." />
          </>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save}>{editing === 'new' ? 'Create' : 'Save'}</Btn>
          <Btn variant="ghost" onClick={cancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {Toast}
      <SectionHeader title="Predictions" action={<Btn onClick={startNew}>+ New Prediction</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Title', 'Category', 'Votes', 'Status', 'Actions']}>
          {preds.map(p => (
            <TR key={p.id}>
              <TD><span style={{ fontWeight: 600, color: '#e8e8e8' }}>{p.title?.slice(0, 45)}{p.title?.length > 45 ? '…' : ''}</span></TD>
              <TD><span style={{ fontSize: '0.7rem', background: '#1f2937', color: '#7dd3fc', padding: '2px 8px', borderRadius: 99 }}>{p.category}</span></TD>
              <TD style={{ fontSize: '0.75rem', color: '#888' }}>{(p.votes_yes || 0) + (p.votes_no || 0)} total</TD>
              <TD><span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.is_resolved ? '#f59e0b' : p.is_published ? '#22c55e' : '#888' }}>{p.is_resolved ? '✓ Resolved' : p.is_published ? '● Live' : '○ Draft'}</span></TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => startEdit(p)}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(p.id)}>Del</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  NOTIFICATIONS TAB
// ══════════════════════════════════════════════════════════════════
function NotificationsTab() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal', action_url: '' })
  const [sending, setSending] = useState(false)
  const { show, Toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    // Admin can see all (using service role via RPC or just direct query with anon - might need service role for non-published)
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
    setNotifs(data || [])
    setLoading(false)
  }

  async function send() {
    if (!form.title?.trim()) { show('Title required', 'error'); return }
    if (form.action_url && !/^https?:\/\//.test(form.action_url) && !form.action_url.startsWith('/')) {
      show('Invalid action URL', 'error'); return
    }
    setSending(true)
    const { error } = await supabase.rpc('send_notification', {
      p_title: sanitizeText(form.title, 300),
      p_body: sanitizeText(form.body, 2000),
      p_priority: form.priority,
      p_action_url: sanitizeUrl(form.action_url) || null
    })
    setSending(false)
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show('Notification sent!')
    setForm({ title: '', body: '', priority: 'normal', action_url: '' })
    load()
  }

  async function del(id) {
    if (!isValidUUID(id) || !confirm('Delete?')) return
    await supabase.from('notifications').delete().eq('id', id)
    show('Deleted'); load()
  }

  const priorityColor = { low: '#888', normal: '#7dd3fc', high: '#fb923c', urgent: '#ef4444' }

  return (
    <div>
      {Toast}
      <SectionHeader title="Notifications" />
      {/* Send form */}
      <div style={{ background: '#161616', borderRadius: 12, padding: 24, border: '1px solid #1f1f1f', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>Send Notification</h3>
        <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title..." />
        <Textarea label="Body (optional)" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Details..." style={{ minHeight: 80 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">🚨 Urgent</option>
          </Select>
          <Input label="Action URL (optional)" value={form.action_url} onChange={e => setForm(f => ({ ...f, action_url: e.target.value }))} placeholder="/news/... or https://..." />
        </div>
        <Btn onClick={send} disabled={sending}>{sending ? 'Sending...' : '🔔 Send Notification'}</Btn>
      </div>

      {/* History */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>History</h3>
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Title', 'Priority', 'Sent', 'Actions']}>
          {notifs.map(n => (
            <TR key={n.id}>
              <TD>
                <div>
                  <span style={{ fontWeight: 600, color: '#e8e8e8' }}>{n.title}</span>
                  {n.body && <p style={{ fontSize: '0.73rem', color: '#666', marginTop: 2 }}>{n.body.slice(0, 60)}…</p>}
                </div>
              </TD>
              <TD><span style={{ fontSize: '0.7rem', fontWeight: 700, color: priorityColor[n.priority] || '#888', textTransform: 'uppercase' }}>{n.priority}</span></TD>
              <TD style={{ fontSize: '0.75rem', color: '#666' }}>{n.sent_at ? new Date(n.sent_at).toLocaleString() : ''}</TD>
              <TD><Btn variant="danger" onClick={() => del(n.id)}>Del</Btn></TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  DIRECTORY TAB
// ══════════════════════════════════════════════════════════════════
function DirectoryTab() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const { show, Toast } = useToast()
  const blank = { name: '', category: 'Exchange', description: '', logo_url: '', url: '', is_featured: false }
  const [form, setForm] = useState(blank)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('directory_listings').select('*').order('name')
    setListings(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.name?.trim() || !form.url?.trim()) { show('Name and URL required', 'error'); return }
    const safeUrl = sanitizeUrl(form.url)
    if (!safeUrl) { show('Invalid URL', 'error'); return }
    const payload = { name: sanitizeText(form.name, 100), category: sanitizeText(form.category, 50), description: sanitizeText(form.description, 500), logo_url: sanitizeUrl(form.logo_url), url: safeUrl, is_featured: !!form.is_featured }
    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('directory_listings').insert(payload))
    } else {
      if (!isValidUUID(editing.id)) return
      ;({ error } = await supabase.from('directory_listings').update(payload).eq('id', editing.id))
    }
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show(editing === 'new' ? 'Created!' : 'Updated!'); setEditing(null); load()
  }

  async function del(id) {
    if (!isValidUUID(id) || !confirm('Delete?')) return
    await supabase.from('directory_listings').delete().eq('id', id)
    show('Deleted'); load()
  }

  const CATS = ['Exchange', 'DEX', 'Wallet', 'Analytics', 'NFT', 'DeFi', 'News', 'Tools', 'Data', 'Other']

  if (editing) return (
    <div>
      {Toast}
      <SectionHeader title={editing === 'new' ? 'New Listing' : 'Edit Listing'} action={<Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>} />
      <div style={{ background: '#161616', borderRadius: 12, padding: 24, border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Input label="URL *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} type="url" placeholder="https://..." />
        <Input label="Logo URL" value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} type="url" placeholder="https://..." />
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 80 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
          <input type="checkbox" checked={!!form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> ⭐ Featured listing
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save}>{editing === 'new' ? 'Create' : 'Save'}</Btn>
          <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {Toast}
      <SectionHeader title="Directory" action={<Btn onClick={() => { setForm(blank); setEditing('new') }}>+ New Listing</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Name', 'Category', 'Featured', 'URL', 'Actions']}>
          {listings.map(l => (
            <TR key={l.id}>
              <TD><span style={{ fontWeight: 600, color: '#e8e8e8' }}>{l.name}</span></TD>
              <TD><span style={{ fontSize: '0.7rem', background: '#1f2937', color: '#7dd3fc', padding: '2px 8px', borderRadius: 99 }}>{l.category}</span></TD>
              <TD>{l.is_featured ? '⭐' : '—'}</TD>
              <TD><a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0079C1', fontSize: '0.75rem' }}>{l.url?.slice(8, 35)}</a></TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => { setForm({ ...l }); setEditing(l) }}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(l.id)}>Del</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  CATEGORIES TAB
// ══════════════════════════════════════════════════════════════════
function CategoriesTab() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', color: '#0079C1', type: 'news', is_active: true })
  const [editing, setEditing] = useState(null)
  const { show, Toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setCats(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.name?.trim() || !form.slug?.trim()) { show('Name and slug required', 'error'); return }
    const payload = { name: sanitizeText(form.name, 50).toUpperCase(), slug: sanitizeText(form.slug, 50).toLowerCase().replace(/[^a-z0-9-]/g, ''), color: form.color, type: form.type, is_active: !!form.is_active }
    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('categories').insert(payload))
    } else {
      if (!isValidUUID(editing.id)) return
      ;({ error } = await supabase.from('categories').update(payload).eq('id', editing.id))
    }
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show(editing === 'new' ? 'Category created!' : 'Updated!'); setEditing(null); load()
  }

  async function del(id) {
    if (!isValidUUID(id) || !confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    show('Deleted'); load()
  }

  if (editing) return (
    <div>
      {Toast}
      <SectionHeader title={editing === 'new' ? 'New Category' : 'Edit Category'} action={<Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>} />
      <div style={{ background: '#161616', borderRadius: 12, padding: 24, border: '1px solid #1f1f1f', maxWidth: 480 }}>
        <Input label="Name (e.g. SPORTS)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase(), slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} />
        <Input label="Slug (e.g. sports)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="news">News</option>
            <option value="prediction">Prediction</option>
          </Select>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 4, fontWeight: 600 }}>Color</label>
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #2a2a2a', background: '#1a1a1a', cursor: 'pointer' }} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
          <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={save}>{editing === 'new' ? 'Create' : 'Save'}</Btn>
          <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {Toast}
      <SectionHeader title="Categories" action={<Btn onClick={() => { setForm({ name: '', slug: '', color: '#0079C1', type: 'news', is_active: true }); setEditing('new') }}>+ New Category</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Name', 'Slug', 'Type', 'Color', 'Active', 'Actions']}>
          {cats.map(c => (
            <TR key={c.id}>
              <TD><span style={{ fontWeight: 700, color: '#e8e8e8' }}>{c.name}</span></TD>
              <TD style={{ color: '#888', fontSize: '0.75rem' }}>{c.slug}</TD>
              <TD><span style={{ fontSize: '0.7rem', color: '#7dd3fc' }}>{c.type}</span></TD>
              <TD><div style={{ width: 20, height: 20, borderRadius: 4, background: c.color || '#0079C1' }} /></TD>
              <TD><span style={{ color: c.is_active ? '#22c55e' : '#666', fontSize: '0.8rem' }}>{c.is_active ? '✓' : '✗'}</span></TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => { setForm({ ...c }); setEditing(c) }}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(c.id)}>Del</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  USERS / WALLET USERS TAB
// ══════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('wallet_users').select('*').order('created_at', { ascending: false }).limit(100)
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleBan(user) {
    if (!isValidUUID(user.id)) return
    const newBan = !user.is_banned
    const { error } = await supabase.from('wallet_users').update({ is_banned: newBan, ban_reason: newBan ? 'Admin action' : null }).eq('id', user.id)
    if (error) { show(safeErrorMsg(error), 'error'); return }
    show(newBan ? 'User banned' : 'User unbanned')
    load()
  }

  return (
    <div>
      {Toast}
      <SectionHeader title={`Users (${users.length})`} action={<Btn variant="ghost" onClick={load}>Refresh</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : (
        <Table headers={['Wallet', 'Created', 'Last Seen', 'Status', 'Actions']}>
          {users.map(u => (
            <TR key={u.id}>
              <TD><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#ccc' }}>{u.wallet_address?.slice(0,10)}…{u.wallet_address?.slice(-6)}</span></TD>
              <TD style={{ fontSize: '0.75rem', color: '#666' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</TD>
              <TD style={{ fontSize: '0.75rem', color: '#666' }}>{u.last_seen ? new Date(u.last_seen).toLocaleDateString() : '—'}</TD>
              <TD><span style={{ fontSize: '0.75rem', fontWeight: 600, color: u.is_banned ? '#ef4444' : '#22c55e' }}>{u.is_banned ? '🚫 Banned' : '✓ Active'}</span></TD>
              <TD><Btn variant={u.is_banned ? 'success' : 'danger'} onClick={() => toggleBan(u)}>{u.is_banned ? 'Unban' : 'Ban'}</Btn></TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECURITY TAB
// ══════════════════════════════════════════════════════════════════
function SecurityTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(100)
    setEvents(data || [])
    setLoading(false)
  }

  async function resolve(id) {
    if (!isValidUUID(id)) return
    await supabase.from('security_events').update({ resolved: true }).eq('id', id)
    show('Marked resolved'); load()
  }

  const sevColor = { low: '#888', medium: '#f59e0b', high: '#fb923c', critical: '#ef4444' }

  return (
    <div>
      {Toast}
      <SectionHeader title="Security Events" action={<Btn variant="ghost" onClick={load}>Refresh</Btn>} />
      {loading ? <div className="spinner mx-auto my-8" /> : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#22c55e' }}>
          <p style={{ fontSize: '2rem' }}>🛡️</p>
          <p style={{ marginTop: 8 }}>No security events logged.</p>
        </div>
      ) : (
        <Table headers={['Type', 'Severity', 'IP', 'Payload', 'Time', 'Actions']}>
          {events.map(e => (
            <TR key={e.id} style={{ opacity: e.resolved ? 0.5 : 1 }}>
              <TD><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{e.event_type}</span></TD>
              <TD><span style={{ fontSize: '0.7rem', fontWeight: 700, color: sevColor[e.severity] || '#888', textTransform: 'uppercase' }}>{e.severity}</span></TD>
              <TD style={{ fontSize: '0.73rem', color: '#888', fontFamily: 'monospace' }}>{e.ip_address || '—'}</TD>
              <TD style={{ fontSize: '0.72rem', color: '#666', maxWidth: 200 }}>{e.payload?.slice(0, 60) || '—'}</TD>
              <TD style={{ fontSize: '0.72rem', color: '#555' }}>{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</TD>
              <TD>{!e.resolved && <Btn onClick={() => resolve(e.id)} variant="ghost">Resolve</Btn>}</TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  )
}
