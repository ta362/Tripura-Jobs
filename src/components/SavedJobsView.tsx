import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from './../context/AuthContext';
import { api } from '../lib/api';
import { SavedJobItem } from '../types';
import { JobCard } from './JobCard';
import { Bookmark, Sparkles, Inbox } from 'lucide-react';

export const SavedJobsView: React.FC = () => {
  const { user } = useAuth();
  const { savedJobIds, setActiveTab } = useJobs();
  const [savedItems, setSavedItems] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .getSavedJobs(user.id)
      .then(data => setSavedItems(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user, savedJobIds]);

  return (
    <div className="p-4 space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <span>Saved Recruitment Notices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personal bookmark archive with automated deadline tracking
          </p>
        </div>
        <span className="text-xs bg-slate-800 text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-slate-700">
          {savedItems.length} Bookmarked
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading your saved jobs...</span>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Saved Jobs Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any government recruitment card to save it for quick review and receive deadline alerts.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Latest Notifications</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedItems.map(item => (
            <div key={item.job.id} className="space-y-1">
              <JobCard job={item.job} />
              {item.saved.notes && (
                <div className="text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/80 mx-2">
                  <span className="font-semibold text-slate-300">Note: </span>
                  {item.saved.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
