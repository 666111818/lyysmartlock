import React, { useState, useEffect } from 'react';
import '../css/AdminPage.css';
import { fetchUpdatedUsersLockStatus, toggleLockStatus, fetchIdentityTimestamp, updateIdentity } from './Metamask';

function AdminPage() {
  const [showModal, setShowModal] = useState(false); // 控制弹出框显示状态
  const [searchTerm, setSearchTerm] = useState(''); // 搜索框输入内容
  const [tableData, setTableData] = useState([]); // 表数据
  const [selectedUser, setSelectedUser] = useState(null); // 选中的用户

  // 获取表格数据
  const fetchTableData = async () => {
    try {
      const data = await fetchUpdatedUsersLockStatus();
      console.log('Fetched table data:', data); // 打印获取到的数据
      const formattedData = await Promise.all(data.map(async (item) => ({
        address: item.user,
        lockStatus: item.lockStatus ? '锁定' : '解锁',
        operation: item.lockStatus ? '解锁' : '锁定',
        updateTime: await fetchIdentityTimestamp(item.user),
        updater: '', // 这里可以根据需求设置实际更新者
      })));
      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };
  

  useEffect(() => {
    fetchTableData(); // 组件挂载时调用
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
  ); // 模糊查询过滤数据

  // 处理锁定与解锁操作
  const handleLockUnlock = async (userAddress, isLocked) => {
    try {
      await toggleLockStatus(userAddress, isLocked);
      fetchTableData(); // 更新表格数据
    } catch (error) {
      console.error('Error toggling lock status:', error);
    }
  };

  // 处理身份验证操作
  const handleIdentityVerification = async (userAddress, verify) => {
    try {
      await updateIdentity(userAddress, verify);
      fetchTableData(); // 更新表格数据
    } catch (error) {
      console.error('Error updating identity:', error);
    }
  };

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
          <h2>管理用户门锁开关</h2>
          <button onClick={handleManageUsersClick}>管理用户</button>
        </div>

        <div className="admin-box">
          <h2>添加用户</h2>
          <p>在这里你可以添加新用户。</p>
          <button>添加新用户</button>
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
                  <th>锁的状态</th>
                  <th>操作</th>
                  <th>更新时间</th>
                  <th>验证身份</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.address}</td>
                      <td>{row.lockStatus}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleLockUnlock(
                              row.address,
                              row.lockStatus === '解锁'
                            )
                          }
                        >
                          {row.operation}
                        </button>
                      </td>
                      <td>{row.updateTime}</td>
                      <td>
                        <button
                          onClick={() => setSelectedUser(row.address)}
                        >
                          验证
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 验证身份弹框 */}
            {selectedUser && (
              <div className="identity-modal">
                <h3>用户身份验证</h3>
                <p>用户地址: {selectedUser}</p>
                <button
                  onClick={() => handleIdentityVerification(selectedUser, true)}
                >
                  验证
                </button>
                <button
                  onClick={() => handleIdentityVerification(selectedUser, false)}
                >
                  撤销
                </button>
                <button onClick={() => setSelectedUser(null)}>关闭</button>
              </div>
            )}

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
