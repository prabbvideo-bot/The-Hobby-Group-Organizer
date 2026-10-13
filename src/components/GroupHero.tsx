import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  ChevronDown,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GroupHeroProps {
  onOpenCreateGroup: () => void;
}

export const GroupHero: React.FC<GroupHeroProps> = ({ onOpenCreateGroup }) => {
  const { groups, activeGroup, setActiveGroupId, resetToDemoData } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative bg-white border-b border-neutral-200">
      {/* Cover Banner Image with measured contrast scrim */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full bg-neutral-900 overflow-hidden">
        {!imgError ? (
          <img
            src={activeGroup.coverImage}
            alt={activeGroup.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-900 flex items-center justify-center">
            <span className="text-neutral-400 font-medium">{activeGroup.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent pointer-events-none" />

        {/* Top-right Community Switcher Menu */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md rounded-lg border border-white/20 transition-all cursor-pointer shadow-sm"
            >
              <span>Switch Community</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-1.5 z-50 text-xs text-neutral-800"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1 font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                  Your Hobby Communities
                </div>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(g.id)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-100 transition-colors ${
                      g.id === activeGroup.id ? 'font-semibold text-neutral-900 bg-neutral-50' : 'text-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="truncate">{g.name}</div>
                      <div className="text-[11px] text-neutral-500">{g.category} · {g.members.length} members</div>
                    </div>
                    {g.id === activeGroup.id && (
                      <span className="text-[10px] text-neutral-900 font-mono">Active</span>
                    )}
                  </button>
                ))}
                <div className="my-1 border-t border-neutral-100" />
                <button
                  onClick={onOpenCreateGroup}
                  className="w-full text-left px-3 py-2 text-neutral-900 hover:bg-neutral-100 font-medium flex items-center gap-2"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Create New Community</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset to initial sample data with 3 hobby groups?')) {
                      resetToDemoData();
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Group Headline overlaid at bottom of banner */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 flex flex-col justify-end text-white pointer-events-auto">
          <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium mb-1">
            <span>{activeGroup.category}</span>
            <span aria-hidden="true">·</span>
            <span>Est. {activeGroup.createdAt.split('-')[0]}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activeGroup.members.length} members
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-xs">
            {activeGroup.name}
          </h1>
        </div>
      </div>

      {/* Group Quick Details strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-neutral-600">
          <p className="max-w-2xl text-neutral-700 line-clamp-1 sm:line-clamp-none">
            {activeGroup.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs shrink-0 text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{activeGroup.meetingFrequency}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span className="truncate max-w-[200px]" title={activeGroup.defaultLocation}>
                {activeGroup.defaultLocation}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
