import React, { useState } from 'react';
import { Sale, ShopSettings } from '../types';
import { formatFCFA, formatDateTimeFR } from '../utils/formatters';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  XCircle,
  FileText,
  Coins,
  Smartphone,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SalesHistoryViewProps {
  sales: Sale[];
  settings: ShopSettings;
  onViewInvoice: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  settings,
  onViewInvoice,
  onCancelSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('Tous');

  const currency = settings.currencySymbol || 'FCFA';

  const filteredSales = sales.filter(s => {
    const matchesPayment = 
      paymentFilter === 'Tous' || 
      (paymentFilter === 'Espèces' && s.paymentMode === 'Cash') ||
      (paymentFilter === 'MoMo / QR' && s.paymentMode === 'UPI') ||
      (paymentFilter === 'Carte' && s.paymentMode === 'Card') ||
      (paymentFilter === 'Crédit' && s.paymentMode === 'Credit');

    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q));
    return matchesPayment && matchesSearch;
  });

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <PageHeader
        title="Journal des Ventes & Facturation"
        subtitle="Historique des encaissements, réimpression de tickets thermique et gestion des annulations avec réintégration des stocks."
        icon={<Receipt className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <Badge variant="teal" size="sm">
            {sales.length} transactions
          </Badge>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° facture, nom de client, téléphone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs focus:border-[#D85C3A] outline-none text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Règlement :</span>
          {['Tous', 'Espèces', 'MoMo / QR', 'Carte', 'Crédit'].map(mode => (
            <button
              key={mode}
              onClick={() => setPaymentFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                paymentFilter === mode
                  ? 'bg-[#123F46] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-[#ECE5D7] border border-[#ECE5D7]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#ECE5D7] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5">N° Facture</th>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5 text-center">Panier</th>
                <th className="p-3.5 text-right">Sous-total</th>
                <th className="p-3.5 text-right">Remise</th>
                <th className="p-3.5 text-right">Net Réglé</th>
                <th className="p-3.5 text-center">Paiement</th>
                <th className="p-3.5 text-center">État</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE5D7] text-xs">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-14 text-slate-400">
                    Aucune transaction trouvée pour ces filtres.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {sale.invoiceNumber}
                    </td>

                    <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatDateTimeFR(sale.dateTime)}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {sale.customerName || 'Client Comptoir'}
                      {sale.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.customerPhone}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#ECE5D7] font-mono text-[11px] font-medium text-slate-700">
                        {sale.items.length} réf.
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono-data text-slate-600 font-medium">
                      {formatFCFA(sale.subtotal, currency)}
                    </td>

                    <td className="p-3.5 text-right font-mono-data text-emerald-700 font-medium">
                      {sale.discountAmount > 0 ? `-${formatFCFA(sale.discountAmount, currency)}` : '—'}
                    </td>

                    <td className="p-3.5 text-right font-mono-data font-black text-slate-900 text-sm">
                      {formatFCFA(sale.totalAmount, currency)}
                    </td>

                    <td className="p-3.5 text-center">
                      {sale.paymentMode === 'Cash' ? (
                        <Badge variant="teal" size="sm">Espèces</Badge>
                      ) : sale.paymentMode === 'UPI' ? (
                        <Badge variant="mango" size="sm">MoMo / QR</Badge>
                      ) : sale.paymentMode === 'Card' ? (
                        <Badge variant="clay" size="sm">Carte</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Crédit</Badge>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {sale.status === 'Completed' ? (
                        <Badge variant="teal" size="sm">Validée</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Annulée</Badge>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#ECE5D7] text-slate-700 border border-[#ECE5D7] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Consulter la facture"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Voir</span>
                        </button>

                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 bg-[#FDF3F0] hover:bg-[#FBE4DD] text-[#D85C3A] border border-[#D85C3A]/20 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Imprimer le ticket de caisse"
                        >
                          <Printer className="w-3 h-3 text-[#D85C3A]" />
                          <span>Ticket</span>
                        </button>

                        {sale.status === 'Completed' && (
                          <button
                            onClick={() => {
                              if (confirm(`Annuler la facture ${sale.invoiceNumber} ? Les articles seront immédiatement réintégrés dans les stocks.`)) {
                                onCancelSale(sale.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Annuler la vente"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
