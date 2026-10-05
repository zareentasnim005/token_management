import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFlow } from '../context/FlowContext.jsx';
import { getStudentTokens } from '../services/tokenService.js';
import TokenCard from '../components/TokenCard.jsx';
import { Empty, Spinner, Alert } from '../components/ui.jsx';

export default function TokenList() {
    const { flow } = useFlow();
    const [tokens, setTokens] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!flow.student) return;
        let alive = true;
        setTokens(null);
        setError('');
        getStudentTokens(flow.student.studentId)
            .then((list) => alive && setTokens(list))
            .catch(() => alive && setError('টোকেন লোড করা যায়নি। আবার চেষ্টা করুন।'));
        return () => {
            alive = false;
        };
    }, [flow.student]);

    if (!flow.student) {
        return (
            <main className="container narrow page-pad">
                <Empty icon="🔒" title="আগে আইডি দিন">
                    টোকেনের তালিকা দেখতে আগে শিক্ষার্থী আইডি দিয়ে ঢুকুন।
                </Empty>
                <div className="btn-row">
                    <Link to="/student" className="btn btn-primary">আইডি দিন →</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container narrow page-pad">
            <h1 className="section-title">টোকেন  লিস্ট</h1>
            <p className="card-sub">
                {flow.student.name} <span className="mono">({flow.student.studentId})</span> — এই আইডিতে কেনা সব মিল টোকেন এখানে দেখা যাবে।
            </p>

            {error && <Alert tone="error" icon="⚠️">{error}</Alert>}
            {tokens === null && !error && <Spinner label="টোকেন লোড হচ্ছে…" />}

            {tokens && tokens.length === 0 && (
                <Empty icon="🎫" title="এখনো কোনো টোকেন কেনা হয়নি">
                    মিল টোকেন কিনলে সেগুলো এখানে তালিকা আকারে দেখা যাবে।
                </Empty>
            )}

            {tokens && tokens.length > 0 && (
                <div className="print-area">
                    {tokens.map((t) => (
                        <TokenCard key={t.tokenId} token={t} />
                    ))}
                </div>
            )}

            <div className="btn-row no-print">
                <Link to="/student" className="btn btn-outline">← নতুন টোকেন কিনুন</Link>
            </div>
        </main>
    );
}