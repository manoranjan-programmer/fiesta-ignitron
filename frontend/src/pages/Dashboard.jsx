import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const tiers = [
    { title: "Tier 1 – Elite", items: [
        { name: "TimSort", scores: [9, 9, 10, 8, 9, 8, 9, 7, 9, 9] },
        { name: "Merge Sort", scores: [9, 9, 8, 8, 9, 7, 9, 7, 8, 9] },
        { name: "Quick Sort", scores: [9, 9, 7, 5, 8, 7, 9, 7, 8, 8] },
        { name: "Heap Sort", scores: [8, 8, 7, 7, 8, 6, 8, 6, 7, 8] },
        { name: "Intro Sort", scores: [9, 9, 8, 7, 9, 7, 9, 7, 8, 9] },
        { name: "Dual Pivot Quick", scores: [8, 9, 7, 6, 8, 7, 9, 6, 8, 8] },
        { name: "Block Sort", scores: [8, 8, 7, 7, 8, 6, 8, 6, 7, 8] },
        { name: "Smooth Sort", scores: [7, 8, 8, 7, 7, 6, 7, 6, 6, 7] },
        { name: "Library Sort", scores: [8, 8, 7, 7, 8, 6, 8, 6, 7, 8] },
        { name: "Grail Sort", scores: [8, 8, 7, 7, 8, 6, 8, 6, 7, 7] }
    ]},
    { title: "Tier 2 – Strong", items: [
        { name: "Radix Sort", scores: [8, 9, 7, 7, 9, 10, 9, 2, 1, 8] },
        { name: "Counting Sort", scores: [7, 8, 6, 6, 9, 10, 2, 1, 1, 7] },
        { name: "Bucket Sort", scores: [8, 8, 7, 7, 6, 6, 5, 9, 2, 7] },
        { name: "Flash Sort", scores: [7, 8, 6, 6, 7, 6, 6, 4, 3, 7] },
        { name: "Pigeonhole Sort", scores: [6, 7, 5, 5, 8, 9, 1, 1, 1, 6] },
        { name: "Spread Sort", scores: [8, 8, 7, 7, 8, 7, 8, 4, 4, 8] },
        { name: "American Flag", scores: [7, 8, 6, 6, 7, 8, 7, 2, 1, 7] },
        { name: "Cartesian Tree", scores: [6, 6, 6, 5, 6, 5, 6, 4, 4, 6] },
        { name: "Strand Sort", scores: [7, 6, 7, 5, 6, 5, 6, 4, 5, 6] },
        { name: "Comb Sort", scores: [6, 5, 6, 5, 6, 5, 6, 4, 5, 6] }
    ]},
    { title: "Tier 3 – Basic", items: [
        { name: "Insertion Sort", scores: [8, 2, 9, 3, 6, 6, 2, 4, 5, 6] },
        { name: "Selection Sort", scores: [6, 2, 6, 3, 5, 5, 2, 3, 4, 5] },
        { name: "Bubble Sort", scores: [6, 1, 7, 2, 5, 5, 1, 3, 4, 5] },
        { name: "Shell Sort", scores: [7, 5, 7, 6, 6, 6, 5, 5, 6, 7] },
        { name: "Cocktail Sort", scores: [6, 1, 7, 2, 5, 5, 1, 3, 4, 5] },
        { name: "Gnome Sort", scores: [6, 1, 7, 2, 5, 5, 1, 3, 4, 5] },
        { name: "Odd-Even Sort", scores: [6, 2, 6, 3, 5, 5, 2, 3, 4, 5] },
        { name: "Cycle Sort", scores: [6, 3, 6, 4, 5, 5, 3, 3, 4, 5] },
        { name: "Pancake Sort", scores: [6, 2, 6, 3, 5, 5, 2, 3, 4, 5] },
        { name: "Tree Sort", scores: [7, 4, 6, 4, 6, 5, 4, 4, 5, 6] }
    ]},
    { title: "Tier 4 – Wildcards", items: [
        { name: "Bogo Sort", scores: [2, 0, 3, 1, 2, 1, 0, 0, 0, 1] },
        { name: "Bozo Sort", scores: [2, 0, 3, 1, 2, 1, 0, 0, 0, 1] },
        { name: "Stalin Sort", scores: [4, 1, 6, 2, 3, 3, 1, 2, 2, 3] },
        { name: "Sleep Sort", scores: [3, 1, 3, 2, 2, 2, 1, 1, 0, 2] },
        { name: "Miracle Sort", scores: [1, 0, 10, 0, 1, 1, 0, 0, 0, 1] },
        { name: "Slow Sort", scores: [3, 1, 4, 2, 3, 2, 1, 1, 1, 2] },
        { name: "Stooge Sort", scores: [3, 1, 4, 2, 3, 2, 1, 1, 1, 2] },
        { name: "Thanos Sort", scores: [4, 1, 4, 2, 3, 2, 1, 1, 1, 3] },
        { name: "Quantum Bogo", scores: [1, 0, 2, 0, 1, 0, 0, 0, 0, 0] },
        { name: "Intelligent Design", scores: [2, 0, 3, 1, 2, 1, 0, 0, 0, 1] }
    ]}
];

