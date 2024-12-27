  import { ethers } from 'ethers';
  import { IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI } from '../contract/identityOracle.js';
  import { SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI } from '../contract/SmartLock.js';


  export const checkMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum); 
        const accounts = await provider.send('eth_requestAccounts', []);
        console.log('Connected accounts:', accounts);
        return accounts[0];
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('Failed to connect to MetaMask. Please try again.');
        return null;
      }
    } else {
      alert('Please install MetaMask!');
      return null;
    }
  };


  export const checkSystemUser = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); 
      const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
      const isSystemUser = await contract.getUserIdentity(address);
      console.log('System user status:', isSystemUser);
      console.log(isSystemUser);
      return isSystemUser;
    } catch (error) {
      console.error('Error checking system user:', error);
      return false;
    }
  };

  export const fetchLockStatus = async (address, setIsLocked) => {
    try {

      console.log('SMART_LOCK_CONTRACT_ADDRESS:', SMART_LOCK_CONTRACT_ADDRESS); // 调试用
      console.log('SMART_LOCK_ABI:', SMART_LOCK_ABI); // 调试用

      // 确保 SMART_LOCK_CONTRACT_ADDRESS 和 ABI 有效
      if (!SMART_LOCK_CONTRACT_ADDRESS || !SMART_LOCK_ABI) {
        throw new Error("合约地址或 ABI 未正确配置");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
      const status = await contract.getLockStatus();
      setIsLocked(status);
    } catch (error) {
      console.error('Error fetching lock status:', error);
      alert('无法获取锁的状态，请稍后重试。');
    }
  };



  export const toggleLockStatus = async (address, isLocked, setIsLocked) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // 使用 BrowserProvider
      const signer = await provider.getSigner(); // 需要加上 await 来正确解析 signer
      const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

      // 根据锁定状态调用相应方法
      const tx = isLocked ? await contract.unlock(address) : await contract.lock(address);
      await tx.wait(); // 等待交易完成
      setIsLocked(!isLocked); // 更新锁定状态
    } catch (error) {
      console.error('切换锁状态时出错：', error);

      // 针对不同错误进行提示
      if (error.code === 4001) {
        alert('用户拒绝交易，请重试。');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('网络连接失败，请检查您的网络连接。');
      } else {
        alert('无法切换锁的状态，请稍后重试。');
      }
    }
  };

  export const getIdentityTimestamp = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // 使用 BrowserProvider 
      const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
      const timestamp = await contract.getIdentityTimestamp(address);
      console.log(timestamp);
      return Number(timestamp); // 转换为 JavaScript 数字类型
    } catch (error) {
      console.error('Error fetching identity timestamp:', error);
      return null;
    }
  };

  export const fetchLockOperations = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
    try {
      // 获取历史 LockOperation 事件
      const filter = contract.filters.LockOperation(); // 或者使用合适的 filter 来过滤
      const events = await contract.queryFilter(filter);
  
      const lockOperations = events.map(event => ({
        user: event.args.user,
        timestamp: Number(event.args.timestamp),
        operation: event.args.operation,
      }));
  
      return lockOperations;
    } catch (error) {
      console.error('Error fetching lock operations:', error);
      return [];
    }
  };
  // ********************************************************************************
  
  
  export const fetchUpdatedUsersLockStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); 
      const contractIdentity = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
      const contractLock = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
      
      const updatedUsers = await contractIdentity.getAllUpdatedUsers();
      console.log('Updated Users:', updatedUsers);  // 调试返回的用户列表
      
      const lockStatusList = [];
      
      for (const user of updatedUsers) {
        const lockStatus = await contractLock.getLockStatus(user);
        console.log(`Lock status for ${user}:`, lockStatus); // 打印锁定状态
        
        lockStatusList.push({
          user: user,
          lockStatus: lockStatus ? '已开启' : '已关闭',
        });
      }
      
      return lockStatusList;
    } catch (error) {
      console.error('Error fetching lock status for updated users:', error);
      return [];
    }
  };
  
  
  

  export const getLockStatus = async (address) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
    try {
      const status = await contract.getLockStatus(address); // 确保传递地址
      return status ? '已开启' : '已关闭';
    } catch (error) {
      console.error(`Error fetching lock status for ${address}:`, error);
      return '未知';
    }
  };
  



