import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Header from "./components/Header.jsx";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import WishlistDrawer from "./components/WishlistDrawer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import DynamicProductDetailPage from "./pages/DynamicProductDetailPage.jsx";
import { Navigate, Route, Routes } from "react-router-dom";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import { AdminProtectedRoute, CustomerProtectedRoute } from "./routes/ProtectedRoute.jsx";
import AdminOrderDetailPage from "./pages/AdminOrderDetailPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import PaymentReturnPage from "./pages/PaymentReturnPage.jsx";
import PlainCourierBagsPage from "./pages/PlainCourierBagsPage.jsx";
import WhiteCourierBagsPage from "./pages/WhiteCourierBagsPage.jsx";
import CustomPrintedCourierBagsPage from "./pages/CustomPrintedCourierBagsPage.jsx";
import CustomPrintedPinkCourierBagsPage from "./pages/CustomPrintedPinkCourierBagsPage.jsx";
import CustomPrintedPurpleCourierBagsPage from "./pages/CustomPrintedPurpleCourierBagsPage.jsx";
import CustomPrintedWhiteCourierBagsPage from "./pages/CustomPrintedWhiteCourierBagsPage.jsx";
import CustomPrintedBlackCourierBagsPage from "./pages/CustomPrintedBlackCourierBagsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";

export default function App() {
  return (
    <div className="page">
      <AnnouncementBar />
      <Header />
      <NavBar />
      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <CustomerProtectedRoute>
                <HomePage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/custom-printed-frosted-slider-zipper-lock-bags"
            element={
              <CustomerProtectedRoute>
                <ProductDetailPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/plain-courier-bags"
            element={
              <CustomerProtectedRoute>
                <PlainCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/white-courier-bags"
            element={
              <CustomerProtectedRoute>
                <WhiteCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/custom-printed-courier-bags"
            element={
              <CustomerProtectedRoute>
                <CustomPrintedCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/custom-printed-pink-courier-bags-60-micron"
            element={
              <CustomerProtectedRoute>
                <CustomPrintedPinkCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/custom-printed-purple-courier-bags-60-micron"
            element={
              <CustomerProtectedRoute>
                <CustomPrintedPurpleCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/custom-printed-white-courier-bags-51-micron"
            element={
              <CustomerProtectedRoute>
                <CustomPrintedWhiteCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/custom-printed-black-courier-covers-60-micron"
            element={
              <CustomerProtectedRoute>
                <CustomPrintedBlackCourierBagsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/product/:productId"
            element={
              <CustomerProtectedRoute>
                <DynamicProductDetailPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <CustomerProtectedRoute>
                <NotificationsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerProtectedRoute>
                <CartPage />
              </CustomerProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/checkout"
            element={
              <CustomerProtectedRoute>
                <CheckoutPage />
              </CustomerProtectedRoute>
            }
          />
          <Route path="/payment/return" element={<PaymentReturnPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrdersPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProductsPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <AdminProtectedRoute>
                <AdminOrderDetailPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsersPage />
              </AdminProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
}
