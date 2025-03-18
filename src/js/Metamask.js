import { ethers } from 'ethers';
import { IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI } from '../contract/identityOracle.js';
import { SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI } from '../contract/SmartLock.js';

// 连接MetaMask，获取用户的地址   

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

// 判断用户是否为系统用户      
export const checkSystemUser = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);    

  try {
    console.log('Checking system user status for address:', userAddress);
    const isSystemUser = await contract.getUserIdentity(userAddress);
    console.log('System user status:', isSystemUser); // 输出返回的系统身份状态
    return isSystemUser;  
  } catch (error) {
    console.error('Error checking system user:', error);
    alert('Failed to check user status. Please try again.');
    return false; // 如果有错误，返回 false   
  }
};

// 判断用户是否为管理员    
export const checkIfAdmin = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);

  try {
    console.log('Checking if address is admin:', userAddress);   
    const isAdmin = await contract.admins(userAddress);
    console.log('Admin status:', isAdmin);
    return isAdmin;    
  } catch (error) {
    console.error('Error checking admin status:', error);
    alert('Failed to check admin status. Please try again.');
    return false; // 错误情况下返回 false     
  }
};


export const getUserIdentityExpiry = async (userAddress) => {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return false;
  }
  
  try {
    // 创建与 IdentityOracle 合约的连接   
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
    // 调用 getIdentityExpiry 方法获取用户身份验证的过期时间戳   
    const expiryTimestamp = await contract.getIdentityExpiry(userAddress);
    console.log(`User identity expiry timestamp: ${expiryTimestamp}`);
    return expiryTimestamp.toString();
  } catch (error) {
    console.error('Error fetching identity expiry:', error);
  }
};


// Metamask.js 新增方法
export const toggleUserLock = async (userAddress, shouldLock) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

  try {
    if (shouldLock) {
      const tx = await contract.lock(userAddress);
      await tx.wait();
    } else {
      const tx = await contract.unlock(userAddress);
      await tx.wait();
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getLockStatus = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
  try {
    return await contract.userLockStatus(userAddress);
  } catch (error) {
    console.error('Error getting lock status:', error);
    return false;
  }
};

export const getUserUnlockTime = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, provider);
  
  try {
    const time = await contract.userUnlockTimes(userAddress);
    return Number(time.toString()); // 转换为数字
  } catch (error) {
    console.error('Error getting unlock time:', error);
    return 0;
  }
};

export const  getVerifiedUsers =async() =>{
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);
  try {
    const users = await contract.getAllVerifiedUsers();
    console.log('Verified Users:', users); // 查看返回的数据
    return users; // 返回正确的格式   
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}



// *************************************  

// 切换系统锁定状态      
export const toggleLockStatus = async (userAddress, setIsLocked) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);

  try {
    // 获取当前状态
    const currentStatus = await contract.userLockStatus(userAddress);
    
    // 执行相反操作
    if (currentStatus) {
      const tx = await contract.unlock(userAddress);
      await tx.wait();
    } else {
      const tx = await contract.lock(userAddress);
      await tx.wait();
    }

    // 强制刷新状态
    const updatedStatus = await contract.userLockStatus(userAddress);
    setIsLocked(updatedStatus);
    
  } catch (error) {
    console.error('操作失败:', error);
    // 显示具体错误原因
    alert(`操作失败: ${error.reason || error.message}`);
  }
};

// 管理员获取锁的状态
export const checkLockStatus  = async (userAddress)=>{
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer =await provider.getSigner();
  const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS,SMART_LOCK_ABI,signer);

  try{
    console.log('Checking lock status for address:',userAddress);
    const lockStatus =await contract.getLockStatus(userAddress);
    console.log('lock status:',lockStatus);
    return lockStatus;
  }catch (error){
    console.log('Error checking lock status:',error);
    return true;// 默认返回关锁状态
  }

}



// // ******************************************* 
// 获取锁操作记录    
export const getUserOperationsTable = async (address) => {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return [];
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum); 
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(SMART_LOCK_CONTRACT_ADDRESS, SMART_LOCK_ABI, signer);  

    // 获取用户的操作记录   
    const userOperations = await contract.getUserOperations(address);
    console.log('User operations:', userOperations);

    // 获取当前时间戳
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // 将操作记录格式化为表格可以显示的数据   
    const operationsData = userOperations.map((operation, index) => {
      return {
        user: address,
        timestamp: currentTimestamp - (userOperations.length - index) * 60, // 假设每个操作间隔为1分钟
        operation: operation,
      };
    });

    return operationsData; // 返回格式化后的操作记录
  } catch (error) {
    console.error('Error fetching user operations:', error);
    alert('Failed to fetch user operations. Please try again.');
    return []; // 如果有错误，返回空数组
  }
};

export const getUsersWithChangedIdentity = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, provider);
  // 假设您可以在合约中获取已更改身份状态的用户地址列表
  const users = await contract.getChangedIdentities();
  return users;
};

// 新增updateUserIdentity方法
export const updateUserIdentity = async (userAddress, status) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);

  try {
    console.log('Updating identity for:', userAddress, 'Status:', status);
    const tx = await contract.updateUserIdentity(userAddress, status);
    await tx.wait();
    console.log('Transaction confirmed');
    return true;
  } catch (error) {
    console.error('Error updating user identity:', error);
    throw error;
  }
};

// 添加获取验证时间方法
export const getUserIdentityTimestamp = async (userAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IDENTITY_ABI, signer);

  try {
    const timestamp = await contract.getIdentityTimestamp(userAddress);
    return timestamp;
  } catch (error) {
    console.error('Error getting identity timestamp:', error);
    throw error;
  }
};