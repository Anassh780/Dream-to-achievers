import QRCode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates an SVG string for a given text/URL using QR standard.
 */
export async function generateQrSvgString(
  text: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const {
    width = 256,
    margin = 1,
    color = { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel = 'M',
  } = options;

  return await QRCode.toString(text, {
    type: 'svg',
    width,
    margin,
    color,
    errorCorrectionLevel,
  });
}

/**
 * Generates a PNG Data URL (base64) for a given text/URL.
 */
export async function generateQrDataUrl(
  text: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const {
    width = 512,
    margin = 1,
    color = { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel = 'M',
  } = options;

  return await QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel,
  });
}

/**
 * Triggers a direct download of the QR code as a high-resolution PNG image.
 */
export async function downloadQrCodeImage(
  text: string,
  filename: string = 'dta-profile-qr.png',
  options: QrCodeOptions = {}
): Promise<void> {
  const dataUrl = await generateQrDataUrl(text, {
    width: options.width || 1024,
    margin: options.margin ?? 2,
    color: options.color || { dark: '#0A0F1D', light: '#FFFFFF' },
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
  });

  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the QR code PNG image directly to the system clipboard (if supported).
 */
export async function copyQrCodeImageToClipboard(
  text: string,
  options: QrCodeOptions = {}
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy not supported in this environment');
  }

  const dataUrl = await generateQrDataUrl(text, {
    width: options.width || 512,
    margin: options.margin ?? 2,
    color: options.color || { dark: '#0A0F1D', light: '#FFFFFF' },
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
  });

  const res = await fetch(dataUrl);
  const blob = await res.blob();

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);

  return true;
}

/**
 * Opens WhatsApp Web / Mobile with a pre-filled referral share text and QR link.
 */
export function shareReferralToWhatsApp(
  partnerName: string,
  referralCode: string,
  referralUrl: string
): void {
  const message =
    `🚀 *Official Dream to Achievers Reseller Invitation*\n\n` +
    `Assalam o Alaikum! This is *${partnerName}*.\n` +
    `Join my verified wholesale reseller network on *Dream to Achievers* (Pakistan's Premier B2B Dropshipping & COD Platform).\n\n` +
    `🔑 *VIP Referral Code:* ${referralCode}\n` +
    `📲 *Direct Registration Link:* ${referralUrl}\n\n` +
    `✨ Start earning high-margin COD wholesale profits with instant wallet disbursements!`;

  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}
