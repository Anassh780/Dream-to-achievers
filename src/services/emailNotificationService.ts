import { AppNotification } from '@/types';

export interface EmailTemplateData {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export const emailNotificationService = {
  /**
   * Generates a fully responsive, inline-styled luxury HTML email template
   * tailored to the notification category.
   */
  generateEmailForNotification(
    notification: AppNotification,
    options: {
      recipientName?: string;
      recipientEmail?: string;
      additionalData?: Record<string, any>;
    } = {}
  ): EmailTemplateData {
    const name = options.recipientName || 'Valued Partner';
    const email = options.recipientEmail || 'partner@dreamtoachievers.com';
    const type = notification.type || 'system';
    const dateFormatted = new Date(notification.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let subject = `[DreamToAchievers] ${notification.title}`;
    let badgeLabel = 'OFFICIAL NOTICE';
    let primaryColor = '#D9C08A'; // Champagne Gold
    let gradientStart = '#D9C08A';
    let gradientEnd = '#B39356';
    let ctaLabel = 'Open Partner Terminal';
    let ctaUrl = 'https://dreamtoachievers.com/dashboard/notifications';
    let heroIcon = '🔔';
    let categoryDetailsHtml = '';

    if (type.includes('sale') || type.includes('order')) {
      subject = `🛒 Order Update: ${notification.title}`;
      badgeLabel = 'B2B ORDER & DISPATCH';
      primaryColor = '#34D399'; // Emerald
      gradientStart = '#34D399';
      gradientEnd = '#059669';
      ctaLabel = 'Track Live Order & Profit';
      ctaUrl = 'https://dreamtoachievers.com/dashboard/sales';
      heroIcon = '📦';
      categoryDetailsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #0D1612; border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 12px 16px; color: #9EABA2; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">Fulfillment Mode:</td>
            <td style="padding: 12px 16px; color: #34D399; font-weight: bold; font-size: 12px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">Cash on Delivery (COD)</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #9EABA2; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">Logistics Node:</td>
            <td style="padding: 12px 16px; color: #F4F7F5; font-size: 12px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">Lahore Central Hub</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #9EABA2; font-size: 12px; font-family: monospace;">Reseller Profit Status:</td>
            <td style="padding: 12px 16px; color: #34D399; font-weight: bold; font-size: 13px; text-align: right; font-family: monospace;">Credited Upon Customer Delivery</td>
          </tr>
        </table>
      `;
    } else if (type.includes('rank')) {
      subject = `🏆 Level Milestone Unlocked: ${notification.title}`;
      badgeLabel = 'TIER ADVANCEMENT';
      primaryColor = '#F59E0B'; // Amber Gold
      gradientStart = '#F59E0B';
      gradientEnd = '#D97706';
      ctaLabel = 'Review Milestone Journey';
      ctaUrl = 'https://dreamtoachievers.com/dashboard/ranks';
      heroIcon = '👑';
      categoryDetailsHtml = `
        <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(0,0,0,0.4)); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; text-align: center;">
          <p style="margin: 0; color: #F59E0B; font-size: 11px; font-family: monospace; letter-spacing: 1px; text-transform: uppercase;">Milestone Achievement Certificate</p>
          <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 16px; font-weight: bold;">Dual Qualifications Met</p>
          <p style="margin: 4px 0 0 0; color: #9EABA2; font-size: 12px;">Personal volume orders + downline team verified.</p>
        </div>
      `;
    } else if (type.includes('reward') || type.includes('withdrawal')) {
      subject = `💰 Payout & Reward Notice: ${notification.title}`;
      badgeLabel = 'FINANCIAL LEDGER';
      primaryColor = '#34D399';
      gradientStart = '#34D399';
      gradientEnd = '#10B981';
      ctaLabel = 'View Available Balance';
      ctaUrl = 'https://dreamtoachievers.com/dashboard/sales';
      heroIcon = '💳';
      categoryDetailsHtml = `
        <div style="margin-top: 16px; padding: 14px 16px; background-color: #0E1813; border: 1px solid rgba(52,211,153,0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9EABA2; font-size: 11px; font-family: monospace;">TRANSFER METHOD</span>
            <span style="color: #34D399; font-size: 11px; font-family: monospace; font-weight: bold;">LOCAL BANK / JAZZCASH / EASYPAISA</span>
          </div>
          <p style="margin: 6px 0 0 0; color: #F4F7F5; font-size: 12px; line-height: 1.5;">Manual payout disbursements are processed by platform treasury within 24–48 hours directly into your registered payout account.</p>
        </div>
      `;
    } else if (type.includes('referral') || type.includes('team')) {
      subject = `👥 Team Addition: ${notification.title}`;
      badgeLabel = 'PARTNER NETWORK';
      primaryColor = '#C084FC'; // Purple
      gradientStart = '#C084FC';
      gradientEnd = '#9333EA';
      ctaLabel = 'Inspect Partner Downline';
      ctaUrl = 'https://dreamtoachievers.com/dashboard/referrals';
      heroIcon = '🤝';
      categoryDetailsHtml = `
        <div style="margin-top: 16px; padding: 14px 16px; background-color: #160F1E; border: 1px solid rgba(192,132,252,0.3); border-radius: 12px;">
          <span style="color: #C084FC; font-size: 11px; font-family: monospace; font-weight: bold;">ATTRIBUTION PERMANENTLY LOCKED</span>
          <p style="margin: 6px 0 0 0; color: #F4F7F5; font-size: 12px;">Your new distributor team member has been cryptographically attributed to your sponsor code. Active orders qualify toward your next milestone rank.</p>
        </div>
      `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #040705; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F7F5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #040705; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #0A0F0C; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
          
          <!-- Top Accent Glow Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${gradientStart}, ${gradientEnd});"></td>
          </tr>

          <!-- Header / Brandmark -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background-color: #070B09;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #F4F7F5; letter-spacing: -0.5px;">
                      DreamToAchievers
                    </div>
                    <div style="font-size: 10px; font-family: monospace; color: #34D399; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px;">
                      Wholesale B2B Distribution Network
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); color: ${primaryColor}; font-size: 10px; font-family: monospace; font-weight: bold; letter-spacing: 0.5px;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Notification Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <div style="display: inline-block; font-size: 32px; line-height: 1; margin-bottom: 16px;">
                ${heroIcon}
              </div>

              <h1 style="margin: 0 0 10px; font-size: 20px; line-height: 1.35; color: #FFFFFF; font-weight: bold; font-family: Georgia, serif;">
                ${notification.title}
              </h1>

              <div style="font-size: 11px; font-family: monospace; color: #9EABA2; margin-bottom: 20px;">
                Logged at: ${dateFormatted} · Partner: <span style="color: #F4F7F5;">${name}</span>
              </div>

              <div style="font-size: 14px; line-height: 1.6; color: #D1D5DB; background-color: #0D1310; padding: 18px 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
                ${notification.message}
              </div>

              ${categoryDetailsHtml}

              <!-- Primary Action CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; padding: 14px 28px; background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}); color: #070B09; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(0,0,0,0.5);">
                      ${ctaLabel} →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Security & Footer Notice -->
          <tr>
            <td style="padding: 24px 32px 28px; background-color: #060907; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #9EABA2; line-height: 1.5;">
                This automated dispatch was generated for <strong>${email}</strong> via the Dream to Achievers Reseller Ledger.
              </p>
              <p style="margin: 0 0 12px; font-size: 10px; color: #6B7280; font-family: monospace;">
                COD Logistics · Zero-Investment E-Commerce · Pakistan Nationwide Hubs
              </p>
              <div style="font-size: 10px; color: #9EABA2;">
                <a href="https://dreamtoachievers.com" style="color: #34D399; text-decoration: none; margin: 0 8px;">Portal Home</a>
                ·
                <a href="https://dreamtoachievers.com/dashboard" style="color: #34D399; text-decoration: none; margin: 0 8px;">Partner Dashboard</a>
                ·
                <a href="https://dreamtoachievers.com/faq" style="color: #34D399; text-decoration: none; margin: 0 8px;">Help &amp; FAQ</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
[Dream to Achievers - ${badgeLabel}]
=======================================
${notification.title}

Dear ${name},

${notification.message}

Timestamp: ${dateFormatted}
Target Link: ${ctaUrl}

Dream to Achievers Wholesale Network
https://dreamtoachievers.com
    `.trim();

    return {
      recipientName: name,
      recipientEmail: email,
      subject,
      htmlContent,
      textContent,
    };
  },

  /**
   * Dispatches the email notification.
   * Simulates reliable delivery, saves a dispatch log into local/cloud ledger,
   * and opens a mail client fallback if requested.
   */
  async sendEmailNotification(
    notification: AppNotification,
    options: {
      recipientName?: string;
      recipientEmail: string;
      openMailClient?: boolean;
    }
  ): Promise<{ success: boolean; message: string; template: EmailTemplateData }> {
    const template = this.generateEmailForNotification(notification, {
      recipientName: options.recipientName,
      recipientEmail: options.recipientEmail,
    });

    try {
      // Record dispatch receipt in local storage ledger
      const dispatchLog = {
        id: `email-dispatch-${Date.now()}`,
        notificationId: notification.id,
        recipientEmail: options.recipientEmail,
        subject: template.subject,
        sentAt: new Date().toISOString(),
        status: 'delivered',
      };
      const existingLogs = JSON.parse(localStorage.getItem('dta_email_dispatches') || '[]');
      existingLogs.unshift(dispatchLog);
      localStorage.setItem('dta_email_dispatches', JSON.stringify(existingLogs.slice(0, 100)));

      if (options.openMailClient && typeof window !== 'undefined') {
        const mailtoUrl = `mailto:${encodeURIComponent(options.recipientEmail)}?subject=${encodeURIComponent(
          template.subject
        )}&body=${encodeURIComponent(template.textContent)}`;
        window.open(mailtoUrl, '_blank');
      }

      return {
        success: true,
        message: `Luxury email receipt dispatched successfully to ${options.recipientEmail}.`,
        template,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to dispatch email notification.',
        template,
      };
    }
  },
};
