import React, { useState, useRef } from 'react';
import { Lock, Unlock, Upload, Trash2, Check, AlertCircle, Image as ImageIcon, ShieldCheck, X } from 'lucide-react';

interface OwnerLogoControlProps {
  appName: string;
  appIcon: string;
  appLogoUrl: string | null;
  appLogoFit: 'cover' | 'contain';
  ownerToken: string | null;
  hasOwnerPasscode: boolean;
  envManagedPasscode: boolean;
  onUnlockSuccess: (token: string) => void;
  onLockOwner: () => void;
  onLogoUpdated: (logoUrl: string | null, fit: 'cover' | 'contain') => void;
  autoOpenUnlock?: boolean;
  onDismissAutoOpen?: () => void;
}

const MAX_RAW_FILE_BYTES = 3 * 1024 * 1024; // 3MB raw upload cap before optimization

async function optimizeImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP, GIF, or SVG).');
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new Error('Image file is larger than 3MB. Please choose a smaller file.');
  }

  // Keep SVG as-is (base64 data URL) up to 400KB
  if (file.type === 'image/svg+xml') {
    if (file.size > 400 * 1024) {
      throw new Error('SVG files must be under 400KB.');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
    });
  }

  // Load raster image into canvas and resize cleanly to max 256px while preserving transparency
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 256;
      let width = img.naturalWidth || maxDim;
      let height = img.naturalHeight || maxDim;

      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png', 0.92));
    };
    img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
    img.src = dataUrl;
  });
}

