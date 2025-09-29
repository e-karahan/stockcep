import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const { data, error } = await supabase
        .from('urunler')
        .select('*')
        .order('stok_miktari', { ascending: true });
      if (error) throw error;
      if (data != null) setProducts(data);
    } catch (error) {
      alert(error.message);
    }
  }

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
      getProducts();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="App-header">
      <h1>StokCep - Ana Sayfa</h1>
      <Link to="/ekle" className="button-link">Yeni Ürün Ekle</Link>
      
      <h2>Ürün Listesi</h2>
      <table>
        <thead>
          <tr>
            <th>Ürün Adı</th>
            <th>Cinsi</th>
            <th>Stok</th>
            <th>Geliş Fiyatı</th>
            <th>Satış Fiyatı</th>
            <th>Toplam Stok Maliyeti</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.urun_adi}</td>
              <td>{product.cinsi}</td>
              <td>
                <button onClick={() => updateStock(product.id, product.stok_miktari - 1)}>-</button>
                {product.stok_miktari} adet
                <button onClick={() => updateStock(product.id, product.stok_miktari + 1)}>+</button>
              </td>
              <td>{product.gelis_fiyati ? `${product.gelis_fiyati.toFixed(2)} TL` : '-'}</td>
              <td>{product.satis_fiyati ? `${product.satis_fiyati.toFixed(2)} TL` : '-'}</td>
              {/* Toplam fiyatı burada anlık hesaplıyoruz */}
              <td>
                { (product.gelis_fiyati * product.stok_miktari) ? `${(product.gelis_fiyati * product.stok_miktari).toFixed(2)} TL` : '-' }
              </td>
              <td>
                <button onClick={() => deleteProduct(product.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}