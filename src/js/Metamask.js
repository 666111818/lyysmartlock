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
  
  // 获取用户身份（是否是系统用户）
  export const checkSystemUser = async (address) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  
    try {
      const isSystemUser = await contract.getUserIdentity(address);
      console.log(`User identity for ${address}: ${isSystemUser}`);
      
      // 如果是系统用户，查询锁定状态
      if (isSystemUser) {
        const lockStatus = await fetchLockStatus(address); // 获取锁状态
        console.log(`Lock status for ${address}: ${lockStatus}`);
      }
      
      return isSystemUser; // 返回身份
    } catch (error) {
      console.error('Error fetching user identity:', error);
      return false; // 如果出错则返回false
    }
  };
  
  
  // 获取用户身份的时间戳
  export const getIdentityTimestamp = async (address) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  
    try {
      const timestamp = await contract.getIdentityTimestamp(address);
      return timestamp.toString(); // 转换 BigInt 为字符串返回
    } catch (error) {
      console.error('Error fetching identity timestamp:', error);
      return null; // 如果出错返回 null
    }
  };



// 从合约获取用户锁状态
export const fetchLockStatus = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

  try {
    const lockStatus = await contract.getLockStatus(userAddress); // 调用合约方法获取锁状态
    return lockStatus;
  } catch (error) {
    console.error('Error fetching lock status:', error);
    return false; // 出错时默认返回锁定状态
  }
};

// 切换锁的状态
export const toggleLockStatus = async (userAddress, isLocked, setIsLocked) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

  try {
    if (isLocked) {
      await contract.unlock(userAddress); // 调用解锁方法
      setIsLocked(false); // 更新前端锁的状态
    } else {
      await contract.lock(userAddress); // 调用锁定方法
      setIsLocked(true); // 更新前端锁的状态
    }

    // 状态切换后，重新查询锁定状态，确保前端与链上的状态同步
    const updatedLockStatus = await contract.getLockStatus(userAddress);
    setIsLocked(updatedLockStatus);  // 更新锁的状态
  } catch (error) {
    console.error('Error toggling lock status:', error);
    alert('操作失败，请重试');
  }
};


// *******************************************
// 获取锁操作记录
export const fetchLockOperations = async (currentUser) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  const filter = contract.filters.LockOperation(currentUser);

  try {
    // 获取锁定/解锁操作记录
    const events = await contract.queryFilter(filter);
    console.log('Fetched events:', events);
    
    const operations = events.map(event => ({
      user: event.args.user,
      timestamp: event.args.timestamp.toNumber(),
      operation: event.args.operation
    }));

    return operations;
  } catch (error) {
    console.error('Error fetching lock operations:', error);
    return [];
  }
};



// *************************************


// 获取用户锁的状态
export const fetchUpdatedUsersLockStatus = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);

  const users = await contract.getAllUpdatedUsers(); // 获取所有更新过身份的用户

  const statusPromises = users.map(async (user) => {
    const lockStatus = await contract.getLockStatus(user); // 获取每个用户的锁定状态
    return { user, lockStatus };
  });

  const usersWithStatus = await Promise.all(statusPromises);
  return usersWithStatus;
};

// 获取身份时间戳
export const fetchIdentityTimestamp = async (address) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  try {
    const timestamp = await contract.getIdentityTimestamp(address);
    return new Date(timestamp * 1000).toLocaleString(); // 转换为可读的时间格式
  } catch (error) {
    console.error('Error fetching identity timestamp:', error);
    return '未知';
  }
};

