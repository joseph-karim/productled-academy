import { Link, useLocation } from 'react-router-dom';
import { BarChart2, MessageSquare, Phone, Settings, Users, Bot, Book, FileText, FolderOpen } from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart2 },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Contact Events', href: '/contact-events', icon: Phone },
  { name: 'Playbooks', href: '/playbooks', icon: Bot },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: Book },
  { name: 'Assets', href: '/assets', icon: FolderOpen },
  { name: 'Deal Rooms', href: '/deals/1', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 min-h-screen px-4 py-8 bg-white border-r border-gray-200">
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-blue-700' : 'text-gray-400'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}