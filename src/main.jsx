import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// StrictMode ইচ্ছাকৃতভাবে বন্ধ: ক্যামেরা স্ক্যানার (html5-qrcode) দুইবার চালু/বন্ধ হয়ে সমস্যা করে।
createRoot(document.getElementById('root')).render(<App />);
