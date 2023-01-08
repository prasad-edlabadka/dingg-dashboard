
import './App.css';

import DinggNav from './nav/DinggNav';
import Main from './main/Main';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <div>
      <DinggNav token={token} setToken={setToken}/>
      <Main token={token} setToken={setToken}/>
    </div>
  );
}

export default App;
