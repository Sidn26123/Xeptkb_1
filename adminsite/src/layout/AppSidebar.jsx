import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

// Icon placeholder
const Icon = ({ color = "gray" }) => (
  <span style={{
    display: "inline-block",
    width: 20,
    height: 20,
    borderRadius: 4,
    background: color
  }} />
);

const navItems = [
  {
    name: "School Management",
    icon: <Icon color="#14b8a6" />, // teal-500
    subItems: [
      { name: "Student Management", path: "/student-management", pro: false },
      { name: "Class Management", path: "/class-management", pro: false },
      { name: "Teacher Management", path: "/teacher-management", pro: false },
      { name: "Faculty Management", path: "/faculty-management", pro: false },
      { name: "Subject Management", path: "/Subject-management", pro: false },
    ],
  },
  {
    name: "Academic Calendar Management",
    icon: <Icon color="#ef4444" />, // red-500
    subItems: [
      { name: "Semester Management", path: "/semester-management", pro: false },
      { name: "AcademicYears Management", path: "/academicyear-management", pro: false },
      { name: "Holiday Management", path: "/holiday-management", pro: false },
    ],
  },
  {
    name: "Facility Management",
    icon: <Icon color="#64748b" />, // slate-500
    subItems: [
      { name: "Room Management", path: "/room-management", pro: false },
      { name: "Equipments", path: "/equipment-management", pro: false },
    ],
  },
   {
    name: "Scheduling",
    icon: <Icon color="#22c55e" />, // green-500
    subItems: [
      { name: "Homeroom Teachers", path: "/homeroom-teachers", pro: false },
      { name: "Teaching Assignment", path: "/teaching-assignment", pro: false },
      { name: "Grade - Subject - Period", path: "/grade-subject-period", pro: false },
      { name: "Timetable Arrangement", path: "/timetable-arrangement", pro: false },
      { name: "Research Schedule", path: "/research-schedule", pro: false },
    ],
  },
    {
    name: "Configuration",
    icon: <Icon color="#a855f7" />, // purple-500
    subItems: [
      { name: "Set School Days", path: "/set-school-days", pro: false },
      { name: "Set Break Periods", path: "/set-break-periods", pro: false },
      { name: "Fixed Periods", path: "/fixed-periods", pro: false },
    ],
  },
  {
    name: "Merge Classes",
    icon: <Icon color="#3b82f6" />, // blue-500
    subItems: [
      { name: "Select Class", path: "/select-merge-class", pro: false },
      { name: "Merged Timetable", path: "/merged-timetable", pro: false },
    ],
  },
  {
    name: "Split Classes",
    icon: <Icon color="#f59e42" />, // orange-400
    subItems: [
      { name: "Select Class", path: "/select-split-class", pro: false },
      { name: "Split Timetable", path: "/split-timetable", pro: false },
    ],
  },
  {
    name: "Print Timetable",
    icon: <Icon color="#06b6d4" />, // cyan-500
    subItems: [
      { name: "Students", path: "/print-timetable/students", pro: false },
      { name: "Teachers", path: "/print-timetable/teachers", pro: false },
    ],
  },
  {
    name: "Publish Timetable",
    icon: <Icon color="#84cc16" />, // lime-500
    subItems: [
      { name: "Students", path: "/publish-timetable/students", pro: false },
      { name: "Teachers", path: "/publish-timetable/teachers", pro: false },
      { name: "Entire School", path: "/publish-timetable/school", pro: false },
      { name: "Change Link", path: "/publish-timetable/change-link", pro: false },
    ],
  },
  {
    name: "Timetable Backup",
    icon: <Icon color="#f59e42" />, // amber-400
    subItems: [
      { name: "Backup", path: "/timetable-backup/backup", pro: false },
      { name: "Restore", path: "/timetable-backup/restore", pro: false },
      { name: "Refresh", path: "/timetable-backup/refresh", pro: false },
    ],
  },
  {
    name: "Room Arrangement",
    icon: <Icon color="#6366f1" />, // indigo-500
    subItems: [
      { name: "Rooms", path: "/room-arrangement/rooms", pro: false },
      { name: "Arrange", path: "/room-arrangement/arrange", pro: false },
    ],
  },
];

/* othersItems đã bị loại bỏ theo yêu cầu */

function ChevronDownIcon({ className }) {
  return (
    <span className={className + " inline-block w-4 h-4"}>▼</span>
  );
}

function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : [];
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="font-bold text-lg">AdminSite</span>
          ) : (
            <span className="font-bold text-lg">A</span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <span>...</span>
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {/* Phần giao diện Others đã bị loại bỏ theo yêu cầu */}
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default AppSidebar;