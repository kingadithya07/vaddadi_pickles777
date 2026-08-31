import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const CART_KEY = 'vp_cart';
const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!getToken()) return setBooting(false);
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setBooting(false));
  }, []);

  const toast = useCallback((message, tone = '') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  /* ------------------------------------------------------------------ auth */
  const login = useCallback(async (payload) => {
    const d = await api.login(payload);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (payload) => {
    const d = await api.register(payload);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const d = await api.me();
    setUser(d.user);
    return d.user;
  }, []);

  /* ------------------------------------------------------------------ cart */
  const addToCart = useCallback(
    (product, weight, qty = 1) => {
      const variant = product.variants.find((v) => Number(v.weight) === Number(weight));
      if (!variant) return;
      setCart((prev) => {
        const i = prev.findIndex(
          (l) => l.productId === product.id && Number(l.weight) === Number(weight)
        );
        if (i > -1) {
          const next = [...prev];
          next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, variant.stock || 99) };
          return next;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            weight: Number(weight),
            weightLabel: variant.label,
            price: variant.price,
            stock: variant.stock,
            qty,
          },
        ];
      });
      toast(`${product.name} (${variant.label}) added to cart`, 'ok');
    },
    [toast]
  );

  const setQty = useCallback((productId, weight, qty) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.productId === productId && Number(l.weight) === Number(weight)
            ? { ...l, qty: Math.max(0, qty) }
            : l
        )
        .filter((l) => l.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId, weight) => {
    setCart((prev) =>
      prev.filter((l) => !(l.productId === productId && Number(l.weight) === Number(weight)))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartSubtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);

  const value = useMemo(
    () => ({
      user,
      booting,
      login,
      register,
      logout,
      refreshUser,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      toast,
      toasts,
    }),
    [
      user, booting, login, register, logout, refreshUser, cart, cartCount, cartSubtotal,
      addToCart, setQty, removeFromCart, clearCart, cartOpen, toast, toasts,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
