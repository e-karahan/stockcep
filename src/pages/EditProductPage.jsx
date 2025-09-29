import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'; // useLocation ekledik

export default function EditProductPage() {
  const [product, setProduct] = useState({ 
    urun_adi: '', cinsi: '', stok_miktari: 0, 
    gelis_fiyati: 0, satis_fiyati: 0, aciklama: '' 
  });
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation(); // Konum bilgisini almak için

  // YENİ: Hangi sayfadan geldiğimizi state'den alıyoruz, eğer yoksa 1 kabul ediyoruz.
  const fromPage = location.state?.fromPage || 1;

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('urunler')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        navigate('/', { state: { fromPage: fromPage } }); // Hata olursa geldiğimiz sayfaya geri dön
      } else if (data) {
        setProduct(data);
      }
    }
    fetchProduct();
  }, [productId, navigate, fromPage]);

  const handleFocus = (event) => event.target.select();

  function handleInputChange(event) {
    const { name, value, type } = event.target;
    const newValue = type === 'number'
      ? (value === '' ? '' : parseFloat(value))
      : value;
    setProduct(prev => ({ ...prev, [name]: newValue }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    const { error } = await supabase
      .from('urunler')
      .update({ ...product })
      .eq('id', productId);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      alert('Ürün başarıyla güncellendi!');
      // YENİ: Ana sayfaya dönerken, hangi sayfadan geldiğimizi de state ile gönderiyoruz
      navigate('/', { state: { fromPage: fromPage } });
    }
  }

  return (
    <div className="App-header">
        {/* YENİ: Ana sayfaya dön linki de artık geldiği sayfaya geri dönecek */}
        <Link to="/" state={{ fromPage: fromPage }} className='button-link'>← Geri Dön</Link>
        <h1>Ürünü Düzenle</h1>
        <form onSubmit={handleUpdate}>
          <div className="form-field">
            <input type="text" name="urun_adi" id="urun_adi" placeholder=" " value={product.urun_adi || ''} onChange={handleInputChange} onFocus={handleFocus} required />
            <label htmlFor="urun_adi">Ürün Adı</label>
          </div>
          <div className="form-field">
            <input type="text" name="cinsi" id="cinsi" placeholder=" " value={product.cinsi || ''} onChange={handleInputChange} onFocus={handleFocus} />
            <label htmlFor="cinsi">Cinsi / Kategorisi</label>
          </div>
          <div className="form-field">
            <input type="number" name="stok_miktari" id="stok_miktari" placeholder=" " value={product.stok_miktari || 0} onChange={handleInputChange} onFocus={handleFocus} required />
            <label htmlFor="stok_miktari">Stok Miktarı</label>
          </div>
          <div className="form-field">
            <input type="number" step="0.01" name="gelis_fiyati" id="gelis_fiyati" placeholder=" " value={product.gelis_fiyati || 0} onChange={handleInputChange} onFocus={handleFocus} />
            <label htmlFor="gelis_fiyati">Geliş Fiyatı</label>
          </div>
          <div className="form-field">
            <input type="number" step="0.01" name="satis_fiyati" id="satis_fiyati" placeholder=" " value={product.satis_fiyati || 0} onChange={handleInputChange} onFocus={handleFocus} />
            <label htmlFor="satis_fiyati">Satış Fiyatı</label>
          </div>
          <div className="form-field">
            <input type="text" name="aciklama" id="aciklama" placeholder=" " value={product.aciklama || ''} onChange={handleInputChange} onFocus={handleFocus} />
            <label htmlFor="aciklama">Açıklama</label>
          </div>
          <button type="submit">Değişiklikleri Kaydet</button>
        </form>
    </div>
  );
}