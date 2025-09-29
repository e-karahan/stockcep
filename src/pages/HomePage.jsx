import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useLocation ekledik
import { supabase } from '../supabaseClient';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation(); // Sayfa state'ini okumak için

  // YENİ: Edit sayfasından geri dönüldüğünde gelen sayfa numarasını al
  // Eğer bir state gelmediyse veya ilk yüklenişse, 1. sayfadan başla
  const initialPage = location.state?.fromPage || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [products, setProducts] = useState([]);
  const [itemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const getProducts = useCallback(async () => {
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
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);
  
  const handleSearchChange = (e) => {
    setCurrentPage(1);
    setSearchTerm(e.target.value);
  };
  
  async function deleteProduct(id) {
    if (!window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const { error } = await supabase.from('urunler').delete().eq('id', id);
      if (error) throw error;
      getProducts();
    } catch (error) {
      alert(error.message);
    }
  }

  async function updateStock(id, newStockAmount) {
    if (newStockAmount < 0) return;
    try {
      const { error } = await supabase.from('urunler').update({ stok_miktari: newStockAmount }).eq('id', id);
      if (error) throw error;
      setProducts(products.map(p => p.id === id ? {...p, stok_miktari: newStockAmount} : p));
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
                <td>
                 {product.stok_miktari}
                </td>
                <td>{product.gelis_fiyati ? `${product.gelis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>{product.satis_fiyati ? `${product.satis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>
                  {/* YENİ: Düzenle butonuna basarken o anki sayfa numarasını da gönderiyoruz */}
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