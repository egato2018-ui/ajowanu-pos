import React from 'react';
import { AlertTriangle, PackageCheck, Clock, ShoppingBag, ChevronRight, X, Bell } from 'lucide-react';
import { sqliteDB } from '../../db/sqliteStorage';
import { TabType } from '../../types';

interface NotificationsDropdownProps {
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose, onNavigate }) => {
  const products = sqliteDB.getProducts();
  const settings = sqliteDB.getSettings();
  const lowStockThreshold = settings.lowStockThreshold || 5;
  const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel || lowStockThreshold));

  const purchaseOrders = sqliteDB.getPurchaseOrders();
  const pendingPOs = purchaseOrders.filter(po => po.status === 'Ordered');

  const heldBills = sqliteDB.getHeldBills();
  const activeShift = sqliteDB.getCurrentCashShift();

  interface NotificationItem {
    id: string;
    type: 'warning' | 'info' | 'action';
    title: string;
    description: string;
    targetTab: TabType;
    icon: React.ReactNode;
  }

  const notifications: NotificationItem[] = [];

  if (lowStockProducts.length > 0) {
    notifications.push({
      id: 'low_stock',
      type: 'warning',
      title: `${lowStockProducts.length} article(s) en alerte stock`,
      description: `Certains produits sont sous le seuil critique (${lowStockProducts.slice(0, 2).map(p => p.name).join(', ')}${lowStockProducts.length > 2 ? '...' : ''})`,
      targetTab: 'smart_reorder',
      icon: <AlertTriangle className="w-4 h-4 text-[#D85C3A]" />,
    });
  }

  if (pendingPOs.length > 0) {
    notifications.push({
      id: 'pending_pos',
      type: 'info',
      title: `${pendingPOs.length} commande(s) fournisseur en transit`,
      description: `Commandes d'approvisionnement en attente de réception au magasin`,
      targetTab: 'purchase_orders',
      icon: <PackageCheck className="w-4 h-4 text-emerald-600" />,
    });
  }

  if (heldBills.length > 0) {
    notifications.push({
      id: 'held_bills',
      type: 'action',
      title: `${heldBills.length} ticket(s) en attente en caisse`,
      description: `Paniers mis en pause au comptoir prêts à être repris`,
      targetTab: 'pos',
      icon: <ShoppingBag className="w-4 h-4 text-[#123F46]" />,
    });
  }

  if (!activeShift) {
    notifications.push({
      id: 'no_shift',
      type: 'warning',
      title: 'Session de caisse non ouverte',
      description: 'Ouvrez votre registre de caisse pour consigner le fond de caisse initial',
      targetTab: 'cash_register',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    });
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#ECE5D7] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ECE5D7]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Bell className="w-3.5 h-3.5 text-[#123F46]" />
          <span>Notifications & Activité</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Bell className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="font-semibold text-slate-600">Aucune alerte active</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tous les paramètres et stocks sont opérationnels.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onNavigate(item.targetTab);
                onClose();
              }}
              className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#ECE5D7] transition cursor-pointer flex items-start gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-white border border-[#E2D9C8] shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{item.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-slate-400 text-center mt-2 pt-2 border-t border-[#ECE5D7]">
        Alertes système synchronisées avec la base locale
      </div>
    </div>
  );
};
