import React, { useState } from 'react';
import { Menu, Home, User, Settings, Mail, Info } from 'lucide-react';
import LeadNewsSort from './LeadNewsSort';

interface MenuItem {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href: string;
}

const LeadNewsWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Mail, label: 'Contact', href: '/contact-us' },
    { icon: Info, label: 'About', href: '/about-us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Next.js Offcanvas Component
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Menu size={20} />
              Open Offcanvas
            </button>

            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as 'left' | 'right' | 'top' | 'bottom')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Current position: <span className="font-medium">{position}</span>
          </p>
        </div>

        {/* Feature List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Smooth slide animations with Tailwind transitions</li>
            <li>• Multiple positions (left, right, top, bottom)</li>
            <li>• Keyboard navigation (ESC to close)</li>
            <li>• Click outside to close</li>
            <li>• Body scroll lock when open</li>
            <li>• Fully accessible with ARIA attributes</li>
            <li>• Customizable width and styling</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>

      {/* Offcanvas Component */}
      <LeadNewsSort
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={position}
        width="w-80"
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                    }}
                  >
                    <IconComponent size={20} />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="text-sm text-gray-500">
            <p className="mb-2">Sample content area</p>
            <p>You can put any content here including forms, lists, or other components.</p>
          </div>
        </div>
      </LeadNewsSort>
    </div>
  );
};

export default LeadNewsWrapper;