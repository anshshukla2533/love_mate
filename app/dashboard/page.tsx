'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RecommendedTasks from '@/components/RecommendedTasks';
import ChatRoom from '@/components/ChatRoom';
import TaskExperienceSection from '@/components/TaskExperienceSection';

interface Match {
    id: string;
    status: string;
    taskStatus: string;
    taskProofUrl?: string;
    boy: { id: string; name: string; age: number };
    girl: { id: string; name: string; age: number };
    task: { id: string; title: string; description: string; category: string; difficulty: string };
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [friends, setFriends] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [finding, setFinding] = useState(false);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [activeFriendChat, setActiveFriendChat] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            Promise.all([fetchMatch(), fetchFriends()]).finally(() => setLoading(false));
        }
    }, [status, router]);

    const fetchMatch = async () => {
        try {
            const res = await fetch('/api/matches');
            const data = await res.json();
            setMatch(data.match);
        } catch (err) {
            console.error('Failed to fetch match:', err);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            const data = await res.json();
            if (data.friends) {
                setFriends(data.friends);
            }
        } catch (err) {
            console.error('Failed to fetch friends:', err);
        }
    };

    const updateMatchAction = async (matchId: string, action: string, extraData: Record<string, unknown> = {}) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/matches/${matchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...extraData }),
            });

            if (res.ok) {
                if (action === 'part_ways' || action === 'decline_friend') {
                    setMatch(null);
                } else {
                    const data = await res.json();
                    if (data.match?.status === 'friend') {
                        setMatch(null);
                        fetchFriends();
                    } else {
                        fetchMatch();
                    }
                }
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to sync with the stars');
            }
        } catch (err) {
            setError('The universe is fluctuating. Try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetMatchId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                await updateMatchAction(targetMatchId, 'complete_task', { proofUrl: data.url });
            } else {
                setError('Vibration failed. Check your connection.');
            }
        } catch (err) {
            setError('The stars are clouded. Could not upload.');
        } finally {
            setUploading(false);
        }
    };

    const QuestCard = ({ m, isCompact = false }: { m: Match, isCompact?: boolean }) => (
        <div className={`love-gradient rounded-[3rem] text-white p-8 space-y-4 shadow-xl card-hover relative overflow-hidden group ${isCompact ? 'scale-95 origin-top' : ''}`}>
            <div className="absolute top-2 right-6 text-6xl opacity-20 rotate-12 font-black">QUEST</div>
            <div className="relative z-10 flex flex-col h-full">
                <div>
                    <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-1">Shared Quest</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {m.task.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-rose-400/40 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {m.task.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.taskStatus === 'completed' ? 'bg-emerald-400/60' :
                            m.taskStatus === 'ongoing' ? 'bg-amber-400/60' : 'bg-white/10'
                            }`}>
                            {m.taskStatus}
                        </span>
                    </div>
                    <h4 className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black mb-2`}>{m.task.title}</h4>
                    {!isCompact && (
                        <p className="text-white/80 font-medium leading-relaxed italic mb-6">
                            &quot;{m.task.description}&quot;
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-white/20">
                    {m.taskStatus === 'pending' ? (
                        <button
                            onClick={() => updateMatchAction(m.id, 'start_task')}
                            disabled={actionLoading}
                            className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-xl active:scale-95"
                        >
                            {actionLoading ? 'Initializing...' : 'Accept Quest ✨'}
                        </button>
                    ) : m.taskStatus === 'ongoing' ? (
                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-white/40 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase">Uploading...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-2xl">📸</span>
                                        <span className="text-[10px] font-black uppercase">Upload Proof</span>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, m.id)} disabled={uploading} />
                            </label>
                            <p className="text-[9px] text-center font-bold text-white/60 uppercase tracking-widest">Share the memory to complete</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {m.taskProofUrl && (
                                <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg mb-2">
                                    <img src={m.taskProofUrl} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/40 rounded-2xl border border-emerald-400/50 mb-4">
                                <span className="text-xl">🌟</span>
                                <span className="font-black uppercase tracking-widest text-xs">Harmony Achieved</span>
                            </div>
                            <button
                                onClick={() => updateMatchAction(m.id, 'assign_task')}
                                disabled={actionLoading}
                                className="w-full py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-white/40 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? 'Consulting Stars...' : <><span>✨</span> New Shared Quest</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const findMatch = async () => {
        setFinding(true);
        setError('');

        try {
            const res = await fetch('/api/matches', {
                method: 'POST',
            });

            const data = await res.json();

            if (res.ok) {
                setMatch(data.match);
            } else {
                setError(data.error || 'The universe is busy. Try again later!');
            }
        } catch (err) {
            setError('An error occurred while calling the stars');
        } finally {
            setFinding(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    const partner = match
        ? session?.user?.id === match.boy.id
            ? match.girl
            : match.boy
        : null;

    const hasSentRequest = match?.status === `friend_request_${session?.user?.id}`;
    const hasReceivedRequest = match?.status.startsWith('friend_request_') && !hasSentRequest;

    return (
        <div className="min-h-screen p-4 py-12 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[0%] left-[-5%] w-[30%] h-[30%] bg-rose-100/40 blur-[100px] rounded-full" />
            <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-pink-100/40 blur-[120px] rounded-full" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="glass rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-black text-love">
                            Hello, {session?.user?.name}!
                        </h1>
                        <p className="text-gray-500 font-semibold mt-2">Your journey to a shared soul starts here.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/profile"
                            className="px-8 py-3 bg-white hover:bg-rose-50 border border-rose-100 rounded-2xl font-bold text-rose-600 transition-all shadow-lg card-hover"
                        >
                            Update Heart
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Status Column */}
                    <div className="lg:col-span-12">
                        {match ? (
                            <div className="glass rounded-[4rem] p-10 md:p-16 space-y-12 shadow-[0_32px_64px_-16px_rgba(255,182,193,0.4)] border-white/80">
                                <div className="text-center space-y-4">
                                    <div className="text-8xl animate-bounce">💘</div>
                                    <h2 className="text-6xl md:text-7xl font-black text-love">
                                        Destiny Found!
                                    </h2>
                                    <p className="text-xl text-gray-500 font-bold uppercase tracking-widest">A shared journey has begun</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-white/60 rounded-[3rem] border border-white space-y-6 card-hover flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-4">Your Partner</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full love-gradient flex items-center justify-center text-white text-2xl font-black">
                                                    {partner?.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black text-gray-800">{partner?.name}</p>
                                                    <p className="text-gray-500 font-bold">{partner?.age} Radiant Years</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-6 border-t border-rose-50">
                                            {hasReceivedRequest ? (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center animate-pulse">
                                                        Partner wants to stay connected! ✨
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => updateMatchAction(match.id, 'accept_friend')}
                                                            disabled={actionLoading}
                                                            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-100"
                                                        >
                                                            {actionLoading ? 'Syncing...' : 'Accept 🌸'}
                                                        </button>
                                                        <button
                                                            onClick={() => updateMatchAction(match.id, 'decline_friend')}
                                                            disabled={actionLoading}
                                                            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                                        >
                                                            {actionLoading ? 'Declining...' : 'Decline'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : hasSentRequest ? (
                                                <div className="space-y-3">
                                                    <button
                                                        disabled
                                                        className="w-full px-4 py-3 bg-rose-50 text-rose-300 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-dashed border-rose-200"
                                                    >
                                                        Vibration Sent... 📡
                                                    </button>
                                                    <button
                                                        onClick={() => updateMatchAction(match.id, 'part_ways')}
                                                        disabled={actionLoading}
                                                        className="w-full px-4 py-3 text-gray-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Cancel & Part Ways
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => updateMatchAction(match.id, 'request_friend')}
                                                        disabled={actionLoading}
                                                        className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading ? 'Saving...' : 'Keep Friend 🌸'}
                                                    </button>
                                                    <button
                                                        onClick={() => updateMatchAction(match.id, 'part_ways')}
                                                        disabled={actionLoading}
                                                        className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading ? 'Exiting...' : 'Part Ways 👋'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <QuestCard m={match} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16 pt-16 border-t border-rose-100">
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="flex items-center justify-between px-4">
                                            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                                <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                                                Heart Stream
                                            </h3>
                                        </div>
                                        <ChatRoom matchId={match.id} />
                                    </div>

                                    <div className="lg:col-span-5 space-y-8">
                                        <TaskExperienceSection matchId={match.id} />
                                        {match.taskStatus === 'ongoing' && (
                                            <div className="p-8 glass rounded-[3rem] border-rose-100 shadow-xl space-y-4 animate-in fade-in slide-in-from-right-8">
                                                <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">Active Focus</h3>
                                                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 italic font-medium text-gray-600">
                                                    &quot;Work with {partner?.name} to {match.task.title.toLowerCase()} and upload your memory here.&quot;
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center pt-8">
                                    <div className="inline-block px-10 py-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-black text-xl animate-pulse">
                                        Status: {match.taskStatus === 'completed' ? 'Quest Completed 🌸' : 'Active Connection ✨'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="glass rounded-[4rem] p-12 md:p-20 text-center space-y-10 shadow-2xl border-white/80 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 text-9xl opacity-5 pointer-events-none">✨</div>
                                    <div className="text-8xl mb-4 grayscale opacity-40">🔍</div>
                                    <div className="space-y-4 max-w-2xl mx-auto">
                                        <h2 className="text-5xl md:text-6xl font-black text-gray-800 leading-tight">Searching for Synchronization</h2>
                                        <p className="text-lg text-gray-500 font-medium">
                                            The hearts are aligning. Ready to find the one who speaks your soul&apos;s language?
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl text-rose-600 text-sm font-bold max-w-md mx-auto animate-shake">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={findMatch}
                                        disabled={finding}
                                        className="group relative px-14 py-6 love-gradient text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:shadow-rose-400/50 transition-all duration-500 transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 overflow-hidden"
                                    >
                                        <span className="relative z-10">{finding ? 'Aligning the Stars...' : 'Invite Destiny 💕'}</span>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                                    </button>

                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Tip: Use <Link href="/profile" className="text-rose-400 hover:text-rose-600 underline">Heart Settings</Link> for better alignment
                                    </p>
                                </div>

                                {/* Friends Sanctuary Section */}
                                {friends.length > 0 && (
                                    <div className="space-y-8 pt-12">
                                        <div className="flex items-center justify-between px-6">
                                            <h2 className="text-4xl font-black text-gray-800">Friends Sanctuary</h2>
                                            <span className="px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                                                {friends.length} Soul Connections
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {friends.map((f) => {
                                                const fPartner = session?.user?.id === f.boy.id ? f.girl : f.boy;
                                                return (
                                                    <div
                                                        key={f.id}
                                                        className={`glass p-6 rounded-[2.5rem] border-white/60 hover:bg-white/60 transition-all cursor-pointer card-hover ${activeFriendChat === f.id ? 'ring-4 ring-rose-200 bg-white/80 md:col-span-2' : ''}`}
                                                        onClick={() => setActiveFriendChat(activeFriendChat === f.id ? null : f.id)}
                                                    >
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-12 h-12 rounded-full love-gradient flex items-center justify-center text-white font-black">
                                                                {fPartner.name[0]}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-black text-gray-800">{fPartner.name}</p>
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Shared {f.task.title}</p>
                                                                    </div>
                                                                    {f.taskStatus === 'completed' && <span className="text-emerald-500 text-sm">✨</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {activeFriendChat === f.id ? (
                                                            <div
                                                                className="mt-4 animate-in fade-in slide-in-from-top-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between px-2">
                                                                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">Whisper Box</h4>
                                                                    </div>
                                                                    <ChatRoom matchId={f.id} />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between px-2">
                                                                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">Friendship Quest</h4>
                                                                    </div>
                                                                    <QuestCard m={f} isCompact />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-center mt-2 px-2">
                                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
                                                                    Tap to open sanctuary ✨
                                                                </p>
                                                                <span className={`w-2 h-2 rounded-full ${f.taskStatus === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Tasks Section for Unmatched Users */}
                                <RecommendedTasks />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
