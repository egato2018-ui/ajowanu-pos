import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, CartItem, ShopSettings, Sale } from '../types';
import { formatFCFA } from '../utils/formatters';
import { UPIPaymentModal } from './UPIPaymentModal';
import { UPIPaymentService } from '../services/paymentService';
import { sqliteDB } from '../db/sqliteStorage';
import { playPosSuccessBeep, playPosErrorBeep } from '../utils/sound';
import { 
  Barcode, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  RotateCcw,
  ShoppingBag,
  AlertCircle,
  Keyboard,
  User,
  Phone,
  ArrowRight,
  Coins,
  Smartphone,
  CreditCard,
  FileText,
  Sparkles
} from 'lucide-react';
import { ProductCard } from './ui/ProductCard';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface POSBillingViewProps {
  products: Product[];
  settings: ShopSettings;
  onRecordSale: (
    cartItems: CartItem[],
    customerName: string,
    customerPhone: string,
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit',
    receivedAmount: number,
    discountAmount: number,
    taxPercent: number
  ) => Sale;
  onOpenCameraScanner: () => void;
  scannedBarcode: string | null;
  onClearScannedBarcode: () => void;
}

export const POSBillingView: React.FC<POSBillingViewProps> = ({
  products,
  settings,
  onRecordSale,
  onOpenCameraScanner,
  scannedBarcode,
  onClearScannedBarcode,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [taxPercentInput, setTaxPercentInput] = useState<number>(settings.defaultTaxPercent || 0);
  const [receivedAmountInput, setReceivedAmountInput] = useState<string>('');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [draftInvoiceNumber, setDraftInvoiceNumber] = useState<string>('');

  // Toast & Scanner Status Notification state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const lastScannedTimeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const currency = settings.currencySymbol || 'FCFA';

  // Categories list
  const rawCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const categories = ['Tous', ...rawCategories];

  const focusBarcodeInput = () => {
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 50);
  };

  useEffect(() => {
    focusBarcodeInput();
  }, []);

  // Global Keyboard Shortcuts (F2: Checkout, F3: Focus Barcode, F4: Camera Scanner, Ctrl+L: Clear Cart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
        return;
      }

      if (e.key === 'F3') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        onOpenCameraScanner();
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Vider tous les articles du panier en cours ?')) {
          setCart([]);
          showToast('success', 'Panier vidé');
        }
        return;
      }

      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, customerPhone, paymentMode, receivedAmountInput, discountInput, taxPercentInput]);

  useEffect(() => {
    if (scannedBarcode) {
      handleBarcodeScanned(scannedBarcode);
      onClearScannedBarcode();
    }
  }, [scannedBarcode]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const cleaned = barcode.trim().replace(/\s+/g, '');
    if (!cleaned) return;

    const now = Date.now();
    if (
      lastScannedTimeRef.current.code === cleaned &&
      now - lastScannedTimeRef.current.time < 1000
    ) {
      setSearchQuery('');
      focusBarcodeInput();
      return;
    }

    lastScannedTimeRef.current = { code: cleaned, time: now };

    const matchedProduct = products.find(p => p.barcode === cleaned || p.id.toLowerCase() === cleaned.toLowerCase());
    if (matchedProduct) {
      addToCart(matchedProduct);
      setSearchQuery('');
      playPosSuccessBeep();
      showToast('success', `Ajouté : ${matchedProduct.name} (${formatFCFA(matchedProduct.sellingPrice, currency)})`);
    } else {
      playPosErrorBeep();
      showToast('error', `Aucun article trouvé pour le code : "${cleaned}"`);
    }

    focusBarcodeInput();
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      playPosErrorBeep();
      showToast('error', `"${product.name}" est en RUPTURE DE STOCK !`);
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex !== -1) {
        const existingItem = prevCart[existingIndex];
        if (existingItem.quantity + 1 > product.quantity) {
          playPosErrorBeep();
          showToast('error', `Limite de stock atteinte pour ${product.name} !`);
          return prevCart;
        }

        const updated = [...prevCart];
        const newQty = existingItem.quantity + 1;
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          totalPrice: newQty * existingItem.unitSellingPrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitSellingPrice: product.sellingPrice,
            totalPrice: product.sellingPrice,
          }
        ];
      }
    });

    focusBarcodeInput();
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;

          if (newQty > item.product.quantity) {
            alert(`Stock maximum atteint ! Disponible : ${item.product.quantity}`);
            return item;
          }

          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitSellingPrice,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeCartItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Voulez-vous vider le panier en cours ?')) {
      setCart([]);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = (subtotal - discountInput) * (taxPercentInput / 100);
  const grandTotal = Math.max(0, Math.round(subtotal - discountInput + taxAmount));

  const receivedNum = parseFloat(receivedAmountInput) || 0;
  const changeDue = Math.max(0, receivedNum - grandTotal);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Le panier est vide ! Scannez ou ajoutez un produit.');
      return;
    }

    if (paymentMode === 'Cash' && receivedNum > 0 && receivedNum < grandTotal) {
      alert(`Le montant versé (${formatFCFA(receivedNum, currency)}) est inférieur au total (${formatFCFA(grandTotal, currency)}).`);
      return;
    }

    if (paymentMode === 'UPI') {
      const upiService = new UPIPaymentService(settings);
      if (!upiService.isAvailable()) {
        alert('Les encaissements Mobile Money / QR ne sont pas encore configurés. Renseignez votre numéro marchand dans Paramètres.');
        return;
      }
      setDraftInvoiceNumber(sqliteDB.getNextInvoiceNumber());
      setIsUpiModalOpen(true);
      return;
    }

    onRecordSale(
      cart,
      customerName,
      customerPhone,
      paymentMode,
      receivedNum > 0 ? receivedNum : grandTotal,
      discountInput,
      taxPercentInput
    );

    // Reset Form
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setReceivedAmountInput('');
    setDiscountInput(0);
    setSearchQuery('');
  };

  const finalizeUpiSale = () => {
    onRecordSale(
      cart,
      customerName,
      customerPhone,
      'UPI',
      grandTotal,
      discountInput,
      taxPercentInput
    );

    setIsUpiModalOpen(false);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setReceivedAmountInput('');
    setDiscountInput(0);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Lazy loading batch configuration (prevents heavy DOM overload and scroll jank)
  const INITIAL_BATCH_SIZE = 16;
  const BATCH_STEP = 12;
  const [displayLimit, setDisplayLimit] = useState<number>(INITIAL_BATCH_SIZE);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  // Automatically reset visible limit when user searches or switches category
  useEffect(() => {
    setDisplayLimit(INITIAL_BATCH_SIZE);
  }, [searchQuery, selectedCategory]);

  // Sliced items currently displayed
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  const hasMoreProducts = displayLimit < filteredProducts.length;

  // Progressive infinite scroll: auto-loads next batch when scrolling near bottom
  useEffect(() => {
    if (!loadMoreSentinelRef.current || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit(prev => Math.min(prev + BATCH_STEP, filteredProducts.length));
        }
      },
      { root: null, rootMargin: '300px' }
    );

    observer.observe(loadMoreSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMoreProducts, filteredProducts.length]);

  return (
    <div className="p-4 h-[calc(100vh-3.5rem)] flex flex-col md:flex-row gap-4 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 shadow-md border ${
          toastMessage.type === 'success'
            ? 'bg-[#123F46] text-white border-emerald-400/40'
            : 'bg-[#111827] text-rose-200 border-rose-500/50'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Left Column: Visual Product Catalog & Scanner Bar */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#ECE5D7] shadow-xs overflow-hidden">
        
        {/* Top Search & Hardware Scanner status */}
        <div className="p-4 border-b border-[#ECE5D7] space-y-3 bg-[#FAF8F5]">
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Lecteur USB Prêt
              </span>
              <span className="hidden sm:inline text-slate-400 text-[11px]">
                Focus persistant (F3) • Scanner &lt;100ms
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Keyboard className="w-3.5 h-3.5" />
              <span className="px-1.5 py-0.5 bg-white border border-[#ECE5D7] rounded font-mono font-bold">F2: Encaisser</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#ECE5D7] rounded font-mono font-bold">F4: Caméra</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 absolute left-3.5 top-3 text-[#D85C3A] pointer-events-none" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scanner le code-barres ou rechercher un article... (F3)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleBarcodeScanned(searchQuery);
                  }
                }}
                className="w-full pl-11 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:border-[#D85C3A] focus:ring-2 focus:ring-[#D85C3A]/10 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); focusBarcodeInput(); }}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="md"
              icon={<Camera className="w-4 h-4 text-[#D85C3A]" />}
              onClick={onOpenCameraScanner}
              title="Scanner avec la caméra (F4)"
            >
              <span className="hidden sm:inline">Caméra</span>
            </Button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); focusBarcodeInput(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#123F46] text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with Smooth Lazy Loading */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 content-start">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Aucun article trouvé</p>
                <p className="text-xs">Vérifiez l'orthographe ou le code scanné.</p>
              </div>
            ) : (
              visibleProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onAddToCart={addToCart}
                  onClick={() => addToCart(product)}
                />
              ))
            )}
          </div>

          {/* Lazyload Sentinel & Seamless Load Indicator */}
          {filteredProducts.length > 0 && (
            <div 
              ref={loadMoreSentinelRef}
              className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7] flex items-center justify-between text-xs text-slate-500 shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>
                  Affichage de <strong className="text-slate-800 font-mono-data">{visibleProducts.length}</strong> sur <strong className="text-slate-800 font-mono-data">{filteredProducts.length}</strong> articles
                </span>
              </div>

              {hasMoreProducts ? (
                <button
                  type="button"
                  onClick={() => setDisplayLimit(prev => Math.min(prev + BATCH_STEP, filteredProducts.length))}
                  className="px-3 py-1 bg-white hover:bg-[#FDF3F0] hover:text-[#D85C3A] text-slate-700 border border-[#ECE5D7] rounded-lg font-medium text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Charger plus (+{Math.min(BATCH_STEP, filteredProducts.length - visibleProducts.length)})</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Tous les articles sont affichés
                </span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Checkout Register Terminal */}
      <div className="w-full md:w-[430px] lg:w-[470px] shrink-0 flex flex-col bg-white rounded-2xl border border-[#ECE5D7] shadow-xs overflow-hidden">
        
        {/* Cart Title & Quick Reset */}
        <div className="p-4 border-b border-[#ECE5D7] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FDF3F0] text-[#D85C3A] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Panier de Vente
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {cart.length} référence(s) sélectionnée(s)
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Vider (Ctrl+L)</span>
            </button>
          )}
        </div>

        {/* Customer Details Row */}
        <div className="p-3 bg-white border-b border-[#ECE5D7] grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Nom Client</span>
            </label>
            <input
              type="text"
              placeholder="Client Comptoir"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg outline-none focus:border-[#D85C3A] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Contact / WhatsApp</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 97 00 00 00"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg outline-none focus:border-[#D85C3A] font-mono text-xs"
            />
          </div>
        </div>

        {/* Itemized Cart List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto stroke-1 opacity-40" />
              <p className="text-xs font-bold text-slate-700">Votre panier est vide</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Scannez un code-barres avec la douchette USB ou cliquez sur un produit dans le catalogue.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7] flex items-center justify-between text-xs gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h5>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatFCFA(item.unitSellingPrice, currency)} x {item.quantity} = <strong className="text-slate-900 font-mono-data">{formatFCFA(item.totalPrice, currency)}</strong>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#ECE5D7] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold font-mono-data text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#ECE5D7] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeCartItem(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition ml-1 cursor-pointer"
                    title="Supprimer cet article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Calculation & Payment Section */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#ECE5D7] space-y-3.5">
          
          {/* Subtotal, Discount & Tax */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total HT</span>
              <span className="font-mono-data font-bold text-slate-900">{formatFCFA(subtotal, currency)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Remise commerciale</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={discountInput || ''}
                  placeholder="0"
                  onChange={e => setDiscountInput(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-mono-data text-xs outline-none focus:border-[#D85C3A]"
                />
                <span className="text-[10px] text-slate-400">{currency}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">TVA ({taxPercentInput}%)</span>
              <span className="font-mono-data text-slate-700">{formatFCFA(taxAmount, currency)}</span>
            </div>

            {/* High-Contrast Net à Payer Display */}
            <div className="pt-2.5 border-t border-[#ECE5D7] flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Net à Payer</span>
              <span className="font-mono-data text-2xl font-black text-[#D85C3A]">
                {formatFCFA(grandTotal, currency)}
              </span>
            </div>
          </div>

          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: 'Cash', label: 'Espèces', icon: <Coins className="w-3.5 h-3.5" /> },
              { key: 'UPI', label: 'MoMo / QR', icon: <Smartphone className="w-3.5 h-3.5" /> },
              { key: 'Card', label: 'Carte', icon: <CreditCard className="w-3.5 h-3.5" /> },
              { key: 'Credit', label: 'À Crédit', icon: <FileText className="w-3.5 h-3.5" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaymentMode(key as any)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  paymentMode === key
                    ? 'bg-[#123F46] text-white border-[#123F46] shadow-xs'
                    : 'bg-white text-slate-700 border-[#ECE5D7] hover:bg-slate-50'
                }`}
              >
                {icon}
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>

          {/* Cash Received & Change Calculator */}
          {paymentMode === 'Cash' && grandTotal > 0 && (
            <div className="p-3 rounded-xl bg-white border border-[#ECE5D7] text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">Espèces reçues :</span>
                <input
                  type="number"
                  placeholder={`${grandTotal}`}
                  value={receivedAmountInput}
                  onChange={e => setReceivedAmountInput(e.target.value)}
                  className="w-32 px-2.5 py-1 bg-[#FAF8F5] border border-slate-300 rounded-lg text-right font-mono-data font-bold text-sm outline-none focus:border-[#D85C3A]"
                />
              </div>

              {receivedNum > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="font-medium text-slate-600">Monnaie à restituer :</span>
                  <span className="font-bold font-mono-data text-base text-[#123F46]">
                    {formatFCFA(changeDue, currency)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Primary Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full h-12 text-sm shadow-sm"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            Valider la Vente & Reçu (F2)
          </Button>

        </div>

      </div>

      {/* Dynamic Mobile Money & QR Payment Modal */}
      <UPIPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onPaymentSuccess={finalizeUpiSale}
        settings={settings}
        invoiceNumber={draftInvoiceNumber || 'FAC-2026-0001'}
        customerName={customerName}
        amount={grandTotal}
      />

    </div>
  );
};
