import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BulbOutlined,
  FileTextOutlined,
  MailOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Characters from './pages/Characters';
import StageDesign from './pages/StageDesign';
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import EmailPreview from './pages/EmailPreview';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const location = useLocation();
  
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">控制台</Link> },
    { key: '/characters', icon: <TeamOutlined />, label: <Link to="/characters">角色模型</Link> },
    { key: '/stage', icon: <BulbOutlined />, label: <Link to="/stage">舞台设计</Link> },
    { key: '/meetings', icon: <FileTextOutlined />, label: <Link to="/meetings">会议纪要</Link> },
    { key: '/email', icon: <MailOutlined />, label: <Link to="/email">邮件预览</Link> }
  ];

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/meetings/')) return '/meetings';
    return location.pathname;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="dark" 
        width={240}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
        }}
      >
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Avatar 
              size={64} 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '28px'
              }}
            >
              ✨
            </Avatar>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              虚拟偶像演唱会
            </Title>
            <div style={{ color: '#aaa', fontSize: '12px' }}>
              跨次元策划系统
            </div>
          </Space>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ 
            background: 'transparent',
            borderRight: 'none'
          }}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            background: 'white', 
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {getPageTitle(location.pathname)}
          </Title>
          <Space>
            <Avatar>管</Avatar>
            <span>管理员</span>
          </Space>
        </Header>
        <Content style={{ margin: '24px', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/stage" element={<StageDesign />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/email" element={<EmailPreview />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function getPageTitle(pathname) {
  if (pathname === '/') return '控制台';
  if (pathname === '/characters') return '角色模型管理';
  if (pathname === '/stage') return '舞台设计';
  if (pathname === '/meetings') return '会议纪要列表';
  if (pathname.startsWith('/meetings/')) return '会议详情';
  if (pathname === '/email') return '邮件预览';
  return '虚拟偶像演唱会策划系统';
}

export default App;
