import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../images/brand/kiritsu-crm-logo.png';
import { 
  MdOutlineInbox, 
  MdOutlineViewWeek, 
  MdOutlineSchedule, 
  MdOutlineBusiness, 
  MdOutlineAssignment, 
  MdOutlinePeople, 
  MdOutlineSettings,
  MdOutlineLogout
} from 'react-icons/md';
import { useBranding } from '../../hooks/useBranding';
import { signOut } from '../../lib/db';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { logoUrl, companyName, sidebarBg, sidebarText, sidebarHighlight } = useBranding();
  
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <MdOutlineSchedule size={22} /> },
    { label: 'Leads', path: '/inbox', icon: <MdOutlineInbox size={22} /> },
    { label: 'Pipeline', path: '/pipeline', icon: <MdOutlineViewWeek size={22} /> },
    { label: 'Connections', path: '/connections', icon: <MdOutlinePeople size={22} /> },
    { label: 'Jobs', path: '/jobs', icon: <MdOutlineAssignment size={22} /> },
    { label: 'Settings', path: '/settings', icon: <MdOutlineSettings size={22} /> },
  ];

  const getActiveStyles = (path: string) => {
    const isActive = (path === '/' && pathname === '/') || (path !== '/' && pathname.startsWith(path));
    if (isActive) {
        return {
            background: sidebarHighlight || undefined, // Fallback to CSS class if null
            color: (sidebarHighlight && !sidebarText) ? 'white' : (sidebarText || undefined)
        };
    }
    return {
        color: sidebarText ? `${sidebarText}cc` : undefined // Slightly transparent if custom text but not active
    };
  };

  return (
    <aside
      ref={sidebar}
      style={{ 
        background: sidebarBg || undefined,
        color: sidebarText || undefined
      }}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarBg ? '' : 'bg-black dark:bg-boxdark'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={logoUrl || Logo} alt="CRM Logo" className="h-32 w-auto mx-auto rounded-xl" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
          style={{ color: sidebarText || 'white' }}
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-grow">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-5 lg:px-6">
          <ul className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const activeStyles = getActiveStyles(item.path);
              const isActive = (item.path === '/' && pathname === '/') || (item.path !== '/' && pathname.startsWith(item.path));
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    style={activeStyles}
                    className={`group relative flex items-center gap-4 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out ${
                      isActive 
                        ? (!sidebarHighlight ? 'bg-graydark dark:bg-meta-4 text-white' : '') 
                        : (sidebarText ? '' : 'text-slate-400 hover:bg-graydark dark:hover:bg-meta-4')
                    }`}
                  >
                    <span style={{ color: isActive ? (sidebarText || 'white') : (sidebarText || undefined) }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="px-6 py-6 border-t mx-4" style={{ borderColor: sidebarText ? `${sidebarText}33` : '#1e293b' }}>
        <button
          onClick={() => signOut()}
          style={{ color: sidebarText || undefined }}
          className="group relative flex w-full items-center gap-4 rounded-lg py-3 px-4 font-medium duration-300 ease-in-out hover:bg-black/10 dark:hover:bg-white/10 mb-4"
        >
          <span className={sidebarText ? '' : 'group-hover:text-white'}>
            <MdOutlineLogout size={22} />
          </span>
          Log Out
        </button>
        <div className="text-center">
            <p className="text-[10px] font-medium font-inter tracking-wider" style={{ color: sidebarText ? `${sidebarText}99` : '#64748b' }}>
              © 2026 {companyName || 'Kiritsu Services'} | C8Creates
            </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
