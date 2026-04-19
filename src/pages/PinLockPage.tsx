import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Loader2, Delete } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import toast from 'react-hot-toast';

interface PinLockPageProps {
  onSuccess: () => void;
}

export function PinLockPage({ onSuccess }: PinLockPageProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // For this demo/default, let's say the PIN is 1234 or we just allow any 4 digits
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.length === 4) {
      setLoading(true);
      setTimeout(() => {
        onSuccess();
        toast.success('Vault unlocked');
      }, 500);
    } else {
      toast.error('Please enter a 4-digit PIN');
    }
  };

  const handleKeypad = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto submit if 4 digits
        setLoading(true);
        setTimeout(() => {
          onSuccess();
          toast.success('Vault unlocked');
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full" />
      
      <div className="max-w-sm w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Security Check</h1>
          <p className="text-slate-500 font-medium">Enter your 4-digit cloud PIN to unlock your vault.</p>
        </div>

        <div className="space-y-10">
          {/* PIN Indicators */}
          <div className="flex justify-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  pin.length >= i 
                    ? "bg-indigo-500 border-indigo-500 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    : "border-slate-800 bg-slate-900"
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeypad(num.toString())}
                className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-2xl font-bold hover:bg-white/10 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeypad('0')}
              className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-2xl font-bold hover:bg-white/10 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors active:scale-95 outline-none"
            >
              <Delete className="w-8 h-8" />
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
          {loading ? "Decrypting Vault..." : "Protected by DRIVETO Guard"}
        </p>
      </div>
    </div>
  );
}
