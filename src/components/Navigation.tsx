"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/nodes", label: "Nodes" },
        { href: "/rooms", label: "Rooms" },
        { href: "/map", label: "Map" },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-2 items-center justify-between h-20 md:h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            WIRES-X Viewer
                        </span>
                    </Link>

                    <div className="flex space-x-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === link.href
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
