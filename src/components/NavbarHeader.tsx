import React from 'react';
import { ShopSettings, Employee, TabType } from '../types';
import { TopBar } from './topbar/TopBar';
import { sqliteDB } from '../db/sqliteStorage';

interface NavbarHeaderProps {
  settings: ShopSettings;
  onUpdateSettings?: (newSettings: Partial<ShopSettings>) => void;
  onNavigate: (tab: any) => void;
  activeTab: string;
  onOpenSearch?: () => void;
  onLockTerminal?: () => void;
  onLogout?: () => void;
  currentUser?: Employee | null;
  onUserUpdated?: (user: Employee) => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  settings,
  onNavigate,
  activeTab,
  onOpenSearch = () => {},
  onLockTerminal = () => {},
  onLogout = () => {},
  currentUser = sqliteDB.getCurrentUser(),
  onUserUpdated = () => {},
}) => {
  return (
    <TopBar
      settings={settings}
      activeTab={activeTab as TabType}
      onNavigate={onNavigate}
      onOpenSearch={onOpenSearch}
      onLockTerminal={onLockTerminal}
      onLogout={onLogout}
      currentUser={currentUser}
      onUserUpdated={onUserUpdated}
    />
  );
};
