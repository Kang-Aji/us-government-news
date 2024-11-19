import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ArticleCard from './components/ArticleCard';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import Navbar from './components/Navbar';
import Newsletter from './components/Newsletter';
import CongressionalActivity from './components/CongressionalActivity';
import { useSocket } from './hooks/useSocket';
import { useArticles } from './hooks/useArticles';
import { useTrendingOfficials } from './hooks/useTrendingOfficials';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', []);
  const [filters, setFilters] = useState({
    official: '',
    department: '',
    keyword: '',
    topic: '',
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    totalArticles: 0,
    activeDepartments: 0,
    featuredOfficials: 0,
    lastUpdate: new Date(),
    topTopics: [],
  });
  
  const [articles, setArticles, articlesState] = useArticles(filters, searchTerm);
  const [trendingOfficials, setTrendingOfficials, trendingState] = useTrendingOfficials();
  
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleNewArticles = useCallback((newArticles) => {
    setArticles(prevArticles => [...newArticles, ...prevArticles]);
  }, []);
  
  const handleTrendingUpdate = useCallback((newTrending) => {
    setTrendingOfficials(newTrending);
  }, []);

  const handleAnalyticsUpdate = useCallback((newAnalytics) => {
    setAnalyticsData(typeof newAnalytics === 'function' ? newAnalytics(analyticsData) : newAnalytics);
  }, [analyticsData]);
  
  useSocket(handleNewArticles, handleTrendingUpdate, handleAnalyticsUpdate);

  const handleFilterChange = useCallback((filterName, filterValue) => {
    setFilters(prev => ({ ...prev, [filterName]: filterValue }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const toggleBookmark = useCallback((article) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(bookmark => bookmark.url === article.url);
      if (isBookmarked) {
        return prev.filter(bookmark => bookmark.url !== article.url);
      }
      return [...prev, article];
    });
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const isOfficialMatch = !filters.official || article.officials.includes(filters.official);
      const isDepartmentMatch = !filters.department || article.department === filters.department;
      const isTopicMatch = !filters.topic || article.topics.includes(filters.topic);
      const isKeywordMatch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase());

      if (filters.dateRange === 'today') {
        const isToday = new Date(article.date).toDateString() === new Date().toDateString();
        return isOfficialMatch && isDepartmentMatch && isKeywordMatch && isTopicMatch && isToday;
      }

      return isOfficialMatch && isDepartmentMatch && isKeywordMatch && isTopicMatch;
    });
  }, [articles, filters, searchTerm]);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <main className="container">
        <div className="search-section">
          <SearchBar onSearchChange={handleSearchChange} />
          <FilterBar 
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>
        <div className="content-grid">
          <div className="main-feed">
            {articlesState.error ? (
              <div className="error-message">Error loading articles: {articlesState.error}</div>
            ) : articlesState.loading ? (
              Array(3).fill().map((_, i) => <ArticleCard.Skeleton key={i} />)
            ) : filteredArticles.length === 0 ? (
              <div className="no-results">No articles found matching your criteria</div>
            ) : (
              <div className="articles-grid">
                {filteredArticles.map(article => (
                  <ArticleCard 
                    key={article.url} 
                    article={article}
                    isBookmarked={bookmarks.some(b => b.url === article.url)}
                    onBookmark={() => toggleBookmark(article)}
                  />
                ))}
              </div>
            )}
          </div>
          <aside className="sidebar">
            <Sidebar 
              trendingOfficials={trendingOfficials} 
              loading={trendingState.loading}
              error={trendingState.error}
              bookmarks={bookmarks}
            />
            <Analytics 
              data={analyticsData}
              loading={false}
              error={null}
            />
            <Newsletter />
            <CongressionalActivity />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;