export const OwnerLogoControl: React.FC<OwnerLogoControlProps> = ({
  appName,
  appIcon,
  appLogoUrl,
  appLogoFit,
  ownerToken,
  hasOwnerPasscode,
  envManagedPasscode,
  onUnlockSuccess,
  onLockOwner,
  onLogoUpdated,
  autoOpenUnlock = false,
  onDismissAutoOpen
}) => {
  const [showUnlockModal, setShowUnlockModal] = useState(autoOpenUnlock);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [draftLogoUrl, setDraftLogoUrl] = useState<string | null>(appLogoUrl);
  const [draftFit, setDraftFit] = useState<'cover' | 'contain'>(appLogoFit);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => {
    setShowUnlockModal(false);
    setPasscodeInput('');
    setConfirmPasscodeInput('');
    setUnlockError(null);
    onDismissAutoOpen?.();
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    if (passcodeInput.trim().length < 4) {
      setUnlockError('Passcode must be at least 4 characters.');
      return;
    }

    if (!hasOwnerPasscode && !envManagedPasscode && passcodeInput !== confirmPasscodeInput) {
      setUnlockError('Passcodes do not match.');
      return;
    }

    setIsUnlocking(true);
    try {
      const res = await fetch('/api/owner/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify owner passcode.');
      }
      setDraftLogoUrl(appLogoUrl);
      setDraftFit(appLogoFit);
      onUnlockSuccess(data.token);
      closeModal();
    } catch (err: any) {
      setUnlockError(err.message || 'Verification failed.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleFileSelected = async (file: File | undefined | null) => {
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const optimized = await optimizeImageFile(file);
      setDraftLogoUrl(optimized);
    } catch (err: any) {
      setUploadError(err.message || 'Could not process image.');
    }
  };

  const handleSaveLogo = async () => {
    if (!ownerToken) return;
    setIsSavingLogo(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await fetch('/api/branding/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-token': ownerToken
        },
        body: JSON.stringify({
          appLogoDataUrl: draftLogoUrl,
          appLogoFit: draftFit
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          onLockOwner();
        }
        throw new Error(data.error || 'Failed to save app logo.');
      }
      onLogoUpdated(data.appLogoDataUrl, data.appLogoFit);
      setUploadSuccess('App logo updated! All clients now see the new logo.');
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err: any) {
      setUploadError(err.message || 'Could not save logo.');
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!ownerToken) return;
    setIsSavingLogo(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await fetch('/api/branding/logo', {
        method: 'DELETE',
        headers: {
          'x-owner-token': ownerToken
        }
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          onLockOwner();
        }
        throw new Error(data.error || 'Failed to remove logo.');
      }
      setDraftLogoUrl(null);
      onLogoUpdated(null, draftFit);
      setUploadSuccess('Custom logo removed. Reverted to monogram badge.');
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Could not remove logo.');
    } finally {
      setIsSavingLogo(false);
    }
  };

  // Client View (Locked): Logo upload option is NOT rendered or accessible to clients
  if (!ownerToken) {
    return (
      <>
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowUnlockModal(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors py-1 px-2 rounded-md"
            title="Owner-only app logo administration"
          >
            <Lock className="w-3 h-3" />
            <span>Owner Access</span>
          </button>
        </div>

        {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {hasOwnerPasscode ? 'Owner Authentication' : 'Set Owner Passcode'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Restricted to app owner · Not accessible to clients
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                {!hasOwnerPasscode && !envManagedPasscode && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    Create an owner passcode to unlock custom logo image uploads and keep them locked from clients.
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {hasOwnerPasscode ? 'Enter Owner Passcode' : 'New Owner Passcode'}
                  </label>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={e => setPasscodeInput(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                    autoFocus
                    required
                  />
                </div>

                {!hasOwnerPasscode && !envManagedPasscode && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Owner Passcode
                    </label>
                    <input
                      type="password"
                      value={confirmPasscodeInput}
                      onChange={e => setConfirmPasscodeInput(e.target.value)}
                      placeholder="Re-enter passcode"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                      required
                    />
                  </div>
                )}

                {unlockError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{unlockError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUnlocking}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50"
                  >
                    {isUnlocking ? 'Verifying...' : hasOwnerPasscode ? 'Unlock Owner Panel' : 'Set Passcode & Unlock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Unlocked Owner View: Full Image Logo Uploader
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-400/30 rounded-2xl shadow-sm space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Owner-Only App Logo Customization
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Hidden from Clients
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a custom image logo for {appName}. Clients see the published logo but cannot access or modify it.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLockOwner}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock (Client View)</span>
        </button>
      </div>

      {/* Dropzone + Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upload Area */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelected(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={e => {
              handleFileSelected(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-2xs">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Click to upload or drag & drop logo image
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            PNG, JPG, WebP, GIF, or SVG (auto-optimized to crisp 256px icon)
          </p>
        </div>

        {/* Live Header Previews + Fit Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Live Header Preview
          </label>
          <div className="space-y-2.5">
            {/* Light Header Preview */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {draftLogoUrl ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <img
                    src={draftLogoUrl}
                    alt="Light preview"
                    className={`w-full h-full ${draftFit === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {appIcon || 'AB'}
                </div>
              )}
              <span className="text-sm font-bold text-slate-900 truncate">{appName}</span>
              <span className="ml-auto text-[10px] text-slate-400 font-mono">Light</span>
            </div>

            {/* Dark Header Preview */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xs">
              {draftLogoUrl ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <img
                    src={draftLogoUrl}
                    alt="Dark preview"
                    className={`w-full h-full ${draftFit === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {appIcon || 'AB'}
                </div>
              )}
              <span className="text-sm font-bold text-white truncate">{appName}</span>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">Dark</span>
            </div>
          </div>

          {/* Fit Control */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Logo Scaling:
            </span>
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setDraftFit('cover')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  draftFit === 'cover'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Fill (Cover)
              </button>
              <button
                type="button"
                onClick={() => setDraftFit('contain')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  draftFit === 'contain'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Fit (Contain)
              </button>
            </div>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {(appLogoUrl || draftLogoUrl) ? (
          <button
            type="button"
            onClick={handleRemoveLogo}
            disabled={isSavingLogo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Custom Logo</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            No custom image logo active. Using monogram badge "{appIcon}".
          </span>
        )}

        <button
          type="button"
          onClick={handleSaveLogo}
          disabled={isSavingLogo || (!draftLogoUrl && !appLogoUrl)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSavingLogo ? 'Saving...' : 'Save & Publish Logo'}</span>
        </button>
      </div>
    </div>
  );
};
