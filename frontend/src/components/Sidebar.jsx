import React from "react";
import {
HomeIcon,
CalendarIcon,
ClipboardListIcon,
ChatAlt2Icon,
ClockIcon,
} from "@heroicons/react/outline";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
return (
<div
className={`fixed md:static z-30 bg-blue-700 text-white w-64 p-5 transition-transform duration-300 h-full ${ sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" }`}
>
<h2 className="text-xl font-bold mb-8">College Admin</h2>
<nav className="space-y-4">
<a href="#" className="flex items-center space-x-3 hover:text-blue-200">
<HomeIcon className="h-5 w-5" />
<span>Dashboard</span>
</a>
<a href="#" className="flex items-center space-x-3 hover:text-blue-200">
<CalendarIcon className="h-5 w-5" />
<span>My Events</span>
</a>
<a href="#" className="flex items-center space-x-3 hover:text-blue-200">
<ClipboardListIcon className="h-5 w-5" />
<span>Registrations</span>
</a>
<a href="#" className="flex items-center space-x-3 hover:text-blue-200">
<ChatAlt2Icon className="h-5 w-5" />
<span>Feedback</span>
</a>
<a href="#" className="flex items-center space-x-3 hover:text-blue-200">
<ClockIcon className="h-5 w-5" />
<span>Activity Log</span>
</a>
</nav>
</div>
);
};

export default Sidebar;


