'use client';

import { useState } from 'react';
import { ChevronDown, Building2, Users, Settings } from 'lucide-react';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';

interface OrganizationSelectorProps {
  className?: string;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ 
  className = '' 
}) => {
  const {
    currentOrganization,
    userOrganizations,
    userRole,
    switchOrganization,
    loading,
  } = useOrganizationContext();

  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitchOrganization = async (organizationId: string) => {
    if (organizationId === currentOrganization?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setSwitching(true);
      await switchOrganization(organizationId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching organization:', error);
      // Error is handled by the context
    } finally {
      setSwitching(false);
    }
  };

  if (loading || !currentOrganization) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Current Organization Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center min-w-0">
          <Building2 className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentOrganization.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {/* Organizations List */}
              {userOrganizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrganization(org.id)}
                  disabled={switching}
                  className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    org.id === currentOrganization.id 
                      ? 'bg-primary/5 text-primary' 
                      : 'text-gray-900'
                  }`}
                >
                  <Building2 className="flex-shrink-0 h-4 w-4 mr-2" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {org.members[currentOrganization.id]?.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  {org.id === currentOrganization.id && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full ml-2" />
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-1" />

              {/* Organization Management Links */}
              {userRole === 'FULL_ACCESS' && (
                <button
                  onClick={() => {
                    // Navigate to organization settings
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <Settings className="flex-shrink-0 h-4 w-4 mr-2" />
                  <span className="text-sm">Organization Settings</span>
                </button>
              )}

              <button
                onClick={() => {
                  // Navigate to members page
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <Users className="flex-shrink-0 h-4 w-4 mr-2" />
                <span className="text-sm">View Members</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};