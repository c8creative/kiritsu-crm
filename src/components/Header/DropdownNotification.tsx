import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import { listOpportunities } from '../../lib/db';
import { Opportunity } from '../../lib/types';
import { isToday, isPast, isBefore, addDays, parseISO, format } from 'date-fns';
import { MdRefresh, MdClearAll, MdClose } from 'react-icons/md';

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchNotifications = async () => {
    try {
      const opps = await listOpportunities();
      const newNotifications: any[] = [];
      const now = new Date();
      const upcomingThreshold = addDays(now, 3);

      opps.forEach((opp) => {
        // 1. New Leads
        if (opp.stage === 'new') {
          newNotifications.push({
            id: `new-${opp.id}`,
            title: 'New Lead',
            message: `${opp.account_name || 'Business'} is in the New stage.`,
            date: opp.created_at,
            type: 'new',
            oppId: opp.id
          });
        }

        // Follow-up logic
        if (opp.next_follow_up_date) {
            const followUpDate = parseISO(opp.next_follow_up_date);
            
            // 2. Overdue
            if (isPast(followUpDate) && !isToday(followUpDate)) {
                newNotifications.push({
                    id: `overdue-${opp.id}`,
                    title: 'Overdue Follow-up',
                    message: `Follow-up for ${opp.account_name || 'Business'} was due on ${format(followUpDate, 'MMM d')}.`,
                    date: opp.next_follow_up_date,
                    type: 'overdue',
                    oppId: opp.id
                });
            }
            // 3. Due Today
            else if (isToday(followUpDate)) {
                newNotifications.push({
                    id: `today-${opp.id}`,
                    title: 'Due Today',
                    message: `Follow-up for ${opp.account_name || 'Business'} is due today.`,
                    date: opp.next_follow_up_date,
                    type: 'today',
                    oppId: opp.id
                });
            }
            // 4. Soon Upcoming (Next 3 days)
            else if (isBefore(followUpDate, upcomingThreshold) && !isPast(followUpDate)) {
                newNotifications.push({
                    id: `soon-${opp.id}`,
                    title: 'Upcoming Follow-up',
                    message: `Follow-up for ${opp.account_name || 'Business'} is coming up on ${format(followUpDate, 'MMM d')}.`,
                    date: opp.next_follow_up_date,
                    type: 'soon',
                    oppId: opp.id
                });
            }
        }
      });

      // Sort by date (relevant notifications)
      newNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setNotifications(newNotifications.filter(n => !dismissedIds.has(n.id)));
      setNotifying(newNotifications.filter(n => !dismissedIds.has(n.id)).length > 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedIds(prev => new Set([...prev, id]));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    setDismissedIds(prev => new Set([...prev, ...allIds]));
    setNotifications([]);
    setNotifying(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'overdue': return 'text-danger bg-danger/10';
      case 'today': return 'text-warning bg-warning/10';
      case 'new': return 'text-success bg-success/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          to="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              notifying === false ? 'hidden' : 'inline'
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
              fill=""
            />
          </svg>
        </Link>

        {dropdownOpen && (
          <div
            className={`absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80`}
          >
            <div className="px-4.5 py-3 border-b border-stroke dark:border-strokedark flex items-center justify-between">
              <h5 className="text-sm font-bold text-bodydark2">
                Notifications ({notifications.length})
              </h5>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchNotifications(); }}
                  className="text-bodydark2 hover:text-primary transition-colors"
                  title="Refresh"
                >
                  <MdRefresh size={18} />
                </button>
                <button 
                  onClick={clearAll}
                  className="text-bodydark2 hover:text-danger transition-colors"
                  title="Clear All"
                >
                  <MdClearAll size={18} />
                </button>
              </div>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4.5 py-10 text-center text-sm text-slate-400">
                  All caught up! No urgent follow-ups.
                </li>
              ) : (
                notifications.map((notif) => (
                  <li key={notif.id}>
                    <div className="relative group">
                      <Link
                        className="flex flex-col gap-1 border-b border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 transition-colors"
                        to="/pipeline"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getTypeStyle(notif.type)}`}>
                              {notif.title}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {format(new Date(notif.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <p className="text-sm text-black dark:text-white leading-tight pr-6">
                          {notif.message}
                        </p>
                      </Link>
                      <button
                        onClick={(e) => removeNotification(notif.id, e)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-bodydark2 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Dismiss"
                      >
                        <MdClose size={16} />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
            {/* Removed View Full Pipeline */}
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
