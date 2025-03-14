import { useState, useEffect } from 'react';
import { checkMetaMask, checkIfAdmin, getVerifiedUsers, updateUserIdentity, checkLockStatus } from '../utils/contract';
import './operation.css';

const Operation = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUserAddress, setNewUserAddress] = useState('');

  useEffect(() => {
    const init = async () => {
      const address = await checkMetaMask();
      if (address) {
        const adminStatus = await checkIfAdmin(address);
        setIsAdmin(adminStatus);
        loadVerifiedUsers();
      }
    };
    init();
  }, []);

  const loadVerifiedUsers = async () => {
    const verifiedUsers = await getVerifiedUsers();
    const usersWithStatus = await Promise.all(
      verifiedUsers.map(async (user) => ({
        address: user,
        isLocked: await checkLockStatus(user),
        isVerified: true
      }))
    );
    setUsers(usersWithStatus);
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.address.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleVerifyUser = async (address) => {
    await updateUserIdentity(address, true);
    loadVerifiedUsers();
  };

  const handleAddUser = async () => {
    if (!newUserAddress) return;
    await updateUserIdentity(newUserAddress, true);
    setNewUserAddress('');
    loadVerifiedUsers();
  };

  return (
    <div className="operation-container">
      <button 
        className="open-modal-button"
        onClick={() => setShowModal(true)}
      >
        进入管理页面 
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>智能门锁管理系统</h2>
            
            <div className="search-export">
              <div className="search-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="搜索用户地址..."
                  value={searchKeyword}
                  onChange={handleSearch}
                />
                <button className="search-button">搜索</button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="输入新用户地址"
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  className="add-user-input"
                />
                <button 
                  className="export-button"
                  onClick={handleAddUser}
                >
                  添加新用户
                </button>
              </div>
            </div>

            <table className="user-table">
              <thead>
                <tr>
                  <th>用户地址</th>
                  <th>开/关锁状态</th>
                  <th>验证状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.address}</td>
                    <td>{user.isLocked ? '已锁定' : '未锁定'}</td>
                    <td>{user.isVerified ? '已验证' : '未验证'}</td>
                    <td>
                      {!user.isVerified && (
                        <button 
                          className="operation-button"
                          onClick={() => handleVerifyUser(user.address)}
                        >
                          通过验证
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button 
              className="close-modal-button" 
              onClick={() => setShowModal(false)}
            >
              关闭  
            </button>
          </div>  
        </div>
      )}
    </div>
  );  
};

export default Operation;