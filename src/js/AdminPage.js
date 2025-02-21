import React, { useState, useEffect } from 'react';
import '../css/AdminPage.css';
import { getVerifiedUsers, getUserIdentityExpiry } from './Metamask';

function AdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]); // 保存表格数据
  const [verifiedUsers, setVerifiedUsers] = useState([]);  // 存储获取到的用户地址
  
  // 获取所有用户，并通过 getIdentityExpiry 获取过期时间戳
  const fetchVerifiedUsers = async () => {
    try {
      const users = await getVerifiedUsers();
      console.log('Verified Users:', users);
      
      // 获取每个用户的过期时间
      const usersWithExpiry = await Promise.all(users.map(async (user) => {
        const expiry = await getUserIdentityExpiry(user);
        return { address: user, expiry };
      }));

      setTableData(usersWithExpiry); // 将用户数据和过期时间戳设置到表格数据中    
    } catch (error) {
      console.log('Error fetching verified users:', error);
    }
  };

  useEffect(() => {
    fetchVerifiedUsers(); // 组件挂载时获取所有用户
  }, []);

  const handleManageUsersClick = () => {
    setShowModal(true); // 显示弹出框
  };

  const handleCloseModal = () => {
    setShowModal(false); // 关闭弹出框
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // 更新搜索内容   
  };

  const filteredData = tableData.filter((item) =>
    Object.values(item).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExportTable = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['用户地址,锁的状态,操作,更新时间,更新身份']
        .concat(
          tableData.map(
            (row) =>
              `${row.address},${row.lockStatus},${row.operation},${row.updateTime},${row.updater}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'user_table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-container">
      <h1>管理员页面</h1>

      <div className="admin-boxes">
        <div className="admin-box">
          <h2>用户信息</h2>
          <button onClick={handleManageUsersClick}>查看用户信息</button>
        </div>

        <div className="admin-box">
          <h2>操作</h2>
          <p>开关锁/添加新用户</p>
          <button>进入页面</button>
        </div>
      </div>

      {/* 弹出框 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>用户管理</h2>

            {/* 搜索框和导出按钮 */}
            <div className="search-export">
              <input
                type="text"
                placeholder="搜索用户地址或状态..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button className="search-button">搜索</button>
              <button onClick={handleExportTable} className="export-button">
                导出表格
              </button>
            </div>

            {/* 表格 */}
            <table className="user-table">
              <thead>
                <tr>
                  <th>用户地址</th>
                  <th>时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.address}</td>
                      <td>{user.expiry ? new Date(user.expiry * 1000).toLocaleString() : '未设置'}</td>
                      <td> {/* 状态可以根据用户是否被锁定来设置 */} </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">暂无用户</td>
                  </tr>
                )}
              </tbody>
            </table>

            <button onClick={handleCloseModal} className="close-modal-button">
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
