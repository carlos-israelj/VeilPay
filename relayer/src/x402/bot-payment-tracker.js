/**
 * Bot Payment Tracker
 * Tracks payments to bots for analytics and monitoring
 */

import fs from 'fs';
import path from 'path';

const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'bot-payments.json');

/**
 * Initialize payment tracking
 */
export function initializePaymentTracker() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize payments file if it doesn't exist
  if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify({
      payments: [],
      stats: {
        totalPayments: 0,
        totalRevenue: {
          STX: 0,
          USDCx: 0,
          sBTC: 0
        },
        byBot: {
          security: 0,
          tokenomics: 0,
          sentiment: 0,
          coordinator: 0
        }
      }
    }, null, 2));
  }

  console.log('✓ Bot payment tracker initialized');
}

/**
 * Record a bot payment
 */
export function recordBotPayment(paymentData) {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));

    const payment = {
      id: generatePaymentId(),
      botType: paymentData.botType,
      asset: paymentData.asset,
      amount: paymentData.amount,
      nullifierHash: paymentData.nullifierHash,
      transactionId: paymentData.transactionId,
      paymentMethod: paymentData.paymentMethod || 'veilpay-zk',
      timestamp: new Date().toISOString(),
      metadata: paymentData.metadata || {}
    };

    // Add payment to history
    data.payments.push(payment);

    // Update stats
    data.stats.totalPayments++;
    data.stats.totalRevenue[paymentData.asset] += parseFloat(paymentData.amount);
    data.stats.byBot[paymentData.botType]++;

    // Keep only last 1000 payments (to prevent file from growing too large)
    if (data.payments.length > 1000) {
      data.payments = data.payments.slice(-1000);
    }

    // Save to file
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2));

    console.log(`💰 Payment recorded: ${paymentData.botType} bot - ${paymentData.amount} ${paymentData.asset}`);

    return payment;

  } catch (error) {
    console.error('Error recording payment:', error.message);
    return null;
  }
}

/**
 * Get payment statistics
 */
export function getPaymentStats() {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    return data.stats;
  } catch (error) {
    console.error('Error getting payment stats:', error.message);
    return null;
  }
}

/**
 * Get recent payments
 */
export function getRecentPayments(limit = 10) {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    return data.payments.slice(-limit).reverse(); // Most recent first
  } catch (error) {
    console.error('Error getting recent payments:', error.message);
    return [];
  }
}

/**
 * Get payments for specific bot
 */
export function getPaymentsByBot(botType) {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    return data.payments.filter(p => p.botType === botType);
  } catch (error) {
    console.error('Error getting bot payments:', error.message);
    return [];
  }
}

/**
 * Check if nullifier has been used for bot payment
 */
export function isNullifierUsedForBots(nullifierHash) {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    return data.payments.some(p => p.nullifierHash === nullifierHash);
  } catch (error) {
    return false;
  }
}

/**
 * Get total revenue in STX equivalent
 * (simplified - assumes 1 STX = 1 USDCx = 0.00001 sBTC for now)
 */
export function getTotalRevenueSTX() {
  try {
    const stats = getPaymentStats();
    if (!stats) return 0;

    const stx = stats.totalRevenue.STX || 0;
    const usdcx = stats.totalRevenue.USDCx || 0; // Assume 1:1
    const sbtc = (stats.totalRevenue.sBTC || 0) * 100000; // Convert sBTC to STX equivalent

    return stx + usdcx + sbtc;
  } catch (error) {
    return 0;
  }
}

/**
 * Generate unique payment ID
 */
function generatePaymentId() {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Export payment data as CSV (for analytics)
 */
export function exportPaymentsCSV() {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));

    const csvHeader = 'ID,Bot,Asset,Amount,Payment Method,Timestamp\n';
    const csvRows = data.payments.map(p =>
      `${p.id},${p.botType},${p.asset},${p.amount},${p.paymentMethod},${p.timestamp}`
    ).join('\n');

    return csvHeader + csvRows;

  } catch (error) {
    console.error('Error exporting CSV:', error.message);
    return null;
  }
}

/**
 * Clear old payments (older than 30 days)
 */
export function cleanupOldPayments() {
  try {
    const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentPayments = data.payments.filter(p =>
      new Date(p.timestamp) > thirtyDaysAgo
    );

    data.payments = recentPayments;
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2));

    console.log(`🧹 Cleaned up old payments. Kept ${recentPayments.length} recent payments.`);

  } catch (error) {
    console.error('Error cleaning up payments:', error.message);
  }
}