// 更新用户身份
export const updateIdentity = async (address, verify) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);
  
  try {
    // 更新身份
    await contract.updateIdentity(address, verify);

    // 更新后，查询最新的身份信息
    const updatedStatus = await contract.getUserIdentity(address);
    console.log(`Updated user identity for ${address}: ${updatedStatus}`);
  } catch (error) {
    console.error('Error updating identity:', error);
  }
};













  // export const checkSystemUser = async (address) => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum); 
  //     const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  //     const isSystemUser = await contract.getUserIdentity(address);
  //     console.log('System user status:', isSystemUser);
  //     console.log(isSystemUser);
  //     return isSystemUser;
  //   } catch (error) {
  //     console.error('Error checking system user:', error);
  //     return false;
  //   }
  // };

  // export const fetchLockStatus = async (address, setIsLocked) => {
  //   try {

  //     console.log('SMART_LOCK_CONTRACT_ADDRESS:', SMART_LOCK_CONTRACT_ADDRESS); // 调试用
  //     console.log('SMART_LOCK_ABI:', SMART_LOCK_ABI); // 调试用

  //     // 确保 SMART_LOCK_CONTRACT_ADDRESS 和 ABI 有效
  //     if (!SMART_LOCK_CONTRACT_ADDRESS || !SMART_LOCK_ABI) {
  //       throw new Error("合约地址或 ABI 未正确配置");
  //     }

  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  //     const status = await contract.getLockStatus();
  //     setIsLocked(status);
  //   } catch (error) {
  //     console.error('Error fetching lock status:', error);
  //     alert('无法获取锁的状态，请稍后重试。');
  //   }
  // };



  // export const toggleLockStatus = async (address, isLocked, setIsLocked) => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum); // 使用 BrowserProvider
  //     const signer = await provider.getSigner(); // 需要加上 await 来正确解析 signer
  //     const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

  //     // 根据锁定状态调用相应方法
  //     const tx = isLocked ? await contract.unlock(address) : await contract.lock(address);
  //     await tx.wait(); // 等待交易完成
  //     setIsLocked(!isLocked); // 更新锁定状态
  //   } catch (error) {
  //     console.error('切换锁状态时出错：', error);

  //     // 针对不同错误进行提示
  //     if (error.code === 4001) {
  //       alert('用户拒绝交易，请重试。');
  //     } else if (error.code === 'NETWORK_ERROR') {
  //       alert('网络连接失败，请检查您的网络连接。');
  //     } else {
  //       alert('无法切换锁的状态，请稍后重试。');
  //     }
  //   }
  // };

  // export const getIdentityTimestamp = async (address) => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum); // 使用 BrowserProvider 
  //     const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  //     const timestamp = await contract.getIdentityTimestamp(address);
  //     console.log(timestamp);
  //     return Number(timestamp); // 转换为 JavaScript 数字类型
  //   } catch (error) {
  //     console.error('Error fetching identity timestamp:', error);
  //     return null;
  //   }
  // };

  // export const fetchLockOperations = async () => {
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
  //   try {
  //     // 获取历史 LockOperation 事件
  //     const filter = contract.filters.LockOperation(); // 或者使用合适的 filter 来过滤
  //     const events = await contract.queryFilter(filter);
  
  //     const lockOperations = events.map(event => ({
  //       user: event.args.user,
  //       timestamp: Number(event.args.timestamp),
  //       operation: event.args.operation,
  //     }));
  
  //     return lockOperations;
  //   } catch (error) {
  //     console.error('Error fetching lock operations:', error);
  //     return [];
  //   }
  // };
  // // ********************************************************************************
  
  
  // export const fetchUpdatedUsersLockStatus = async () => {
  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum); 
  //     const contractIdentity = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  //     const contractLock = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
      
  //     const updatedUsers = await contractIdentity.getAllUpdatedUsers();
  //     console.log('Updated Users:', updatedUsers);  // 调试返回的用户列表
      
  //     const lockStatusList = [];
      
  //     for (const user of updatedUsers) {
  //       const lockStatus = await contractLock.getLockStatus(user);
  //       console.log(`Lock status for ${user}:`, lockStatus); // 打印锁定状态
        
  //       lockStatusList.push({
  //         user: user,
  //         lockStatus: lockStatus ? '已开启' : '已关闭',
  //       });
  //     }
      
  //     return lockStatusList;
  //   } catch (error) {
  //     console.error('Error fetching lock status for updated users:', error);
  //     return [];
  //   }
  // };
  
  
  

  // export const getLockStatus = async (address) => {
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
  //   try {
  //     const status = await contract.getLockStatus(address); // 确保传递地址
  //     return status ? '已开启' : '已关闭';
  //   } catch (error) {
  //     console.error(`Error fetching lock status for ${address}:`, error);
  //     return '未知';
  //   }
  // };
  



