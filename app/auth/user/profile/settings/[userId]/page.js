'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, Shield, Globe } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Loading from '@/app/components/Loading';
import Dropdown from '@/app/components/Dropdown';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me/auth');
        const data = await res.json();
        if (!data.success || data.user._id !== "67d00247bda0a3f6a8035d04") {
          router.push(data.success ? '/off-site/comingsoon' : '/auth/login');
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error('Settings error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const TabContent = ({ id }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30"
      >
        {id === 'profile' && (
          <div className="space-y-8">
            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Display Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user?.displayName || ''}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user?.username || ''}
                  />
                </div>
              </div>
            </section>

            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user?.email || ''}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Website</label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user?.website || ''}
                  />
                </div>
              </div>
            </section>

            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Profile Details</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Bio</label>
                  <textarea
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    defaultValue={user?.bio || ''}
                    maxLength={500}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user?.location || ''}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {id === 'notifications' && (
          <div className="space-y-8">
            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'newFollower', label: 'New Follower' },
                  { key: 'newComment', label: 'New Comment' },
                  { key: 'newMention', label: 'New Mention' },
                  { key: 'securityAlerts', label: 'Security Alerts' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-800/20 rounded-lg">
                    <label className="text-sm text-gray-400">{label}</label>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        defaultChecked={user?.settings?.notifications?.[key]}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {id === 'privacy' && (
          <div className="space-y-8">
            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Profile Privacy</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Profile Visibility</label>
                  <Dropdown
                    options={[
                      { value: 'public', label: 'Public' },
                      { value: 'private', label: 'Private' },
                      { value: 'followers', label: 'Followers Only' }
                    ]}
                    value={user?.settings?.privacy?.profileVisibility}
                    onChange={(value) => { }}
                  />
                </div>
              </div>
            </section>

            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Account Security</h3>
              <div className="space-y-4">
                {[
                  { key: 'twoFactorAuth', label: 'Two-Factor Authentication' },
                  { key: 'loginAlerts', label: 'Login Alerts' },
                  { key: 'showEmail', label: 'Show Email Address' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-800/20 rounded-lg">
                    <label className="text-sm text-gray-400">{label}</label>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        defaultChecked={user?.settings?.privacy?.[key]}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {id === 'language' && (
          <div className="space-y-8">
            <section className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold text-gray-200 mb-6">Language Settings</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Preferred Language</label>
                  <Dropdown
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                      { value: 'fr', label: 'Français' },
                      { value: 'de', label: 'Deutsch' },
                      { value: 'pt', label: 'Português' }
                    ]}
                    value={user?.settings?.language}
                    onChange={(value) => { }}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Settings className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
              Settings
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <TabContent id={activeTab} key={activeTab} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
