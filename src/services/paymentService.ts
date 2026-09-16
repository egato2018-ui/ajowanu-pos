import QRCode from 'qrcode';
import { ShopSettings } from '../types';

export interface MobilePaymentConfig {
  enableUpiPayments?: boolean;
  merchantName?: string;
  upiId?: string; // Merchant ID / Mobile Money phone / Code Marchand
  defaultPaymentNote?: string;
  currency?: string;
  receiptFooter?: string;
  merchantLogo?: string;
}

export interface PaymentRequest {
  amount: number;
  invoiceNumber: string;
  customerName?: string;
  note?: string;
  currency?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  generatePaymentString(request: PaymentRequest): string;
  generateQRCodeDataUrl(request: PaymentRequest): Promise<string>;
}

/**
 * Service de paiement Mobile Money & QR Hors-ligne AJOWANU
 * Compatible avec les numéros marchands MTN MoMo, Moov Money, Celtiis et QR de caisse
 */
export class MobilePaymentService implements PaymentProvider {
  public id = 'ajowanu-mobile-qr';
  public name = 'Paiement Mobile Money & QR AJOWANU';
  private settings: ShopSettings;

  constructor(settings: ShopSettings) {
    this.settings = settings;
  }

  public updateSettings(settings: ShopSettings): void {
    this.settings = settings;
  }

  /**
   * Vérifie si le paiement Mobile Money / QR est configuré et activé
   */
  public isAvailable(): boolean {
    const isEnabled = this.settings.enableUpiPayments !== false;
    const hasMerchantId = Boolean(this.settings.upiId && this.settings.upiId.trim().length >= 3);
    return isEnabled && hasMerchantId;
  }

  /**
   * Valide le format de l'identifiant marchand (Numéro de téléphone Bénin, Code Marchand ou ID)
   */
  public static validateMerchantId(merchantId: string): { valid: boolean; error?: string } {
    if (!merchantId || !merchantId.trim()) {
      return { valid: false, error: 'Le numéro ou code marchand ne peut pas être vide.' };
    }
    const trimmed = merchantId.trim();
    if (trimmed.length < 3) {
      return { valid: false, error: 'Identifiant marchand trop court (minimum 3 caractères).' };
    }
    return { valid: true };
  }

  /**
   * Rétrocompatibilité avec l'ancienne signature
   */
  public static validateUPIId(upiId: string): { valid: boolean; error?: string } {
    return this.validateMerchantId(upiId);
  }

  /**
   * Construit la chaîne de paiement QR encodée (Format Standard Mobile Money / Facture AJOWANU)
   */
  public generatePaymentString(request: PaymentRequest): string {
    const merchantId = (this.settings.upiId || '').trim();
    const merchantName = (this.settings.merchantName || this.settings.shopName || 'Boutique AJOWANU').trim();
    const currency = request.currency || this.settings.currencySymbol || 'FCFA';
    const amount = Math.round(request.amount);
    const note = request.note || this.settings.defaultPaymentNote || `Facture ${request.invoiceNumber}`;

    // Payload standard pour paiement QR marchand (lisible par tout scanner de caisse ou application mobile)
    return `AJOWANU:PAY?merchant=${encodeURIComponent(merchantId)}&name=${encodeURIComponent(merchantName)}&amount=${amount}&currency=${encodeURIComponent(currency)}&ref=${encodeURIComponent(request.invoiceNumber)}&note=${encodeURIComponent(note)}`;
  }

  /**
   * Alias pour compatibilité
   */
  public generateUPIString(request: PaymentRequest): string {
    return this.generatePaymentString(request);
  }

  /**
   * Génération du QR Code autonome haute résolution
   */
  public async generateQRCodeDataUrl(request: PaymentRequest): Promise<string> {
    const qrData = this.generatePaymentString(request);
    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 360,
        color: {
          dark: '#111827', // Obsidian Night AJOWANU
          light: '#FFFFFF',
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Erreur lors de la génération du QR Code:', err);
      throw new Error('Échec du rendu du QR Code de paiement');
    }
  }
}

// Alias de classe pour compatibilité absolue sans refactor risqué
export const UPIPaymentService = MobilePaymentService;

export class PaymentServiceFactory {
  public static getUPIProvider(settings: ShopSettings): MobilePaymentService {
    return new MobilePaymentService(settings);
  }
}
