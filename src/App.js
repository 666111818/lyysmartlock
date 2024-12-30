import React, { useState, useEffect } from 'react';
import './App.css';
import AdminPage from './js/AdminPage'; 
import SmallBox1 from './js/smallbox1'; 
import SmallBox2 from './js/smallbox2'; 
import { checkMetaMask, checkSystemUser, fetchLockStatus , toggleLockStatus, getIdentityTimestamp } from './js/Metamask';
import { useNavigate } from 'react-router-dom';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [expirationTime, setExpirationTime] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [activeModal, setActiveModal] = useState(null); 
  const [isSystemUser, setIsSystemUser] = useState(false); // 是否为系统用户
  const navigate = useNavigate();

  const handleConnectMetaMask = async () => {
    const address = await checkMetaMask();
    if (address) {
      const userStatus = await checkSystemUser(address);  // 异步获取系统用户状态
      if (!userStatus) {
        alert('你不是该系统用户，将跳转到联系管理员页面。');
        setActiveModal('box2'); // 跳转到联系管理员弹框
      } else {
        setUserAddress(address);
        setIsSystemUser(true); // 设置为系统用户
        const lockStatus = await fetchLockStatus(address); // 从合约获取锁状态
      setIsLocked(lockStatus);
      
      const userStatus = await checkSystemUser(address); // 异步获取系统用户状态

        const timestamp = await getIdentityTimestamp(address);
        if (timestamp) {
          const dateTime = new Date(timestamp * 1000); 
          const formattedDate = `${dateTime.getFullYear()}/${String(dateTime.getMonth() + 1).padStart(2, '0')}/${String(dateTime.getDate()).padStart(2, '0')}`;
          setExpirationTime(formattedDate);
        }
         // 如果是管理员，跳转到管理员页面
         if (address === '0x483d9448b11d0dfb8136f5a3189ca1f953f3c632') { 
          navigate('/admin'); // 跳转到 /admin 页面
        }
      }
    }
  };

  // 切换锁的状态
  const toggleLock = async () => {
    if (!userAddress || !isSystemUser) {
      alert('请先登录并确保您是系统用户！');
      return;
    }
    await toggleLockStatus(userAddress, isLocked, setIsLocked); // 调用合约切换锁状态
  };

  const handleSmallBoxClick = (boxId) => {
    if (!userAddress || !isSystemUser) {
      alert('请先登录并确保您是系统用户！');
      return;
    }
    setActiveModal(boxId); 
  };

  const handleCloseModal = () => {
    setActiveModal(null); 
  };

  // 创建粒子并根据鼠标位置更新
  useEffect(() => {
    const particleContainer = document.querySelector('.particle-container');

    if (!particleContainer) return; // 确保粒子容器存在

    const generateParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 5 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x - size / 2}px`;
      particle.style.top = `${y - size / 2}px`;
      particleContainer.appendChild(particle);

      // 粒子移动后销毁
      setTimeout(() => {
        particle.remove();
      }, 3000);
    };

    // 监听鼠标移动
    const handleMouseMove = (event) => {
      generateParticle(event.clientX, event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="container">
      {/* MetaMask连接按钮 */}
      <div className="connect-metamask">
      <button
        onClick={handleConnectMetaMask}
        style={{
          position: 'absolute',
          top: '55px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#5a9153',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
          {userAddress ? (
          <span>
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </span>
        ) : (
          'Connect MetaMask'
        )}
      </button>
      </div>

      {/* 粒子容器 */}
      <div className="particle-container"></div>

      <div className="big-box">
        <p>上次验证时间：{expirationTime ? expirationTime : '加载中...'}</p>
        <p className="big-box-p">当前锁的状态</p>
        <div className="lock-status">
          <div className={`lock-icon ${isLocked ? 'locked' : 'unlocked'}`}>
            {isLocked ? '🔒' : '🔓'}
          </div>
          <h2 className="lock-message">
            {isLocked ? '锁已关闭' : '锁已打开'}
          </h2>
        </div>
        <div className="lock-control">
          <button
            className={`circle-button ${isLocked ? 'locked' : 'unlocked'}`}
            onClick={toggleLock}
          >
            {isLocked ? '🔒 关锁' : '🔓 开锁'}
          </button>
        </div>
      </div>

      <div className="small-boxes">
        <div className="small-box small-box-1" onClick={() => handleSmallBoxClick('box1')}>
          <h3>操作门锁记录</h3>
        </div>
        <div className="small-box small-box-2" onClick={() => handleSmallBoxClick('box2')}>
          <h3>联系管理员</h3>
        </div>
      </div>

      {activeModal === 'box1' && (
        <SmallBox1 onClose={handleCloseModal} />
      )}
      {activeModal === 'box2' && (
        <SmallBox2 onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;
