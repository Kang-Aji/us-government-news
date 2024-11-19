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
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch congressional activities');
            }
            const data = await response.json();
            console.log('Received congressional data:', data);
            setActivities(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching congressional activities:', err);
            setError(err.message || 'Error loading congressional activities');
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
                <button onClick={fetchActivities} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (err) {
            console.error('Error formatting date:', dateString, err);
            return 'Date unavailable';
        }
    };

    return (
        <div className="congressional-activity">
            <div className="tabs">
                <button 
                    className={activeTab === 'bills' ? 'active' : ''} 
                    onClick={() => setActiveTab('bills')}
                >
                    Recent Bills ({activities.bills?.length || 0})
                </button>
                <button 
                    className={activeTab === 'votes' ? 'active' : ''} 
                    onClick={() => setActiveTab('votes')}
                >
                    Recent Votes ({activities.votes?.length || 0})
                </button>
            </div>

            <div className="activity-content">
                {activeTab === 'bills' && (
                    <div className="bills-list">
                        {activities.bills?.length === 0 ? (
                            <p className="no-data">No recent bills available</p>
                        ) : (
                            activities.bills?.map(bill => (
                                <div key={bill.id} className="activity-card">
                                    <h3>{bill.title}</h3>
                                    <div className="bill-meta">
                                        <span className="sponsor">Sponsor: {bill.sponsor}</span>
                                        <span className="date">
                                            Introduced: {formatDate(bill.introducedDate)}
                                        </span>
                                    </div>
                                    <p className="latest-action">{bill.latestAction}</p>
                                    <a 
                                        href={bill.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="view-more"
                                    >
                                        View Bill Details
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'votes' && (
                    <div className="votes-list">
                        {activities.votes?.length === 0 ? (
                            <p className="no-data">No recent votes available</p>
                        ) : (
                            activities.votes?.map(vote => (
                                <div key={vote.id} className="activity-card">
                                    <h3>{vote.question}</h3>
                                    <div className="vote-meta">
                                        <span className="chamber">{vote.chamber}</span>
                                        <span className="date">
                                            {formatDate(vote.date)}
                                        </span>
                                    </div>
                                    <div className="vote-results">
                                        <div className="vote-count">
                                            <span className="yea">Yea: {vote.totalYea}</span>
                                            <span className="nay">Nay: {vote.totalNay}</span>
                                        </div>
                                        <span className="result">Result: {vote.result || 'Pending'}</span>
                                    </div>
                                    {vote.url && (
                                        <a 
                                            href={vote.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="view-more"
                                        >
                                            View Vote Details
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CongressionalActivity;
