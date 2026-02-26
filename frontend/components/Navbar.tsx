'use client';

import Link from "next/link";
import { useAuth } from '@/app/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (isAuthPage) {
        return null;
    }

    return (
        <nav className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm">
            <Link
                href="/"
                className="font-bold text-xl tracking-tight text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm"
            >
                BusinessSim <span className="text-gray-400 font-normal">v1.0</span>
            </Link>

            <div className="flex items-center gap-6">
                {user?.email && (
                    <span className="text-sm text-gray-600">
                        Logged in as: <span className="font-medium text-black">{user.email}</span>
                    </span>
                )}
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="rounded-md px-2 py-1 text-sm font-medium text-zinc-700 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                        Logout
                    </button>
                ) : (
                    <div className="flex items-center gap-3 text-sm">
                        <Link
                            href="/login"
                            className="rounded-md px-2 py-1 font-medium text-zinc-700 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                        >
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
