import React from 'react';
import { format } from 'date-fns';
import './ArticleCard.css';

const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

const ArticleCard = ({ article, isBookmarked, onBookmark }) => {
  const readingTime = calculateReadingTime(article.content);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.content.substring(0, 100) + '...',
        url: article.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <article className="article-card">
      <div className="article-header">
        <span className="department-tag">{article.department}</span>
        <div className="article-actions">
          <button 
            className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmark(article)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z"/>
            </svg>
          </button>
          <button 
            className="share-button"
            onClick={handleShare}
            aria-label="Share article"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.136 10.136 0 0 1 3 18C3 12.477 7.477 8 13 8V2.5L23.5 11 13 19.5V14zm-2-2h4v3.308L20.321 11 15 6.692V10h-2a7.982 7.982 0 0 0-6.057 2.773A10.988 10.988 0 0 1 11 12z"/>
            </svg>
          </button>
        </div>
      </div>
      <h2 className="article-title">{article.title}</h2>
      <div className="article-meta">
        <span className="date">{format(new Date(article.date), 'MMM d, yyyy')}</span>
        <span className="reading-time">{readingTime} min read</span>
      </div>
      <p className="article-excerpt">{article.content.substring(0, 200)}...</p>
      <div className="article-footer">
        <div className="officials">
          {article.officials.map((official, index) => (
            <span key={index} className="official-tag">{official}</span>
          ))}
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
          Read More
        </a>
      </div>
    </article>
  );
};

ArticleCard.Skeleton = function ArticleCardSkeleton() {
  return (
    <div className="article-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-tag"></div>
        <div className="skeleton-actions">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      <div className="skeleton-title"></div>
      <div className="skeleton-meta">
        <div className="skeleton-date"></div>
        <div className="skeleton-reading-time"></div>
      </div>
      <div className="skeleton-excerpt"></div>
      <div className="skeleton-footer">
        <div className="skeleton-officials">
          <div className="skeleton-tag"></div>
          <div className="skeleton-tag"></div>
        </div>
        <div className="skeleton-read-more"></div>
      </div>
    </div>
  );
};

export default ArticleCard;