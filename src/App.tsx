
import './App.css';

import DinggNav from './nav/DinggNav';
import Main from './main/Main';
import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import callAPI, { callPOSTAPI } from './main/tile/Utility';

interface ITokenContext {
  token: string | null;
  employeeName: string | null;
  setEmployeeName: (employeeName: string | null) => void;
  location: string | null;
  setLocation: (location: string | null) => void;
  updateToken: (token: string | null) => void;
  navOption: string;
  setNavOption: any;
  callAPI: (url: string, cb: any) => void;
  callPOSTAPI: (url: string, data: any, cb: any) => void;
  darkMode: boolean;
}

const TokenContext = React.createContext<ITokenContext>({ token: null, employeeName: null, location: null, setEmployeeName: () => {}, setLocation: () => {}, updateToken: () => {}, navOption: '', setNavOption: () => {}, callAPI: () => {}, callPOSTAPI: () => {}, darkMode: false});
const API_BASE_URL = 'https://api.dingg.app/api/v1';
function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [navOption, setNavOption] = useState("home");
  const [employeeName, setEmployeeName] = useState(localStorage.getItem("employeeName"));
  const [locationName, setLocationName] = useState(localStorage.getItem("locationName"));
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const i = index === (navs.length - 1) ? 0 : index + 1;
      //console.log('Swipe left', i)
      setIndex(i);
      setNavOption(navs[i]);
    },
    onSwipedRight: () => {
      const i = index === 0 ? navs.length - 1 : index - 1;
      //console.log('Swipe right', i)
      setIndex(i);
      setNavOption(navs[i]);
    },
  });
  const navs = ['home', 'products', 'finance', 'staff'];
  const [index, setIndex] = useState(0);
  const updateToken = (token: string | null) => {
    setToken(token);
    localStorage.removeItem("token");
    if(token !== null) {
      localStorage.setItem("token", token);
    }
  }
  const setEmpName = (employeeName: string | null) => {
    setEmployeeName(employeeName || '');
    localStorage.removeItem("employeeName");
    if(employeeName !== null) {
      localStorage.setItem("employeeName", employeeName);
    }
  }

  const setLocation = (location: string | null) => {
    setLocationName(location || '');
    localStorage.removeItem("locationName");
    if(location !== null) {
      localStorage.setItem("locationName", location);
    }
  }
  
  const callGetAPI = (url: string, cb: any) => {
    callAPI(url, token, setToken, cb);
  }

  const callPOSTAPI2 = (url: string, data: object, cb: any) => {
    callPOSTAPI(url, data, token, setToken, cb);
  }

  const [darkMode, setDarkMode] = useState(!window.matchMedia('(prefers-color-scheme: dark)').matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        console.log("Dark mode is " + (e.matches ? "on" : "off"));
        setDarkMode(!e.matches);
    });

  return (
    <TokenContext.Provider value={{ token, employeeName, location: locationName, setEmployeeName: setEmpName, setLocation, updateToken, navOption, setNavOption, callAPI: callGetAPI, callPOSTAPI: callPOSTAPI2, darkMode: darkMode }}>
      <div  {...handlers}>
        <DinggNav />
        <Main />
        <div style={{ height: 96 }} />
      </div>
    </TokenContext.Provider>
  );
}

export { TokenContext, API_BASE_URL };

export default App;

