// Carousel.jsx
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'

export default function Carousel({ token }) {
  const [carouselItems, setCarouselItems] = useState([
    { id: 1, name: "Summer Sale", link: "https://bigtenx.com/summer", image: "" },
    { id: 2, name: "Referral Bonus", link: "https://bigtenx.com/refer", image: "" },
    { id: 3, name: "New Tasks Available", link: "https://bigtenx.com/tasks", image: "" }
  ])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', link: '', image: '' })

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setFormData({ name: item.name, link: item.link, image: item.image || '' })
    } else {
      setEditingId(null)
      setFormData({ name: '', link: '', image: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ name: '', link: '', image: '' })
  }

  const saveItem = () => {
    if (!formData.name.trim() || !formData.link.trim()) {
      alert('Name and link are required')
      return
    }

    if (editingId !== null) {
      setCarouselItems(items => items.map(item =>
        item.id === editingId ? { ...item, name: formData.name, link: formData.link, image: formData.image } : item
      ))
      alert('Carousel item updated')
    } else {
      const newId = carouselItems.length > 0 ? Math.max(...carouselItems.map(i => i.id)) + 1 : 1
      setCarouselItems([...carouselItems, { id: newId, name: formData.name, link: formData.link, image: formData.image }])
      alert('Carousel item added')
    }
    closeModal()
  }

  const deleteItem = (id) => {
    if (confirm('Delete this carousel item?')) {
      setCarouselItems(items => items.filter(item => item.id !== id))
      alert('Carousel item deleted')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#001F54', margin: 0 }}>Carousel Manager</h1>
        <p style={{ fontSize: 13, color: '#8899AA', marginTop: 4 }}>Manage homepage carousel banners and promotional items</p>
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: O, border: 'none', borderRadius: 30,
            padding: '10px 20px', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Carousel Item
        </button>
      </div>

      {/* Carousel List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {carouselItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 24, border: '1px solid #E9EDF2', color: '#8899AA' }}>
            No carousel items yet. Add one!
          </div>
        )}
        {carouselItems.map(item => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: 20, padding: 14,
            border: '1px solid #E9EDF2', display: 'flex', gap: 14,
            alignItems: 'center'
          }}>
            {/* Image Preview */}
            <div style={{
              width: 60, height: 60, background: '#F7F8FC', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
              ) : (
                <ImageIcon size={28} color={O} />
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#001F54', marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: O, wordBreak: 'break-all' }}>{item.link}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => openModal(item)} style={{ background: 'none', border: 'none', color: O, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', width: 340, borderRadius: 32, overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid #E9EDF2',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#001F54' }}>
                {editingId ? 'Edit Carousel Item' : 'Add Carousel Item'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <i className="fas fa-times" style={{ fontSize: 20, color: '#8899AA' }}></i>
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54', display: 'block', marginBottom: 6 }}>Name</label>
                <input
                  type="text"
                  placeholder="Item name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 14, border: '1px solid #E9EDF2', fontSize: 13, background: '#F7F8FC' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54', display: 'block', marginBottom: 6 }}>Link (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 14, border: '1px solid #E9EDF2', fontSize: 13, background: '#F7F8FC' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#001F54', display: 'block', marginBottom: 6 }}>Image URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 14, border: '1px solid #E9EDF2', fontSize: 13, background: '#F7F8FC' }}
                />
              </div>
              <button
                onClick={saveItem}
                style={{ width: '100%', background: O, border: 'none', borderRadius: 30, padding: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}