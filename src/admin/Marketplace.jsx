// Marketplace.jsx - COMPLETE FIXED VERSION (mobile responsive)
import { useState } from 'react'
import { API, O } from './adminUtils'
import { Plus, Edit, Trash2, Box, Save, X, ShoppingBag } from 'lucide-react'

export default function Marketplace({ token }) {
  const [products, setProducts] = useState([
    { id: 1, name: "Premium Hoodie", price: "40", discount: "10", description: "Limited edition", reward: "50", available: "In Stock", active: true, commissions: { B: "2", S: "3", G: "5", D: "8" } },
    { id: 2, name: "Gaming Mouse", price: "25", discount: "5", description: "RGB gaming mouse", reward: "30", available: "In Stock", active: true, commissions: { B: "1", S: "2", G: "3", D: "5" } },
    { id: 3, name: "T-Shirt", price: "15", discount: "0", description: "Cotton t-shirt", reward: "20", available: "Out of stock", active: false, commissions: { B: "1", S: "1", G: "2", D: "3" } }
  ])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '', price: '', discount: '', description: '', reward: '',
    available: 'In Stock', active: true,
    commissions: { B: '0', S: '0', G: '0', D: '0' }
  })

  const resetForm = () => {
    setFormData({
      name: '', price: '', discount: '', description: '', reward: '',
      available: 'In Stock', active: true,
      commissions: { B: '0', S: '0', G: '0', D: '0' }
    })
    setEditingId(null)
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name, price: product.price, discount: product.discount,
        description: product.description, reward: product.reward,
        available: product.available, active: product.active,
        commissions: { ...product.commissions }
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const saveProduct = () => {
    if (!formData.name.trim() || !formData.price) {
      alert('Name and price are required')
      return
    }

    const newProduct = {
      id: editingId || (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
      name: formData.name,
      price: formData.price,
      discount: formData.discount || '0',
      description: formData.description || '',
      reward: formData.reward || '0',
      available: formData.available,
      active: formData.active,
      commissions: { ...formData.commissions }
    }

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? newProduct : p))
      alert('Product updated')
    } else {
      setProducts([...products, newProduct])
      alert('Product added')
    }
    closeModal()
  }

  const deleteProduct = (id) => {
    if (confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      alert('Product deleted')
    }
  }

  const getStatusClass = (product) => {
    if (!product.active) return '#DC2626'
    if (product.available === 'In Stock') return '#10B981'
    return '#F59E0B'
  }

  const getStatusText = (product) => {
    if (!product.active) return 'Inactive'
    if (product.available === 'In Stock') return 'Active'
    return 'Out of stock'
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001F54', margin: 0 }}>Marketplace</h1>
        <p style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Manage products, commissions, and inventory</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: O, border: 'none', borderRadius: 30, padding: '8px 18px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 20, border: '1px solid #E9EDF2', color: '#8899AA' }}>No products yet</div>
        )}
        {products.map(product => (
          <div key={product.id} style={{ background: '#fff', borderRadius: 18, padding: 12, border: '1px solid #E9EDF2', display: 'flex', gap: 12 }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FFF8F0, #FFF2E6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingBag size={28} color={O} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#001F54' }}>{product.name}</div>
              <div style={{ fontSize: 12, color: O, fontWeight: 700, marginTop: 2 }}>${product.price}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: `${getStatusClass(product)}15`, color: getStatusClass(product), fontWeight: 600 }}>{getStatusText(product)}</span>
                <span style={{ fontSize: 9, color: '#8899AA' }}>{product.reward} XP</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button onClick={() => openModal(product)} style={{ background: 'none', border: 'none', color: O, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Edit size={11} /> Edit</button>
                <button onClick={() => deleteProduct(product.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Trash2 size={11} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: 340, borderRadius: 28, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E9EDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#8899AA" /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Price</label><input type="text" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Discount</label><input type="text" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: '#001F54', marginBottom: 4, display: 'block' }}>Reward (XP)</label><input type="text" value={formData.reward} onChange={e => setFormData({ ...formData, reward: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #E9EDF2', fontSize: 12, background: '#F7F8FC' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {['B', 'S', 'G', 'D'].map(level => (
                  <div key={level} style={{ textAlign: 'center', background: '#F7F8FC', borderRadius: 10, padding: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#001F54' }}>{level}</div>
                    <input type="text" value={formData.commissions[level]} onChange={e => setFormData({ ...formData, commissions: { ...formData.commissions, [level]: e.target.value } })} style={{ width: '100%', textAlign: 'center', padding: '4px', borderRadius: 8, border: '1px solid #E9EDF2', fontSize: 11, marginTop: 4 }} />
                  </div>
                ))}
              </div>
              <button onClick={saveProduct} style={{ width: '100%', background: O, border: 'none', borderRadius: 30, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}><Save size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}