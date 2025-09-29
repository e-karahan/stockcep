import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'

// Sayfalarımızı import ediyoruz
import HomePage from './pages/HomePage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';

// Rotaları (yolları) tanımlıyoruz
const router = createBrowserRouter([
  {
    path: "/", // Ana URL (http://localhost:5173/)
    element: <HomePage />, // Bu URL'de HomePage bileşenini göster
  },
  {
    path: "/ekle", // http://localhost:5173/ekle URL'i
    element: <AddProductPage />, // Bu URL'de AddProductPage bileşenini göster
  },
  { // YENİ: Düzenleme rotası
    path: "/duzenle/:productId", // :productId dinamik bir parametre
    element: <EditProductPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)