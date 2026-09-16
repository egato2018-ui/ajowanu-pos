import React, { useState, useEffect, useRef } from 'react';
import { Product, ShopSettings, IncomingStockLog } from '../types';
import { formatFCFA, formatDateTimeFR } from '../utils/formatters';
import { 
  PackagePlus, 
  Barcode, 
  Camera, 
  Plus, 
  History, 
  AlertCircle,
  Truck,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface IncomingStockViewProps {
  products: Product[];
  settings: ShopSettings;
  onAddExistingStock: (
    productId: string, 
    qtyToAdd: number, 
    newPurchasePrice?: number, 
    newSellingPrice?: number, 
    supplierName?: string
  ) => void;
  onSaveNewProduct: (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number }) => void;
  stockLogs: IncomingStockLog[];
  onOpenCameraScanner: () => void;
  scannedBarcode: string | null;
  onClearScannedBarcode: () => void;
}

export const IncomingStockView: React.FC<IncomingStockViewProps> = ({
  products,
  settings,
  onAddExistingStock,
  onSaveNewProduct,
  stockLogs,
  onOpenCameraScanner,
  scannedBarcode,
  onClearScannedBarcode,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Form state for existing product update
  const [addQty, setAddQty] = useState<string>('10');
  const [newPurchasePrice, setNewPurchasePrice] = useState<string>('');
  const [newSellingPrice, setNewSellingPrice] = useState<string>('');
  const [supplierNameInput, setSupplierNameInput] = useState<string>('');

  // Form state for brand new product creation
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Céréales & Féculents');
  const [newProdQty, setNewProdQty] = useState('20');
  const [newProdPurchasePrice, setNewProdPurchasePrice] = useState('1000');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('1250');
  const [newProdSupplier, setNewProdSupplier] = useState('');

  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const currency = settings.currencySymbol || 'FCFA';

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scannedBarcode) {
      setBarcodeInput(scannedBarcode);
      lookupBarcode(scannedBarcode);
      onClearScannedBarcode();
    }
  }, [scannedBarcode]);

  const lookupBarcode = (codeToLookup: string) => {
    const code = codeToLookup.trim();
    if (!code) return;

    const found = products.find(p => p.barcode === code || p.id.toLowerCase() === code.toLowerCase());
    setHasSearched(true);
    if (found) {
      setScannedProduct(found);
      setNewPurchasePrice(found.purchasePrice.toString());
      setNewSellingPrice(found.sellingPrice.toString());
      setSupplierNameInput(found.supplierName || '');
    } else {
      setScannedProduct(null);
    }
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;

    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Veuillez renseigner une quantité valide.');
      return;
    }

    onAddExistingStock(
      scannedProduct.id,
      qty,
      newPurchasePrice ? parseFloat(newPurchasePrice) : undefined,
      newSellingPrice ? parseFloat(newSellingPrice) : undefined,
      supplierNameInput
    );

    alert(`+${qty} unités ajoutées à "${scannedProduct.name}" !`);

    // Reset lookup form
    setScannedProduct(null);
    setHasSearched(false);
    setBarcodeInput('');
    setAddQty('10');
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPurchasePrice || !newProdSellingPrice || !newProdQty) {
      alert('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    onSaveNewProduct({
      name: newProdName,
      category: newProdCategory,
      barcode: barcodeInput.trim(),
      purchasePrice: parseFloat(newProdPurchasePrice),
      sellingPrice: parseFloat(newProdSellingPrice),
      quantity: parseInt(newProdQty),
      supplierName: newProdSupplier,
    });

    alert(`Nouvel article "${newProdName}" créé et stock enregistré !`);

    // Reset form
    setScannedProduct(null);
    setHasSearched(false);
    setBarcodeInput('');
    setNewProdName('');
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <PageHeader
        title="Réceptions & Entrées en Stock"
        subtitle="Enregistrez les livraisons de colis fournisseurs, mettez à jour les prix d'achat et intégrez de nouveaux articles par scan."
        icon={<PackagePlus className="w-5 h-5 text-[#D85C3A]" />}
        actions={
          <Button
            variant="secondary"
            size="md"
            icon={<Camera className="w-4 h-4 text-[#D85C3A]" />}
            onClick={onOpenCameraScanner}
          >
            Scanner par Caméra
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step 1 & 2: Barcode Lookup Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-5">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
              1. Scanner ou Saisir le Code-barres du Colis
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3.5 top-3.5 text-[#D85C3A]" />
                <input
                  ref={barcodeRef}
                  type="text"
                  placeholder="Scanner avec lecteur USB ou taper les chiffres..."
                  value={barcodeInput}
                  onChange={e => {
                    setBarcodeInput(e.target.value);
                    setHasSearched(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      lookupBarcode(barcodeInput);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-[#D85C3A] text-slate-900"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => lookupBarcode(barcodeInput)}
              >
                Vérifier
              </Button>
            </div>
          </div>

          {/* Result Case A: Product EXISTS in Inventory */}
          {hasSearched && scannedProduct && (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE5D7] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-[#ECE5D7] pb-3">
                <div>
                  <Badge variant="teal" size="sm">
                    Article Répertorié
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {scannedProduct.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Code : {scannedProduct.barcode} | Rayon : {scannedProduct.category}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-medium">Stock en rayon</div>
                  <div className="text-xl font-black font-mono-data text-[#123F46]">
                    {scannedProduct.quantity} {scannedProduct.unit || 'pcs'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Quantité reçue à ajouter *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={addQty}
                      onChange={e => setAddQty(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D85C3A] rounded-xl font-mono-data font-black text-base text-[#D85C3A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Fournisseur livrant
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : SOBEBRA, Grossiste..."
                      value={supplierNameInput}
                      onChange={e => setSupplierNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix d'Achat Récent ({currency})
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={newPurchasePrice}
                      onChange={e => setNewPurchasePrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono-data text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix de Vente Conseillé ({currency})
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={newSellingPrice}
                      onChange={e => setNewSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono-data text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<Plus className="w-4 h-4" />}
                >
                  Valider l'Approvisionnement (+{addQty} unités)
                </Button>
              </form>
            </div>
          )}

          {/* Result Case B: Product DOES NOT EXIST -> Show New Item Form */}
          {hasSearched && !scannedProduct && barcodeInput && (
            <div className="p-5 rounded-2xl bg-[#FEF9EB] border border-[#F2C14E]/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-slate-900">
                <AlertCircle className="w-5 h-5 text-[#B47805] shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Article inconnu dans la base</h4>
                  <p className="text-xs text-slate-600">Le code <strong className="font-mono text-[#B47805]">{barcodeInput}</strong> est nouveau. Complétez la fiche pour créer la référence.</p>
                </div>
              </div>

              <form onSubmit={handleAddNewProductSubmit} className="space-y-3 pt-3 border-t border-[#F2C14E]/40 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Désignation de l'article *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Biscuits Cracker 100g, Eau Minérale Possotomé 1.5L..."
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Rayon / Catégorie *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Quantité reçue *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdQty}
                      onChange={e => setNewProdQty(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono-data text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix d'Achat ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={newProdPurchasePrice}
                      onChange={e => setNewProdPurchasePrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono-data text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix de Vente ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={newProdSellingPrice}
                      onChange={e => setNewProdSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono-data text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Créer l'Article & Enregistrer l'Approvisionnement
                </Button>
              </form>
            </div>
          )}

        </div>

        {/* Incoming Stock History Logs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#123F46] border border-[#ECE5D7] flex items-center justify-center font-bold">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Journal des Réceptions Récentes
                </h3>
                <p className="text-[11px] text-slate-400">Traçabilité des livraisons fournisseurs</p>
              </div>
            </div>

            {stockLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Truck className="w-9 h-9 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Aucun bon de réception enregistré.</p>
                <p className="text-xs">Les réapprovisionnements validés apparaîtront ici.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {stockLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7] text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate max-w-[200px]">{log.productName}</span>
                      <span className="font-mono-data text-emerald-700 font-bold">
                        +{log.quantityAdded} unités
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Stock : {log.previousQuantity} &rarr; <strong className="text-slate-800">{log.newQuantity}</strong></span>
                      <span className="truncate max-w-[120px]">{log.supplierName || 'Fournisseur direct'}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 text-right pt-0.5 font-mono">
                      {formatDateTimeFR(log.dateTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
