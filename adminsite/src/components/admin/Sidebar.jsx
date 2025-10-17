import { useState } from 'react';
import {
    X,
    FolderPlus,
    CheckCircle,
    Settings,
    Printer,
    RotateCcw,
    Building,
    User,
    LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menuKey) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    const menuItems = [
        {
            key: 'khai-bao',
            icon: <FolderPlus size={18} />,
            title: 'Khai báo',
            subItems: [
                { href: 'khoi', label: 'Khối', active: true },
                { href: 'lop', label: 'Lớp học' },
                { href: 'mon-hoc', label: 'Môn học' },
                { href: 'tiet', label: 'Tiết học' },
                { href: 'giao-vien', label: 'Giáo viên' },
            ],
        },
        {
            key: 'xep-lich',
            icon: <CheckCircle size={18} />,
            title: 'Xếp lịch',
            subItems: [
                { href: 'chu-nhiem-lop', label: 'Giáo viên chủ nhiệm' },
                { href: 'phan-cong-giang-day', label: 'Phân công giảng dạy' },
                { href: 'khoi-mon-tiet', label: 'Khối - môn - tiết' },
                { href: 'thoi-khoa-bieu', label: 'Xếp thời khoá biểu' },
            ],
        },
        {
            key: 'cau-hinh',
            icon: <Settings size={18} />,
            title: 'Cấu hình',
            subItems: [
                { href: 'set-ngay-hoc', label: 'Set ngày học' },
                { href: 'set-ngay-nghi', label: 'Set tiết nghỉ' },
                { href: 'tiet-co-dinh', label: 'Tiết cố định' },
            ],
        },
        {
            key: 'ghep-lop',
            icon: <CheckCircle size={18} />,
            title: 'Ghép lớp',
            subItems: [
                { href: 'ghep-lop', label: 'Chọn lớp' },
                { href: 'tkb-ghep-lop', label: 'TKB ghép lớp' },
            ],
        },
        {
            key: 'tach-lop',
            icon: <CheckCircle size={18} />,
            title: 'Tách lớp',
            subItems: [
                { href: 'tach-lop', label: 'Chọn lớp' },
                { href: 'tkb-tach-lop', label: 'TKB tách lớp' },
            ],
        },
        {
            key: 'in-tkb',
            icon: <Printer size={18} />,
            title: 'In TKB',
            subItems: [
                { href: 'in-thoi-khoa-bieu-hoc-vien', label: 'Học sinh' },
                { href: 'in-thoi-khoa-bieu-giao-vien', label: 'Giáo viên' },
            ],
        },
        {
            key: 'cong-khai',
            icon: <Link size={18} />,
            title: 'Công khai TKB',
            subItems: [
                {
                    href: '../tkb-hoc-sinh?s=1760334801GEXTujOmOH',
                    label: 'Học sinh',
                    external: true,
                },
                {
                    href: '../tkb-giao-vien?s=1760334801GEXTujOmOH',
                    label: 'Giáo viên',
                    external: true,
                },
                {
                    href: '../tkb-toan-truong?s=1760334801GEXTujOmOH',
                    label: 'Toàn trường',
                    external: true,
                },
                { label: 'Đổi link', isButton: true },
            ],
        },
        {
            key: 'backup',
            icon: <RotateCcw size={18} />,
            title: 'Backup TKB',
            subItems: [
                { href: 'backup-tkb', label: 'Sao lưu' },
                { href: 'restore-tkb', label: 'Khôi phục' },
                { href: 'reset-thoi-khoa-bieu', label: 'Làm mới' },
            ],
        },
        {
            key: 'xep-phong',
            icon: <Building size={18} />,
            title: 'Xếp phòng',
            subItems: [
                { href: 'phong', label: 'Phòng' },
                { href: 'xep-phong', label: 'Sắp xếp' },
            ],
        },
    ];

    const singleItems = [
        { href: 'export-file', label: 'Xuất excel TKB', className: 'border-t' },
        {
            href: '../tai-khoan',
            label: 'Tài khoản',
            icon: <User size={18} />,
            external: true,
            className: 'border-t',
        },
        {
            href: '../thoat',
            label: 'Thoát hệ thống',
            icon: <LogOut size={18} />,
            external: true,
        },
    ];

    return (
        <div
            className={`${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed lg:relative lg:translate-x-0 z-30 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out flex flex-col`}
            style={{ height: '100vh' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <img
                        src="public/image/logo.svg"
                        alt="Logo"
                        className="h-8"
                    />
                </div>
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            {/*<nav className="flex-1 overflow-y-auto">*/}
            {/*    <ul className="py-2">*/}
            {/*        /!* Menu items with submenus *!/*/}
            {/*        {menuItems.map((item) => (*/}
            {/*            <li key={item.key} className="border-b border-gray-700">*/}
            {/*                <button*/}
            {/*                    onClick={() => toggleMenu(item.key)}*/}
            {/*                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"*/}
            {/*                >*/}
            {/*                    {item.icon}*/}
            {/*                    <span className="flex-1">{item.title}</span>*/}
            {/*                    <span*/}
            {/*                        className={`transition-transform duration-200 ${openMenus[item.key] ? 'rotate-90' : ''}`}*/}
            {/*                    >*/}
            {/*                        ▶*/}
            {/*                    </span>*/}
            {/*                </button>*/}

            {/*                /!* Submenu *!/*/}
            {/*                <ul*/}
            {/*                    className={`overflow-hidden transition-all duration-300 ${*/}
            {/*                        openMenus[item.key] ? 'max-h-96' : 'max-h-0'*/}
            {/*                    }`}*/}
            {/*                >*/}
            {/*                    {item.subItems.map((subItem, idx) => (*/}
            {/*                        <li key={idx} className="bg-gray-900">*/}
            {/*                            {subItem.isButton ? (*/}
            {/*                                <button className="w-full text-left px-6 py-2 text-sm hover:bg-gray-700 transition-colors">*/}
            {/*                                    ● {subItem.label}*/}
            {/*                                </button>*/}
            {/*                            ) : (*/}
            {/*                                <a*/}
            {/*                                    href={subItem.href}*/}
            {/*                                    target={*/}
            {/*                                        subItem.external*/}
            {/*                                            ? '_blank'*/}
            {/*                                            : undefined*/}
            {/*                                    }*/}
            {/*                                    rel={*/}
            {/*                                        subItem.external*/}
            {/*                                            ? 'noopener noreferrer'*/}
            {/*                                            : undefined*/}
            {/*                                    }*/}
            {/*                                    className={`block px-6 py-2 text-sm hover:bg-gray-700 transition-colors ${*/}
            {/*                                        subItem.active*/}
            {/*                                            ? 'text-green-400'*/}
            {/*                                            : ''*/}
            {/*                                    }`}*/}
            {/*                                >*/}
            {/*                                    ● {subItem.label}*/}
            {/*                                </a>*/}
            {/*                            )}*/}
            {/*                        </li>*/}
            {/*                    ))}*/}
            {/*                </ul>*/}
            {/*            </li>*/}
            {/*        ))}*/}

            {/*        /!* Single items *!/*/}
            {/*        {singleItems.map((item, idx) => (*/}
            {/*            <li key={idx} className={item.className || ''}>*/}
            {/*                <a*/}
            {/*                    href={item.href}*/}
            {/*                    target={item.external ? '_blank' : undefined}*/}
            {/*                    rel={*/}
            {/*                        item.external*/}
            {/*                            ? 'noopener noreferrer'*/}
            {/*                            : undefined*/}
            {/*                    }*/}
            {/*                    className="flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors"*/}
            {/*                >*/}
            {/*                    {item.icon}*/}
            {/*                    <span>{item.label}</span>*/}
            {/*                </a>*/}
            {/*            </li>*/}
            {/*        ))}*/}
            {/*    </ul>*/}
            {/*</nav>*/}
            <nav className="flex-1 overflow-y-auto">
                <ul className="py-2">
                    {/* --- Khai báo --- */}
                    <li className="border-b border-gray-700">
                        <Link to={'admin/inputs'}>
                            <button
                                onClick={() => toggleMenu('khai-bao')}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                            >
                                <FolderPlus size={18} />
                                <span className="flex-1">Khai báo</span>
                                <span
                                    className={`transition-transform duration-200 ${
                                        openMenus['khai-bao'] ? 'rotate-90' : ''
                                    }`}
                                >
                                    ▶
                                </span>
                            </button>
                        </Link>

                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['khai-bao'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="khoi"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors text-green-400"
                                >
                                    ● Khối
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Lớp học
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="mon-hoc"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Môn học
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="tiet"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Tiết học
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="giao-vien"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Giáo viên
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Xếp lịch --- */}
                    <li className="border-b border-gray-700">
                        <Link to={'admin/xep-lich'}>
                            <button
                                onClick={() => toggleMenu('xep-lich')}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                            >
                                <CheckCircle size={18} />
                                <span className="flex-1">Xếp lịch</span>
                                <span
                                    className={`transition-transform duration-200 ${
                                        openMenus['xep-lich'] ? 'rotate-90' : ''
                                    }`}
                                >
                                    ▶
                                </span>
                            </button>
                        </Link>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['xep-lich'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="chu-nhiem-lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Giáo viên chủ nhiệm
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="phan-cong-giang-day"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Phân công giảng dạy
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="khoi-mon-tiet"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Khối - môn - tiết
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="thoi-khoa-bieu"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Xếp thời khoá biểu
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Cấu hình --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('cau-hinh')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <Settings size={18} />
                            <span className="flex-1">Cấu hình</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['cau-hinh'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['cau-hinh'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="set-ngay-hoc"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Set ngày học
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="set-ngay-nghi"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Set tiết nghỉ
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="tiet-co-dinh"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Tiết cố định
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Ghép lớp --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('ghep-lop')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <CheckCircle size={18} />
                            <span className="flex-1">Ghép lớp</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['ghep-lop'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['ghep-lop'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="ghep-lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Chọn lớp
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="tkb-ghep-lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● TKB ghép lớp
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Tách lớp --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('tach-lop')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <CheckCircle size={18} />
                            <span className="flex-1">Tách lớp</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['tach-lop'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['tach-lop'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="tach-lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Chọn lớp
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="tkb-tach-lop"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● TKB tách lớp
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- In TKB --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('in-tkb')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <Printer size={18} />
                            <span className="flex-1">In TKB</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['in-tkb'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['in-tkb'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="in-thoi-khoa-bieu-hoc-vien"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Học sinh
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="in-thoi-khoa-bieu-giao-vien"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Giáo viên
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Công khai TKB --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('cong-khai')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <Link size={18} />
                            <span className="flex-1">Công khai TKB</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['cong-khai'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['cong-khai'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="../tkb-hoc-sinh?s=1760334801GEXTujOmOH"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Học sinh
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="../tkb-giao-vien?s=1760334801GEXTujOmOH"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Giáo viên
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="../tkb-toan-truong?s=1760334801GEXTujOmOH"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Toàn trường
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <button className="w-full text-left px-6 py-2 text-sm hover:bg-gray-700 transition-colors">
                                    ● Đổi link
                                </button>
                            </li>
                        </ul>
                    </li>

                    {/* --- Backup TKB --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('backup')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <RotateCcw size={18} />
                            <span className="flex-1">Backup TKB</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['backup'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['backup'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="backup-tkb"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Sao lưu
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="restore-tkb"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Khôi phục
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="reset-thoi-khoa-bieu"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Làm mới
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* --- Xếp phòng --- */}
                    <li className="border-b border-gray-700">
                        <button
                            onClick={() => toggleMenu('xep-phong')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                        >
                            <Building size={18} />
                            <span className="flex-1">Xếp phòng</span>
                            <span
                                className={`transition-transform duration-200 ${
                                    openMenus['xep-phong'] ? 'rotate-90' : ''
                                }`}
                            >
                                ▶
                            </span>
                        </button>
                        <ul
                            className={`overflow-hidden transition-all duration-300 ${
                                openMenus['xep-phong'] ? 'max-h-96' : 'max-h-0'
                            }`}
                        >
                            <li className="bg-gray-900">
                                <a
                                    href="phong"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Phòng
                                </a>
                            </li>
                            <li className="bg-gray-900">
                                <a
                                    href="xep-phong"
                                    className="block px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
                                >
                                    ● Sắp xếp
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
