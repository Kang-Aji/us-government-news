import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './CongressionalActivity.css';

const CongressionalActivity = () => {
    const [activities, setActivities] = useState({ bills: [], votes: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('bills');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/congressional-activity');
            if (!response.ok) {
                throw new Error('Failed to fetch congressional activities');
            }
            const data = await response.json();
            setActivities(data);
            setError(null);
        } catch (err) {
            setError('Error loading congressional activities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="congressional-activity loading">
                <div className="skeleton-loader">
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="congressional-activity error">
                <p>{error}</p>
                <button onClick={fetchActivities}>Retry</button>
            </div>
        );
    }

    return (
        <div className="congressional-activity">
            <div className="tabs">
                <button 
                    className={activeTab === 'bills' ? 'active' : ''} 
                    onClick={() => setActiveTab('bills')}
                >
                    Recent Bills
                </button>
                <button 
                    className={activeTab === 'votes' ? 'active' : ''} 
                    onClick={() => setActiveTab('votes')}
                >
                    Recent Votes
                </button>
            </div>

            <div className="activity-content">
                {activeTab === 'bills' && (
                    <div className="bills-list">
                        {activities.bills.map(bill => (
                            <div key={bill.id} className="activity-card">
                                <h3>{bill.title}</h3>
                                <div className="bill-meta">
                                    <span className="sponsor">Sponsor: {bill.sponsor}</span>
                                    <span className="date">
                                        Introduced: {format(new Date(bill.introducedDate), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="latest-action">{bill.latestAction}</p>
                                <a href={bill.url} target="_blank" rel="noopener noreferrer" className="view-more">
                                    View Bill Details
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'votes' && (
                    <div className="votes-list">
                        {activities.votes.map(vote => (
                            <div key={vote.id} className="activity-card">
                                <h3>{vote.question}</h3>
                                <div className="vote-meta">
                                    <span className="chamber">{vote.chamber}</span>
                                    <span className="date">
                                        {format(new Date(vote.date), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="vote-results">
                                    <div className="vote-count">
                                        <span className="yea">Yea: {vote.totalYea}</span>
                                        <span className="nay">Nay: {vote.totalNay}</span>
                                    </div>
                                    <span className="result">Result: {vote.result}</span>
                                </div>
                                <a href={vote.url} target="_blank" rel="noopener noreferrer" className="view-more">
                                    View Vote Details
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CongressionalActivity;
