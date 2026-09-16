import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sale, SaleReturn, ShopSettings, Product } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Printer, 
  AlertCircle, 
  FileText, 
  X,
  PackageCheck,
  Eye,
  Mic,
  MicOff,
  Barcode,
  Calendar,
  CreditCard,
  User,
  Phone,
  ShoppingBag,
  Filter,
  Zap,
  ArrowRightLeft,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Coins,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface ReturnsExchangesViewProps {
  settings: ShopSettings;
  onViewInvoice?: (sale: Sale) => void;
  onReturnProcessed?: () => void;
}

type DateFilterType = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';
type PaymentFilterType = 'all' | 'Cash' | 'UPI' | 'Card' | 'Credit';
type StatusFilterType = 'all' | 'Completed' | 'Refunded' | 'Partially Refunded' | 'Cancelled';

interface SearchSuggestion {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dateTime: string;
  matchReason: string;
  sale: Sale;
}

export const ReturnsExchangesView: React.FC<ReturnsExchangesViewProps> = ({ 
  settings,
  onViewInvoice,
  onReturnProcessed
}) => {
  const currency = settings.currencySymbol || 'FCFA';

  // State Management
  const [sales, setSales] = useState<Sale[]>(() => sqliteDB.getSales());
  const [returns, setReturns] = useState<SaleReturn[]>(() => sqliteDB.getReturns());
  const [products, setProducts] = useState<Product[]>(() => sqliteDB.getProducts());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Voice Search state
  const [isListening, setIsListening] = useState(false);

  // Return Processing modal state
  const [matchedSale, setMatchedSale] = useState<Sale | null>(null);
  const [returnReason, setReturnReason] = useState<'Defective' | 'Expired' | 'Wrong Item' | 'Customer Changed Mind'>('Defective');
  const [selectedItemReturnQty, setSelectedItemReturnQty] = useState<Record<string, number>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  const refreshAll = () => {
    setSales(sqliteDB.getSales());
    setReturns(sqliteDB.getReturns());
    setProducts(sqliteDB.getProducts());
  };

  // Keyboard Shortcuts: Ctrl+F, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSearchQuery('');
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('La recherche vocale n\'est pas supportée sur ce navigateur. Veuillez saisir votre recherche au clavier.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        setShowSuggestions(true);
      };

      recognition.onerror = (event: any) => {
        console.warn('Erreur reconnaissance vocale :', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Impossible de démarrer la reconnaissance vocale :', err);
      setIsListening(false);
    }
  };

  // Barcode / Form Search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setShowSuggestions(false);

    // Check if query directly matches a product barcode
    const matchedProductsByBarcode = products.filter(p => p.barcode && p.barcode.toLowerCase() === query.toLowerCase());
    
    let barcodeMatchedSales: Sale[] = [];
    if (matchedProductsByBarcode.length > 0) {
      const productIds = new Set(matchedProductsByBarcode.map(p => p.id));
      barcodeMatchedSales = sales.filter(s => s.items.some(item => productIds.has(item.productId) || item.barcode === query));
    } else {
      barcodeMatchedSales = sales.filter(s => s.items.some(item => item.barcode && item.barcode.toLowerCase() === query.toLowerCase()));
    }

    if (barcodeMatchedSales.length === 1) {
      openReturnProcessor(barcodeMatchedSales[0]);
      return;
    }

    // Direct invoice lookup
    const exactSale = sqliteDB.getSaleByInvoice(query);
    if (exactSale) {
      openReturnProcessor(exactSale);
      return;
    }
  };

  // Open Return Processor for a given Sale
  const openReturnProcessor = (sale: Sale) => {
    setMatchedSale(sale);
    const initialQtyMap: Record<string, number> = {};
    sale.items.forEach(it => {
      initialQtyMap[it.productId] = 0;
    });
    setSelectedItemReturnQty(initialQtyMap);
  };

  // Live Multi-Search Filtering Logic
  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sales.filter(sale => {
      let matchesSearch = true;
      if (q) {
        const matchInvoice = sale.invoiceNumber.toLowerCase().includes(q);
        const matchCustomer = (sale.customerName || '').toLowerCase().includes(q);
        const matchPhone = (sale.customerPhone || '').toLowerCase().includes(q);
        const matchCashier = (sale.cashierName || '').toLowerCase().includes(q);
        const matchAmount = sale.totalAmount.toString().includes(q) || `${sale.totalAmount} ${currency}`.toLowerCase().includes(q);
        const matchPayment = sale.paymentMode.toLowerCase().includes(q);
        const matchItem = sale.items.some(item => 
          item.productName.toLowerCase().includes(q) || 
          (item.barcode && item.barcode.toLowerCase().includes(q))
        );

        matchesSearch = matchInvoice || matchCustomer || matchPhone || matchCashier || matchAmount || matchPayment || matchItem;
      }

      // Date Filter
      let matchesDate = true;
      const saleDate = new Date(sale.dateTime);
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate = saleDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'yesterday') {
        const yest = new Date();
        yest.setDate(now.getDate() - 1);
        matchesDate = saleDate.toDateString() === yest.toDateString();
      } else if (dateFilter === 'last7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = saleDate >= sevenDaysAgo;
      } else if (dateFilter === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = saleDate >= thirtyDaysAgo;
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = saleDate >= start && saleDate <= end;
      }

      // Payment Filter
      let matchesPayment = true;
      if (paymentFilter !== 'all') {
        matchesPayment = sale.paymentMode === paymentFilter;
      }

      // Status Filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = sale.status === statusFilter;
      }

      return matchesSearch && matchesDate && matchesPayment && matchesStatus;
    });
  }, [sales, searchQuery, dateFilter, paymentFilter, statusFilter, customStartDate, customEndDate, currency]);

  // Live Search Suggestions List (Max 6 preview results)
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchSuggestion[] = [];
    for (const sale of sales) {
      if (results.length >= 6) break;

      let reason = '';
      if (sale.invoiceNumber.toLowerCase().includes(q)) {
        reason = 'Facture trouvée';
      } else if ((sale.customerName || '').toLowerCase().includes(q)) {
        reason = `Client : ${sale.customerName}`;
      } else if ((sale.customerPhone || '').toLowerCase().includes(q)) {
        reason = `Tél : ${sale.customerPhone}`;
      } else {
        const matchedItem = sale.items.find(i => 
          i.productName.toLowerCase().includes(q) || (i.barcode && i.barcode.toLowerCase().includes(q))
        );
        if (matchedItem) {
          reason = `Article : ${matchedItem.productName}`;
        } else if (sale.totalAmount.toString().includes(q)) {
          reason = `Montant : ${formatFCFA(sale.totalAmount, currency)}`;
        }
      }

      if (reason) {
        results.push({
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          customerName: sale.customerName || 'Client Comptant',
          amount: sale.totalAmount,
          dateTime: sale.dateTime,
          matchReason: reason,
          sale,
        });
      }
    }
    return results;
  }, [sales, searchQuery, currency]);

  // Quick Action Handlers
  const handleTodaySales = () => {
    setSearchQuery('');
    setDateFilter('today');
    setPaymentFilter('all');
    setStatusFilter('all');
  };

  const handleRecentInvoices = () => {
    setSearchQuery('');
    setDateFilter('all');
    setPaymentFilter('all');
    setStatusFilter('all');
  };

  const handleHighValueBills = () => {
    setSearchQuery('');
    setDateFilter('all');
    setPaymentFilter('all');
    setStatusFilter('all');
    setSales(sqliteDB.getSales().filter(s => s.totalAmount >= 25000));
  };

  const handleLastCustomer = () => {
    const all = sqliteDB.getSales();
    if (all.length > 0 && all[0].customerName) {
      setSearchQuery(all[0].customerName);
    } else {
      alert('Aucun client enregistré récemment.');
    }
  };

  const handleRepeatLastBill = () => {
    const all = sqliteDB.getSales();
    if (all.length > 0) {
      if (onViewInvoice) {
        onViewInvoice(all[0]);
      } else {
        openReturnProcessor(all[0]);
      }
    } else {
      alert('Aucune vente enregistrée dans l\'historique.');
    }
  };

  // Process Refund Submission
  const handleProcessRefund = () => {
    if (!matchedSale) return;

    const itemsToReturn = matchedSale.items
      .filter(item => (selectedItemReturnQty[item.productId] || 0) > 0)
      .map(item => ({
        productId: item.productId,
        productName: item.productName,
        qty: selectedItemReturnQty[item.productId],
        unitPrice: item.unitSellingPrice,
      }));

    if (itemsToReturn.length === 0) {
      alert('Veuillez sélectionner au moins 1 article à retourner.');
      return;
    }

    const totalRefund = itemsToReturn.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0);

    sqliteDB.recordReturn(matchedSale.id, itemsToReturn, totalRefund, returnReason);
    
    if (onReturnProcessed) {
      onReturnProcessed();
    }

    alert(`Bon de retour enregistré ! Remboursement de ${formatFCFA(totalRefund, currency)} validé et articles réintégrés en stock.`);
    
    refreshAll();

    const updatedSale = sqliteDB.getSaleByInvoice(matchedSale.invoiceNumber);
    setMatchedSale(null);

    if (updatedSale && onViewInvoice) {
      if (confirm('Souhaitez-vous imprimer le ticket de caisse actualisé dès maintenant ?')) {
        onViewInvoice(updatedSale);
      }
    }
  };

  const recentTenSales = useMemo(() => sales.slice(0, 10), [sales]);

  const reasonLabels: Record<string, string> = {
    'Defective': 'Produit défectueux / abîmé',
    'Expired': 'Date de péremption proche ou dépassée',
    'Wrong Item': 'Mauvais article emporté par erreur',
    'Customer Changed Mind': 'Changement d\'avis du client',
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Retours, Échanges & Avoirs"
        subtitle="Recherche universelle par N° de facture, nom du client, téléphone ou code-barres. Réintégration automatique des articles au stock magasin."
        icon={<RotateCcw className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <div className="flex items-center gap-1 text-[11px] font-mono bg-white border border-[#ECE5D7] px-3 py-1 rounded-xl text-slate-600">
            <Zap className="w-3.5 h-3.5 text-[#D85C3A]" />
            <span><strong className="text-slate-900">Ctrl + F</strong> pour chercher</span>
          </div>
        }
      />

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={handleTodaySales}
          className="px-3.5 py-2 bg-[#FDF3F0] hover:bg-[#FBE8E4] text-[#D85C3A] rounded-xl text-xs font-bold border border-[#D85C3A]/25 flex items-center gap-1.5 shrink-0 transition cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-[#D85C3A]" />
          Ventes du Jour
        </button>

        <button
          onClick={handleRecentInvoices}
          className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-slate-800 rounded-xl text-xs font-bold border border-[#ECE5D7] flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs"
        >
          <Receipt className="w-3.5 h-3.5 text-[#123F46]" />
          Toutes les Factures
        </button>

        <button
          onClick={handleHighValueBills}
          className="px-3.5 py-2 bg-[#FEF9EB] hover:bg-[#FDF3D6] text-amber-900 rounded-xl text-xs font-bold border border-[#F2C14E]/50 flex items-center gap-1.5 shrink-0 transition cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          Grosses Factures (&ge; 25 000 {currency})
        </button>

        <button
          onClick={handleLastCustomer}
          className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-slate-800 rounded-xl text-xs font-bold border border-[#ECE5D7] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-purple-600" />
          Dernier Client Saisi
        </button>

        <button
          onClick={handleRepeatLastBill}
          className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-slate-800 rounded-xl text-xs font-bold border border-[#ECE5D7] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#123F46]" />
          Afficher Dernière Facture
        </button>
      </div>

      {/* Universal Search Box */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs relative">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D85C3A]" />
              Recherche Universelle Facture & Code-Barres
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Lecteur douchette, dictée vocale, N° facture ou téléphone client
            </span>
          </div>

          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Scannez un code-barres, tapez N° facture (ex: INV-2026-0001), nom du client..."
              className="w-full pl-10 pr-28 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-mono font-bold"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleVoiceSearch}
                title="Recherche Vocale"
                className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                  isListening 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'bg-[#ECE5D7] text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                className="px-3.5 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Chercher</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute left-5 right-5 top-[92px] z-30 bg-white border border-[#ECE5D7] rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-100">
            <div className="p-2.5 bg-[#FAF8F5] text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Factures correspondantes ({searchSuggestions.length})</span>
              <span>Cliquez pour charger le retour</span>
            </div>
            {searchSuggestions.map(sugg => (
              <button
                key={sugg.id}
                type="button"
                onClick={() => {
                  setSearchQuery(sugg.invoiceNumber);
                  setShowSuggestions(false);
                  openReturnProcessor(sugg.sale);
                }}
                className="w-full p-3 text-left hover:bg-[#FAF8F5] flex items-center justify-between transition group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#D85C3A]">
                      {sugg.invoiceNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {sugg.customerName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-mono font-bold">{formatFCFA(sugg.amount, currency)}</span>
                    <span>•</span>
                    <span>{formatDateFR(sugg.dateTime)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#ECE5D7] text-slate-700 rounded text-[10px] font-semibold">
                    {sugg.matchReason}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D85C3A] transition" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-[#D85C3A]" />
            <span>Filtres de Sélection Rapide</span>
          </div>
          <span className="text-xs font-bold text-[#123F46]">
            {filteredSales.length} factures trouvées
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Période temporelle</label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as DateFilterType)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 font-medium focus:outline-none focus:border-[#D85C3A]"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="yesterday">Hier</option>
              <option value="last7">7 derniers jours</option>
              <option value="last30">30 derniers jours</option>
              <option value="custom">Plage personnalisée</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Mode de règlement</label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as PaymentFilterType)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 font-medium focus:outline-none focus:border-[#D85C3A]"
            >
              <option value="all">Tous les modes</option>
              <option value="Cash">Espèces uniquement</option>
              <option value="UPI">Mobile Money (MTN / Moov)</option>
              <option value="Card">Carte Bancaire</option>
              <option value="Credit">Crédit client</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Statut de la facture</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilterType)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 font-medium focus:outline-none focus:border-[#D85C3A]"
            >
              <option value="all">Tous les statuts</option>
              <option value="Completed">Payée / Conclue</option>
              <option value="Refunded">Remboursée / Retournée</option>
              <option value="Cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex gap-3 pt-2 border-t border-[#ECE5D7]">
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs bg-[#FAF8F5]"
            />
            <span className="self-center text-xs font-bold text-slate-400">au</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs bg-[#FAF8F5]"
            />
          </div>
        )}
      </div>

      {/* Active Return Processor Card */}
      {matchedSale && (
        <div className="bg-white p-6 rounded-2xl border-2 border-[#D85C3A] shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#FDF3F0] text-[#D85C3A] font-mono font-bold text-sm rounded-xl border border-[#D85C3A]/20">
                  {matchedSale.invoiceNumber}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {formatDateFR(matchedSale.dateTime)}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-1">
                Client : <strong>{matchedSale.customerName || 'Client Comptant'}</strong> • Tél : {matchedSale.customerPhone || 'Non renseigné'} • Caissier : {matchedSale.cashierName || 'Gérant'}
              </p>
            </div>
            <button
              onClick={() => setMatchedSale(null)}
              className="p-1.5 hover:bg-[#FAF8F5] rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motif du Retour / Échange
                </label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 font-semibold focus:outline-none focus:border-[#D85C3A]"
                >
                  <option value="Defective">Article défectueux / avarié</option>
                  <option value="Expired">Produit périmé / date dépassée</option>
                  <option value="Wrong Item">Erreur d'article ou de référence</option>
                  <option value="Customer Changed Mind">Changement d'avis du client</option>
                </select>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Montant Initial Facturé</div>
                  <div className="text-base font-mono-data font-bold text-slate-900">
                    {formatFCFA(matchedSale.totalAmount, currency)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Règlement</div>
                  <div className="text-xs font-bold text-[#123F46]">
                    {matchedSale.paymentMode}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Articles à retourner au stock :</span>
                <span className="text-[11px] text-slate-400">
                  Les quantités saisies réintégreront l'inventaire
                </span>
              </div>

              <div className="border border-[#ECE5D7] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-[#ECE5D7]">
                    <tr>
                      <th className="p-3">Désignation</th>
                      <th className="p-3 text-center">Qté Achetée</th>
                      <th className="p-3 text-center">Qté à Retourner</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Total Remboursé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matchedSale.items.map(item => {
                      const returnQty = selectedItemReturnQty[item.productId] || 0;
                      const subtotalRefund = returnQty * item.unitSellingPrice;

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5]">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">
                              {item.productName}
                            </div>
                            {item.barcode && (
                              <div className="text-[10px] font-mono text-slate-400">
                                {item.barcode}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500 font-mono-data">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = selectedItemReturnQty[item.productId] || 0;
                                  setSelectedItemReturnQty(prev => ({
                                    ...prev,
                                    [item.productId]: Math.max(0, current - 1)
                                  }));
                                }}
                                className="w-7 h-7 bg-[#ECE5D7] rounded-lg font-bold hover:bg-slate-300 transition cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={returnQty}
                                onChange={e => {
                                  const val = Math.min(item.quantity, Math.max(0, Number(e.target.value)));
                                  setSelectedItemReturnQty(prev => ({ ...prev, [item.productId]: val }));
                                }}
                                className="w-14 p-1 border border-slate-300 rounded-lg text-center font-bold font-mono-data text-[#D85C3A] bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const current = selectedItemReturnQty[item.productId] || 0;
                                  setSelectedItemReturnQty(prev => ({
                                    ...prev,
                                    [item.productId]: Math.min(item.quantity, current + 1)
                                  }));
                                }}
                                className="w-7 h-7 bg-[#ECE5D7] rounded-lg font-bold hover:bg-slate-300 transition cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono-data text-slate-600">
                            {formatFCFA(item.unitSellingPrice, currency)}
                          </td>
                          <td className="p-3 text-right font-mono-data font-bold text-[#D85C3A]">
                            {formatFCFA(subtotalRefund, currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Refund Summary & Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-[#ECE5D7]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Montant Total à Rembourser :</span>
                <span className="font-bold text-lg text-[#D85C3A] font-mono-data">
                  {formatFCFA(
                    matchedSale.items.reduce((acc, item) => acc + ((selectedItemReturnQty[item.productId] || 0) * item.unitSellingPrice), 0),
                    currency
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onViewInvoice && (
                  <Button
                    variant="ghost"
                    size="md"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => onViewInvoice(matchedSale)}
                  >
                    Voir Ticket
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="md"
                  icon={<PackageCheck className="w-4 h-4" />}
                  onClick={handleProcessRefund}
                >
                  Valider le Remboursement & Réintégrer en Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Purchases Quick Access Grid */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D85C3A]" />
            Dernières Ventes Encaissées (Accès Direct)
          </h3>
          <span className="text-[11px] text-slate-400">Cliquez sur une facture pour initier un retour</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {recentTenSales.map(sale => (
            <div
              key={sale.id}
              onClick={() => openReturnProcessor(sale)}
              className="p-3 bg-[#FAF8F5] hover:bg-white border border-[#ECE5D7] hover:border-[#D85C3A]/50 rounded-xl cursor-pointer transition space-y-1.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#D85C3A] group-hover:underline">
                  {sale.invoiceNumber}
                </span>
                <span className="px-1.5 py-0.5 bg-[#ECE5D7] text-slate-700 rounded text-[9px] font-bold">
                  {sale.paymentMode}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-slate-800 truncate">
                {sale.customerName || 'Client Comptant'}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#ECE5D7] text-[11px]">
                <span className="font-mono-data font-bold text-slate-900">
                  {formatFCFA(sale.totalAmount, currency)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {sale.items.length} art.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return Vouchers History Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#ECE5D7] font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Historique des Bons de Retours & Avoirs Validés</span>
          <span className="text-xs font-mono font-bold text-slate-500">{returns.length} Avoirs traités</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-slate-500 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">N° Bon d'Avoir</th>
                <th className="py-3 px-4">Facture Initiale</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Motif</th>
                <th className="py-3 px-4 text-right">Montant Remboursé</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <EmptyState
                      title="Aucun bon de retour émis"
                      description="Les retours de marchandises et remboursements clients s'archiveront automatiquement ici."
                      icon={<RotateCcw className="w-6 h-6 text-[#123F46]" />}
                    />
                  </td>
                </tr>
              ) : (
                returns.map(ret => (
                  <tr key={ret.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#D85C3A]">{ret.returnInvoiceNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{ret.originalInvoiceNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{ret.customerName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{reasonLabels[ret.reason] || ret.reason}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#D85C3A] font-mono-data text-sm">
                      {formatFCFA(ret.refundAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          const sale = sqliteDB.getSaleByInvoice(ret.originalInvoiceNumber);
                          if (sale && onViewInvoice) {
                            onViewInvoice(sale);
                          } else {
                            alert(`Détails de la facture ${ret.originalInvoiceNumber} introuvables.`);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#123F46] hover:text-white text-slate-700 border border-[#ECE5D7] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
