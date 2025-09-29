import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function AddProductPage() {
  // State'i yeni alanları içerecek şekilde güncelledik
  const [newProduct, setNewProduct] = useState({ urun_adi: '', cinsi: '', stok_miktari: '', gelis_fiyati: '', satis_fiyati: '', aciklama: '' });
  const navigate = useNavigate();

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
          <input type="text" name="urun_adi" placeholder="Ürün Adı" value={newProduct.urun_adi} onChange={handleInputChange} required />
          {/* YENİ: Cinsi input'u */}
          <input type="text" name="cinsi" placeholder="Cinsi / Kategorisi" value={newProduct.cinsi} onChange={handleInputChange} />
          <input type="number" name="stok_miktari" placeholder="Stok Miktarı" value={newProduct.stok_miktari} onChange={handleInputChange} required />
          {/* YENİ: Geliş Fiyatı input'u */}
          <input type="number" step="0.01" name="gelis_fiyati" placeholder="Geliş Fiyatı" value={newProduct.gelis_fiyati} onChange={handleInputChange} />
          <input type="number" step="0.01" name="satis_fiyati" placeholder="Satış Fiyatı" value={newProduct.satis_fiyati} onChange={handleInputChange} />
          <input type="text" name="aciklama" placeholder="Açıklama" value={newProduct.aciklama} onChange={handleInputChange} />
          <button type="submit">Ürünü Kaydet</button>
        </form>
    </div>
  );
}