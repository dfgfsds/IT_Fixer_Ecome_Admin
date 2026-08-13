import { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  Package,
  ShoppingCart,
  User,
  FolderTree,
  Ticket,
  Library,
  Sliders,
  Layers,
  Cpu,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Wrench,
} from 'lucide-react';
import Logo from '../../assets/image/Logo.png';

export default function StoreNav() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if current route is inside PC Builder group
  const isPcBuilderActive =
    location.pathname.includes('/builder-categories') ||
    location.pathname.includes('/attributes') ||
    location.pathname.includes('/category-attributes') ||
    location.pathname.includes('/builder-components');

  const [isPcBuilderOpen, setIsPcBuilderOpen] = useState(isPcBuilderActive);

  useEffect(() => {
    if (isPcBuilderActive) {
      setIsPcBuilderOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const pcBuilderSubLinks = [
    { to: `/store/${id}/builder-categories`, icon: FolderTree, label: 'Categories' },
    { to: `/store/${id}/attributes`, icon: Sliders, label: 'Attributes' },
    { to: `/store/${id}/category-attributes`, icon: Layers, label: 'Category Attributes' },
    { to: `/store/${id}/builder-components`, icon: Cpu, label: 'PC Components' },
  ];

  return (
    <>
      {/* Mobile Top Header (< md screens) */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <img src={Logo} alt="Logo" className="h-8 w-auto object-contain" />
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 
          flex flex-col shrink-0 select-none 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* FIXED TOP: Logo Section */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center justify-center w-full">
            <img src={Logo} alt="ITFixer Logo" className="h-10 w-auto object-contain" />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MIDDLE: Scrollable Menus */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Products Link */}
          <NavLink
            to={`/store/${id}/products`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Package
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Products</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* Categories Link */}
          <NavLink
            to={`/store/${id}/categories`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <FolderTree
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Categories</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* PC BUILDER GROUP WITH SUB MENU */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsPcBuilderOpen(!isPcBuilderOpen)}
              className={`group w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isPcBuilderActive
                ? 'bg-amber-50 text-[#c49e1e] font-bold border border-amber-200/60'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
                }`}
            >
              <div className="flex items-center gap-3">
                <Wrench
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isPcBuilderActive
                    ? 'scale-110 text-[#c49e1e]'
                    : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                    }`}
                />
                <span>PC Builder</span>
              </div>
              {isPcBuilderOpen ? (
                <ChevronDown className="h-4 w-4 text-[#c49e1e] transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#c49e1e] transition-transform" />
              )}
            </button>

            {/* PC Builder Sub Menu items */}
            {isPcBuilderOpen && (
              <div className="pl-4 pr-1 space-y-1 pt-1 border-l-2 border-amber-200/60 ml-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {pcBuilderSubLinks.map(({ to, icon: SubIcon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive
                        ? 'bg-[#e2ba2b] text-white shadow-xs font-bold'
                        : 'text-gray-600 hover:bg-amber-50/80 hover:text-[#c49e1e]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <SubIcon
                            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#c49e1e]'
                              }`}
                          />
                          <span>{label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Orders Link */}
          <NavLink
            to={`/store/${id}/orders`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <ShoppingCart
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Orders</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* Customers Link */}
          <NavLink
            to={`/store/${id}/website-users`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <User
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Customers</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* Coupons Link */}
          <NavLink
            to={`/store/${id}/coupons`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Ticket
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Coupons</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* Blogs Link */}
          <NavLink
            to={`/store/${id}/blogs`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Library
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Blogs</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-white translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>

          {/* Settings Link */}
          <NavLink
            to={`/store/${id}/settings`}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#e2ba2b] text-white shadow-md shadow-[#e2ba2b]/25 font-semibold'
                : 'text-gray-600 hover:bg-amber-50/70 hover:text-[#c49e1e]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Settings
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive
                      ? 'scale-110 text-white'
                      : 'text-gray-500 group-hover:text-[#c49e1e] group-hover:scale-105'
                      }`}
                  />
                  <span>Settings</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isActive
                    ? 'text-[#c49e1e] translate-x-0.5'
                    : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                />
              </>
            )}
          </NavLink>
        </div>

        {/* FIXED BOTTOM: Logout Button */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="group w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200/80 hover:border-red-200 rounded-xl shadow-2xs transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-4 w-4 shrink-0" />
              </div>
              <span className="font-semibold">Logout</span>
            </div>
            <ChevronRight className="h-4 w-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>
    </>
  );
}