const datasets = [
    'Small Random', 'Large Random', 'Nearly Sorted', 'Reverse Sorted',
    'Many Duplicates', 'Small Range', 'Wide Range', 'Floating Data',
    'Strings', 'Mixed Size'
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Added loading state
    const [step, setStep] = useState(1);
    const [teamName, setTeamName] = useState('');
    const [selectedBids, setSelectedBids] = useState([]);
    const [selectedData, setSelectedData] = useState([]);
    const [credits, setCredits] = useState('');
    const [finalScore, setFinalScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/auth/check`, { withCredentials: true });
                if (res.data.success) {
                    localStorage.setItem('cld_token', 'google_active');
                }
            } catch (err) {
                if (!localStorage.getItem('cld_token')) {
                    navigate('/login');
                }
            } finally {
                setIsCheckingAuth(false); // Finish loading
            }
        };
        checkAuth();
    }, [navigate]);

    const toggleBid = (itemName) => {
        setSelectedBids(prev => prev.includes(itemName) ? prev.filter(i => i !== itemName) : [...prev, itemName]);
    };

    const toggleData = (d) => {
        setSelectedData(prev => {
            if (prev.includes(d)) return prev.filter(x => x !== d);
            if (prev.length >= 5) return prev;
            return [...prev, d];
        });
    };

    const handleFinalCalculation = async () => {
        setIsLoading(true);
        let algorithmTotal = 0;
        const credsValue = parseFloat(credits) || 0;

        selectedBids.forEach(bidName => {
            let foundItem = null;
            tiers.forEach(t => {
                const item = t.items.find(i => i.name === bidName);
                if (item) foundItem = item;
            });

            if (foundItem) {
                selectedData.forEach(dsName => {
                    const dsIndex = datasets.indexOf(dsName);
                    if (dsIndex !== -1) {
                        algorithmTotal += foundItem.scores[dsIndex];
                    }
                });
            }
        });

        const score = (credsValue / 100) + algorithmTotal;
        setFinalScore(score);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/submit-team`, {
                teamName, bids: selectedBids, selectedData, credits: credsValue, score
            }, { withCredentials: true });

            if (response.data.success) setStep(5);
        } catch (err) {
            alert(err.response?.data?.message || "Connection Error: Check if Backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('cld_token');
        window.location.href = `${BACKEND_URL}/auth/logout`;
    };

    // Prevent rendering anything while checking auth to avoid flashes/errors
    if (isCheckingAuth) return <div className="login-wrapper"><div className="page"><h2>Loading...</h2></div></div>;

    return (
        <div className="login-wrapper">
             <button className="btn-secondary" onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, width: 'auto', height: 40, padding: '0 20px', borderRadius: '10px', zIndex: 100 }}>
                Logout
            </button>

            <div className="page" style={{ 
                maxWidth: (step === 2 || step === 3) ? '800px' : '440px',
                transition: '0.4s ease' 
            }}>
                {step === 1 && (
                    <div className="step-content">
                        <h2>Team Setup</h2>
                        <div className="input-group">
                            <input type="text" placeholder="e.g. The Avengers" value={teamName} onChange={e => setTeamName(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" disabled={!teamName.trim()} onClick={() => setStep(2)}>Continue to Bids</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, textAlign: 'left' }}>Select Bids</h2>
                            <span className="link-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                {selectedBids.length} Selected
                            </span>
                        </div>
                        <div className="tiers-container" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                            {tiers.map((tier) => (
                                <div key={tier.title} className="tier-section" style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ textAlign: 'left', color: 'var(--accent-secondary)', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>{tier.title}</h3>
                                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                        {tier.items.map(it => (
                                            <button key={it.name} className={`btn ${selectedBids.includes(it.name) ? 'btn-primary' : 'btn-secondary'}`} 
                                            style={{ height: '48px', fontSize: '0.85rem' }} onClick={() => toggleBid(it.name)}>{it.name}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="btn-flex" style={{ display: 'flex', gap: '15px', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn btn-primary" disabled={selectedBids.length < 1} onClick={() => setStep(3)}>Next Step</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, textAlign: 'left' }}>Datasets</h2>
                            <span className="link-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                {selectedData.length}/5 Picked
                            </span>
                        </div>
                        <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                            {datasets.map(d => (
                                <button key={d} className={`btn ${selectedData.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ height: '48px', fontSize: '0.85rem' }} onClick={() => toggleData(d)}>{d}</button>
                            ))}
                        </div>
                        <div className="btn-flex" style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                            <button className="btn btn-primary" disabled={selectedData.length !== 5} onClick={() => setStep(4)}>Next Step</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="step-content">
                        <h2>Final Details</h2>
                        <div className="input-group">
                            <input type="number" placeholder="Credits (0-100)" value={credits} onChange={e => setCredits(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
                            <button className="btn btn-primary" onClick={handleFinalCalculation} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Calculate Score"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="step-content" style={{ textAlign: 'center' }}>
                        <h2>Simulation Ready</h2>
                        <div className="result-card" style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '30px', borderRadius: '16px', border: '1px solid var(--accent-primary)', margin: '20px 0' }}>
                            <h1 style={{ fontSize: '3.5rem', color: 'white', fontWeight: '800' }}>{finalScore?.toFixed(2)}</h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Final Score Saved</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setStep(1)}>Start Over</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;