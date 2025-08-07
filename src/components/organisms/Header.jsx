import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";

const Header = ({ onMenuClick, searchValue, onSearchChange }) => {
  const { logout } = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <div className="hidden md:block">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Search patients, appointments..."
              className="w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ApperIcon name="Calendar" size={16} className="mr-2" />
              Schedule
            </Button>
            <Button variant="primary" size="sm">
              <ApperIcon name="UserPlus" size={16} className="mr-2" />
              New Patient
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <ApperIcon name="Bell" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
              {user && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-slate-900"
              >
                <ApperIcon name="LogOut" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search patients, appointments..."
          className="w-full"
        />
      </div>
    </header>
  );
};

export default Header;