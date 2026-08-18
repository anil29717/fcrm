import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  getCompany,
  getInvoice,
  getTemplateBlocks,
} from '../db/queries';
import type { LineItem, TemplateBlock } from '../types';
import { formatCurrency, formatDate } from './format';
import { ensureDir, getInvoicePdfDir, readFileAsBase64 } from './files';

const BLOCK_RENDERERS: Record<
  string,
  (ctx: InvoicePdfContext) => string
> = {
  company_details: (ctx) => {
    const c = ctx.company;
    if (!c) return '';
    const logo = ctx.logoDataUri
      ? `<img src="${ctx.logoDataUri}" style="height:48px;margin-bottom:8px;" />`
      : '';
    return `
      <div class="block">
        ${logo}
        <div class="company-name">${esc(c.name)}</div>
        ${c.owner_name ? `<div>${esc(c.owner_name)}</div>` : ''}
        ${c.address ? `<div>${esc(c.address)}</div>` : ''}
        ${c.email ? `<div>${esc(c.email)}</div>` : ''}
        ${c.phone ? `<div>${esc(c.phone)}</div>` : ''}
        ${c.gstin ? `<div>GSTIN: ${esc(c.gstin)}</div>` : ''}
      </div>`;
  },
  invoice_meta: (ctx) => `
    <div class="block meta">
      <div><strong>Invoice:</strong> ${esc(ctx.invoice.invoice_number)}</div>
      <div><strong>Date:</strong> ${esc(formatDate(ctx.invoice.date))}</div>
      <div><strong>Status:</strong> ${esc(ctx.invoice.status)}</div>
    </div>`,
  client_details: (ctx) => `
    <div class="block">
      <div class="block-title">Bill To</div>
      <div><strong>${esc(ctx.invoice.client_name ?? '')}</strong></div>
      <div>${esc(ctx.invoice.project_name ? `Project: ${ctx.invoice.project_name}` : 'Other service')}</div>
    </div>`,
  payment_details: (ctx) => {
    const c = ctx.company;
    const lines: string[] = [];
    if (c?.bank_account_name) lines.push(`Bank: ${esc(c.bank_account_name)}`);
    if (c?.bank_account_number) lines.push(`A/C: ${esc(c.bank_account_number)}`);
    if (c?.bank_ifsc) lines.push(`IFSC: ${esc(c.bank_ifsc)}`);
    if (c?.upi_id) lines.push(`UPI: ${esc(c.upi_id)}`);
    if (c?.payment_link) lines.push(`Pay: ${esc(c.payment_link)}`);
    if (ctx.invoice.payment_method) lines.push(`Method: ${esc(ctx.invoice.payment_method)}`);
    if (!lines.length) return '';
    return `<div class="block"><div class="block-title">Payment Details</div>${lines.map((l) => `<div>${l}</div>`).join('')}</div>`;
  },
  delivery_timeline: (ctx) => {
    if (!ctx.invoice.notes) return '';
    return `<div class="block"><div class="block-title">Delivery / Notes</div><div>${esc(ctx.invoice.notes)}</div></div>`;
  },
  signature: (ctx) => renderSignatureBlock(ctx),
};

