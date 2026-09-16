import React, { useState, useEffect } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { Lock, KeyRound, ShieldAlert, X } from 'lucide-react';

interface PinLockModalProps {
  onUnlock: () => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ onUnlock, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const currentUser = sqliteDB.getCurrentUser();

  // Support physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          handleDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleVerify(pin);
        }
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError('');
      if (next.length === 4) {
        handleVerify(next);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleVerify = (pinToTest?: string) => {
    const targetPin = pinToTest || pin;
    if (targetPin.length !== 4) return;

    const employee = sqliteDB.verifyEmployeePin(targetPin);
    if (employee) {
      sqliteDB.setCurrentUser(employee);
      onUnlock();
    } else {
      setError('Code PIN invalide !');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-[#ECE5D7] text-center">
        
        {/* Header Icon */}
        <div className="w-12 h-12 bg-[#FAF7F2] text-[#123F46] border border-[#ECE5D7] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base">Caisse Verrouillée</h3>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser ? `Session de ${currentUser.name}` : 'Saisissez votre code PIN à 4 chiffres'}
          </p>
        </div>

        {/* PIN Display Dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition ${
                pin.length > i
                  ? 'bg-[#123F46] border-[#123F46] scale-110 shadow-2xs'
                  : 'border-[#ECE5D7] bg-[#FAF7F2]'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-3 bg-[#FAF7F2] hover:bg-[#F0EAE1] border border-[#ECE5D7] rounded-xl font-bold text-slate-800 text-base transition cursor-pointer shadow-2xs"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => {
              setPin('');
              setError('');
            }}
            className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 text-xs transition cursor-pointer"
          >
            Effacer
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-3 bg-[#FAF7F2] hover:bg-[#F0EAE1] border border-[#ECE5D7] rounded-xl font-bold text-slate-800 text-base transition cursor-pointer shadow-2xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 text-xs transition cursor-pointer"
          >
            ⌫
          </button>
        </div>

        <div className="text-[10px] text-slate-400 pt-2 border-t border-[#ECE5D7]">
          Tapez votre code au clavier physique ou sur le pavé tactile
        </div>
      </div>
    </div>
  );
};
