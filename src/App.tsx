
import './App.css';

import DinggNav from './nav/DinggNav';
import Main from './main/Main';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [navOption, setNavOption] = useState("home");
  return (
    <div>
      <DinggNav token={token} setToken={setToken} navOption={navOption} setNavOption={setNavOption}/>
      <Main token={token} setToken={setToken} navOption={navOption} setNavOption={setNavOption}/>
    </div>
  );
}

export default App;
