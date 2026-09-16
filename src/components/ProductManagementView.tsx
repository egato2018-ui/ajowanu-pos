import React, { useState } from 'react';
import { Product, ShopSettings } from '../types';
import { formatFCFA } from '../utils/formatters';
import { sqliteDB, resolveProductImage } from '../db/sqliteStorage';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Barcode, 
  X, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Tag,
  Coins,
  Layers,
  Calendar,
  Upload,
  Image as ImageIcon,
  Link2
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

const STANDARD_GROCERY_CATEGORIES = [
  'Riz, Pâtes & Féculents',
  'Huiles & Condiments',
  'Conserves & Tomates',
  'Épices & Assaisonnements',
  'Boissons & Jus',
  'Lait & Petit Déjeuner',
  'Biscuits & Confiseries',
  'Entretien & Lessive',
  'Hygiène & Soins',
  'Paniers & Packs Éco',
  'Produits Frais & Laiterie',
  'Boulangerie & Pâtisserie',
  'Snacks & Friandises',
  'Bébé & Puériculture',
  'Divers'
];

const PRESET_PRODUCT_IMAGES = [
  { label: 'Riz', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Huile', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80' },
  { label: 'Sucre', url: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=400&q=80' },
  { label: 'Eau / Jus', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Lait', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { label: 'Tomates', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80' },
  { label: 'Pâtes', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80' },
  { label: 'Savon', url: 'https://images.unsplash.com/photo-1607006314644-8d96e57924ef?auto=format&fit=crop&w=400&q=80' },
  { label: 'Dentifrice', url: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=400&q=80' },
  { label: 'Biscuits', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80' },
];

interface ProductManagementViewProps {
  products: Product[];
  settings: ShopSettings;
  onSaveProduct: (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number; imageUrl?: string }) => void;
  onDeleteProduct: (id: string) => void;
  onOpenBarcodeGenerator: (product: Product) => void;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onOpenBarcodeGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'expiring'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Complete categories collection (DB + products + standard categories)
  const dbCategories = sqliteDB.getCategories().map(c => c.name);
  const allAvailableCategories = Array.from(
    new Set([
      ...products.map(p => p.category),
      ...dbCategories,
      ...STANDARD_GROCERY_CATEGORIES
    ])
  ).filter(Boolean).sort();

  const [formData, setFormData] = useState({
    name: '',
    category: allAvailableCategories[0] || 'Riz, Pâtes & Féculents',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    supplierName: '',
    expiryDate: '',
    unit: 'pcs',
    imageUrl: '',
  });

  const currency = settings.currencySymbol || 'FCFA';

  const rawCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const categories = ['Tous', ...rawCategories];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsCustomCategory(false);
    setFormData({
      name: '',
      category: allAvailableCategories[0] || 'Riz, Pâtes & Féculents',
      barcode: `${Math.floor(200000000000 + Math.random() * 800000000000)}`,
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      supplierName: '',
      expiryDate: '',
      unit: 'pcs',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const isCustom = !allAvailableCategories.includes(product.category);
    setIsCustomCategory(isCustom);
    setFormData({
      name: product.name,
      category: product.category,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
      supplierName: product.supplierName || '',
      expiryDate: product.expiryDate || '',
      unit: product.unit || 'pcs',
      imageUrl: product.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleGenerateBarcode = () => {
    const randomBarcode = `${Math.floor(200000000000 + Math.random() * 800000000000)}`;
    setFormData(prev => ({ ...prev, barcode: randomBarcode }));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image dépasse 5 Mo. Veuillez choisir une image plus légère.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.purchasePrice || !formData.sellingPrice || !formData.quantity || !formData.category.trim()) {
      alert('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    onSaveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      name: formData.name.trim(),
      category: formData.category.trim(),
      barcode: formData.barcode.trim(),
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
      supplierName: formData.supplierName.trim(),
      expiryDate: formData.expiryDate || undefined,
      unit: formData.unit,
      imageUrl: formData.imageUrl.trim() || resolveProductImage(formData.name.trim(), formData.category.trim(), formData.barcode.trim()),
    });

    setIsModalOpen(false);
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    
    let matchesFilter = true;
    if (filterType === 'low') {
      matchesFilter = p.quantity > 0 && p.quantity <= (p.minStockLevel || settings.lowStockThreshold || 10);
    } else if (filterType === 'out') {
      matchesFilter = p.quantity <= 0;
    } else if (filterType === 'expiring') {
      if (!p.expiryDate) matchesFilter = false;
      else {
        const exp = new Date(p.expiryDate).getTime();
        matchesFilter = exp <= (Date.now() + 30 * 24 * 3600 * 1000);
      }
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);

    return matchesCategory && matchesFilter && matchesSearch;
  });

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <PageHeader
        title="Catalogue des Articles & Stocks"
        subtitle="Répertoire complet des références, marges commerciales, codes-barres et alertes locales."
        icon={<Package className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <Badge variant="teal" size="sm">
            {products.length} références actives
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Nouvel Article
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par article, code-barres, fournisseur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs focus:border-[#D85C3A] outline-none text-slate-900"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#123F46] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-slate-700 hover:bg-[#ECE5D7] border border-[#ECE5D7]'
              }`}
            >
              Tous ({products.length})
            </button>

            <button
              onClick={() => setFilterType('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'low'
                  ? 'bg-[#F2C14E] text-slate-900 shadow-xs'
                  : 'bg-[#FEF9EB] text-[#B47805] border border-[#F2C14E]/60'
              }`}
            >
              Stock Faible
            </button>

            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              Rupture
            </button>

            <button
              onClick={() => setFilterType('expiring')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === 'expiring'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 border border-purple-200'
              }`}
            >
              Péremption &lt; 30j
            </button>
          </div>

        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-[#ECE5D7] scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1 shrink-0">Rayon :</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#D85C3A] text-white font-semibold shadow-2xs'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-[#ECE5D7] border border-[#ECE5D7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#ECE5D7] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5">Référence / Code</th>
                <th className="p-3.5">Désignation de l'article</th>
                <th className="p-3.5">Rayon</th>
                <th className="p-3.5 text-right">Prix d'Achat</th>
                <th className="p-3.5 text-right">Prix de Vente</th>
                <th className="p-3.5 text-right">Marge %</th>
                <th className="p-3.5 text-center">Disponibilité</th>
                <th className="p-3.5">Fournisseur</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE5D7] text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-slate-400">
                    Aucun article ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const marginPercent = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0;
                  const isLow = p.quantity <= (p.minStockLevel || settings.lowStockThreshold || 10);
                  const isOut = p.quantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">{p.id}</div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3 text-[#D85C3A]" />
                          {p.barcode}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#ECE5D7] shrink-0 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#ECE5D7] flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                            {p.expiryDate && (
                              <div className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                Exp: {p.expiryDate}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-slate-700 font-semibold text-[10px] border border-[#ECE5D7]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono-data text-slate-600 font-medium">
                        {formatFCFA(p.purchasePrice, currency)}
                      </td>

                      <td className="p-3.5 text-right font-mono-data font-bold text-slate-900 text-sm">
                        {formatFCFA(p.sellingPrice, currency)}
                      </td>

                      <td className="p-3.5 text-right font-mono-data font-bold text-[#123F46]">
                        +{marginPercent}%
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-mono-data font-bold text-xs ${
                          isOut
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.quantity} {p.unit || 'pcs'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 font-medium">
                        {p.supplierName || 'Principal'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenBarcodeGenerator(p)}
                            className="p-1.5 hover:bg-[#ECE5D7] text-slate-700 rounded-lg transition cursor-pointer"
                            title="Imprimer étiquette code-barres"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 hover:bg-[#ECE5D7] text-slate-700 rounded-lg transition cursor-pointer"
                            title="Modifier l'article"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-[#ECE5D7] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            <div className="flex items-center justify-between p-4 border-b border-[#ECE5D7] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3F0] text-[#D85C3A] flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingProduct ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Fiche produit enregistrée dans la base locale SQLite
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Désignation de l'article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Riz Parfumé 25kg, Savon BF, Huile Mayor 1L..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900"
                />
              </div>

              {/* Product Picture Upload Section */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ECE5D7] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D85C3A]" />
                    Photo du produit
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer la photo
                    </button>
                  )}
                </div>

                {formData.imageUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#ECE5D7]">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu du produit"
                      className="w-16 h-16 rounded-lg object-cover border border-[#ECE5D7] shrink-0 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">Photo prête et associée</p>
                      <p className="text-[10px] text-slate-400">Cette image sera affichée en caisse POS et dans l'inventaire.</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <label
                          htmlFor="modal-product-image-upload"
                          className="text-[11px] font-semibold text-[#123F46] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" /> Remplacer l'image
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Drag and Drop / File Picker Area */}
                    <label
                      htmlFor="modal-product-image-upload"
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#D85C3A] hover:bg-white rounded-xl cursor-pointer transition text-center group"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-[#FDF3F0] text-slate-400 group-hover:text-[#D85C3A] flex items-center justify-center mb-1.5 transition">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-[#D85C3A]">
                        Importer une photo depuis l'appareil
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP jusqu'à 5 Mo
                      </span>
                    </label>

                    {/* URL Input */}
                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="Ou collez directement une URL d'image web..."
                        value={formData.imageUrl}
                        onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-[#D85C3A] text-slate-800"
                      />
                    </div>

                    {/* Quick Preset Photos */}
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#D85C3A]" />
                        Photos modèles prêtes en 1 clic :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_PRODUCT_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                            className="text-[10px] px-2.5 py-1 bg-white hover:bg-[#ECE5D7] border border-[#ECE5D7] rounded-lg text-slate-700 font-medium transition cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <input
                  id="modal-product-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rayon / Catégorie *
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={isCustomCategory ? '__CUSTOM__' : formData.category}
                      onChange={e => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomCategory(true);
                          setFormData(prev => ({ ...prev, category: '' }));
                        } else {
                          setIsCustomCategory(false);
                          setFormData(prev => ({ ...prev, category: e.target.value }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900 font-medium cursor-pointer"
                    >
                      {allAvailableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__CUSTOM__">➕ Créer un nouveau rayon / Autre...</option>
                    </select>

                    {isCustomCategory && (
                      <div className="relative animate-in fade-in duration-150">
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Nom du nouveau rayon..."
                          value={formData.category}
                          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-[#D85C3A] rounded-xl text-xs outline-none text-slate-900 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setFormData(prev => ({ ...prev, category: allAvailableCategories[0] || 'Riz, Pâtes & Féculents' }));
                          }}
                          className="absolute right-2 top-1.5 text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unité de vente
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A] text-slate-900 cursor-pointer"
                  >
                    <option value="pcs">Pièce (pcs)</option>
                    <option value="sac">Sac / Bag</option>
                    <option value="carton">Carton</option>
                    <option value="paquet">Paquet</option>
                    <option value="bouteille">Bouteille</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="l">Litre (L)</option>
                    <option value="g">Gramme (g)</option>
                  </select>
                </div>
              </div>

              {/* Barcode Field with Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Numéro Code-barres *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-[#D85C3A] hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Générer automatiquement
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Scanner avec lecteur USB ou générer"
                  value={formData.barcode}
                  onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-[#D85C3A] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix d'Achat ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="1000"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-[#D85C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix de Vente ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="1250"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#D85C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantité initiale *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-[#D85C3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : SOBEBRA, Grossiste Dantokpa..."
                    value={formData.supplierName}
                    onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de Péremption
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs outline-none focus:border-[#D85C3A]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#ECE5D7] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Enregistrer l'Article
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
