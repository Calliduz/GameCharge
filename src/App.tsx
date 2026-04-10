/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import HistoryPage from './pages/HistoryPage';
import SuccessPage from './pages/SuccessPage';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <CartProvider>
      <Toaster position="top-center" richColors theme="dark" />
      <Router>
        <ScrollToTop />
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:gameId" element={<ProductPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/success/:transactionId" element={<SuccessPage />} />
              <Route path="/success" element={<SuccessPage />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
    </CartProvider>
  );
}
