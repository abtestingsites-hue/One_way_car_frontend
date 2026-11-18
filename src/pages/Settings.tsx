import React from 'react';
import Card from '../components/Card';
import { Bell, Lock, User, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-2">
                <h2 className="text-xl sm:text-2xl font-montserrat font-bold text-dark-950 dark:text-white">Settings</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your application preferences</p>
            </div>

            <div className="space-y-6">
                <Card title="Account Settings">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-white dark:bg-dark-800 rounded-lg mr-3 shadow-xs text-dark-950 dark:text-white">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark-950 dark:text-white text-xs">Profile Information</p>
                                    <p className="text-[11px] text-slate-400">Update your name and email</p>
                                </div>
                            </div>
                            <button className="btn-enterprise-sm btn-secondary text-xs">
                                Edit
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-white dark:bg-dark-800 rounded-lg mr-3 shadow-xs text-dark-950 dark:text-white">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark-950 dark:text-white text-xs">Change Password</p>
                                    <p className="text-[11px] text-slate-400">Update your security credentials</p>
                                </div>
                            </div>
                            <button className="btn-enterprise-sm btn-secondary text-xs">
                                Update
                            </button>
                        </div>
                    </div>
                </Card>

                <Card title="Preferences">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-white dark:bg-dark-800 rounded-lg mr-3 shadow-xs text-dark-950 dark:text-white">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark-950 dark:text-white text-xs">Notifications</p>
                                    <p className="text-[11px] text-slate-400">Manage email and push notifications</p>
                                </div>
                            </div>
                            <div className="relative inline-block w-11 h-6 select-none">
                                <input type="checkbox" id="toggle1" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-dark-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </div>
                        </div>

                        {/* Interactive Dark Mode Switch in Settings */}
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-white dark:bg-dark-800 rounded-lg mr-3 shadow-xs text-dark-950 dark:text-white">
                                    {theme === 'dark' ? <Moon size={18} className="text-amber-400" /> : <Sun size={18} className="text-amber-500" />}
                                </div>
                                <div>
                                    <p className="font-bold text-dark-950 dark:text-white text-xs">Dark Theme</p>
                                    <p className="text-[11px] text-slate-400">Switch between light and dark themes</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    theme === 'dark'
                                        ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                                        : 'bg-slate-100 border-slate-300 text-dark-950'
                                }`}
                            >
                                {theme === 'dark' ? 'Dark Theme ON' : 'Light Theme ON'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                            <div className="flex items-center">
                                <div className="p-2.5 bg-white dark:bg-dark-800 rounded-lg mr-3 shadow-xs text-dark-950 dark:text-white">
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark-950 dark:text-white text-xs">Language</p>
                                    <p className="text-[11px] text-slate-400">Select your preferred language</p>
                                </div>
                            </div>
                            <select className="input-enterprise-sm !h-8 text-xs font-bold">
                                <option>English</option>
                                <option>Tamil</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
