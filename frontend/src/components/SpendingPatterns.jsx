import React, { useState, useEffect } from 'react';
import '../styles/SpendingPatterns.css';
import { t } from '../utils/localization';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const SpendingPatterns = ({ onBack, language }) => {
  const [spendingData, setSpendingData] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'diary'
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [newDiaryEntry, setNewDiaryEntry] = useState('');

  useEffect(() => {
    // Fetch spending data from backend
    fetchSpendingData();
    
    // Load diary entries from localStorage
    const savedDiary = localStorage.getItem('userDiary');
    if (savedDiary) {
      setDiaryEntries(JSON.parse(savedDiary));
    }
  }, [timeRange]);

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from the backend
      // For this demo, we'll use mock data
      const mockData = {
        daily: [
          { category: t('groceries', language), amount: 250, percentage: 25 },
          { category: t('transport', language), amount: 120, percentage: 12 },
          { category: t('entertainment', language), amount: 80, percentage: 8 },
          { category: t('utilities', language), amount: 100, percentage: 10 },
          { category: t('dining', language), amount: 90, percentage: 9 },
          { category: t('other', language), amount: 360, percentage: 36 }
        ],
        weekly: [
          { category: t('groceries', language), amount: 2500, percentage: 35 },
          { category: t('transport', language), amount: 1200, percentage: 17 },
          { category: t('entertainment', language), amount: 800, percentage: 11 },
          { category: t('utilities', language), amount: 1000, percentage: 14 },
          { category: t('dining', language), amount: 900, percentage: 13 },
          { category: t('other', language), amount: 700, percentage: 10 }
        ],
        monthly: [
          { category: t('groceries', language), amount: 10000, percentage: 30 },
          { category: t('transport', language), amount: 4800, percentage: 14 },
          { category: t('entertainment', language), amount: 3200, percentage: 10 },
          { category: t('utilities', language), amount: 4000, percentage: 12 },
          { category: t('dining', language), amount: 3600, percentage: 11 },
          { category: t('rent', language), amount: 12000, percentage: 33 }
        ]
      };
      
      // Simulate API delay
      setTimeout(() => {
        setSpendingData(mockData[timeRange] || mockData.monthly);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching spending data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Prepare data for pie chart
  const pieChartData = {
    labels: spendingData.map(item => item.category),
    datasets: [
      {
        data: spendingData.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
  };

  // Handle diary entry submission
  const handleAddDiaryEntry = () => {
    if (newDiaryEntry.trim() === '') return;
    
    const entry = {
      id: Date.now(),
      text: newDiaryEntry,
      date: new Date().toLocaleString()
    };
    
    const updatedDiary = [entry, ...diaryEntries];
    setDiaryEntries(updatedDiary);
    localStorage.setItem('userDiary', JSON.stringify(updatedDiary));
    setNewDiaryEntry('');
  };

  // Handle diary entry deletion
  const handleDeleteDiaryEntry = (id) => {
    const updatedDiary = diaryEntries.filter(entry => entry.id !== id);
    setDiaryEntries(updatedDiary);
    localStorage.setItem('userDiary', JSON.stringify(updatedDiary));
  };

  return (
    <div className="spending-patterns-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>{t('spending_patterns', language)}</h1>
      </div>
      <div className="patterns-container">
        <div className="controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="daily">{t('daily', language)}</option>
            <option value="weekly">{t('weekly', language)}</option>
            <option value="monthly">{t('monthly', language)}</option>
          </select>
        </div>

        {/* Tab navigation */}
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            {t('spending_patterns', language)}
          </button>
          <button 
            className={`tab-button ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            {t('user_diary', language)}
          </button>
        </div>

        {loading ? (
          <div className="loading">{t('loading_spending_patterns', language)}...</div>
        ) : (
          <div className="visualization">
            {activeTab === 'chart' ? (
              <>
                <div className="chart-container">
                  <h3>{t('spending_by_category', language)}</h3>
                  <div className="pie-chart-container">
                    <Pie data={pieChartData} options={pieChartOptions} />
                  </div>
                </div>

                <div className="summary">
                  <h3>{t('spending_summary', language)}</h3>
                  <div className="summary-list">
                    {spendingData.map((item, index) => (
                      <div key={index} className="summary-item">
                        <div className="summary-header">
                          <span className="category">{item.category}</span>
                          <span className="percentage">{item.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          ></div>
                        </div>
                        <div className="amount">{formatCurrency(item.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="diary-container">
                <h3>{t('user_diary', language)}</h3>
                <div className="diary-input-container">
                  <textarea
                    value={newDiaryEntry}
                    onChange={(e) => setNewDiaryEntry(e.target.value)}
                    placeholder={t('add_financial_note', language)}
                    className="diary-textarea"
                  />
                  <button 
                    className="add-diary-button" 
                    onClick={handleAddDiaryEntry}
                  >
                    {t('add_entry', language)}
                  </button>
                </div>
                
                <div className="diary-entries">
                  {diaryEntries.length === 0 ? (
                    <div className="empty-diary">
                      <p>{t('no_diary_entries', language)}</p>
                    </div>
                  ) : (
                    diaryEntries.map(entry => (
                      <div key={entry.id} className="diary-entry">
                        <div className="diary-entry-header">
                          <span className="diary-date">{entry.date}</span>
                          <button 
                            className="delete-entry-button"
                            onClick={() => handleDeleteDiaryEntry(entry.id)}
                          >
                            {t('delete', language)}
                          </button>
                        </div>
                        <p className="diary-text">{entry.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingPatterns;