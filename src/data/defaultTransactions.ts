import { Transaction, BusinessPreset } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_01",
    date: "2026-08-12",
    description: "Client Retainer - Horizon Mobility App",
    category: "Consulting & Retainers",
    type: "income",
    amount: 6500.00,
    paymentMethod: "ACH Direct Deposit",
    status: "settled"
  },
  {
    id: "txn_02",
    date: "2026-08-20",
    description: "WeWork Office Suite - Dedicated Space Lease",
    category: "Facilities & Rent",
    type: "expense",
    amount: 1450.00,
    paymentMethod: "ACH Transfer",
    status: "settled"
  },
  {
    id: "txn_03",
    date: "2026-08-25",
    description: "Gusto Payroll & Benefits Administration",
    category: "Payroll & Compensation",
    type: "expense",
    amount: 4200.00,
    paymentMethod: "Direct Debit",
    status: "settled"
  },
  {
    id: "txn_04",
    date: "2026-09-04",
    description: "Website Redesign Milestone 2 - Nordic Goods",
    category: "Project Billing",
    type: "income",
    amount: 3800.00,
    paymentMethod: "Wire Transfer",
    status: "settled"
  },
  {
    id: "txn_05",
    date: "2026-09-15",
    description: "Quarterly Commercial General Liability Insurance",
    category: "Insurance & Legal",
    type: "expense",
    amount: 620.00,
    paymentMethod: "Corporate Visa",
    status: "settled"
  },
  {
    id: "txn_06",
    date: "2026-09-22",
    description: "Dell Ultrasharp Monitors & Ergonomic Hardware",
    category: "Equipment & Hardware",
    type: "expense",
    amount: 875.40,
    paymentMethod: "Corporate Card",
    status: "settled"
  },
  {
    id: "txn_07",
    date: "2026-09-28",
    description: "Stripe Online Checkout Payout (Digital Assets)",
    category: "Product Sales",
    type: "income",
    amount: 1940.25,
    paymentMethod: "Stripe Payout",
    status: "settled"
  },
  {
    id: "txn_08",
    date: "2026-10-04",
    description: "Google Workspace & Cloud Infrastructure",
    category: "Software & Cloud",
    type: "expense",
    amount: 248.50,
    paymentMethod: "Corporate Visa",
    status: "settled"
  },
  {
    id: "txn_09",
    date: "2026-10-18",
    description: "AdRoll & Meta Retargeting Ad Campaign",
    category: "Marketing & Advertising",
    type: "expense",
    amount: 410.00,
    paymentMethod: "Corporate Visa",
    status: "settled"
  },
  {
    id: "txn_10",
    date: "2026-10-28",
    description: "Strategy Sprint Invoice - Beacon Logistics",
    category: "Consulting & Retainers",
    type: "income",
    amount: 4750.00,
    paymentMethod: "ACH Direct Deposit",
    status: "settled"
  }
];

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: "tech-agency",
    name: "Digital Studio & Consultancy",
    industry: "B2B Professional Services",
    description: "Multi-month consulting retainers, cloud infrastructure, team payroll, and corporate hardware.",
    transactions: INITIAL_TRANSACTIONS
  },
  {
    id: "cafe-roastery",
    name: "Artisan Coffee Roastery & Cafe",
    industry: "Food & Beverage Retail",
    description: "Daily counter sales, wholesale coffee beans, espresso machine service, milk delivery, and barista payroll across multiple months.",
    transactions: [
      { id: "txn_01", date: "2026-08-08", description: "Square POS Summer Counter Sales", category: "Retail Sales", type: "income", amount: 3420.50, paymentMethod: "Square Payout", status: "settled" },
      { id: "txn_02", date: "2026-08-16", description: "Green Coffee Bean Import - Ethiopian Yirgacheffe", category: "Raw Materials", type: "expense", amount: 1650.00, paymentMethod: "Wire Transfer", status: "settled" },
      { id: "txn_03", date: "2026-08-24", description: "Barista Team Bi-Weekly Payroll & Tips", category: "Payroll & Labor", type: "expense", amount: 3100.00, paymentMethod: "Gusto ACH", status: "settled" },
      { id: "txn_04", date: "2026-09-06", description: "Wholesale Order - Westside Boutique Hotels", category: "Wholesale Accounts", type: "income", amount: 2890.00, paymentMethod: "ACH Direct Deposit", status: "settled" },
      { id: "txn_05", date: "2026-09-14", description: "Commercial La Marzocco Machine Calibration", category: "Repairs & Maintenance", type: "expense", amount: 380.00, paymentMethod: "Corporate Debit", status: "settled" },
      { id: "txn_06", date: "2026-09-20", description: "Eco Compostable Takeout Cups & Lids (5,000 units)", category: "Packaging & Supplies", type: "expense", amount: 740.00, paymentMethod: "Corporate Visa", status: "settled" },
      { id: "txn_07", date: "2026-09-27", description: "Saturday Farmers Market Pop-Up Revenue", category: "Retail Sales", type: "income", amount: 1285.00, paymentMethod: "Zettle POS", status: "settled" },
      { id: "txn_08", date: "2026-10-05", description: "Organic Oat & Whole Milk Bi-Weekly Delivery", category: "Kitchen Supplies", type: "expense", amount: 512.40, paymentMethod: "Direct Vendor Debit", status: "settled" },
      { id: "txn_09", date: "2026-10-16", description: "Commercial Gas & City Water Utilities", category: "Utilities", type: "expense", amount: 625.30, paymentMethod: "Utility Auto-Pay", status: "settled" },
      { id: "txn_10", date: "2026-10-25", description: "Corporate Cold Brew Keg Subscription Delivery", category: "Wholesale Accounts", type: "income", amount: 1450.00, paymentMethod: "Credit Card Payout", status: "settled" }
    ]
  },
  {
    id: "ecommerce-store",
    name: "Modern Home Goods E-Commerce",
    industry: "Consumer Retail & D2C",
    description: "Shopify payouts, third-party logistics warehousing, Meta ad customer acquisition, and inventory restock across August-October.",
    transactions: [
      { id: "txn_01", date: "2026-08-10", description: "Shopify Payments August Sales Settlement", category: "D2C Online Sales", type: "income", amount: 8940.00, paymentMethod: "Shopify Balance", status: "settled" },
      { id: "txn_02", date: "2026-08-18", description: "ShipBob 3PL Warehousing & Order Pick/Pack", category: "Fulfillment & Freight", type: "expense", amount: 1420.80, paymentMethod: "ACH Direct Debit", status: "settled" },
      { id: "txn_03", date: "2026-08-26", description: "Ceramic Tableware Restock Purchase Order", category: "Inventory & Goods", type: "expense", amount: 3600.00, paymentMethod: "International Wire", status: "settled" },
      { id: "txn_04", date: "2026-09-08", description: "Amazon Brand Store Marketplace Payout", category: "Marketplace Sales", type: "income", amount: 4120.50, paymentMethod: "Amazon Direct Deposit", status: "settled" },
      { id: "txn_05", date: "2026-09-17", description: "Meta Ads Customer Acquisition Campaign", category: "Performance Marketing", type: "expense", amount: 1850.00, paymentMethod: "Amex Business", status: "settled" },
      { id: "txn_06", date: "2026-09-23", description: "Custom Embossed Shipping Boxes & Kraft Tape", category: "Packaging Supplies", type: "expense", amount: 685.20, paymentMethod: "Corporate Card", status: "settled" },
      { id: "txn_07", date: "2026-10-06", description: "Wholesale Stockist Invoice - Austin Design Co", category: "Wholesale Revenue", type: "income", amount: 2650.00, paymentMethod: "ACH Direct Deposit", status: "settled" },
      { id: "txn_08", date: "2026-10-14", description: "Klaviyo Email Marketing & SMS Automation SaaS", category: "Software & SaaS", type: "expense", amount: 295.00, paymentMethod: "Amex Business", status: "settled" },
      { id: "txn_09", date: "2026-10-21", description: "Google Ads High-Intent Search Campaign", category: "Performance Marketing", type: "expense", amount: 920.00, paymentMethod: "Corporate Visa", status: "settled" },
      { id: "txn_10", date: "2026-10-29", description: "TikTok Shop Merchant Direct Deposit", category: "D2C Online Sales", type: "income", amount: 1845.00, paymentMethod: "Direct Deposit", status: "settled" }
    ]
  },
  {
    id: "trades-contractor",
    name: "Summit HVAC & Mechanical Services",
    industry: "Commercial & Residential Services",
    description: "Commercial heat pump installation, emergency repairs, wholesale parts, and fleet fuel across late summer into autumn.",
    transactions: [
      { id: "txn_01", date: "2026-08-05", description: "Commercial Rooftop HVAC Unit Installation (Job #402)", category: "Commercial Contracting", type: "income", amount: 9850.00, paymentMethod: "Commercial Check", status: "settled" },
      { id: "txn_02", date: "2026-08-14", description: "Ferguson Wholesale Supply - Copper Piping & Valves", category: "Job Materials & Parts", type: "expense", amount: 2150.40, paymentMethod: "Vendor Net-30", status: "settled" },
      { id: "txn_03", date: "2026-08-22", description: "Technician Overtime & Bi-Weekly Payroll", category: "Field Labor", type: "expense", amount: 4500.00, paymentMethod: "Direct Deposit", status: "settled" },
      { id: "txn_04", date: "2026-09-07", description: "Residential Heat Pump Emergency Repair Call", category: "Residential Service", type: "income", amount: 680.00, paymentMethod: "HouseCall Pro Credit Card", status: "settled" },
      { id: "txn_05", date: "2026-09-16", description: "Workers Comp & Commercial Auto Insurance", category: "Insurance & Compliance", type: "expense", amount: 1120.00, paymentMethod: "ACH Transfer", status: "settled" },
      { id: "txn_06", date: "2026-09-24", description: "Fleet Commercial Van Fuel & Toll Tag Pass", category: "Fleet & Fuel", type: "expense", amount: 485.60, paymentMethod: "WEX Fleet Card", status: "settled" },
      { id: "txn_07", date: "2026-10-03", description: "Fall Furnace Tune-up & Inspection Package", category: "Preventative Maintenance", type: "income", amount: 2280.00, paymentMethod: "Credit Card", status: "settled" },
      { id: "txn_08", date: "2026-10-12", description: "Refrigerant Recovery Machine & Digital Manifold Set", category: "Tools & Equipment", type: "expense", amount: 840.00, paymentMethod: "Commercial Visa", status: "settled" },
      { id: "txn_09", date: "2026-10-20", description: "Restaurant Ductwork Replacement & Balancing", category: "Commercial Contracting", type: "income", amount: 4350.00, paymentMethod: "ACH Direct Deposit", status: "settled" },
      { id: "txn_10", date: "2026-10-30", description: "Shop Storage Facility & Dumpster Service", category: "Facilities", type: "expense", amount: 530.00, paymentMethod: "ACH Transfer", status: "settled" }
    ]
  },
  {
    id: "real-estate",
    name: "PrimeKey Real Estate & Property Mgmt",
    industry: "Real Estate & Property",
    description: "Tenant monthly rent collections, property maintenance contractor invoices, property tax escrow, and management fees.",
    transactions: [
      { id: "txn_01", date: "2026-08-01", description: "Oakridge Apartments Unit 4B Monthly Rent", category: "Rental Revenue", type: "income", amount: 2450.00, paymentMethod: "ACH Transfer", status: "settled" },
      { id: "txn_02", date: "2026-08-10", description: "Emergency Plumbing Repair - Unit 2A", category: "Property Maintenance", type: "expense", amount: 410.00, paymentMethod: "Check", status: "settled" },
      { id: "txn_03", date: "2026-08-15", description: "Commercial Property Insurance Premium", category: "Insurance", type: "expense", amount: 780.00, paymentMethod: "Wire Transfer", status: "settled" },
      { id: "txn_04", date: "2026-09-01", description: "Maple Street Retail Suite Lease Income", category: "Commercial Lease", type: "income", amount: 5200.00, paymentMethod: "Wire Transfer", status: "settled" },
      { id: "txn_05", date: "2026-09-12", description: "Lawn Care & Landscaping Maintenance", category: "Property Maintenance", type: "expense", amount: 320.00, paymentMethod: "Corporate Card", status: "settled" },
      { id: "txn_06", date: "2026-10-01", description: "Oakridge Apartments Unit 4B Monthly Rent", category: "Rental Revenue", type: "income", amount: 2450.00, paymentMethod: "ACH Transfer", status: "settled" },
      { id: "txn_07", date: "2026-10-15", description: "Municipal Property Tax Semi-Annual Escrow", category: "Property Taxes", type: "expense", amount: 3100.00, paymentMethod: "Wire Transfer", status: "settled" }
    ]
  },
  {
    id: "healthcare",
    name: "Apex Family Medical Practice",
    industry: "Healthcare & Clinical Services",
    description: "Patient consultation fees, insurance claims payouts, medical supplies restock, and clinical equipment leasing.",
    transactions: [
      { id: "txn_01", date: "2026-08-04", description: "BlueCross BlueShield Insurance Batch Payout", category: "Insurance Reimbursements", type: "income", amount: 14200.00, paymentMethod: "ACH Direct Deposit", status: "settled" },
      { id: "txn_02", date: "2026-08-15", description: "Medline Scientific PPE & Syringe Bulk Restock", category: "Medical Supplies", type: "expense", amount: 1850.00, paymentMethod: "Corporate Card", status: "settled" },
      { id: "txn_03", date: "2026-08-28", description: "Philips Ultrasound Machine Monthly Lease", category: "Equipment Lease", type: "expense", amount: 2200.00, paymentMethod: "ACH Direct Debit", status: "settled" },
      { id: "txn_04", date: "2026-09-10", description: "Direct Patient Co-Pay & Consultation Fees", category: "Patient Fees", type: "income", amount: 6400.00, paymentMethod: "Square Terminal", status: "settled" },
      { id: "txn_05", date: "2026-09-22", description: "Medical Malpractice Liability Insurance", category: "Insurance & Legal", type: "expense", amount: 1450.00, paymentMethod: "Wire Transfer", status: "settled" },
      { id: "txn_06", date: "2026-10-08", description: "Medicare & Medicaid Remittance Advice Payout", category: "Insurance Reimbursements", type: "income", amount: 11800.00, paymentMethod: "ACH Direct Deposit", status: "settled" }
    ]
  },
  {
    id: "creative-studio",
    name: "Vanguard Creative & Design Studio",
    industry: "Creative Services & Agency",
    description: "Brand identity design retainers, UI/UX prototyping milestones, font & stock asset licensing, and freelance contractor fees.",
    transactions: [
      { id: "txn_01", date: "2026-08-06", description: "Brand Identity System - Apex FinTech", category: "Design Services", type: "income", amount: 7500.00, paymentMethod: "Wire Transfer", status: "settled" },
      { id: "txn_02", date: "2026-08-19", description: "Figma, Adobe Creative Cloud & Font Licences", category: "Software & SaaS", type: "expense", amount: 185.00, paymentMethod: "Corporate Visa", status: "settled" },
      { id: "txn_03", date: "2026-09-02", description: "Motion Graphics Subcontractor - 3D Animation", category: "Subcontractor Labor", type: "expense", amount: 2400.00, paymentMethod: "ACH Transfer", status: "settled" },
      { id: "txn_04", date: "2026-09-18", description: "Mobile App UI/UX Redesign - Nova Health", category: "Design Services", type: "income", amount: 6200.00, paymentMethod: "ACH Direct Deposit", status: "settled" },
      { id: "txn_05", date: "2026-10-10", description: "Annual D&AD Design Awards Submission Entry", category: "Marketing & Awards", type: "expense", amount: 350.00, paymentMethod: "Corporate Card", status: "settled" }
    ]
  },
  {
    id: "freelance-solo",
    name: "Solo Expert & Independent Consultant",
    industry: "Freelance & Solo Practice",
    description: "Hourly advisory engagements, home office allocation, self-employment software, and professional development.",
    transactions: [
      { id: "txn_01", date: "2026-08-10", description: "Advisory Sprint - Cloud Migration Strategy", category: "Advisory Services", type: "income", amount: 3500.00, paymentMethod: "Stripe Payout", status: "settled" },
      { id: "txn_02", date: "2026-08-25", description: "Home Office High-Speed Fiber Internet & Utilities", category: "Office Expenses", type: "expense", amount: 125.00, paymentMethod: "Auto-Debit", status: "settled" },
      { id: "txn_03", date: "2026-09-15", description: "Quarterly Estimated Self-Employment Tax Payment", category: "Taxes", type: "expense", amount: 1200.00, paymentMethod: "IRS Direct Pay", status: "settled" },
      { id: "txn_04", date: "2026-10-01", description: "Technical Writing & Whitepaper Deliverable", category: "Advisory Services", type: "income", amount: 2800.00, paymentMethod: "ACH Direct Deposit", status: "settled" }
    ]
  }
];
