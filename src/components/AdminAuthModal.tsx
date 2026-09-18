import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Delete,
  Sparkles,
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: 'km' | 'en';
  currentPasscode: string;
  onUpdatePasscode: (newPasscode: string) => void;
  mode?: 'verify' | 'change';
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
  currentPasscode,
  onUpdatePasscode,
  mode = 'verify',
}) => {
  const [activeTab, setActiveTab] = useState<'verify' | 'change'>(mode);
  const [enteredPin, setEnteredPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Change password fields
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeError, setChangeError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
      setEnteredPin('');
      setErrorMsg('');
      setSuccessNotice('');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setChangeError('');
    }
  }, [isOpen, mode]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (enteredPin.length < 12) {
      setEnteredPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setEnteredPin('');
  };

  const triggerShake = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredPin.trim()) {
      triggerShake(
        lang === 'km'
          ? 'សូមបញ្ចូលលេខកូដសម្ងាត់!'
          : 'Please enter the secret passcode!'
      );
      return;
    }

    if (enteredPin.trim() === currentPasscode) {
      setSuccessNotice(
        lang === 'km'
          ? 'ផ្ទៀងផ្ទាត់ត្រឹមត្រូវ! កំពុងចូល...'
          : 'Passcode verified! Entering...'
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } else {
      triggerShake(
        lang === 'km'
          ? 'លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ! សូមព្យាយាមម្តងទៀត។'
          : 'Incorrect passcode! Please try again.'
      );
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (oldPin !== currentPasscode) {
      setChangeError(
        lang === 'km'
          ? 'លេខកូដចាស់មិនត្រឹមត្រូវទេ!'
          : 'Current passcode is incorrect!'
      );
      return;
    }

    if (newPin.length < 4) {
      setChangeError(
        lang === 'km'
          ? 'លេខកូដថ្មីត្រូវមានយ៉ាងតិច ៤ ខ្ទង់!'
          : 'New passcode must be at least 4 characters!'
      );
      return;
    }

    if (newPin !== confirmPin) {
      setChangeError(
        lang === 'km'
          ? 'លេខកូដថ្មីទាំងពីរមិនដូចគ្នាទេ!'
          : 'New passcodes do not match!'
      );
      return;
    }

    onUpdatePasscode(newPin);
    setSuccessNotice(
      lang === 'km'
        ? 'បានផ្លាស់ប្តូរលេខកូដសម្ងាត់ជោគជ័យ!'
        : 'Passcode updated successfully!'
    );
    setTimeout(() => {
      setActiveTab('verify');
      setEnteredPin(newPin);
    }, 1200);
  };

  return (
    <div
      id="admin-auth-modal"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-md bg-slate-900/95 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {activeTab === 'verify'
                  ? lang === 'km'
                    ? 'ផ្ទៀងផ្ទាត់សិទ្ធិ Admin'
                    : 'Admin Verification'
                  : lang === 'km'
                  ? 'ប្តូរលេខកូដសម្ងាត់ Admin'
                  : 'Change Admin Passcode'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'verify'
                  ? lang === 'km'
                    ? 'បញ្ចូលលេខកូដដើម្បីចូលគ្រប់គ្រងវីដេអូ'
                    : 'Enter secret code to access management'
                  : lang === 'km'
                  ? 'កំណត់លេខកូដសម្ងាត់ថ្មីសម្រាប់សុវត្ថិភាព'
                  : 'Set a new secret code for security'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white hover:text-red-200 bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ml-2 shrink-0"
            title={lang === 'km' ? 'បិទផ្ទាំង (Close - Esc)' : 'Close (Esc)'}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'verify'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'km' ? 'បញ្ចូលលេខកូដ (Enter PIN)' : 'Enter PIN'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('change')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'change'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'km' ? 'ប្តូរលេខកូដ (Change PIN)' : 'Change PIN'}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Error or Success Alert */}
              {errorMsg && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successNotice && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Passcode Input Display */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  {lang === 'km' ? 'លេខកូដសម្ងាត់ (Passcode)' : 'Passcode / PIN'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={enteredPin}
                    onChange={(e) => {
                      setErrorMsg('');
                      setEnteredPin(e.target.value);
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full pl-4 pr-12 py-3 bg-slate-950/70 border border-white/15 focus:border-indigo-400 rounded-2xl text-center text-xl tracking-[0.3em] font-mono text-white placeholder:tracking-normal placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Numpad Grid (Extremely handy on Mobile/Tablets) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 transition-all text-base font-bold font-mono text-white flex items-center justify-center shadow-xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 active:scale-95 transition-all text-xs font-bold flex items-center justify-center"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 transition-all text-base font-bold font-mono text-white flex items-center justify-center shadow-xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center justify-center"
                  title="លុបថយក្រោយ"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              {/* Cloud Security Indicator */}
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 flex items-start gap-2.5 text-[11px] text-indigo-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{lang === 'km' ? 'សុវត្ថិភាព Cloud Sync' : 'Cloud Sync Security'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === 'km'
                      ? 'លេខកូដសម្ងាត់ត្រូវបានការពារ និង Sync ដោយស្វ័យប្រវត្តិលើគ្រប់ Browser និងឧបករណ៍ទាំងអស់។'
                      : 'The security passcode is synchronized in real time across all browsers and devices.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ចូលគ្រប់គ្រង' : 'Unlock Admin'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePasscode} className="space-y-4">
              {changeError && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{changeError}</span>
                </div>
              )}

              {successNotice && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  {lang === 'km' ? 'លេខកូដបច្ចុប្បន្ន' : 'Current Passcode'}
                </label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="បញ្ចូលលេខកូដចាស់"
                  className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/15 focus:border-indigo-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  {lang === 'km' ? 'លេខកូដសម្ងាត់ថ្មី' : 'New Passcode'}
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="យ៉ាងតិច ៤ ខ្ទង់"
                  className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/15 focus:border-indigo-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  {lang === 'km' ? 'បញ្ជាក់លេខកូដថ្មី' : 'Confirm New Passcode'}
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="បញ្ចូលលេខកូដថ្មីម្តងទៀត"
                  className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/15 focus:border-indigo-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('verify')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
                >
                  {lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'km' ? 'រក្សាទុកលេខកូដថ្មី' : 'Save New Passcode'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
