// src/context/MetaMaskContext.js
import React, { createContext, useState, useContext } from 'react';

// 创建 Context
const MetaMaskContext = createContext();

// 提供 MetaMask 状态的 Provider
export const MetaMaskProvider = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [isSystemUser, setIsSystemUser] = useState(false);

  return (
    <MetaMaskContext.Provider value={{ userAddress, setUserAddress, isSystemUser, setIsSystemUser }}>
      {children}
    </MetaMaskContext.Provider>
  );
};

// 自定义 Hook，便于使用 Context
export const useMetaMask = () => useContext(MetaMaskContext);
