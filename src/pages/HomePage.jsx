import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const [isExporting, setIsExporting] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const getProducts = useCallback(async () => {
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      let query = supabase.from('urunler').select('*', { count: 'exact' });
      if (searchTerm) {
        query = query.ilike('urun_adi', `%${searchTerm}%`);
      }
      query = query.order('id', { ascending: true }).range(from, to);
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
      setCurrentPage(1);
    } catch (error) {
      alert(error.message);
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const { data: allProducts, error } = await supabase
        .from('urunler')
        .select('urun_adi, cinsi, stok_miktari, gelis_fiyati, satis_fiyati, aciklama')
        .order('id', { ascending: true });
      if (error) throw error;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stok Listesi');
      worksheet.columns = [
        { header: 'Ürün Adı', key: 'urun_adi', width: 40 },
        { header: 'Cinsi', key: 'cinsi', width: 25 },
        { header: 'Stok Adedi', key: 'stok_miktari', width: 15 },
        { header: 'Geliş Fiyatı', key: 'gelis_fiyati', width: 15, style: { numFmt: '#,##0.00 TL' } },
        { header: 'Satış Fiyatı', key: 'satis_fiyati', width: 15, style: { numFmt: '#,##0.00 TL' } },
        { header: 'Açıklama', key: 'aciklama', width: 50 }
      ];
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      allProducts.forEach(product => {
        worksheet.addRow(product);
      });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Stok Raporu.xlsx');
    } catch (error) {
      alert("Veri aktarılırken bir hata oluştu: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExpand = (productId) => {
    setExpandedProductId(prevId => (prevId === productId ? null : productId));
  };

  return (
    <div className="App-header">
      <h1>StokCep</h1>
      <div className="page-actions">
        <Link to="/ekle" className="button-link">Yeni Ürün Ekle</Link>
        <button onClick={handleExportExcel} disabled={isExporting} className="export-button">
          {isExporting ? 'Aktarılıyor...' : "Excel'e Aktar"}
        </button>
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

      <div className="table-container desktop-only">
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
                  <button onClick={() => deleteProduct(product.id)} className="delete-button">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-list-container mobile-only">
        {products.map(product => (
          <div key={product.id} className={`mobile-card ${expandedProductId === product.id ? 'expanded' : ''}`}>
            <div className="card-header" onClick={() => toggleExpand(product.id)}>
              <span className="product-name">{product.urun_adi}</span>
              <div className="header-details">
                <span className="stock-info">Stok: {product.stok_miktari}</span>
                <span className="arrow">▼</span>
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item"><strong>Cinsi:</strong> <span>{product.cinsi || '-'}</span></div>
              <div className="detail-item"><strong>Geliş Fiyatı:</strong> <span>{product.gelis_fiyati ? `${product.gelis_fiyati.toFixed(2)} TL` : '-'}</span></div>
              <div className="detail-item"><strong>Satış Fiyatı:</strong> <span>{product.satis_fiyati ? `${product.satis_fiyati.toFixed(2)} TL` : '-'}</span></div>
              <div className="card-actions">
                <button onClick={() => navigate(`/duzenle/${product.id}`, { state: { fromPage: currentPage } })} className="edit-button">Düzenle</button>
                <button onClick={() => deleteProduct(product.id)} className="delete-button">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Önceki</button>
        <span>Sayfa {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>Sonraki</button>
      </div>
    </div>
  );
}