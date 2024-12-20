import React, { useState, useEffect } from 'react';
import './App.css';
import SmallBox1 from './js/smallbox1'; // 导入 SmallBox1 组件
import SmallBox2 from './js/smallbox2'; // 导入 SmallBox2 组件
import { checkMetaMask } from './js/Metamask';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制弹出框的显示
  const [activeModal, setActiveModal] = useState(null); // 控制哪个弹框打开

  const handleConnectMetaMask = async () => {
    const address = await checkMetaMask();
    if (address) {
      setUserAddress(address);
    }
  };

  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
  };

  const handleSmallBoxClick = (boxId) => {
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
