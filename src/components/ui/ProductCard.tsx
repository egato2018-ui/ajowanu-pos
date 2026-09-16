import React, { useState } from 'react';
import { Product } from '../../types';
import { formatFCFA } from '../../utils/formatters';
import { 
  Package, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Wheat, 
  Droplet, 
  Coffee, 
  Sparkles, 
  Apple, 
  CupSoda, 
  Cookie, 
  Heart,
  ShoppingBag,
  Layers
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  onAddToCart: (product: Product) => void;
  onClick?: () => void;
  compact?: boolean;
}

// Category visual theme mapper for placeholders when image is missing or loading
const getCategoryVisuals = (categoryName?: string) => {
  const cat = (categoryName || '').toLowerCase();
  
  if (cat.includes('riz') || cat.includes('pâte') || cat.includes('féculent') || cat.includes('céréale')) {
    return {
      bg: 'bg-amber-50 text-amber-600',
      icon: <Wheat className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-amber-700/85',
    };
  }
  if (cat.includes('huile') || cat.includes('condiment')) {
    return {
      bg: 'bg-yellow-50 text-yellow-600',
      icon: <Droplet className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-yellow-700/85',
    };
  }
  if (cat.includes('boisson') || cat.includes('jus') || cat.includes('eau')) {
    return {
      bg: 'bg-cyan-50 text-cyan-600',
      icon: <CupSoda className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-cyan-800/85',
    };
  }
  if (cat.includes('lait') || cat.includes('déjeuner') || cat.includes('café')) {
    return {
      bg: 'bg-sky-50 text-sky-600',
      icon: <Coffee className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-sky-800/85',
    };
  }
  if (cat.includes('conserve') || cat.includes('tomate')) {
    return {
      bg: 'bg-rose-50 text-rose-600',
      icon: <Apple className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-rose-800/85',
    };
  }
  if (cat.includes('biscuit') || cat.includes('confiserie') || cat.includes('snack')) {
    return {
      bg: 'bg-orange-50 text-orange-600',
      icon: <Cookie className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-orange-800/85',
    };
  }
  if (cat.includes('entretien') || cat.includes('lessive') || cat.includes('nettoyage')) {
    return {
      bg: 'bg-blue-50 text-blue-600',
      icon: <Sparkles className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-blue-800/85',
    };
  }
  if (cat.includes('hygiène') || cat.includes('soin') || cat.includes('santé')) {
    return {
      bg: 'bg-emerald-50 text-emerald-600',
      icon: <Heart className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-emerald-800/85',
    };
  }
  if (cat.includes('panier') || cat.includes('pack')) {
    return {
      bg: 'bg-indigo-50 text-indigo-600',
      icon: <ShoppingBag className="w-8 h-8 stroke-[1.5]" />,
      badgeBg: 'bg-indigo-800/85',
    };
  }
  return {
    bg: 'bg-slate-100 text-slate-500',
    icon: <Package className="w-8 h-8 stroke-[1.5]" />,
    badgeBg: 'bg-slate-700/85',
  };
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onAddToCart,
  onClick,
  compact = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = !isOutOfStock && product.quantity <= (product.minStockLevel || 5);
  const visualTheme = getCategoryVisuals(product.category);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden select-none hover:shadow-md min-h-[268px] ${
        isOutOfStock
          ? 'border-slate-200 bg-slate-50/70 opacity-65 cursor-not-allowed'
          : 'border-[#ECE5D7] hover:border-[#D85C3A] cursor-pointer active:scale-[0.98]'
      }`}
      style={{ minHeight: '268px' }}
    >
      {/* Product Image Banner Container - Fixed 144px height, will never collapse or shrink */}
      <div 
        className="relative w-full h-36 min-h-[144px] shrink-0 bg-[#FAF8F5] overflow-hidden border-b border-[#ECE5D7]/80 select-none"
        style={{ height: '144px', minHeight: '144px' }}
      >
        {product.imageUrl && !imageError ? (
          <>
            {/* Skeleton shimmer while loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#F6F1E7] animate-pulse flex flex-col items-center justify-center text-slate-300">
                {visualTheme.icon}
              </div>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center ${visualTheme.bg} transition-transform duration-300 group-hover:scale-105`}>
            {visualTheme.icon}
            <span className="text-[10px] font-semibold mt-1 opacity-75 uppercase tracking-wider max-w-[90%] truncate text-center px-2">
              {product.category || 'Article'}
            </span>
          </div>
        )}

        {/* Floating Category Badge Pill on top-left of image */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold rounded-md uppercase tracking-wider shadow-xs max-w-[130px] truncate block">
            {product.category || 'Épicerie'}
          </span>
        </div>

        {/* Floating Stock Availability Badge on top-right of image */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[9px] flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-2.5 h-2.5" />
              Épuisé
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[9px] flex items-center gap-1 shadow-xs font-mono-data">
              {product.quantity} restant(s)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-semibold text-[9px] flex items-center gap-1 shadow-xs font-mono-data">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {product.quantity} dispo
            </span>
          )}
        </div>
      </div>

      {/* Card Content Details */}
      <div className={`flex-1 flex flex-col justify-between bg-white ${compact ? 'p-2.5' : 'p-3'}`}>
        <div>
          {/* Product Name with minimum 2-line height for aligned grid rows */}
          <h4 
            className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.4rem] group-hover:text-[#D85C3A] transition-colors"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Barcode & Reference Info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span className="truncate">Réf: {product.barcode || 'SANS-CODE'}</span>
            {product.unit && (
              <span className="text-slate-500 font-medium shrink-0">
                /{product.unit}
              </span>
            )}
          </div>
        </div>

        {/* Bottom row: Price Display & Fast Add Action */}
        <div className="pt-2 mt-2 border-t border-[#ECE5D7]/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block leading-none">
              Prix de vente
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono-data text-[#123F46] tracking-tight mt-0.5 block">
              {formatFCFA(product.sellingPrice, currency)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                onAddToCart(product);
              }
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#FAF8F5] group-hover:bg-[#D85C3A] text-[#123F46] group-hover:text-white border border-[#ECE5D7] group-hover:border-[#D85C3A] shadow-2xs hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            title={isOutOfStock ? 'Article en rupture de stock' : 'Ajouter au panier de vente'}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
