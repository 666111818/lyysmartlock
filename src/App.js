import React, { useState, useEffect } from 'react';
import './App.css';
import AdminPage from './js/AdminPage'; 
import SmallBox1 from './js/smallbox1'; 
import SmallBox2 from './js/smallbox2'; 
import { checkMetaMask,checkSystemUser,fetchLockStatus, toggleLockStatus,getIdentityTimestamp  } from './js/Metamask';
import { useNavigate } from 'react-router-dom';


function App() {
  const [userAddress, setUserAddress] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [expirationTime, setExpirationTime] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制弹出框的显示
  const [activeModal, setActiveModal] = useState(null); //  控制哪个弹框打开
  const [isSystemUser, setIsSystemUser] = useState(false); // 是否为系统用户
  const navigate = useNavigate();

  const handleConnectMetaMask = async () => {
    const address = await checkMetaMask();
    if (address) {
      const userStatus = await checkSystemUser(address);
      if (!userStatus) {
        alert('你不是该系统用户，将跳转到联系管理员页面。');
        setActiveModal('box2'); // 跳转到联系管理员弹框
      } else {
        setUserAddress(address);
        setIsSystemUser(true); // 设置为系统用户
        await fetchLockStatus(address, setIsLocked);

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
 
  const toggleLock = async () => {
    if (!userAddress || !isSystemUser) {
      alert('请先登录并确保您是系统用户！');
      return;
    }
     toggleLockStatus(userAddress, isLocked, setIsLocked);
  };

  const handleSmallBoxClick = (boxId) => {
    if (!userAddress || !isSystemUser) {
      alert('请先登录并确保您是系统用户！');
      return;
    }
    setActiveModal(boxId); // 根据点击的框体打开相应的弹框
  };

  const handleCloseModal = () => {
    setActiveModal(null); // 关闭弹框
  };

  // 创建粒子并根据鼠标位置更新
  useEffect(() => {
    const particleContainer = document.querySelector('.particle-container');

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
      <div className="big-box">
        <p>上次验证时间：
        {expirationTime ? expirationTime.toLocaleString() : '加载中...'}
        </p>
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

      {/* 粒子容器 */}
      <div className="particle-container"></div>

      
    </div>
  );
}


export default App;