interface InvoicePdfContext {
  company: Awaited<ReturnType<typeof getCompany>>;
  invoice: NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
  lineItems: LineItem[];
  logoDataUri: string | null;
  signatureDataUri: string | null;
  blocks: TemplateBlock[];
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSignatureBlock(ctx: InvoicePdfContext): string {
  const mode = ctx.company?.signature_mode ?? 'computer_generated';
  const name = ctx.company?.owner_name ?? ctx.company?.name ?? '';

  if (mode === 'authorized') {
    const image = ctx.signatureDataUri
      ? `<img src="${ctx.signatureDataUri}" class="sig-image" alt="Signature" />`
      : `<div class="sig-line"></div>`;
    return `
      <div class="block signature">
        ${image}
        <div class="sig-label">Authorized Signatory</div>
        ${name ? `<div class="sig-name">${esc(name)}</div>` : ''}
        <div class="sig-note">Digitally authorized for ${esc(ctx.company?.name ?? 'this business')}</div>
      </div>`;
  }

  return `
    <div class="block signature computer">
      <div class="computer-badge">SYSTEM GENERATED</div>
      <div class="computer-text">This is a system generated invoice and does not require a physical signature.</div>
      ${name ? `<div class="sig-name">${esc(name)}</div>` : ''}
      ${ctx.company?.name ? `<div class="sig-note">${esc(ctx.company.name)}</div>` : ''}
    </div>`;
}

function buildLineItemsTable(items: LineItem[], invoice: InvoicePdfContext['invoice'], currency: string): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td>${esc(item.description)}</td>
        <td class="num">${item.qty}</td>
        <td class="num">${formatCurrency(item.rate, currency)}</td>
        <td class="num">${formatCurrency(item.amount, currency)}</td>
      </tr>`,
    )
    .join('');

  return `
    <table>
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div>Subtotal: ${formatCurrency(invoice.subtotal, currency)}</div>
      ${invoice.discount > 0 ? `<div>Discount: −${formatCurrency(invoice.discount, currency)}</div>` : ''}
      ${invoice.tax > 0 ? `<div>Tax: ${formatCurrency(invoice.tax, currency)}</div>` : ''}
      <div class="total-final">Total: ${formatCurrency(invoice.total, currency)}</div>
    </div>`;
}

async function buildInvoiceHtml(invoiceId: number): Promise<string> {
  const [invoice, company, blocks] = await Promise.all([
    getInvoice(invoiceId),
    getCompany(),
    getTemplateBlocks(),
  ]);
  if (!invoice) throw new Error('Invoice not found');

  const lineItems: LineItem[] = JSON.parse(invoice.line_items);
  const currency = company?.currency ?? 'INR';

  let logoDataUri: string | null = null;
  if (company?.logo_path) {
    const b64 = await readFileAsBase64(company.logo_path);
    if (b64) logoDataUri = `data:image/jpeg;base64,${b64}`;
  }

  let signatureDataUri: string | null = null;
  if (company?.signature_path) {
    const b64 = await readFileAsBase64(company.signature_path);
    if (b64) {
      const lower = company.signature_path.toLowerCase();
      const mime = lower.endsWith('.png') ? 'image/png' : 'image/jpeg';
      signatureDataUri = `data:${mime};base64,${b64}`;
    }
  }

  const ctx: InvoicePdfContext = {
    company,
    invoice,
    lineItems,
    logoDataUri,
    signatureDataUri,
    blocks,
  };
  const visibleBlocks = blocks.filter((b) => b.visible).sort((a, b) => a.sort_order - b.sort_order);
  const bodyBlocks = visibleBlocks.filter((b) => b.block_type !== 'signature');
  // Always show signature on PDF (computer generated by default).
  const signatureHtml = renderSignatureBlock(ctx);

  const blockHtml = bodyBlocks
    .map((b) => BLOCK_RENDERERS[b.block_type]?.(ctx) ?? '')
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #181C1B; padding: 32px; font-size: 13px; }
    .company-name { font-size: 20px; font-weight: 700; color: #005445; }
    .block { margin-bottom: 20px; }
    .block-title { font-weight: 700; color: #005445; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .meta { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #BEC9C4; padding: 8px; text-align: left; }
    th { background: #F1F4F1; color: #005445; }
    .num { text-align: right; }
    .totals { text-align: right; margin-top: 8px; }
    .total-final { font-size: 16px; font-weight: 700; color: #005445; margin-top: 6px; }
    .signature { margin-top: 48px; max-width: 260px; }
    .sig-line { border-top: 1px solid #333; width: 200px; margin: 36px 0 8px; }
    .sig-image { max-height: 64px; max-width: 220px; margin-bottom: 8px; }
    .sig-label { font-weight: 700; font-size: 12px; color: #005445; }
    .sig-name { margin-top: 4px; }
    .sig-note { font-size: 11px; color: #5F6B66; margin-top: 4px; }
    .signature.computer { border: 1px dashed #BEC9C4; padding: 14px; border-radius: 8px; max-width: 320px; background: #F8FAF9; }
    .computer-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; color: #005445; margin-bottom: 6px; }
    .computer-text { font-size: 12px; color: #3D4945; line-height: 1.4; }
  </style>
</head>
<body>
  ${blockHtml}
  ${buildLineItemsTable(lineItems, invoice, currency)}
  ${signatureHtml}
</body>
</html>`;
}

export async function generateInvoicePdf(invoiceId: number): Promise<string> {
  const html = await buildInvoiceHtml(invoiceId);
  const invoice = await getInvoice(invoiceId);
  const dir = getInvoicePdfDir();
  await ensureDir(dir);
  const fileName = `${invoice?.invoice_number.replace(/[^a-zA-Z0-9-_]/g, '_') ?? invoiceId}.pdf`;
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const dest = `${dir}${fileName}`;
  const FileSystem = await import('expo-file-system/legacy');
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function shareInvoicePdf(invoiceId: number): Promise<void> {
  const path = await generateInvoicePdf(invoiceId);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device');
  await Sharing.shareAsync(path, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function previewInvoicePdf(invoiceId: number): Promise<void> {
  const html = await buildInvoiceHtml(invoiceId);
  await Print.printAsync({ html });
}
