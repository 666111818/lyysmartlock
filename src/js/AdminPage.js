import React, { useState, useEffect } from 'react';
import '../css/AdminPage.css';
import {getVerifiedUsers, 
  getUserUnlockTime,
  getLockStatus,
  toggleUserLock,
  checkIfAdmin,
  updateUserIdentity} from './Metamask';

function AdminPage() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取用户数据
  const fetchVerifiedUsers = async () => {
    try {
      const users = await getVerifiedUsers();
      const usersWithLockData = await Promise.all(
        users.map(async (user) => {
          const unlockTime = await getUserUnlockTime(user);
          const lockStatus = await getLockStatus(user);
          return { address: user, unlockTime, lockStatus };
        })
      );
      setTableData(usersWithLockData);
    } catch (error) {
      console.log('Error fetching verified users:', error);
    }
  };

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  // 新增操作处理函数
  const handleAddUser = () => {
    console.log("添加新用户");
    // 这里添加实际逻辑
  };

  const handleDeleteUser = () => {
    console.log("删除用户"); 
    // 这里添加实际逻辑
  };


  const handleToggleLock = async (address, currentStatus) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // 调用合约方法切换锁状态
      await toggleUserLock(address, !currentStatus);
      
      // 更新本地状态
      const updatedData = tableData.map(user => 
        user.address === address ? { 
          ...user, 
          lockStatus: !currentStatus,
          unlockTime: !currentStatus ? Math.floor(Date.now() / 1000) : user.unlockTime
        } : user
      );
      
      setTableData(updatedData);
      alert('锁状态已更新！');
    } catch (error) {
      console.error('切换锁状态失败:', error);
      alert(`操作失败: ${error.reason || error.message}`);
    }
    setIsProcessing(false);
  };

const handleVerifyIdentity = async (address) => {
  try {
    // 调用合约方法更新身份验证状态
    await updateUserIdentity(address, true);
    
    // 更新本地数据
    const updatedData = tableData.map(user => {
      if (user.address === address) {
        return {
          ...user,
          expiry: Math.floor(Date.now() / 1000) + 300, // 假设默认超时300秒
          lockStatus: false
        };
      }
      return user;
    });
    
    setTableData(updatedData);
    alert('用户验证已更新！');
    
    // 可选：重新从区块链获取最新数据
    // await fetchVerifiedUsers();
    
  } catch (error) {
    console.error('验证失败:', error);
    alert(`操作失败: ${error.reason || error.message}`);
  }
};

  // 弹窗关闭处理
  const handleCloseModal = (setter) => () => setter(false);

  // 表格过滤
  const filteredData = tableData.filter(item => 
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // CSV导出
  const handleExportTable = () => {
    const csvContent = [
      ['用户地址', '过期时间', '状态'],
      ...tableData.map(user => [
        user.address,
        user.expiry ? new Date(user.expiry * 1000).toLocaleString() : '未设置',
        user.lockStatus ? '已锁定' : '已解锁'
      ])
    ].join('\n');

    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURI(csvContent)}`;
    link.download = 'user_table.csv';
    link.click();
  };

  return (
    <div className="admin-container">
      <h1>管理员页面</h1>

      <div className="admin-boxes">
        <div className="admin-box">
          <h2>用户信息</h2>
          <button onClick={() => setShowUserModal(true)}>查看用户信息</button>
        </div>

        <div className="admin-box">
          <h2>操作</h2>
          <p>开关锁/添加新用户</p>
          <button onClick={() => setShowOtherModal(true)}>进入页面</button>
        </div>
      </div>

      {/* 用户信息弹窗 */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>用户管理</h2>
            <div className="search-export">
              <input
                type="text"
                placeholder="搜索用户地址或状态..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="export-button" onClick={handleExportTable}>
                导出表格
              </button>
            </div>

            <table className="user-table">
    <thead>
      <tr>
        <th>用户地址</th>
        <th>最后操作时间</th>
        <th>锁状态</th>
      </tr>
    </thead>
    <tbody>
      {filteredData.map((user, index) => (
        <tr key={index}>
          <td>{user.address}</td>
          <td>
            {user.unlockTime ? 
              new Date(user.unlockTime * 1000).toLocaleString() : 
              '暂无记录'}
          </td>
          <td>
            <button 
              className={`lock-btn ${user.lockStatus ? 'locked' : 'unlocked'}`}
              onClick={() => handleToggleLock(user.address, user.lockStatus)}
              disabled={isProcessing}
            >
              {user.lockStatus ? '解锁' : '关锁'}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
            <button 
              onClick={handleCloseModal(setShowUserModal)}
              className="close-modal-button"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 操作页面弹窗 */}
      {/* 操作页面弹窗 */}
{showOtherModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>用户操作</h2>
      <div className="action-buttons">
        <button className="operation-button" onClick={handleAddUser}>
          添加新用户
        </button>
        <button className="operation-button" onClick={handleDeleteUser}>
          删除用户
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>用户地址</th>
            {/* 修改表头为验证时间 */}
            <th>验证时间</th>
            <th>验证身份</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((user, index) => (
            <tr key={index}>
              <td>{user.address}</td>
             
              <td>{user.expiry ? new Date(user.expiry * 1000).toLocaleString() : '未验证'}</td>
              <td>
                <button 
                  className="verify-button"
                  onClick={() => handleVerifyIdentity(user.address)}
                >
                  验证
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleCloseModal(setShowOtherModal)}
        className="close-modal-button"
      >
        关闭
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminPage;