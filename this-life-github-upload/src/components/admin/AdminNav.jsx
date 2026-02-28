import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Timetable', path: '/admin/timetable' },
  { label: 'Protocol', path: '/admin/protocol' },
  { label: 'Work & Meetings', path: '/admin/work' },
  { label: 'Ideas', path: '/admin/ideas' },
  { label: 'Brands', path: '/admin/brands' },
  { label: 'Planning', path: '/admin/planning' },
  { label: 'Settings', path: '/admin/settings' }
];

function AdminNav() {
  return (
    <nav className="section-card mb-3 flex gap-2 overflow-x-auto p-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
              isActive ? 'bg-accent text-black' : 'bg-cardAlt text-zinc-300 hover:text-white'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminNav;
