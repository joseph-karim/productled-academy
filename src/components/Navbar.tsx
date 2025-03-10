import { useAuth0 } from '@auth0/auth0-react';
import { Bell, Settings, User } from 'lucide-react';
import { Menu } from '@headlessui/react';

export default function Navbar() {
  const { user, logout } = useAuth0();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">ReviveAgent</h1>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings className="w-5 h-5" />
            </button>
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex items-center p-2 text-gray-500 hover:text-gray-700">
                <User className="w-5 h-5" />
                <span className="ml-2">{user?.name}</span>
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => logout()}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full px-4 py-2 text-sm text-left text-gray-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}