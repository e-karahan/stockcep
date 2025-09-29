import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // YENİ: Toplam ürün sayısını ve toplam sayfa sayısını tutmak için state'ler
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getProducts();
  }, [currentPage]);

  async function getProducts() {
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // YENİ: Sorgudan 'count' bilgisini de alıyoruz
      const { data, error, count } = await supabase
        .from('urunler')
        .select('*', { count: 'exact' })
        .order('stok_miktari', { ascending: true })
        .range(from, to);

      if (error) throw error;
      
      if (data != null) {
        setProducts(data);
      }
      // YENİ: Gelen 'count' bilgisi ile toplam ürün ve sayfa sayılarını hesaplayıp state'e kaydediyoruz
      if (count != null) {
        setTotalProducts(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

    } catch (error) {
      alert(error.message);
    }
  }

  // ... deleteProduct ve updateStock fonksiyonları aynı kalıyor ...
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
      <div className="page-actions"> {/* YENİ: Butonu bir div içine aldık */}
        <Link to="/ekle" className="button-link">Yeni Ürün Ekle</Link>
      </div>
      
      <h2>Ürün Listesi ({totalProducts} ürün)</h2> {/* Bu başlık zaten vardı, yerinde kalıyor */}
      <div className="table-container">
        {/* ... tablonun geri kalanı aynı ... */}
        <table>
            {/* ... table content ... */}
            <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.urun_adi}</td>
                <td>{product.cinsi}</td>
                <td>
                  <div className="stock-controls">
                    <button onClick={() => updateStock(product.id, product.stok_miktari - 1)}>-</button>
                    <span style={{ padding: '0 10px' }}>{product.stok_miktari}</span>
                    <button onClick={() => updateStock(product.id, product.stok_miktari + 1)}>+</button>
                  </div>
                </td>
                <td>{product.gelis_fiyati ? `${product.gelis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>{product.satis_fiyati ? `${product.satis_fiyati.toFixed(2)} TL` : '-'}</td>
                <td>{ (product.gelis_fiyati * product.stok_miktari) ? `${(product.gelis_fiyati * product.stok_miktari).toFixed(2)} TL` : '-' }</td>
                <td>
                  <button onClick={() => navigate(`/duzenle/${product.id}`)} className="edit-button">Düzenle</button>
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
        {/* YENİ: Toplam sayfa sayısını da gösterelim */}
        <span>Sayfa {currentPage} / {totalPages}</span>
        {/* YENİ: Son sayfadaysak "Sonraki Sayfa" butonunu devre dışı bırakıyoruz */}
        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>
          Sonraki Sayfa
        </button>
      </div>
    </div>
  );
}