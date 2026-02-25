'use client';

import Link from "next/link";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <nav className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="font-bold text-xl tracking-tight text-blue-600">
                BusinessSim <span className="text-gray-400 font-normal">v1.0</span>
            </div>

            <div className="flex items-center gap-6">
                {user?.email && (
                    <span className="text-sm text-gray-600">
                        Logged in as: <span className="font-medium text-black">{user.email}</span>
                    </span>
                )}
                {user ? (
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <Link href="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}
