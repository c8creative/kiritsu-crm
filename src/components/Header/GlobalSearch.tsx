import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalSearch, SearchResult } from '../../lib/db';
import { MdOutlineSearch, MdOutlinePerson, MdOutlineFlashOn } from 'react-icons/md';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const res = await globalSearch(query);
          setResults(res);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'lead') {
      navigate('/inbox'); // Ideally we'd have a lead detail, but for now inbox
    } else {
      navigate(`/connections/${result.id}`);
    }
  };

  return (
    <div className="relative flex-1 px-4 lg:px-8" ref={dropdownRef}>
      <div className="relative h-full flex items-center">
        <span className="absolute left-0 text-black dark:text-white pointer-events-none">
          <MdOutlineSearch size={22} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leads & contacts..."
          className="w-full bg-transparent pl-8 pr-4 py-3 text-black focus:outline-none dark:text-white xl:text-lg font-medium"
        />
        {loading && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 mt-2 w-full rounded-lg border border-stroke bg-white py-2 shadow-lg dark:border-strokedark dark:bg-boxdark z-999999">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                result.type === 'lead' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
              }`}>
                {result.type === 'lead' ? <MdOutlineFlashOn size={20} /> : <MdOutlinePerson size={20} />}
              </div>
              <div>
                <h4 className="text-sm font-medium text-black dark:text-white">
                  {result.title}
                </h4>
                <p className="text-xs text-bodydark2">
                  {result.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 1 && results.length === 0 && !loading && (
        <div className="absolute left-0 mt-2 w-full rounded-lg border border-stroke bg-white p-4 text-center shadow-lg dark:border-strokedark dark:bg-boxdark z-999999">
          <p className="text-sm text-bodydark2">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
