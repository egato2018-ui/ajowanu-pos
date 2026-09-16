import React, { useState, useRef, useEffect } from 'react';
import { Employee, ShopSettings } from '../../types';
import { User, LogOut, Lock, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';

interface UserProfileMenuProps {
  user: Employee;
  settings: ShopSettings;
  onLockTerminal: () => void;
  onLogout: () => void;
  onUserUpdated: (updatedUser: Employee) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  settings,
  onLockTerminal,
  onLogout,
  onUserUpdated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'Gérant';
      case 'Cashier':
        return 'Caissier';
      default:
        return 'Stock';
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-800 border border-[#ECE5D7] transition cursor-pointer"
          title="Menu utilisateur"
        >
          {/* Avatar */}
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-lg object-cover border border-[#ECE5D7] shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-[#123F46] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
          )}

          {/* Name & Role */}
          <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">{getRoleBadge(user.role)}</p>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#ECE5D7] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
            {/* User Header */}
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] mb-2">
              <div className="flex items-center gap-2.5">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-[#ECE5D7] shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#123F46] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#123F46] text-white font-semibold">
                      {getRoleBadge(user.role)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-900 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Mon profil</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onLockTerminal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Verrouiller le terminal</span>
              </button>

              <div className="my-1 border-t border-[#ECE5D7]" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isProfileModalOpen && (
        <UserProfileModal
          user={user}
          settings={settings}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdated={onUserUpdated}
        />
      )}
    </>
  );
};
