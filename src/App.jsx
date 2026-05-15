import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShoppingList from './pages/ShoppingList';
import Menu from './pages/Menu';
import CampgroundTerms from './pages/CampgroundTerms';
import ErrorBoundary from './components/ErrorBoundary';
import { useTripCountdown } from './hooks/useTripCountdown';
import './App.css';

// Defaults to '/' for Vercel and local dev. For GitHub Pages, set VITE_BASE_PATH (e.g. '/july4-camping-shopping-list/').
const basePath = import.meta.env.VITE_BASE_PATH || '/';

function App() {
  const { tripStartIso, tripEndIso } = useTripCountdown();

  useEffect(() => {
    const title = 'July 4 weekend campout — shopping & meals';
    const description = `Independence Day weekend campout packing list and cook plan (${tripStartIso} → ${tripEndIso}). Shared shopping list and menu in one PWA.`;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }
  }, [tripStartIso, tripEndIso]);

  return (
    <ErrorBoundary>
      <Router basename={basePath}>
        <Routes>
          <Route path="/" element={<ShoppingList />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/terms" element={<CampgroundTerms />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
