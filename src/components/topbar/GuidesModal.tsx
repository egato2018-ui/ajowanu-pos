import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ShoppingCart, 
  Banknote, 
  Package, 
  Keyboard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Layers,
  HelpCircle
} from 'lucide-react';
import { TabType } from '../../types';

interface GuidesModalProps {
  onClose: () => void;
  onNavigate?: (tab: TabType) => void;
  onOpenCashCounter?: () => void;
  onOpenCalculator?: () => void;
}

interface GuideItem {
  id: string;
  category: 'caisse' | 'cash' | 'stock' | 'shortcuts' | 'offline';
  title: string;
  summary: string;
  badge: string;
  icon: React.ReactNode;
  steps: string[];
  tips: string[];
  actionLabel?: string;
  actionTab?: TabType;
  actionFn?: () => void;
}

export const GuidesModal: React.FC<GuidesModalProps> = ({ 
  onClose, 
  onNavigate,
  onOpenCashCounter,
  onOpenCalculator
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('pos-basics');

  const categories = [
    { id: 'all', label: 'Tous les guides', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'caisse', label: 'Vente & Caisse (F2)', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { id: 'cash', label: 'Comptage & Coupures', icon: <Banknote className="w-3.5 h-3.5" /> },
    { id: 'stock', label: 'Stocks & Réassort', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'shortcuts', label: 'Raccourcis Clavier', icon: <Keyboard className="w-3.5 h-3.5" /> },
    { id: 'offline', label: 'Autonomie & Sécurité', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const guides: GuideItem[] = [
    {
      id: 'pos-basics',
      category: 'caisse',
      title: 'Encaisser une vente en moins de 10 secondes',
      summary: 'Accédez directement à la caisse, scannez ou recherchez un article et validez le paiement.',
      badge: 'Essentiel Caisse',
      icon: <ShoppingCart className="w-4 h-4 text-[#D85C3A]" />,
      steps: [
        'Pressez la touche F2 ou cliquez sur le bouton orange "Caisse (F2)" dans la barre supérieure.',
        'Scannez le code-barres avec votre douchette USB, ou tapez les premières lettres du produit dans la recherche.',
        'Ajustez les quantités au clavier avec les touches + et - ou directement sur l\'écran tactile.',
        'Sélectionnez le moyen de paiement du client (Espèces, Mobile Money MoMo/Flooz, Carte ou Crédit client).',
        'Saisissez le montant reçu pour calculer la monnaie exacte, puis validez pour imprimer ou enregistrer le ticket.'
      ],
      tips: [
        'Astuce Pro : Pressez la touche Espace pour valider instantanément l\'encaissement lorsque le montant est complet.',
        'Vous pouvez mettre un ticket en attente (Bouton "Mettre en attente") pour servir un autre client pressé.'
      ],
      actionLabel: 'Accéder à la Caisse (F2)',
      actionTab: 'pos'
    },
    {
      id: 'cash-count',
      category: 'cash',
      title: 'Calculateur de coupures FCFA & Clôture de caisse',
      summary: 'Comptez rapidement vos billets et pièces de monnaie FCFA sans risque d\'erreur mathématique.',
      badge: 'Gestion Espèces',
      icon: <Banknote className="w-4 h-4 text-emerald-600" />,
      steps: [
        'Cliquez sur l\'icône Billet de banque dans la barre supérieure.',
        'Saisissez le nombre de billets pour chaque coupure (10 000, 5 000, 2 000, 1 000 et 500 FCFA).',
        'Faites de même pour les pièces (500, 250, 200, 100, 50, 25, 10 et 5 FCFA).',
        'Le total général se calcule en temps réel avec le format monétaire officiel de la BCEAO.',
        'Utilisez le bouton "Copier le bilan" ou exportez la ventilation pour vos justificatifs comptables.'
      ],
      tips: [
        'Astuce Pro : Effectuez ce comptage à chaque début de quart pour fixer votre fond de caisse initial et éviter tout écart en fin de journée.',
      ],
      actionLabel: 'Ouvrir le calculateur d\'espèces',
      actionFn: () => {
        onClose();
        if (onOpenCashCounter) onOpenCashCounter();
      }
    },
    {
      id: 'stock-reorder',
      category: 'stock',
      title: 'Suivi des stocks et alertes de réapprovisionnement',
      summary: 'Anticipez les ruptures de stock grâce aux seuils d\'alerte et au calcul automatique du coût d\'achat.',
      badge: 'Stocks & Logistique',
      icon: <Package className="w-4 h-4 text-[#123F46]" />,
      steps: [
        'Consultez la carte "Articles en Rupture" sur le Tableau de bord pour voir les produits sous le seuil critique.',
        'Rendez-vous dans "Réception de stock" lors de la livraison de vos fournisseurs pour enregistrer les quantités reçues.',
        'Indiquez le prix d\'achat facturé pour recalculer le coût de revient unitaire et préserver votre marge bénéficiaire.',
        'Définissez pour chaque article un "Stock Minimum" personnalisé adapté à sa vitesse de rotation.'
      ],
      tips: [
        'Astuce Pro : Consultez le module "Intelligence des stocks" pour découvrir vos produits stars (classe A) et les références dormantes.'
      ],
      actionLabel: 'Voir les alertes de réassort',
      actionTab: 'smart_reorder'
    },
    {
      id: 'keyboard-mastery',
      category: 'shortcuts',
      title: 'Les raccourcis clavier pour une vitesse maximale',
      summary: 'Gagnez de précieuses secondes sur chaque passage en caisse en utilisant votre clavier standard.',
      badge: 'Productivité',
      icon: <Keyboard className="w-4 h-4 text-[#F2C14E]" />,
      steps: [
        'F2 : Ouvre immédiatement le terminal de caisse depuis n\'importe quel écran.',
        'Ctrl + K : Ouvre la boîte de recherche universelle pour retrouver un article ou un client.',
        'F4 : Ouvre la sélection rapide des comptes clients pour les ventes à crédit.',
        'F11 : Active le mode plein écran pour une immersion totale sans barre de navigateur.',
        'Échap (ESC) : Ferme immédiatement toute boîte de dialogue, fenêtre modale ou menu déroulant.'
      ],
      tips: [
        'Astuce Pro : Combinez la douchette code-barres et le pavé numérique pour une saisie ultra-rapide les yeux fermés.'
      ],
      actionLabel: 'Aller à la Caisse',
      actionTab: 'pos'
    },
    {
      id: 'offline-architecture',
      category: 'offline',
      title: 'Architecture 100% Hors-Ligne & Sauvegarde Locale',
      summary: 'Votre commerce continue de fonctionner normalement même en cas de coupure totale d\'Internet.',
      badge: 'Résilience SQLite',
      icon: <ShieldCheck className="w-4 h-4 text-sky-600" />,
      steps: [
        'AJOWANU s\'exécute avec un moteur SQLite local : aucune dépendance envers un serveur distant pendant vos ventes.',
        'Tous les tickets, paiements et mouvements de stock sont immédiatement enregistrés sur la mémoire de votre poste.',
        'Rendez-vous régulièrement dans "Paramètres" > "Sauvegardes" pour exporter une copie chiffrée de votre base.',
        'Conservez une copie hebdomadaire du fichier JSON/SQLite sur une clé USB dédiée pour une protection maximale.'
      ],
      tips: [
        'Astuce Pro : En cas de redémarrage de la machine, vos sessions de caisse et états d\'inventaire sont intégralement préservés.'
      ],
      actionLabel: 'Vérifier l\'état des sauvegardes',
      actionTab: 'backup'
    }
  ];

  const filteredGuides = guides.filter(g => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedGuide = guides.find(g => g.id === selectedGuideId) || filteredGuides[0] || guides[0];

  const handleAction = (guide: GuideItem) => {
    if (guide.actionFn) {
      guide.actionFn();
    } else if (guide.actionTab && onNavigate) {
      onClose();
      onNavigate(guide.actionTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-[#ECE5D7] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#ECE5D7] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#123F46] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-[#F2C14E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Guides & Astuces d'Utilisation AJOWANU
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#D85C3A]/10 text-[#D85C3A]">
                  Aide Pratique
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Conseils d'experts, raccourcis et bonnes pratiques pour optimiser la gestion de votre point de vente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#ECE5D7] bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
            title="Fermer (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-header: Search & Categories */}
        <div className="px-6 py-3 bg-white border-b border-[#ECE5D7] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#123F46] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-slate-600 hover:bg-[#F0EAE1] border border-[#ECE5D7]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un conseil, astuce..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ECE5D7] bg-[#FAF8F5] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#D85C3A] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Body 2-Columns Layout: List of guides & Detail reader */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Guide Cards List */}
          <div className="w-full md:w-80 border-r border-[#ECE5D7] overflow-y-auto p-4 space-y-2 bg-[#FAF8F5]/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              {filteredGuides.length} guide(s) disponible(s)
            </span>

            {filteredGuides.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aucun guide ne correspond à votre recherche.
              </div>
            ) : (
              filteredGuides.map(guide => {
                const isSelected = selectedGuide?.id === guide.id;
                return (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuideId(guide.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-white border-[#D85C3A] ring-2 ring-[#D85C3A]/20 shadow-xs'
                        : 'bg-white/80 border-[#ECE5D7] hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {guide.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {guide.badge}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isSelected ? 'text-[#D85C3A]' : ''}`} />
                    </div>
                    <h4 className={`text-xs font-bold leading-snug line-clamp-1 ${
                      isSelected ? 'text-[#D85C3A]' : 'text-slate-900'
                    }`}>
                      {guide.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {guide.summary}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Selected Guide Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-5">
            {selectedGuide ? (
              <div>
                {/* Guide Header */}
                <div className="pb-4 border-b border-[#ECE5D7]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#123F46]/10 text-[#123F46]">
                      {selectedGuide.badge}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">Recommandation certifiée</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {selectedGuide.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {selectedGuide.summary}
                  </p>
                </div>

                {/* Steps Section */}
                <div className="space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#D85C3A]" />
                    Étapes pas-à-pas :
                  </h4>
                  <div className="space-y-2.5">
                    {selectedGuide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7]/80 text-xs">
                        <span className="w-5 h-5 rounded-full bg-[#123F46] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips Box */}
                {selectedGuide.tips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FEF9EB] border border-[#F2C14E]/40 space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-[#B47805] text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-[#B47805]" />
                      <span>Conseil d'Expert AJOWANU</span>
                    </div>
                    {selectedGuide.tips.map((tip, idx) => (
                      <p key={idx} className="text-xs text-slate-700 leading-relaxed font-medium">
                        {tip}
                      </p>
                    ))}
                  </div>
                )}

                {/* Quick Interactive Action Trigger */}
                {selectedGuide.actionLabel && (
                  <div className="pt-4 border-t border-[#ECE5D7] flex items-center justify-between mt-6">
                    <span className="text-xs text-slate-400">
                      Tester directement cette fonctionnalité :
                    </span>
                    <button
                      onClick={() => handleAction(selectedGuide)}
                      className="px-4 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <span>{selectedGuide.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sélectionnez un guide pour afficher ses instructions.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#ECE5D7] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Assistance intégrée 100% autonome et disponible hors-ligne</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">AJOWANU POS v2.6</span>
        </div>

      </div>
    </div>
  );
};

// Help helper for Chevron
function ChevronRight(props: { className?: string }) {
  return (
    <svg 
      className={props.className || 'w-4 h-4'} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
