
import './App.css';

import DinggNav from './nav/DinggNav';
import Main from './main/Main';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [navOption, setNavOption] = useState("home");
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const i = index === (navs.length - 1)? 0:index + 1; 
      //console.log('Swipe left', i)
      setIndex(i); 
      setNavOption(navs[i]);
    },
    onSwipedRight: () => {
      const i = index === 0? navs.length - 1:index - 1; 
      //console.log('Swipe right', i)
      setIndex(i); 
      setNavOption(navs[i]);
    },
  });
  const navs = ['home', 'products', 'finance'];
  const [index, setIndex] = useState(0);
  return (
    <div  {...handlers}>
      <DinggNav token={token} setToken={setToken} navOption={navOption} setNavOption={setNavOption}/>
      <Main token={token} setToken={setToken} navOption={navOption} setNavOption={setNavOption}/>
      <div style={{height: 96}}/>
    </div>
  );
}

export default App;
