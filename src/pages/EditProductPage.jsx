import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function EditProductPage() {
  // YENİ: State'in başlangıç değerlerinin null olmamasını sağlıyoruz.
  const [product, setProduct] = useState({ 
    urun_adi: '', 
    cinsi: '', 
    stok_miktari: 0, 
    gelis_fiyati: 0, 
    satis_fiyati: 0, 
    aciklama: '' 
  });
  const navigate = useNavigate();
  const { productId } = useParams();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('urunler')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } else if (data) {
        setProduct(data);
      }
    }
    fetchProduct();
  }, [productId, navigate]);

  // YENİ: handleInputChange fonksiyonunu güncelliyoruz.
  function handleInputChange(event) {
    const { name, value, type } = event.target;
    
    // Gelen değerin tipine göre işlem yapıyoruz.
    // Eğer input'un tipi 'number' ise ve içi boşsa 0, değilse sayıya çevirerek ata.
    // Diğerleri için normal değeri kullan.
    const newValue = type === 'number'
      ? (value === '' ? '' : parseFloat(value))
      : value;

    setProduct(prev => ({ 
      ...prev, 
      [name]: newValue 
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    const { error } = await supabase
      .from('urunler')
      .update({ 
        ...product, // Artık tüm product state'ini direkt gönderebiliriz.
        // Supabase'den gelen id ve created_at gibi alanları göndermemek daha temizdir
        // ama Supabase bunları genellikle görmezden gelir, bu yüzden sorun olmaz.
       })
      .eq('id', productId);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      alert('Ürün başarıyla güncellendi!');
      navigate('/');
    }
  }

  // YENİ: Input'ların value prop'larını null'a karşı korumalı hale getiriyoruz.
  return (
    <div className="App-header">
        <Link to="/" className='button-link'>← Ana Sayfaya Dön</Link>
        <h1>Ürünü Düzenle</h1>
        <form onSubmit={handleUpdate}>
         <h1>Ürünü Düzenle</h1>
  
  <div className="form-field">
    <input type="text" name="urun_adi" id="urun_adi" placeholder=" " value={product.urun_adi || ''} onChange={handleInputChange} required />
    <label htmlFor="urun_adi">Ürün Adı</label>
  </div>
  
  <div className="form-field">
    <input type="text" name="cinsi" id="cinsi" placeholder=" " value={product.cinsi || ''} onChange={handleInputChange} />
    <label htmlFor="cinsi">Cinsi / Kategorisi</label>
  </div>

  <div className="form-field">
    <input type="number" name="stok_miktari" id="stok_miktari" placeholder=" " value={product.stok_miktari || 0} onChange={handleInputChange} required />
    <label htmlFor="stok_miktari">Stok Miktarı</label>
  </div>

  <div className="form-field">
    <input type="number" step="0.01" name="gelis_fiyati" id="gelis_fiyati" placeholder=" " value={product.gelis_fiyati || 0} onChange={handleInputChange} />
    <label htmlFor="gelis_fiyati">Geliş Fiyatı</label>
  </div>

  <div className="form-field">
    <input type="number" step="0.01" name="satis_fiyati" id="satis_fiyati" placeholder=" " value={product.satis_fiyati || 0} onChange={handleInputChange} />
    <label htmlFor="satis_fiyati">Satış Fiyatı</label>
  </div>

  <div className="form-field">
    <input type="text" name="aciklama" id="aciklama" placeholder=" " value={product.aciklama || ''} onChange={handleInputChange} />
    <label htmlFor="aciklama">Açıklama</label>
  </div>

  <button type="submit">Değişiklikleri Kaydet</button>
        </form>
    </div>
  );
}