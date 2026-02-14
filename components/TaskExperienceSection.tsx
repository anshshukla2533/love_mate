'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Experience {
    id: string;
    content: string;
    proofUrl?: string;
    createdAt: string;
    user: { name: string };
}

export default function TaskExperienceSection({ matchId }: { matchId: string }) {
    const { data: session } = useSession();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [content, setContent] = useState('');
    const [proofUrl, setProofUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperiences();
    }, [matchId]);

    const fetchExperiences = async () => {
        try {
            const res = await fetch(`/api/tasks/experience?matchId=${matchId}`);
            const data = await res.json();
            if (data.experiences) {
                setExperiences(data.experiences);
            }
        } catch (err) {
            console.error('Fetch experiences error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/tasks/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, proofUrl, matchId }),
            });
            const data = await res.json();
            if (data.experience) {
                setExperiences((prev) => [data.experience, ...prev]);
                setContent('');
                setProofUrl('');
            }
        } catch (err) {
            console.error('Submit experience error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass rounded-[3rem] p-8 md:p-10 border-white/60 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-rose-600 flex items-center gap-3">
                        <span className="text-3xl">🏆</span> Echo Your Glory
                    </h3>
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em]">Proof of Vibration</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="How did it feel? Share the magic of your experience..."
                        className="w-full h-32 px-6 py-5 bg-white/50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium resize-none placeholder:text-gray-300"
                        required
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            placeholder="Proof Link / Image URL (Optional)"
                            className="flex-1 px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium text-sm"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-10 py-4 love-gradient text-white rounded-[1.5rem] font-black text-lg shadow-lg hover:shadow-rose-400/40 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Sharing...' : 'Publish Experience ✨'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <h4 className="text-xl font-black text-gray-700 ml-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-400 rounded-full" /> Shared Moments
                </h4>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                ) : experiences.length === 0 ? (
                    <div className="p-10 text-center glass rounded-[2rem] border-dashed border-rose-200 opacity-60">
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">No echoes yet. Be the first to speak.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="glass p-8 rounded-[2.5rem] border-white/80 space-y-4 card-hover shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full love-gradient flex items-center justify-center text-white font-black text-xs">
                                        {exp.user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-sm">{exp.user.name}</p>
                                        <p className="text-[10px] font-bold text-rose-300 uppercase">{new Date(exp.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <p className="text-gray-600 font-medium leading-relaxed italic">
                                    &quot;{exp.content}&quot;
                                </p>

                                {exp.proofUrl && (
                                    <a
                                        href={exp.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                                    >
                                        View Proof 🔗
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
