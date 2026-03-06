import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { SearchProvider } from "./search/SearchContext.jsx";
import { CartProvider } from "./cart/CartContext.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { WishlistProvider } from "./wishlist/WishlistContext.jsx";
import { ProductsProvider } from "./products/ProductsContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <ProductsProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ProductsProvider>
      </SearchProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
