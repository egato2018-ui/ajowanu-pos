import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../types';
import { MobilePaymentService } from '../services/paymentService';
import { formatFCFA } from '../utils/formatters';
import { 
  CheckCircle, 
  Save, 
  AlertCircle, 
  Info,
  Smartphone,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface UpiSettingsSectionProps {
  settings: ShopSettings;
  onUpdateSettings: (newSettings: Partial<ShopSettings>) => void;
}

export const UpiSettingsSection: React.FC<UpiSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState({
    enableUpiPayments: settings.enableUpiPayments !== false,
    merchantName: settings.merchantName || settings.shopName || 'Boutique AJOWANU',
    upiId: settings.upiId || settings.phone || '+229 97 00 12 34',
    defaultPaymentNote: settings.defaultPaymentNote || 'Merci pour vos achats chez Boutique AJOWANU !',
    upiReceiptFooter: settings.upiReceiptFooter || 'Paiement Mobile Money / QR Encaissé avec succès',
    merchantLogo: settings.merchantLogo || '',
  });

  const [testAmount, setTestAmount] = useState<number>(5000);
  const [testQrDataUrl, setTestQrDataUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSuccessToast, setSavedSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    setFormData({
      enableUpiPayments: settings.enableUpiPayments !== false,
      merchantName: settings.merchantName || settings.shopName || 'Boutique AJOWANU',
      upiId: settings.upiId || settings.phone || '+229 97 00 12 34',
      defaultPaymentNote: settings.defaultPaymentNote || 'Merci pour vos achats chez Boutique AJOWANU !',
      upiReceiptFooter: settings.upiReceiptFooter || 'Paiement Mobile Money / QR Encaissé avec succès',
      merchantLogo: settings.merchantLogo || '',
    });
  }, [settings]);

  useEffect(() => {
    const mobileValidation = MobilePaymentService.validateUPIId(formData.upiId);
    if (!mobileValidation.valid) {
      setValidationError(mobileValidation.error || 'Numéro ou identifiant invalide');
      setTestQrDataUrl('');
      return;
    }

    setValidationError(null);

    const tempSettings: ShopSettings = {
      ...settings,
      ...formData,
    };

    const service = new MobilePaymentService(tempSettings);
    service.generateQRCodeDataUrl({
      amount: testAmount || 1000,
      invoiceNumber: 'TEST-0001',
      note: formData.defaultPaymentNote,
      currency: settings.currencySymbol || 'FCFA',
    })
      .then(url => setTestQrDataUrl(url))
      .catch(err => console.error('Test QR code error', err));

  }, [formData, testAmount, settings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.enableUpiPayments) {
      const validation = MobilePaymentService.validateUPIId(formData.upiId);
      if (!validation.valid) {
        setValidationError(validation.error || 'Identifiant invalide');
        return;
      }
    }

    onUpdateSettings(formData);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE5D7] pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#D85C3A]" />
            <span>Encaissement Mobile Money & QR Code Caisse</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Paramétrage direct pour MTN MoMo, Moov Money, Celtiis et QR codes hors-ligne.
          </p>
        </div>

        {/* Enable / Disable Toggle */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer bg-[#FAF8F5] px-3.5 py-1.5 rounded-xl border border-[#ECE5D7]">
          <input
            type="checkbox"
            checked={formData.enableUpiPayments}
            onChange={e => handleChange('enableUpiPayments', e.target.checked)}
            className="w-4 h-4 text-[#D85C3A] rounded focus:ring-[#D85C3A] border-slate-300"
          />
          <span className="text-xs font-bold text-slate-700">
            {formData.enableUpiPayments ? 'Paiement Mobile Activé' : 'Désactivé'}
          </span>
        </label>
      </div>

      {savedSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres Mobile Money & QR enregistrés avec succès dans la base locale.</span>
        </div>
      )}

      {/* Main Settings & Interactive Test QR Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Merchant Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nom du Compte Marchand / Boutique
              </label>
              <input
                type="text"
                placeholder="Ex: Boutique AJOWANU Cotonou"
                value={formData.merchantName}
                onChange={e => handleChange('merchantName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl font-medium outline-none focus:border-[#D85C3A] text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1">Affiché au client lors du scan du code QR</p>
            </div>

            {/* Merchant Number / ID */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Numéro Mobile Marchand (MoMo / Moov) <span className="text-[#D85C3A]">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: +229 97 00 12 34 ou 67001234"
                value={formData.upiId}
                onChange={e => handleChange('upiId', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-[#FAF8F5] border rounded-xl font-mono text-slate-900 font-bold outline-none focus:border-[#D85C3A] ${
                  validationError ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {validationError ? (
                <p className="text-[10px] text-rose-600 mt-1 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationError}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">Numéro receveur pour validation des transferts</p>
              )}
            </div>

            {/* Default Payment Note */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Libellé automatique sur la facture
              </label>
              <input
                type="text"
                placeholder="Ex: Merci pour vos achats chez Boutique AJOWANU !"
                value={formData.defaultPaymentNote}
                onChange={e => handleChange('defaultPaymentNote', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl font-medium outline-none focus:border-[#D85C3A] text-slate-900"
              />
            </div>

            {/* Receipt Footer Message */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Message de pied de ticket
              </label>
              <input
                type="text"
                placeholder="Ex: Paiement Mobile Money Encaissé"
                value={formData.upiReceiptFooter}
                onChange={e => handleChange('upiReceiptFooter', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl font-medium outline-none focus:border-[#D85C3A] text-slate-900"
              />
            </div>

          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
            >
              Enregistrer les Paramètres Mobile Money
            </Button>
          </div>

        </form>

        {/* Right Column: Live Interactive QR Preview */}
        <div className="bg-[#171614] text-white p-5 rounded-2xl border border-[#2A2722] flex flex-col items-center justify-between text-center space-y-4 shadow-md">
          
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-[#2A2722] pb-2 mb-3">
              <span className="text-[10px] font-bold text-[#F2C14E] uppercase tracking-wider">
                Aperçu Caisse en Direct
              </span>
              <span className="px-2 py-0.5 bg-[#2A2722] text-[#F6F4EE] text-[10px] rounded font-mono">
                100% Autonome
              </span>
            </div>

            {/* Test Amount Input */}
            <div className="mb-3 text-left">
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Montant de test pour simulation (FCFA)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={testAmount || ''}
                onChange={e => setTestAmount(Math.max(100, parseFloat(e.target.value) || 100))}
                className="w-full px-3 py-1.5 bg-[#2A2722] border border-[#3E3A33] rounded-xl text-[#F2C14E] font-mono font-bold text-sm outline-none focus:border-[#F2C14E]"
              />
            </div>

            {/* QR Render Area */}
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-[#123F46] inline-block my-1">
              {testQrDataUrl ? (
                <img 
                  src={testQrDataUrl} 
                  alt="QR Code test Mobile Money" 
                  className="w-36 h-36 object-contain mx-auto"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-500 text-xs font-medium p-2">
                  Entrez un numéro marchand valide pour générer le code
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-300 font-mono mt-2">
              Montant : <strong className="text-[#F2C14E] font-extrabold">{formatFCFA(testAmount, settings.currencySymbol)}</strong>
            </div>

            <div className="text-[10px] text-slate-400 mt-1.5 leading-tight">
              Compatible MTN MoMo, Moov Money, Celtiis et portefeuilles QR.
            </div>
          </div>

          <div className="w-full p-2.5 rounded-xl bg-[#2A2722] border border-[#3E3A33] text-[10px] text-slate-300 flex items-center gap-2 text-left">
            <Info className="w-4 h-4 text-[#F2C14E] shrink-0" />
            <span>Encaissement instantané sans connexion internet requise.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
