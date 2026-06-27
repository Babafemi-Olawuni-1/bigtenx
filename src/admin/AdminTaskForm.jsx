// AdminTaskForm.jsx - Updated with conditional Post URL (Hot Offer only)
import { useState } from 'react'
import {
  X, Trash2, Zap, Plus, ArrowUp, ArrowDown, RefreshCw,
  ExternalLink, Eye, ThumbsUp, Heart, Star, Bell, Mail,
  Share2, Download, Upload, Lock, Unlock, Settings, User, Users,
  Calendar, Clock, MapPin, Camera, Image, Video, Music,
  Headphones, Phone, MessageCircle, Send, Gift, Award, Trophy,
  CheckCircle, Play, Link, MousePointer, AlertCircle,
  Bookmark, Flag, Tag, Search, Filter, Edit3, Hash,
  Globe, Wifi, Zap as ZapIcon, Shield, Target, TrendingUp,
  BarChart2, PieChart, Activity, Layers, Copy, Clipboard
} from 'lucide-react'
import { O, PLATFORMS } from './adminUtils'
import { Toggle } from './AdminShared'

// ── All available step icons ──────────────────────────────────────────────────
const STEP_ICONS = [
  { name:'ExternalLink',   Icon: ExternalLink   },
  { name:'MousePointer',   Icon: MousePointer   },
  { name:'CheckCircle',    Icon: CheckCircle    },
  { name:'Clock',          Icon: Clock          },
  { name:'Play',           Icon: Play           },
  { name:'Link',           Icon: Link           },
  { name:'Eye',            Icon: Eye            },
  { name:'ThumbsUp',       Icon: ThumbsUp       },
  { name:'Heart',          Icon: Heart          },
  { name:'Star',           Icon: Star           },
  { name:'Bell',           Icon: Bell           },
  { name:'Mail',           Icon: Mail           },
  { name:'Share2',         Icon: Share2         },
  { name:'Download',       Icon: Download       },
  { name:'Upload',         Icon: Upload         },
  { name:'Lock',           Icon: Lock           },
  { name:'Unlock',         Icon: Unlock         },
  { name:'Settings',       Icon: Settings       },
  { name:'User',           Icon: User           },
  { name:'Users',          Icon: Users          },
  { name:'Calendar',       Icon: Calendar       },
  { name:'MapPin',         Icon: MapPin         },
  { name:'Camera',         Icon: Camera         },
  { name:'Image',          Icon: Image          },
  { name:'Video',          Icon: Video          },
  { name:'Music',          Icon: Music          },
  { name:'Headphones',     Icon: Headphones     },
  { name:'Phone',          Icon: Phone          },
  { name:'MessageCircle',  Icon: MessageCircle  },
  { name:'Send',           Icon: Send           },
  { name:'Gift',           Icon: Gift           },
  { name:'Award',          Icon: Award          },
  { name:'Trophy',         Icon: Trophy         },
  { name:'Bookmark',       Icon: Bookmark       },
  { name:'Flag',           Icon: Flag           },
  { name:'Tag',            Icon: Tag            },
  { name:'Search',         Icon: Search         },
  { name:'Globe',          Icon: Globe          },
  { name:'Shield',         Icon: Shield         },
  { name:'Target',         Icon: Target         },
  { name:'TrendingUp',     Icon: TrendingUp     },
  { name:'Activity',       Icon: Activity       },
  { name:'Layers',         Icon: Layers         },
  { name:'Copy',           Icon: Copy           },
  { name:'Clipboard',      Icon: Clipboard      },
  { name:'Hash',           Icon: Hash           },
  { name:'AlertCircle',    Icon: AlertCircle    },
  { name:'Zap',            Icon: ZapIcon        },
]

const ICON_MAP = Object.fromEntries(STEP_ICONS.map(i => [i.name, i.Icon]))

