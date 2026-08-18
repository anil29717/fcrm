export const CURRENCY_OPTIONS = [
  { label: 'INR — Indian Rupee', value: 'INR', icon: 'currency-rupee' as const },
  { label: 'USD — US Dollar', value: 'USD', icon: 'attach-money' as const },
  { label: 'EUR — Euro', value: 'EUR', icon: 'euro' as const },
  { label: 'GBP — British Pound', value: 'GBP', icon: 'currency-pound' as const },
  { label: 'Other', value: 'OTHER', icon: 'payments' as const },
];

export const BUSINESS_TYPE_OPTIONS = [
  { label: 'Freelancer', value: 'freelancer', icon: 'person' as const },
  { label: 'Agency', value: 'agency', icon: 'groups' as const },
  { label: 'Studio', value: 'studio', icon: 'palette' as const },
  { label: 'Consultant', value: 'consultant', icon: 'support-agent' as const },
];

export const INDUSTRY_OPTIONS = [
  { label: 'Web Development', value: 'web_dev', icon: 'language' as const },
  { label: 'Design', value: 'design', icon: 'brush' as const },
  { label: 'Marketing', value: 'marketing', icon: 'campaign' as const },
  { label: 'Writing', value: 'writing', icon: 'edit' as const },
  { label: 'Photography', value: 'photography', icon: 'photo-camera' as const },
  { label: 'Video', value: 'video', icon: 'videocam' as const },
  { label: 'Other', value: 'other', icon: 'work' as const },
];

export const FINANCIAL_YEAR_OPTIONS = [
  { label: 'January', value: 1, icon: 'calendar-today' as const },
  { label: 'April', value: 4, icon: 'calendar-today' as const },
];

export const PAYMENT_TERMS_OPTIONS = [
  { label: 'Due on Receipt', value: 'due_on_receipt', icon: 'receipt' as const },
  { label: 'Net 7', value: 'net_7', icon: 'schedule' as const },
  { label: 'Net 15', value: 'net_15', icon: 'schedule' as const },
  { label: 'Net 30', value: 'net_30', icon: 'schedule' as const },
  { label: 'Custom', value: 'custom', icon: 'edit' as const },
];

export const INVOICE_FORMAT_OPTIONS = [
  { label: '{prefix}-{FY}-{seq}', value: '{prefix}-{FY}-{seq}', icon: 'tag' as const },
  { label: '{prefix}-{seq}', value: '{prefix}-{seq}', icon: 'tag' as const },
  { label: 'Custom', value: 'custom', icon: 'edit' as const },
];

export const INVOICE_RESET_OPTIONS = [
  { label: 'Never', value: 'never', icon: 'block' as const },
  { label: 'Every Financial Year', value: 'financial_year', icon: 'event' as const },
];

export const CLIENT_TYPE_OPTIONS = [
  { label: 'Individual', value: 'individual', icon: 'person' as const },
  { label: 'Business', value: 'business', icon: 'business' as const },
  { label: 'Agency', value: 'agency', icon: 'groups' as const },
];

export const LEAD_SOURCE_OPTIONS = [
  { label: 'Referral', value: 'referral', icon: 'people' as const },
  { label: 'Upwork', value: 'upwork', icon: 'work' as const },
  { label: 'LinkedIn', value: 'linkedin', icon: 'link' as const },
  { label: 'Direct', value: 'direct', icon: 'call' as const },
  { label: 'Cold Outreach', value: 'cold_outreach', icon: 'email' as const },
  { label: 'Other', value: 'other', icon: 'more-horiz' as const },
];

export const CLIENT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active', icon: 'check-circle' as const },
  { label: 'Inactive', value: 'inactive', icon: 'pause-circle' as const },
  { label: 'Prospect', value: 'prospect', icon: 'star' as const },
];

export const CLIENT_TAG_OPTIONS = [
  { label: 'VIP', value: 'vip', icon: 'star' as const },
  { label: 'Recurring', value: 'recurring', icon: 'repeat' as const },
  { label: 'One-time', value: 'one_time', icon: 'looks-one' as const },
];

export const PROJECT_TYPE_OPTIONS = [
  { label: 'Web Development', value: 'Web Development', icon: 'language' as const },
  { label: 'Mobile App', value: 'Mobile App', icon: 'smartphone' as const },
  { label: 'UI/UX Design', value: 'UI/UX Design', icon: 'palette' as const },
  { label: 'Branding', value: 'Branding', icon: 'brush' as const },
  { label: 'Content', value: 'Content', icon: 'article' as const },
  { label: 'Marketing', value: 'Marketing', icon: 'campaign' as const },
  { label: 'Consulting', value: 'Consulting', icon: 'support-agent' as const },
  { label: 'Other', value: 'Other', icon: 'work' as const },
];

