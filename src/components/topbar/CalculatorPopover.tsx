import React, { useState, useEffect } from 'react';
import { Delete, X, Calculator as CalcIcon } from 'lucide-react';

interface CalculatorPopoverProps {
  onClose: () => void;
}

export const CalculatorPopover: React.FC<CalculatorPopoverProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        inputDot();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        performOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        deleteLastDigit();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key.toLowerCase() === 'c') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation, waitingForOperand]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setEquation('');
    setWaitingForOperand(false);
  };

  const deleteLastDigit = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (equation === '') {
      setEquation(`${inputValue} ${nextOperator}`);
    } else if (!waitingForOperand) {
      const parts = equation.trim().split(' ');
      const prevVal = parseFloat(parts[0]);
      const prevOp = parts[1];
      const res = calculate(prevVal, inputValue, prevOp);
      setDisplay(String(res));
      setEquation(`${res} ${nextOperator}`);
    } else {
      setEquation(`${partsBeforeOp(equation)} ${nextOperator}`);
    }

    setWaitingForOperand(true);
  };

  const partsBeforeOp = (eq: string) => {
    const parts = eq.trim().split(' ');
    return parts[0] || '0';
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      case '%': return (a * b) / 100;
      default: return b;
    }
  };

  const calculateResult = () => {
    if (!equation) return;
    const parts = equation.trim().split(' ');
    const prevVal = parseFloat(parts[0]);
    const op = parts[1];
    const currentVal = parseFloat(display);

    const res = calculate(prevVal, currentVal, op);
    // Round to avoid floating point anomalies
    const cleanRes = Math.round(res * 1000000) / 1000000;
    setDisplay(String(cleanRes));
    setEquation('');
    setWaitingForOperand(true);
  };

  const handlePercentage = () => {
    const currentVal = parseFloat(display);
    if (!equation) {
      setDisplay(String(currentVal / 100));
    } else {
      const parts = equation.trim().split(' ');
      const prevVal = parseFloat(parts[0]);
      const res = (prevVal * currentVal) / 100;
      setDisplay(String(res));
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#ECE5D7] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ECE5D7]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <CalcIcon className="w-3.5 h-3.5 text-[#D85C3A]" />
          <span>Calculatrice Caisse</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fermer la calculatrice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Screen */}
      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#ECE5D7] text-right mb-3">
        <div className="text-[10px] text-slate-400 h-4 font-mono overflow-hidden truncate">
          {equation || ' '}
        </div>
        <div className="text-xl font-bold font-mono text-slate-900 tracking-tight overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
        {/* Row 1 */}
        <button
          onClick={clearAll}
          className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition cursor-pointer"
        >
          C
        </button>
        <button
          onClick={deleteLastDigit}
          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer"
          title="Effacer le dernier caractère"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handlePercentage}
          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => performOperation('/')}
          className="py-2.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#123F46] border border-[#ECE5D7] rounded-xl font-bold transition cursor-pointer"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputDigit('7')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          9
        </button>
        <button
          onClick={() => performOperation('*')}
          className="py-2.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#123F46] border border-[#ECE5D7] rounded-xl font-bold transition cursor-pointer"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit('4')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          6
        </button>
        <button
          onClick={() => performOperation('-')}
          className="py-2.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#123F46] border border-[#ECE5D7] rounded-xl font-bold transition cursor-pointer"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit('1')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer"
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className="py-2.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#123F46] border border-[#ECE5D7] rounded-xl font-bold transition cursor-pointer"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => inputDigit('0')}
          className="py-2.5 col-span-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer font-bold"
        >
          0
        </button>
        <button
          onClick={inputDot}
          className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition cursor-pointer font-bold"
        >
          .
        </button>
        <button
          onClick={calculateResult}
          className="py-2.5 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
        >
          =
        </button>
      </div>

      <div className="text-[10px] text-slate-400 text-center mt-2.5 pt-2 border-t border-[#ECE5D7]">
        Saisie clavier supportée • Esc pour fermer
      </div>
    </div>
  );
};
