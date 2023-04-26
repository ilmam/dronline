import React from 'react';
import TA from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import Dashboard from './components/layout/dashboard';
import AuthGuard from './components/AuthGuard';

TA.addDefaultLocale(en);

function App() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

export default App;
