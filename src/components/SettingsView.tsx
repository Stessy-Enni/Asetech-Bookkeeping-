import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Check, Sparkles, Shield, Database, Palette, Building2, Briefcase, FileText, Tags, PlusCircle, BookOpen } from 'lucide-react';
import { CurrencyConfig, SUPPORTED_CURRENCIES, BusinessProfile, BusinessPreset, Transaction } from '../types';
import { OwnerLogoControl } from './OwnerLogoControl';

interface SettingsViewProps {
  appName: string;
  onUpdateAppName: (name: string) => void;
  appIcon: string;
  onUpdateAppIcon: (icon: string) => void;
  selectedCurrency: CurrencyConfig;
  onCurrencyChange: (currency: CurrencyConfig) => void;
  transactionCount: number;
  onResetData: () => void;
  onOpenCustomCurrency?: () => void;
  businessProfile: BusinessProfile;
  onUpdateBusinessProfile: (profile: BusinessProfile) => void;
  presets: BusinessPreset[];
  activePresetId: string;
  onSelectPreset: (preset: BusinessPreset) => void;
  onAddCustomPreset: (preset: BusinessPreset) => void;
  categories: string[];
  onAddCategory: (categoryName: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  currentTransactions: Transaction[];
  onOpenEvalModal: () => void;
  appLogoUrl: string | null;
  appLogoFit: 'cover' | 'contain';
  ownerToken: string | null;
  hasOwnerPasscode: boolean;
  envManagedPasscode: boolean;
  onUnlockOwner: (token: string) => void;
  onLockOwner: () => void;
  onLogoUpdated: (logoUrl: string | null, fit: 'cover' | 'contain') => void;
  autoOpenOwnerUnlock?: boolean;
  onDismissAutoOpenOwnerUnlock?: () => void;
}

const AVAILABLE_ICONS = ['AB', 'BK', 'FS', '💼', '📊', '💰', '🏢', '⚡', '🚀', '📈'];

const INDUSTRY_OPTIONS = [
  'Technology & Software (SaaS)',
  'Retail & E-Commerce (D2C)',
  'Food & Beverage / Hospitality',
  'Construction & Trades',
  'Real Estate & Property Mgmt',
  'Healthcare & Medical Practice',
  'Creative Services & Agency',
  'Freelance & Solo Practice',
  'Non-Profit Organization',
  'General Small Business'
];

const LEGAL_ENTITIES = [
  'LLC (Limited Liability Company)',
  'Corporation (Inc. / C-Corp / S-Corp)',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit Organization',
  'Independent Contractor / Freelancer'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  appName,
  onUpdateAppName,
  appIcon,
  onUpdateAppIcon,
  selectedCurrency,
  onCurrencyChange,
  transactionCount,
  onResetData,
  onOpenCustomCurrency,
  businessProfile,
  onUpdateBusinessProfile,
  presets,
  activePresetId,
  onSelectPreset,
  onAddCustomPreset,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  currentTransactions,
  onOpenEvalModal,
  appLogoUrl,
  appLogoFit,
  ownerToken,
  hasOwnerPasscode,
  envManagedPasscode,
  onUnlockOwner,
  onLockOwner,
  onLogoUpdated,
  autoOpenOwnerUnlock,
  onDismissAutoOpenOwnerUnlock
}) => {
  const [nameInput, setNameInput] = useState(appName);
  const [iconInput, setIconInput] = useState(appIcon);
  
  // Business Profile local state
  const [profileForm, setProfileForm] = useState<BusinessProfile>(businessProfile);
  
  // Custom Preset Creation local state
  const [showCustomPresetForm, setShowCustomPresetForm] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');
  const [customPresetIndustry, setCustomPresetIndustry] = useState('');
  const [customPresetDesc, setCustomPresetDesc] = useState('');

  // Category management local state
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [renameCategoryInput, setRenameCategoryInput] = useState('');

  const [savedToast, setSavedToast] = useState(false);
  const [profileToast, setProfileToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateAppName(nameInput.trim());
    }
    if (iconInput.trim()) {
      onUpdateAppIcon(iconInput.trim());
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusinessProfile(profileForm);
    setProfileToast(true);
    setTimeout(() => setProfileToast(false), 2500);
  };

  const handleCreateCustomArchetype = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPresetName.trim()) return;

    const newPreset: BusinessPreset = {
      id: `custom_preset_${Date.now()}`,
      name: customPresetName.trim(),
      industry: customPresetIndustry.trim() || 'Custom Small Business',
      description: customPresetDesc.trim() || 'User-defined business archetype and chart of accounts.',
      transactions: currentTransactions.length > 0 ? currentTransactions : []
    };

    onAddCustomPreset(newPreset);
    setCustomPresetName('');
    setCustomPresetIndustry('');
    setCustomPresetDesc('');
    setShowCustomPresetForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Evaluation & Sharing Summary Template Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluation & Sharing Summary Template
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate a downloadable summary of the app, core features, functionalities, and operating procedure for evaluation and sharing.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Export a clean Markdown or text summary template to share with evaluators and stakeholders.
          </span>
          <button
            type="button"
            onClick={onOpenEvalModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Evaluation Summary Template</span>
          </button>
        </div>
      </div>

      {/* Small Business Profile & Industry Customization */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Small Business Profile & Industry Setup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize Asetech Bookkeeping for your specific business type, tax ID, entity, and financial reporting.
            </p>
          </div>
        </div>

        {/* Business Archetype Quick Selector */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Business Archetype & Tailored Chart of Accounts ({presets.length} options)
            </label>
            <button
              type="button"
              onClick={() => setShowCustomPresetForm(!showCustomPresetForm)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showCustomPresetForm ? 'Cancel Manual Addition' : 'Add Custom Archetype'}</span>
            </button>
          </div>

          {showCustomPresetForm && (
            <form onSubmit={handleCreateCustomArchetype} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Create Custom Business Archetype</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={customPresetName}
                  onChange={e => setCustomPresetName(e.target.value)}
                  placeholder="Archetype Name (e.g., Boutique Hotel & Spa)"
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
                <input
                  type="text"
                  value={customPresetIndustry}
                  onChange={e => setCustomPresetIndustry(e.target.value)}
                  placeholder="Industry (e.g., Hospitality & Leisure)"
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <input
                type="text"
                value={customPresetDesc}
                onChange={e => setCustomPresetDesc(e.target.value)}
                placeholder="Description of the business model and chart of accounts"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Save & Apply Custom Archetype
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {presets.map(p => {
              const isActive = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(p);
                    setProfileForm(prev => ({ ...prev, industry: p.name, name: prev.name || p.name }));
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold truncate">{p.name}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>
                  <span className={`text-[11px] line-clamp-2 ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {p.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Legal Business Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="e.g., Summit Mechanical Services LLC"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Legal Entity Type
              </label>
              <select
                value={profileForm.legalEntity}
                onChange={e => setProfileForm({ ...profileForm, legalEntity: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {LEGAL_ENTITIES.map(ent => (
                  <option key={ent} value={ent} className="dark:bg-slate-800">{ent}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Industry / Business Sector
              </label>
              <select
                value={profileForm.industry}
                onChange={e => setProfileForm({ ...profileForm, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {INDUSTRY_OPTIONS.map(ind => (
                  <option key={ind} value={ind} className="dark:bg-slate-800">{ind}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Tax ID / EIN / VAT Number
              </label>
              <input
                type="text"
                value={profileForm.taxId}
                onChange={e => setProfileForm({ ...profileForm, taxId: e.target.value })}
                placeholder="e.g., EIN 45-8923412"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Business Contact Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="billing@yourbusiness.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Phone Number
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Business Address
            </label>
            <input
              type="text"
              value={profileForm.address}
              onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
              placeholder="e.g., 100 Innovation Way, Suite 400, Austin, TX 78701"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Business profile details automatically appear on generated financial report headers and PDF exports.
            </span>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Business Profile</span>
            </button>
          </div>

          {profileToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Business profile updated successfully!</span>
            </div>
          )}
        </form>
      </div>

      {/* Category & Taxonomy Management */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category & Ledger Taxonomy Customization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add new categories, rename existing categories across all transactions, or remove unneeded categories.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryInput}
              onChange={e => setNewCategoryInput(e.target.value)}
              placeholder="New category name (e.g., Software Subscriptions)"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newCategoryInput.trim()) {
                    onAddCategory(newCategoryInput.trim());
                    setNewCategoryInput('');
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (newCategoryInput.trim()) {
                  onAddCategory(newCategoryInput.trim());
                  setNewCategoryInput('');
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              Add Category
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map(cat => {
              const isEditing = editingCategory === cat;
              return (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={renameCategoryInput}
                      onChange={e => setRenameCategoryInput(e.target.value)}
                      className="w-32 px-2 py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (renameCategoryInput.trim() && renameCategoryInput !== cat) {
                            onRenameCategory(cat, renameCategoryInput.trim());
                          }
                          setEditingCategory(null);
                        } else if (e.key === 'Escape') {
                          setEditingCategory(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cat}</span>
                  )}

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (renameCategoryInput.trim() && renameCategoryInput !== cat) {
                          onRenameCategory(cat, renameCategoryInput.trim());
                        }
                        setEditingCategory(null);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px]"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setRenameCategoryInput(cat);
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px]"
                      title="Rename category"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat)}
                    className="text-rose-400 hover:text-rose-700 ml-1 text-xs font-bold"
                    title="Delete category"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Application Branding & Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Application Branding & Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your bookkeeping app name, icon badge, default currency, and local data persistence.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-6">
          {/* App Name Setting */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Application Name (Wordmark)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g., Asetech Bookkeeping"
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                maxLength={40}
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-2xs whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Branding</span>
              </button>
            </div>
          </div>

          {/* App Icon / Badge Setting */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Application Icon / Badge
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {AVAILABLE_ICONS.map(ic => {
                const isSelected = iconInput === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => {
                      setIconInput(ic);
                      onUpdateAppIcon(ic);
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm ring-2 ring-slate-900 dark:ring-slate-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Currency */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Primary Financial Currency
            </label>
            <div className="max-w-xs space-y-2">
              <select
                value={SUPPORTED_CURRENCIES.some(c => c.code === selectedCurrency.code) ? selectedCurrency.code : 'CUSTOM'}
                onChange={e => {
                  if (e.target.value === 'CUSTOM') {
                    onOpenCustomCurrency?.();
                  } else {
                    const match = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                    if (match) onCurrencyChange(match);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="dark:bg-slate-800">
                    {c.code === 'CUSTOM' && !SUPPORTED_CURRENCIES.some(s => s.code === selectedCurrency.code)
                      ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
                      : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Management & Reset */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Data Management & Persistence
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-medium text-slate-900 dark:text-white block">
                  Local Storage Dataset ({transactionCount} active records)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Transactions, custom archetypes, and ledger edits are automatically persisted.
                </span>
              </div>

              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Data</span>
                </button>
              )}
            </div>
          </div>

          {savedToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Branding settings saved successfully!</span>
            </div>
          )}
        </form>
      </div>

      {/* Owner-Only Restricted App Logo Image Upload (Not accessible to clients) */}
      <OwnerLogoControl
        appName={appName}
        appIcon={appIcon}
        appLogoUrl={appLogoUrl}
        appLogoFit={appLogoFit}
        ownerToken={ownerToken}
        hasOwnerPasscode={hasOwnerPasscode}
        envManagedPasscode={envManagedPasscode}
        onUnlockSuccess={onUnlockOwner}
        onLockOwner={onLockOwner}
        onLogoUpdated={onLogoUpdated}
        autoOpenUnlock={autoOpenOwnerUnlock}
        onDismissAutoOpen={onDismissAutoOpenOwnerUnlock}
      />
    </div>
  );
};
