'use client';

import React, { useState, useEffect } from 'react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function SettingsDrawer({ isOpen, onClose, userEmail }: SettingsDrawerProps) {
  const [profileName, setProfileName] = useState('Ravi');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(true);
  const [velocityAlerts, setVelocityAlerts] = useState(true);
  const [weeklyAlerts, setWeeklyAlerts] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('spendLens_profileName');
      if (savedName) setProfileName(savedName);

      const savedAvatar = localStorage.getItem('spendLens_avatarIndex');
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar, 10));

      const sub = localStorage.getItem('spendLens_subAlerts');
      if (sub) setSubscriptionAlerts(sub === 'true');

      const vel = localStorage.getItem('spendLens_velAlerts');
      if (vel) setVelocityAlerts(vel === 'true');

      const wk = localStorage.getItem('spendLens_wkAlerts');
      if (wk) setWeeklyAlerts(wk === 'true');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spendLens_profileName', profileName);
      localStorage.setItem('spendLens_avatarIndex', avatarIndex.toString());
      localStorage.setItem('spendLens_subAlerts', subscriptionAlerts.toString());
      localStorage.setItem('spendLens_velAlerts', velocityAlerts.toString());
      localStorage.setItem('spendLens_wkAlerts', weeklyAlerts.toString());
      onClose();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  const avatars = [
    { bg: 'bg-[#6d5ef9]', text: 'RV', label: 'Indigo Core' },
    { bg: 'bg-[#4b6a4f]', text: 'RV', label: 'Forest Green' },
    { bg: 'bg-[#ba1a1a]', text: 'RV', label: 'Sunset Red' },
    { bg: 'bg-[#007fac]', text: 'RV', label: 'Sky Blue' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-body text-on-surface select-none">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel drawer */}
        <div className="w-screen max-w-md transform transition-all duration-300 ease-out glass-card bg-surface/95 backdrop-blur-xl border-l border-outline-variant/30 flex flex-col p-6 shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20 mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Account Profile</h3>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">Customize your SpendLens preferences</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Avatar selection grid */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${avatars[avatarIndex].bg} text-white font-bold flex items-center justify-center text-lg border border-white/25 shadow-sm`}>
                  {avatars[avatarIndex].text}
                </div>
                <div className="flex-1 flex gap-2">
                  {avatars.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAvatarIndex(idx)}
                      title={av.label}
                      className={`w-9 h-9 rounded-full ${av.bg} flex items-center justify-center border-2 transition-all ${
                        idx === avatarIndex ? 'border-primary scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span className="text-[10px] text-white font-bold">RV</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Inputs */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full h-11 px-4 bg-surface-container border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full h-11 px-4 bg-surface-container-low/50 border-none rounded-xl text-sm font-medium opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Notification preference toggles */}
            <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/20">
              <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Notification Rules</label>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Subscription Audit Alerts</h4>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Detect repeating merchant logs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={subscriptionAlerts}
                    onChange={(e) => setSubscriptionAlerts(e.target.checked)}
                    className="w-9 h-5 bg-surface-container rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer outline-none before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Weekly Spend Flow Reports</h4>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Email summary calculations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyAlerts}
                    onChange={(e) => setWeeklyAlerts(e.target.checked)}
                    className="w-9 h-5 bg-surface-container rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer outline-none before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Spend Velocity Warning</h4>
                    <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Alert when approaching budget limits</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={velocityAlerts}
                    onChange={(e) => setVelocityAlerts(e.target.checked)}
                    className="w-9 h-5 bg-surface-container rounded-full appearance-none checked:bg-primary transition-all relative cursor-pointer outline-none before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-outline-variant/20 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 bg-surface-container hover:bg-surface-container-high text-xs font-semibold rounded-xl transition-all border border-outline-variant/30 text-on-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-11 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
