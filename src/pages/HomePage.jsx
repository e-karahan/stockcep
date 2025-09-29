import { useState, useEffect } from 'react'; // useCallback'i kaldırdık
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPage = location.state?.fromPage || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');

  const [products, setProducts] = useState([]);
  const [itemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // YENİ: Tek ve birleştirilmiş useEffect
  useEffect(() => {
    // Bu fonksiyon her sayfa veya arama terimi değiştiğinde çalışacak
    async function getProducts() {
      try {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase.from('urunler').select('*', { count: 'exact' });

        if (searchTerm) {
          query = query.ilike('urun_adi', `%${searchTerm}%`);
        }

        query = query.order('created_at', { ascending: false }).range(from, to);
        const { data, error, count } = await query;

        if (error) throw error;
        
        if (data != null) setProducts(data);
        if (count != null) {
          setTotalProducts(count);
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
      } catch (error) {
        alert(error.message);
      }
    }
    
    getProducts(); // Fonksiyonu çalıştır
    
  }, [currentPage, searchTerm, itemsPerPage]); // Artık sadece bu iki state'e bağlı

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Arama yapıldığında her zaman 1. sayfaya dön
  };
  
  async function deleteProduct(id) {
    if (!window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const { error } = await supabase.from('urunler').delete().eq('id', id);
      if (error) throw error;
      // getProducts() fonksiyonunu doğrudan çağırmak yerine,
      // currentPage state'ini değiştirerek useEffect'in yeniden tetiklenmesini bekleyebiliriz.
      // Ama şimdilik direkt çağırmak daha basit ve anlaşılır.
      // Eğer arama aktifse ve son elemanı silersek boş sayfa göstermemesi için sayfa numarasını kontrol etmemiz gerekebilir.
      // Şimdilik basit tutalım.
      setCurrentPage(1); // Silme sonrası 1. sayfaya dönmek en güvenli davranış
      setSearchTerm(''); // ve aramayı temizle
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="App-header">
      <h1>StokCep</h1>
      <div className="page-actions">
        <Link to="/ekle" className="button-link">Yeni Ürün Ekle</Link>
      </div>
      
      <div className="search-container">
        <input 
          type="text"
          placeholder="Ürün adıyla ara..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <h2>Ürün Listesi ({totalProducts} ürün)</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ürün Adı</th>
              <th>Cinsi</th>
              <th>Stok</th>
              <th>Geliş Fiyatı</th>
              <th>Satış Fiyatı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.urun_adi}</td>
                <td>{product.cinsi}</td>
                <td>{product.stok_miktari}</td>
                <td>{product.gelis_fiyati ? `${product.gelis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>{product.satis_fiyati ? `${product.satis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>
                  <button onClick={() => navigate(`/duzenle/${product.id}`, { state: { fromPage: currentPage } })} className="edit-button">Düzenle</button>
                  <button onClick={() => deleteProduct(product.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Önceki Sayfa
        </button>
        <span>Sayfa {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>
          Sonraki Sayfa
        </button>
      </div>
    </div>
  );
}