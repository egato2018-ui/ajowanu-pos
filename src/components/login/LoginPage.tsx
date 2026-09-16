import React, { useState, useEffect, useCallback } from 'react';
import { Employee, ShopSettings } from '../../types';
import { sqliteDB } from '../../db/sqliteStorage';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Store, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles,
  Cpu,
  Database,
  CheckCircle2,
  Delete,
  MapPin,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginAmbientBackground } from './LoginAmbientBackground';

interface LoginPageProps {
  settings: ShopSettings;
  onLoginSuccess: (employee: Employee) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ settings, onLoginSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');

  // PIN state
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Password / Credentials state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Subtle Mouse Parallax Coordinates (normalized -1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  }, []);

  // Load active staff members
  useEffect(() => {
    const activeStaff = sqliteDB.getEmployees().filter(e => e.status === 'Active');
    setEmployees(activeStaff);
    if (activeStaff.length > 0) {
      setSelectedEmployee(activeStaff[0]);
      setUsernameInput(activeStaff[0].name);
    }
  }, []);

  // Keyboard navigation & Numpad support
  useEffect(() => {
    if (isSuccess || isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (authMode === 'pin') {
        if (e.key >= '0' && e.key <= '9') {
          handleDigitPress(e.key);
        } else if (e.key === 'Backspace') {
          handleDeleteDigit();
        } else if (e.key === 'Escape') {
          setPin('');
          setError('');
        } else if (e.key === 'Enter') {
          if (pin.length === 4) {
            verifyAndSubmitPin(pin);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, authMode, selectedEmployee, isSuccess, isLoading]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4 && !isLoading && !isSuccess) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyAndSubmitPin(nextPin);
      }
    }
  };

  const handleDeleteDigit = () => {
    if (!isLoading && !isSuccess) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleClearPin = () => {
    if (!isLoading && !isSuccess) {
      setPin('');
      setError('');
    }
  };

  const verifyAndSubmitPin = (pinToTest: string) => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      let matchedEmployee: Employee | null = null;

      // 1. If an employee is explicitly selected, verify their PIN
      if (selectedEmployee && selectedEmployee.pin === pinToTest) {
        matchedEmployee = selectedEmployee;
      }

      // 2. If not matched with current selected, check if this PIN belongs to any active employee
      if (!matchedEmployee) {
        matchedEmployee = sqliteDB.verifyEmployeePin(pinToTest);
      }

      if (matchedEmployee) {
        triggerSuccess(matchedEmployee);
      } else {
        setIsLoading(false);
        setError('Code PIN erroné. Veuillez réessayer.');
        setShakeKey(prev => prev + 1);
        setPin('');
      }
    }, 280);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Veuillez saisir votre mot de passe ou code PIN.');
      setShakeKey(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Find employee by name or ID
      const employee = employees.find(
        e => e.name.toLowerCase() === usernameInput.trim().toLowerCase() || e.id === usernameInput.trim()
      );

      // Verify password (matches PIN or default employee password)
      if (employee && (employee.pin === passwordInput.trim() || passwordInput.trim() === '1234')) {
        triggerSuccess(employee);
      } else {
        setIsLoading(false);
        setError('Identifiant ou mot de passe incorrect.');
        setShakeKey(prev => prev + 1);
      }
    }, 300);
  };

  const triggerSuccess = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsLoading(false);
    setIsSuccess(true);
    sqliteDB.setCurrentUser(employee);

    // Smooth transition into the application workspace
    setTimeout(() => {
      onLoginSuccess(employee);
    }, 450);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Owner': return 'Gérant';
      case 'Cashier': return 'Caissière';
      case 'Stock Manager': return 'Stock';
      default: return role;
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-screen bg-[#F6F1E7] text-[#111827] flex flex-col justify-between items-center relative overflow-x-hidden select-none font-sans px-4 py-6 sm:py-8"
      style={{
        fontFamily: "'Instrument Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Dynamic, organic, low-profile ambient background */}
      <LoginAmbientBackground mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Top Header Branding & Store Identity */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center space-y-2 mb-2"
      >
        {/* Monogram Badge + Brandmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#123F46] flex items-center justify-center shadow-md relative group">
            {/* Subtle inner clay ring accent */}
            <div className="absolute inset-0 rounded-2xl border border-white/15" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D85C3A] ring-2 ring-[#F6F1E7]" />
            <span className="text-xl font-black tracking-tighter text-white">A</span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#111827] leading-none">
                AJOWANU
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#123F46]/10 text-[#123F46]">
                Pro
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight block mt-0.5">
              La technologie de votre commerce.
            </span>
          </div>
        </div>

        {/* Store Active Context Banner - Mieux mis en valeur */}
        <div className="w-full max-w-[440px] px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-[#ECE5D7] shadow-sm flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#123F46]/10 border border-[#123F46]/15 text-[#123F46] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-[#123F46]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 tracking-tight truncate">
                  {settings.shopName || 'Boutique AJOWANU'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  En Ligne
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate mt-0.5">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#D85C3A] shrink-0" />
                  <span className="truncate">{settings.shopAddress || 'Cotonou, Bénin'}</span>
                </span>
                {settings.shopPhone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="hidden sm:flex items-center gap-1 text-slate-500 shrink-0">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {settings.shopPhone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pl-2 border-l border-[#ECE5D7]/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Terminal
            </span>
            <span className="text-[11px] font-bold font-mono text-[#123F46]">
              POS #01
            </span>
          </div>
        </div>
      </motion.div>

      {/* Center Stage: The Sculpted POS Gateway Terminal */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[440px] my-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl border border-[#ECE5D7] shadow-[0_20px_50px_-12px_rgba(18,63,70,0.09),0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-7 relative overflow-hidden"
        >
          
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#123F46] via-[#D85C3A] to-[#F2C14E]" />

          {/* Success Overlay Animation */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30"
              >
                <div className="relative mb-3">
                  {selectedEmployee?.photoUrl ? (
                    <img 
                      src={selectedEmployee.photoUrl} 
                      alt={selectedEmployee.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md ring-4 ring-emerald-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Bienvenue, {selectedEmployee?.name} !
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ouverture de votre session de caisse en cours...
                </p>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full bg-[#123F46]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal Header & Mode Switcher */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#ECE5D7]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Authentification Caisse
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {authMode === 'pin' ? 'Composez votre code PIN personnel' : 'Identifiants utilisateur'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-0.5 bg-[#F6F1E7] rounded-xl border border-[#ECE5D7]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setError('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  authMode === 'pin'
                    ? 'bg-white text-[#123F46] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Code PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  authMode === 'password'
                    ? 'bg-white text-[#123F46] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mot de passe
              </button>
            </div>
          </div>

          {/* Active Employee Profile Showcase Card with Real Photo */}
          {selectedEmployee && (
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE5D7] shadow-2xs mb-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {selectedEmployee.photoUrl ? (
                    <img
                      src={selectedEmployee.photoUrl}
                      alt={selectedEmployee.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#123F46] text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">
                      {selectedEmployee.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#123F46]/10 text-[#123F46]">
                      {getRoleLabel(selectedEmployee.role)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {selectedEmployee.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  En caisse
                </span>
              </div>
            </div>
          )}

          {/* Quick Staff Switcher Bar (when multiple active employees exist) */}
          {employees.length > 1 && (
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Changer d'opérateur :
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {employees.length} collaborateurs
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {employees.map((emp) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setUsernameInput(emp.name);
                        setPin('');
                        setError('');
                      }}
                      className={`px-2 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-left ${
                        isSelected
                          ? 'bg-[#FAF7F2] border-[#D85C3A] ring-2 ring-[#D85C3A]/25 shadow-2xs'
                          : 'bg-white border-[#ECE5D7] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {emp.photoUrl ? (
                        <img
                          src={emp.photoUrl}
                          alt={emp.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-lg object-cover border border-[#ECE5D7] shrink-0"
                        />
                      ) : (
                        <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#D85C3A] text-white' : 'bg-[#123F46] text-white'
                        }`}>
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate leading-tight ${
                          isSelected ? 'text-[#D85C3A]' : 'text-slate-800'
                        }`}>
                          {emp.name.split(' ')[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {getRoleLabel(emp.role)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 1: Fast PIN Authentication */}
          {authMode === 'pin' && (
            <div className="space-y-4">
              {/* PIN Code Visual Capsules */}
              <div className="flex flex-col items-center justify-center py-1">
                <div className="flex items-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pin.length > idx;
                    return (
                      <motion.div
                        key={idx}
                        animate={isFilled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                          isFilled
                            ? 'bg-[#123F46] border-[#123F46] shadow-xs'
                            : 'border-[#ECE5D7] bg-[#F6F1E7]'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Error feedback */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoading && !error && (
                  <p className="mt-2 text-xs text-slate-500 animate-pulse font-medium">
                    Vérification du code PIN...
                  </p>
                )}
              </div>

              {/* High-Performance Tactile Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitPress(digit)}
                    disabled={isLoading || isSuccess}
                    className="h-12 bg-[#FAF7F2] hover:bg-[#EFE9DF] active:scale-95 border border-[#ECE5D7] rounded-2xl text-slate-900 font-bold text-lg font-mono transition shadow-2xs cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#123F46]/20"
                  >
                    {digit}
                  </button>
                ))}

                {/* Bottom row: Clear, 0, Backspace */}
                <button
                  type="button"
                  onClick={handleClearPin}
                  disabled={isLoading || isSuccess}
                  className="h-12 bg-white hover:bg-slate-100 active:scale-95 text-slate-500 font-bold text-xs rounded-2xl transition border border-[#ECE5D7] cursor-pointer flex items-center justify-center"
                  title="Effacer tout"
                >
                  Effacer
                </button>

                <button
                  type="button"
                  onClick={() => handleDigitPress('0')}
                  disabled={isLoading || isSuccess}
                  className="h-12 bg-[#FAF7F2] hover:bg-[#EFE9DF] active:scale-95 border border-[#ECE5D7] rounded-2xl text-slate-900 font-bold text-lg font-mono transition shadow-2xs cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#123F46]/20"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleDeleteDigit}
                  disabled={isLoading || isSuccess}
                  className="h-12 bg-white hover:bg-slate-100 active:scale-95 text-slate-600 font-bold text-sm rounded-2xl transition border border-[#ECE5D7] cursor-pointer flex items-center justify-center"
                  title="Effacer le dernier chiffre"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Password Credentials Authentication */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 py-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identifiant ou Nom d'employé
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="ex: Koffi"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#ECE5D7] rounded-xl font-medium text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe / Code PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-[#FAF7F2] border border-[#ECE5D7] rounded-xl font-mono text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Afficher le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error feedback */}
              {error && (
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#123F46] hover:bg-[#0E3339] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <span>Accéder à la caisse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Helper */}
          <div className="mt-4 pt-3 border-t border-[#ECE5D7] text-center">
            <p className="text-[11px] text-slate-400">
              Codes rapides : Gérant <span className="font-mono font-bold text-slate-700">1234</span> • Caisse <span className="font-mono font-bold text-slate-700">1111</span> • Stock <span className="font-mono font-bold text-slate-700">2222</span>
            </p>
          </div>

        </motion.div>
      </motion.div>

      {/* Footer Security Badges & Autonomy Guarantee */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 flex items-center gap-4 text-[11px] text-slate-500 flex-wrap justify-center mt-3"
      >
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>Autonomie 100% Hors-ligne</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#123F46]" />
          <span>Base Locale SQLite Sécurisée</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D85C3A]" />
          <span>Chiffrement du Terminal</span>
        </div>
      </motion.div>

    </div>
  );
};
