import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../types';
import { MobilePaymentService } from '../services/paymentService';
import { formatFCFA } from '../utils/formatters';
import { 
  QrCode, 
  CheckCircle, 
  Copy, 
  Printer, 
  X, 
  AlertCircle, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Check, 
  Loader2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  settings: ShopSettings;
  invoiceNumber: string;
  customerName: string;
  amount: number;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  settings,
  invoiceNumber,
  customerName,
  amount,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);
  const [qrError, setQrError] = useState<string | null>(null);

  // Success Overlay state
  const [isProcessingSuccess, setIsProcessingSuccess] = useState<boolean>(false);
  const [successStepIndex, setSuccessStepIndex] = useState<number>(0);

  // UI state
  const [copiedField, setCopiedField] = useState<'merchant' | 'amount' | null>(null);
  const [isFullscreenQr, setIsFullscreenQr] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const mobileService = new MobilePaymentService(settings);
  const isAvailable = mobileService.isAvailable();

  // Timer for invoice elapsed time
  useEffect(() => {
    let timer: any;
    if (isOpen && !isProcessingSuccess) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isProcessingSuccess]);

  // Generate QR Code dynamically
  useEffect(() => {
    if (!isOpen) return;

    if (!isAvailable) {
      setQrError('Numéro ou compte marchand non configuré. Veuillez renseigner les paramètres Mobile Money.');
      setIsLoadingQr(false);
      return;
    }

    setQrError(null);
    setIsLoadingQr(true);

    const paymentRequest = {
      amount,
      invoiceNumber,
      customerName,
      note: settings.defaultPaymentNote || `Règlement Facture ${invoiceNumber}`,
      currency: settings.currencySymbol || 'FCFA',
    };

    mobileService.generateQRCodeDataUrl(paymentRequest)
      .then(url => {
        setQrDataUrl(url);
        setIsLoadingQr(false);
      })
      .catch(() => {
        setQrError('Erreur de génération du QR Code autonome.');
        setIsLoadingQr(false);
      });
  }, [isOpen, amount, invoiceNumber, customerName, settings]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: 'merchant' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaymentReceived = () => {
    setIsProcessingSuccess(true);
    setSuccessStepIndex(0);

    setTimeout(() => setSuccessStepIndex(1), 400);  // Enregistrement de la facture...
    setTimeout(() => setSuccessStepIndex(2), 800);  // Décrémentation du stock...
    setTimeout(() => setSuccessStepIndex(3), 1200); // Génération du reçu...
    setTimeout(() => {
      setIsProcessingSuccess(false);
      onPaymentSuccess();
    }, 1600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrintQrCode = () => {
    window.print();
  };

  const merchantNameDisplay = settings.merchantName || settings.shopName || 'Boutique AJOWANU';
  const merchantIdDisplay = settings.upiId || settings.phone || '+229 97 00 12 34';

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      {/* SUCCESS OVERLAY ANIMATION */}
      {isProcessingSuccess && (
        <div className="absolute inset-0 z-50 bg-[#111827]/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 space-y-6 text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
            <CheckCircle className="w-12 h-12 text-white stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Paiement Confirmé avec Succès
            </h2>
            <p className="text-xl sm:text-2xl font-mono-data font-bold text-[#F2C14E]">
              {formatFCFA(amount, settings.currencySymbol)} Reçu
            </p>
          </div>

          {/* Sequential Progress Indicators */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 max-w-sm w-full space-y-2.5 text-xs text-left">
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 0 ? 'text-[#F2C14E] font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-[#F2C14E]" />}
              <span>Enregistrement de la facture ({invoiceNumber})...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 1 ? 'text-[#F2C14E] font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className={`w-4 h-4 ${successStepIndex >= 1 ? 'animate-spin' : 'opacity-0'}`} />}
              <span>Mise à jour des stocks en magasin...</span>
            </div>
            <div className={`flex items-center gap-2.5 ${successStepIndex >= 2 ? 'text-[#F2C14E] font-semibold' : 'text-slate-500'}`}>
              {successStepIndex >= 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className={`w-4 h-4 ${successStepIndex >= 2 ? 'animate-spin' : 'opacity-0'}`} />}
              <span>Préparation de l'impression du ticket...</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">Veuillez patienter un instant...</p>
        </div>
      )}

      {/* MAIN PAYMENT POPUP CARD */}
      <div className={`bg-white rounded-3xl shadow-2xl border border-[#ECE5D7] w-full overflow-hidden transition-all duration-300 flex flex-col ${
        isFullscreenQr ? 'max-w-4xl h-[90vh]' : 'max-w-2xl'
      }`}>
        
        {/* Header Bar AJOWANU Teal */}
        <div className="bg-[#123F46] text-white p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Smartphone className="w-6 h-6 text-[#F2C14E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[#F2C14E] px-2 py-0.5 rounded-full border border-white/20">
                  Paiement Mobile Money & QR
                </span>
                <span className="text-xs text-slate-200 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Règlement Électronique de la Vente
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenQr(!isFullscreenQr)}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white cursor-pointer"
              title={isFullscreenQr ? "Vue normale" : "Plein écran"}
            >
              {isFullscreenQr ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition text-white cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Summary Ribbon */}
        <div className="bg-[#F6F1E7] px-5 py-3 border-b border-[#ECE5D7] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              N° Facture
            </span>
            <span className="font-mono-data font-bold text-[#111827]">
              {invoiceNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Client
            </span>
            <span className="font-semibold text-[#111827] truncate block">
              {customerName || 'Client Comptant'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Compte Marchand
            </span>
            <span className="font-semibold text-[#111827] truncate block">
              {merchantNameDisplay}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Net à Payer
            </span>
            <span className="font-mono-data font-extrabold text-base text-[#D85C3A]">
              {formatFCFA(amount, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          
          {!isAvailable ? (
            <div className="p-6 bg-rose-50 border-2 border-dashed border-rose-300 rounded-3xl text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
              <h3 className="text-base font-bold text-rose-900">
                Paiement Mobile Money non configuré
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                Veuillez renseigner votre numéro ou code marchand dans <strong>Paramètres boutique &gt; Paiement Mobile Money</strong>.
              </p>
            </div>
          ) : (
            <div className={`grid ${isFullscreenQr ? 'grid-cols-1 md:grid-cols-2 gap-8 items-center' : 'grid-cols-1 md:grid-cols-2 gap-6'}`}>
              
              {/* Left Column: QR Code Display Card */}
              <div className="flex flex-col items-center justify-center p-5 bg-[#111827] text-white rounded-3xl border border-slate-800 shadow-xl relative">
                
                {settings.merchantLogo && (
                  <div className="mb-3">
                    <img 
                      src={settings.merchantLogo} 
                      alt="Logo Marchand" 
                      className="h-10 object-contain rounded-lg max-w-[160px] bg-white p-1"
                    />
                  </div>
                )}

                <div className="text-center mb-3">
                  <span className="text-[10px] font-bold text-[#F2C14E] tracking-wider uppercase block">
                    {merchantNameDisplay}
                  </span>
                  <div className="text-xs text-slate-300 font-mono font-medium flex items-center justify-center gap-1.5 mt-0.5">
                    <span>N° Marchand : {merchantIdDisplay}</span>
                    <button
                      onClick={() => handleCopy(merchantIdDisplay, 'merchant')}
                      className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
                      title="Copier le numéro"
                    >
                      {copiedField === 'merchant' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* QR Canvas Container */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl relative border-4 border-[#123F46] flex items-center justify-center min-h-[220px] min-w-[220px]">
                  {isLoadingQr ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-600">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D85C3A]" />
                      <span className="text-xs font-semibold">Génération du code autonome...</span>
                    </div>
                  ) : qrError ? (
                    <div className="p-4 text-center text-rose-600 space-y-1 text-xs font-medium">
                      <AlertCircle className="w-6 h-6 mx-auto" />
                      <span>{qrError}</span>
                    </div>
                  ) : (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code de paiement Mobile Money" 
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  )}
                </div>

                {/* Amount Badge below QR */}
                <div className="mt-4 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Montant exact :</span>
                  <span className="text-base font-extrabold font-mono-data text-[#F2C14E]">
                    {formatFCFA(amount, settings.currencySymbol)}
                  </span>
                  <button
                    onClick={() => handleCopy(amount.toString(), 'amount')}
                    className="text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copier le montant"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Supported Operators in Benin/Africa */}
                <div className="mt-3 flex flex-wrap justify-center items-center gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">MTN MoMo</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">Moov Money</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">Celtiis Cash</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-md">QR Caisse</span>
                </div>

              </div>

              {/* Right Column: Status & Instructions */}
              <div className="space-y-4 flex flex-col justify-between">
                
                {/* Live Waiting Animation Status Box */}
                <div className="p-4 rounded-2xl bg-[#FEF9EB] border border-[#F2C14E]/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2C14E] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D85C3A]"></span>
                    </span>
                    <span>En attente du transfert client...</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Le client effectue le transfert de <strong>{formatFCFA(amount, settings.currencySymbol)}</strong> vers votre compte marchand ou scanne le QR code affiché.
                  </p>
                </div>

                {/* Security & Validation Notice */}
                <div className="p-3.5 rounded-2xl bg-[#F6F1E7] border border-[#ECE5D7] text-xs space-y-2 text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-[#123F46]" />
                    <span>Encaissement Direct & Sans Frais Supplémentaires</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Les fonds arrivent directement sur le compte marchand ({merchantIdDisplay}) en toute sécurité.
                  </p>
                </div>

                {/* Quick Copy Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopy(merchantIdDisplay, 'merchant')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    {copiedField === 'merchant' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>N° Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le Numéro</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(amount.toString(), 'amount')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Montant Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le Montant</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Payment Action Confirmation Button Clay Orange */}
                <button
                  onClick={handleConfirmPaymentReceived}
                  disabled={!isAvailable}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    !isAvailable 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-[#D85C3A] hover:bg-[#C24B2B] text-white shadow-[#D85C3A]/25 active:scale-[0.99]'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Paiement Reçu (Valider la Vente)</span>
                </button>

              </div>

            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#F6F1E7] border-t border-[#ECE5D7] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintQrCode}
              disabled={!isAvailable}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le QR de Caisse</span>
            </button>

            <span className="text-slate-500 text-[11px] hidden sm:inline">
              Montant verrouillé au total de la facture
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition cursor-pointer border border-rose-200"
            >
              Annuler
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
