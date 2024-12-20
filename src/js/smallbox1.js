import React, { useState } from 'react';
import '../css/smallbox1.css'; 
import * as XLSX from "xlsx";

function SmallBox1({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟表格数据
  const data = [
    { time: '2024-12-20 10:00', user: '用户A', status: '开锁' },
    { time: '2024-12-20 11:30', user: '用户B', status: '关锁' },
    { time: '2024-12-20 13:00', user: '用户C', status: '处理中' }
  ];

  // 处理搜索框输入
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 过滤表格数据
  const filteredData = data.filter(item =>
    item.user.includes(searchTerm) || item.status.includes(searchTerm)
  );

// 导出按钮点击事件
const handleExport = () => {
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(filteredData);
  
    // 创建工作簿并附加工作表
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "操作记录");
  
    // 导出 Excel 文件，命名为 "操作记录.xlsx"
    XLSX.writeFile(wb, "操作记录.xlsx");
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>操作门锁记录</h2>

        <div className="search-container">
  <div className="search-box">
    <input
      type="text"
      placeholder="搜索..."
      value={searchTerm}
      onChange={handleSearchChange}
      className="search-input"
    />
    <button className="search-button">搜索</button>
  </div>
  <button className="export-button" onClick={handleExport}>导出</button>
</div>


        {/* 表格 */}
        <table className="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.time}</td>
                  <td>{item.user}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">没有匹配的数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SmallBox1;