export const PROJECT_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low', icon: 'arrow-downward' as const },
  { label: 'Medium', value: 'medium', icon: 'remove' as const },
  { label: 'High', value: 'high', icon: 'arrow-upward' as const },
  { label: 'Urgent', value: 'urgent', icon: 'priority-high' as const },
];

export const BILLING_TYPE_OPTIONS = [
  { label: 'Fixed Price', value: 'fixed', icon: 'payments' as const },
  { label: 'Hourly', value: 'hourly', icon: 'schedule' as const },
  { label: 'Retainer', value: 'retainer', icon: 'autorenew' as const },
];

export const PROJECT_STATUS_OPTIONS = [
  { label: 'Not Started', value: 'not_started', icon: 'radio-button-unchecked' as const },
  { label: 'Active', value: 'active', icon: 'play-circle' as const },
  { label: 'On Hold', value: 'on_hold', icon: 'pause-circle' as const },
  { label: 'Completed', value: 'completed', icon: 'check-circle' as const },
  { label: 'Cancelled', value: 'cancelled', icon: 'cancel' as const },
];

export const PHASE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', icon: 'schedule' as const },
  { label: 'In Progress', value: 'in_progress', icon: 'autorenew' as const },
  { label: 'Completed', value: 'completed', icon: 'check-circle' as const },
  { label: 'On Hold', value: 'on_hold', icon: 'pause-circle' as const },
];

export const ENVIRONMENT_OPTIONS = [
  { label: 'Development', value: 'development', icon: 'code' as const },
  { label: 'Staging', value: 'staging', icon: 'science' as const },
  { label: 'Production', value: 'production', icon: 'cloud' as const },
];

export const DOCUMENT_CATEGORY_OPTIONS = [
  { label: 'Contract', value: 'contract', icon: 'description' as const },
  { label: 'Brief', value: 'brief', icon: 'article' as const },
  { label: 'Design File', value: 'design', icon: 'image' as const },
  { label: 'Invoice Copy', value: 'invoice', icon: 'receipt' as const },
  { label: 'Legal', value: 'legal', icon: 'gavel' as const },
  { label: 'Other', value: 'other', icon: 'folder' as const },
];

export const COMPLIANCE_DOC_OPTIONS = [
  { label: 'MSME Certificate', value: 'msme', icon: 'verified' as const },
  { label: 'GST Certificate', value: 'gst', icon: 'receipt-long' as const },
  { label: 'PAN', value: 'pan', icon: 'badge' as const },
  { label: 'Other', value: 'other', icon: 'folder' as const },
];

export const MILESTONE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', icon: 'schedule' as const },
  { label: 'Invoiced', value: 'invoiced', icon: 'receipt' as const },
  { label: 'Paid', value: 'paid', icon: 'check-circle' as const },
];

export const CHANGE_REQUEST_STATUS_OPTIONS = [
  { label: 'Pending Approval', value: 'pending_approval', icon: 'hourglass-empty' as const },
  { label: 'Approved', value: 'approved', icon: 'thumb-up' as const },
  { label: 'Invoiced', value: 'invoiced', icon: 'receipt' as const },
];

export const INVOICE_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft', icon: 'edit' as const },
  { label: 'Sent', value: 'sent', icon: 'send' as const },
  { label: 'Paid', value: 'paid', icon: 'check-circle' as const },
  { label: 'Partially Paid', value: 'partial', icon: 'payments' as const },
  { label: 'Overdue', value: 'overdue', icon: 'warning' as const },
  { label: 'Cancelled', value: 'cancelled', icon: 'cancel' as const },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Bank Transfer', value: 'bank_transfer', icon: 'account-balance' as const },
  { label: 'UPI', value: 'upi', icon: 'qr-code' as const },
  { label: 'PayPal', value: 'paypal', icon: 'payment' as const },
  { label: 'Cash', value: 'cash', icon: 'money' as const },
  { label: 'Other', value: 'other', icon: 'more-horiz' as const },
];

export const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Amount (₹)', value: 'amount', icon: 'currency-rupee' as const },
  { label: 'Percentage (%)', value: 'percent', icon: 'percent' as const },
];

export const SIGNATURE_MODE_OPTIONS = [
  { label: 'Authorized signature', value: 'authorized', icon: 'draw' as const },
  { label: 'Computer generated', value: 'computer_generated', icon: 'computer' as const },
];

export const SERVICE_PAYMENT_STATUS_OPTIONS = [
  { label: 'Unpaid', value: 'unpaid', icon: 'schedule' as const },
  { label: 'Paid', value: 'paid', icon: 'check-circle' as const },
  { label: 'Partial', value: 'partial', icon: 'payments' as const },
];
