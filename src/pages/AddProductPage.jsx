import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function AddProductPage() {
  // State'i yeni alanları içerecek şekilde güncelledik
  const [newProduct, setNewProduct] = useState({ urun_adi: '', cinsi: '', stok_miktari: '', gelis_fiyati: '', satis_fiyati: '', aciklama: '' });
  const navigate = useNavigate();
   const handleFocus = (event) => event.target.select(); // YENİ FONKSİYON
    
  function handleInputChange(event) {
    const { name, value } = event.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  }

  async function createProduct(event) {
    event.preventDefault();
    try {
      const { error } = await supabase.from('urunler').insert([{ ...newProduct }]);
      if (error) throw error;
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  }
  
  return (
    <div className="App-header">
        <Link to="/" className='button-link'>← Ana Sayfaya Dön</Link>
        <h1>Yeni Ürün Ekle</h1>
        <form onSubmit={createProduct}>
          <h2>Yeni Ürün Ekle</h2>
  
  <div className="form-field">
    <input type="text" name="urun_adi" id="urun_adi" placeholder=" " value={newProduct.urun_adi} onChange={handleInputChange} required />
    <label htmlFor="urun_adi">Ürün Adı</label>
  </div>
  
  <div className="form-field">
    <input type="text" name="cinsi" id="cinsi" placeholder=" " value={newProduct.cinsi} onChange={handleInputChange} />
    <label htmlFor="cinsi">Cinsi / Kategorisi</label>
  </div>

  <div className="form-field">
    <input type="number" name="stok_miktari" id="stok_miktari" placeholder=" " value={newProduct.stok_miktari} onChange={handleInputChange} onFocus={handleFocus} required />
    <label htmlFor="stok_miktari">Stok Miktarı</label>
  </div>

  <div className="form-field">
    <input type="number" step="0.01" name="gelis_fiyati" id="gelis_fiyati" placeholder=" " value={newProduct.gelis_fiyati} onChange={handleInputChange} onFocus={handleFocus} />
    <label htmlFor="gelis_fiyati">Geliş Fiyatı</label>
  </div>

  <div className="form-field">
    <input type="number" step="0.01" name="satis_fiyati" id="satis_fiyati" placeholder=" " value={newProduct.satis_fiyati} onChange={handleInputChange} onFocus={handleFocus} />
    <label htmlFor="satis_fiyati">Satış Fiyatı</label>
  </div>

  <div className="form-field">
    <input type="text" name="aciklama" id="aciklama" placeholder=" " value={newProduct.aciklama} onChange={handleInputChange} />
    <label htmlFor="aciklama">Açıklama</label>
  </div>

  <button type="submit">Ürünü Kaydet</button>
        </form>
    </div>
  );
}