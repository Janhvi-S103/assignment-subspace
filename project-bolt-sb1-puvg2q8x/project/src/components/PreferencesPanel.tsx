import React from 'react';
import { Settings, X } from 'lucide-react';
import type { NewsPreference } from '../types';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: NewsPreference[];
  onTogglePreference: (id: string) => void;
}

export function PreferencesPanel({
  isOpen,
  onClose,
  preferences,
  onTogglePreference
}: PreferencesPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <span className="text-gray-700">{pref.category}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref.isEnabled}
                  onChange={() => onTogglePreference(pref.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}