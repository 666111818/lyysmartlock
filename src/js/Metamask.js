export const checkMetaMask = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected accounts:", accounts);  // 打印连接的账户信息
      return accounts[0];  // 返回连接的用户地址
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask. Please try again.");
      return null;
    }
  } else {
    alert('Please install MetaMask!');
    return null;
  }
};
