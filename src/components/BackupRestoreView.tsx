import React, { useRef, useState } from 'react';
import { DatabaseBackup, Download, Upload, RotateCcw, CheckCircle2, AlertTriangle, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface BackupRestoreViewProps {
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => boolean;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  onExportBackup,
  onImportBackup,
  onResetToSampleData,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<'clear' | 'sample' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportBackup(content);
        if (success) {
          setStatusMsg({ type: 'success', text: 'Base de données restaurée avec succès depuis le fichier d\'archive AJOWANU !' });
        } else {
          setStatusMsg({ type: 'error', text: 'Format de fichier d\'archive invalide ou corrompu. Restauration impossible.' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Sauvegardes & Restauration des Données"
        subtitle="AJOWANU fonctionne à 100% en local et hors-ligne. Exportez régulièrement vos archives sur clé USB pour sécuriser vos comptes de caisse."
        icon={<DatabaseBackup className="w-5 h-5 text-[#123F46]" />}
        badge={
          <Badge variant="teal" size="sm">
            100% Autonome & Souverain
          </Badge>
        }
      />

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fadeIn ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Export Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="p-3 bg-[#FAF8F5] border border-[#ECE5D7] text-[#123F46] rounded-xl w-fit mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Exporter une Archive Complète
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Génère un fichier autonome (<code className="font-mono bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#ECE5D7] text-slate-800">ajowanu_pos_backup.json</code>) incluant le catalogue articles, les mouvements de stocks, l'historique des ventes, les clients et la configuration.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<Download className="w-4 h-4" />}
            onClick={onExportBackup}
          >
            Télécharger la Sauvegarde
          </Button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="p-3 bg-[#FDF3F0] border border-[#D85C3A]/20 text-[#D85C3A] rounded-xl w-fit mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Restaurer la Base de Données
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sélectionnez une archive de secours AJOWANU pour réinjecter immédiatement l'ensemble des stocks, créances clients et rapports d'activité sur ce poste.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.db,.sqlite"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Sélectionner un Fichier de Sauvegarde
          </Button>
        </div>
      </div>

      {/* Fresh Start / Clean Slate Option for Real Store Owners */}
      <div className="p-5 rounded-2xl bg-[#FFF5F5] border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Démarrer avec une Boutique Vierge</span>
              <span className="text-[10px] uppercase bg-rose-200 text-rose-900 font-extrabold px-2 py-0.5 rounded-full">
                Mise en Production
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Purger l'inventaire fictif, les tickets d'exemple et les clients de test pour démarrer avec votre propre catalogue de boutique.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmModal('clear')}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shrink-0 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Remise à Zéro</span>
        </button>
      </div>

      {/* Demo Sample Data Reset Option */}
      <div className="p-5 rounded-2xl bg-white border border-[#ECE5D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7] text-slate-700 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Recharger le Jeu de Démonstration (Commerce Bénin)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Réinjecte des articles types (Riz parfumé 25kg, Huile Dinor 5L, Savon BF, Pâtes Maman...) pour former les caissiers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConfirmModal('sample')}
          className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#ECE5D7] text-slate-800 border border-[#ECE5D7] font-bold rounded-xl text-xs shrink-0 transition cursor-pointer"
        >
          Recharger les Données Démo
        </button>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-[#171614]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#ECE5D7] shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {confirmModal === 'clear' ? (
                <>
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  <span>Confirmer la remise à blanc de la boutique ?</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>Recharger le jeu de démonstration ?</span>
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal === 'clear'
                ? 'Êtes-vous certain de vouloir vider toutes les données fictives ? Tous les articles de test, ventes et clients de démonstration seront purgés pour laisser place à vos vraies données de boutique.'
                : 'Êtes-vous certain de vouloir recharger les articles d\'exemple du catalogue commerce (Riz, Huile, Savon, Pâtes, Sucre) ?'}
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#FAF8F5] rounded-xl transition cursor-pointer border border-[#ECE5D7]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === 'clear') {
                    onClearAllData();
                    setStatusMsg({ type: 'success', text: 'Base de données réinitialisée à blanc avec succès ! Vous pouvez commencer à enregistrer vos articles réels.' });
                  } else {
                    onResetToSampleData();
                    setStatusMsg({ type: 'success', text: 'Jeu de démonstration AJOWANU chargé avec succès !' });
                  }
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer ${
                  confirmModal === 'clear' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#123F46] hover:bg-[#0E3238]'
                }`}
              >
                {confirmModal === 'clear' ? 'Oui, effacer et démarrer' : 'Oui, charger la démo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