// ── Icon Picker ──────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = STEP_ICONS.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
  const Cur = ICON_MAP[value] || ExternalLink

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 42, height: 42, borderRadius: 10,
          background: '#F7F8FC',
          border: `1.5px solid ${open ? O : '#E9EDF2'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        title={value || 'Choose icon'}
      >
        <Cur size={18} color={O} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 46, left: 0, zIndex: 50,
            background: '#fff',
            border: `1px solid #E9EDF2`,
            borderRadius: 14,
            padding: 12,
            width: 280,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }}
          onClick={e => e.stopPropagation()}
        >
          <input
            autoFocus
            placeholder="Search icons…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#F7F8FC',
              border: '1px solid #E9EDF2',
              borderRadius: 8,
              padding: '7px 10px',
              color: '#001F54',
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 10
            }}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            maxHeight: 160,
            overflowY: 'auto'
          }}>
            {filtered.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => { onChange(name); setOpen(false); setQuery('') }}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: value === name ? `${O}15` : '#F7F8FC',
                  border: `1px solid ${value === name ? O : '#E9EDF2'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={16} color={value === name ? O : '#5A6E8A'} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function AdminTaskForm({
  editingTask,
  form,
  setForm,
  onSubmit,
  onClose,
  loading
}) {
  // ─── SET FUNCTION ─────────────────────────────────────────────────────────
  const set = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // ─── STEP FUNCTIONS ──────────────────────────────────────────────────────
  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [
        ...(prev.steps || []),
        {
          id: Date.now(),
          icon: 'ExternalLink',
          title: '',
          description: '',
          link: ''
        }
      ]
    }))
  }

  const updateStep = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      steps: (prev.steps || []).map(step =>
        step.id === id ? { ...step, [key]: value } : step
      )
    }))
  }

  const deleteStep = (id) => {
    setForm(prev => ({
      ...prev,
      steps: (prev.steps || []).filter(step => step.id !== id)
    }))
  }

  const moveStep = (idx, dir) => {
    setForm(prev => {
      const steps = [...(prev.steps || [])]
      const target = idx + dir
      if (target < 0 || target >= steps.length) return prev
      ;[steps[idx], steps[target]] = [steps[target], steps[idx]]
      return { ...prev, steps }
    })
  }

  const isHot = (form?.type || 'daily') === 'hot'

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #E9EDF2',
    fontSize: 13,
    background: '#F7F8FC',
    fontFamily: 'inherit',
    outline: 'none'
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: '#8899AA',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
    display: 'block'
  }

  // ─── VALIDATION & SUBMIT ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()

    const steps = form?.steps || []
    
    if (!steps.length) {
      alert('Please add at least one task step')
      return
    }

    if (form?.type === 'hot') {
      if (form.hot_limit_type === 'timer' && !form.expires_at) {
        alert('Hot offer requires expiry date')
        return
      }

      if (form.hot_limit_type === 'users' && !form.max_users) {
        alert('Hot offer requires max users')
        return
      }
    }

    // Clean steps before submitting
    const cleanSteps = (form?.steps || []).map(step => ({
      icon: step.icon || 'ExternalLink',
      title: step.title || '',
      description: step.description || '',
      link: step.link || ''
    }))

    // Normalize data before submitting
    const cleanFormData = {
      ...form,
      individual_count: Number(form?.individual_count) || 10,
      steps: cleanSteps
    }

    onSubmit(cleanFormData)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 680,
          maxHeight: '94vh',
          overflowY: 'auto',
          border: `1px solid #E9EDF2`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}
      >
        {/* ─── HEADER ──────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E9EDF2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 10
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#001F54' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8899AA' }}>
              {editingTask ? `Task #${editingTask}` : 'Fill in all required fields'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#F7F8FC',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color="#8899AA" />
          </button>
        </div>

        {/* ─── FORM ────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* SECTION 1: Basic Info */}
          <div style={{ marginBottom: 22 }}>
            <span style={labelStyle}>Basic Information</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Task Type *</label>
                <select
                  value={form?.type || 'daily'}
                  onChange={e => set('type', e.target.value)}
                  style={inputStyle}
                >
                  <option value="daily">Daily Task (24h timer)</option>
                  <option value="hot">Hot Offer</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Platform</label>
                <select
                  value={form?.platform || ''}
                  onChange={e => set('platform', e.target.value)}
                  style={inputStyle}
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* ─── FIX: Post URL only for Hot Offers ────────────────────── */}
            {isHot && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Post URL</label>
                <input
                  placeholder="https://..."
                  value={form?.url || ''}
                  onChange={e => set('url', e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 6 }}>Task Title *</label>
              <input
                placeholder="e.g. Follow us on Instagram"
                value={form?.title || ''}
                onChange={e => set('title', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: 6 }}>Description</label>
              <textarea
                rows={2}
                placeholder="What should the user do?"
                value={form?.description || ''}
                onChange={e => set('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* SECTION 2: Reward */}
          <div style={{
            marginBottom: 22,
            padding: 16,
            borderRadius: 14,
            background: '#FFF8F0',
            border: `1px solid ${O}20`
          }}>
            <span style={labelStyle}>Reward</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Amount *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 50 or 0.50"
                  value={form?.reward || ''}
                  onChange={e => set('reward', Math.max(0.01, parseFloat(e.target.value) || 0))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Reward Type</label>
                <select
                  value={form?.reward_type || 'xp'}
                  onChange={e => set('reward_type', e.target.value)}
                  style={inputStyle}
                >
                  <option value="xp">XP Points</option>
                  <option value="cash">Cash ($)</option>
                </select>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#F7F8FC'
            }}>
              <span style={{ fontSize: 12, color: '#8899AA' }}>User earns:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: O }}>
                {form?.reward_type === 'cash' ? `$${form?.reward || 0}` : `+${form?.reward || 0} XP`}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              marginTop: 12,
              borderRadius: 12,
              background: '#F7F8FC'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#001F54' }}>Apply Level Multiplier</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8899AA' }}>
                  L2=1.2×, L3=1.5×, L4=2×, VIP+20%
                </p>
              </div>
              <Toggle
                on={!!form?.apply_multiplier}
                onToggle={() => set('apply_multiplier', form?.apply_multiplier ? 0 : 1)}
              />
            </div>
          </div>

          {/* SECTION 3: Timing (Hot Offer only) */}
          {isHot && (
            <div style={{
              marginBottom: 22,
              padding: 16,
              borderRadius: 14,
              background: '#F5F3FF',
              border: '1px solid #A78BFA30'
            }}>
              <span style={{ ...labelStyle, color: '#8B5CF6' }}>Hot Offer — Limit Type</span>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[
                  { v: 'timer', label: 'Global Timer', sub: 'Task expires at a set date/time' },
                  { v: 'users', label: 'Max Users', sub: 'Task closes when user limit is reached' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => set('hot_limit_type', opt.v)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: `2px solid ${form?.hot_limit_type === opt.v ? '#8B5CF6' : '#E9EDF2'}`,
                      background: form?.hot_limit_type === opt.v ? '#F5F3FF' : '#F7F8FC'
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: form?.hot_limit_type === opt.v ? '#8B5CF6' : '#001F54' }}>
                      {opt.label}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8899AA' }}>
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
              {form?.hot_limit_type === 'timer' && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: 6 }}>Expires On *</label>
                  <input
                    type="datetime-local"
                    value={form?.expires_at || ''}
                    onChange={e => set('expires_at', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}
              {form?.hot_limit_type === 'users' && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: 6 }}>Maximum Users *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={form?.max_users || ''}
                    onChange={e => set('max_users', Math.max(1, parseInt(e.target.value) || 1))}
                    style={inputStyle}
                  />
                  <p style={{ fontSize: 11, color: '#8899AA', marginTop: 5 }}>
                    Task will be hidden when this many users complete it.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: Verification Code */}
          <div style={{ marginBottom: 22 }}>
            <span style={labelStyle}>Verification Code</span>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[
                { v: 'universal', label: 'Universal Code', sub: 'Single code for all users' },
                { v: 'individual', label: 'Individual Codes', sub: 'Unique code per user' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => set('code_type', opt.v)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: `2px solid ${form?.code_type === opt.v ? O : '#E9EDF2'}`,
                    background: form?.code_type === opt.v ? `${O}10` : '#F7F8FC'
                  }}
                >
                  <p style={{ margin: '6px 0 2px', fontWeight: 700, fontSize: 13, color: form?.code_type === opt.v ? O : '#001F54' }}>
                    {opt.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#8899AA' }}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
            {form?.code_type === 'universal' && (
              <div>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Verification Code</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="e.g. X7K9M2P4"
                    value={form?.verify_code || ''}
                    onChange={e => set('verify_code', e.target.value.toUpperCase())}
                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: 2 }}
                    maxLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
                      let c = ''
                      for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)]
                      set('verify_code', c)
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 12,
                      background: `${O}15`,
                      border: `1px solid ${O}40`,
                      color: O,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <RefreshCw size={13} /> Generate
                  </button>
                </div>
              </div>
            )}
            {form?.code_type === 'individual' && (
              <div style={{ padding: '14px 16px', borderRadius: 12, background: '#F7F8FC' }}>
                <label style={{ ...labelStyle, marginBottom: 6 }}>Number of codes to generate *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="e.g. 50"
                  value={form?.individual_count || ''}
                  onChange={e => set('individual_count', Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* SECTION 5: Steps */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={labelStyle}>Task Steps ({(form?.steps || []).length})</span>
              <button
                type="button"
                onClick={addStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: `${O}18`,
                  border: `1px solid ${O}35`,
                  color: O,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} /> Add Step
              </button>
            </div>
            {(form?.steps || []).length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                borderRadius: 12,
                border: '1.5px dashed #E9EDF2',
                color: '#8899AA',
                fontSize: 12
              }}>
                No steps yet. Click "Add Step" to add instructions for users.
              </div>
            )}
            {(form?.steps || []).map((step, idx) => (
              <div key={step.id || idx} style={{
                marginBottom: 10,
                padding: '14px',
                background: '#F7F8FC',
                borderRadius: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#8899AA', minWidth: 20 }}>
                    #{idx + 1}
                  </span>
                  <IconPicker
                    value={step.icon || 'ExternalLink'}
                    onChange={v => updateStep(step.id, 'icon', v)}
                  />
                  <div style={{ flex: 1 }} />
                  <button
                    type="button"
                    onClick={() => moveStep(idx, -1)}
                    disabled={idx === 0}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: '#fff',
                      border: '1px solid #E9EDF2',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.3 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(idx, 1)}
                    disabled={idx === (form?.steps || []).length - 1}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: '#fff',
                      border: '1px solid #E9EDF2',
                      cursor: idx === (form?.steps || []).length - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === (form?.steps || []).length - 1 ? 0.3 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStep(step.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f87171'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    placeholder="Step title *"
                    value={step.title || ''}
                    onChange={e => updateStep(step.id, 'title', e.target.value)}
                    style={{ ...inputStyle, padding: '9px 12px', fontSize: 12 }}
                  />
                  <textarea
                    rows={2}
                    placeholder="Description / instructions for this step"
                    value={step.description || ''}
                    onChange={e => updateStep(step.id, 'description', e.target.value)}
                    style={{ ...inputStyle, padding: '9px 12px', fontSize: 12, resize: 'vertical' }}
                  />
                  <input
                    placeholder="Link URL (optional — clicking this step opens this URL)"
                    value={step.link || ''}
                    onChange={e => updateStep(step.id, 'link', e.target.value)}
                    style={{ ...inputStyle, padding: '9px 12px', fontSize: 12 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ─── SUBMIT ────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            paddingTop: 8,
            borderTop: '1px solid #E9EDF2'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid #E9EDF2',
                background: 'transparent',
                color: '#5A6E8A',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                background: loading ? `${O}55` : O,
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Zap size={15} />
              {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}