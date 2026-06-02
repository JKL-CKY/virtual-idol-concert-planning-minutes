import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Tag, Progress, Space } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  BulbOutlined,
  CalendarOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    meetings: 0,
    characters: 0,
    stages: 0,
    completed: 0
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsRes, charactersRes, stagesRes] = await Promise.all([
        axios.get('/api/meetings'),
        axios.get('/api/characters'),
        axios.get('/api/stage-designs')
      ]);
      
      const meetings = meetingsRes.data;
      const completed = meetings.filter(m => m.status === 'completed').length;
      
      setStats({
        meetings: meetings.length,
        characters: charactersRes.data.length,
        stages: stagesRes.data.length,
        completed
      });
      
      setRecentMeetings(meetings.slice(0, 5));
      setCharacters(charactersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setMockData();
    }
  };

  const setMockData = () => {
    setStats({
      meetings: 12,
      characters: 3,
      stages: 2,
      completed: 8
    });
    
    setRecentMeetings([
      { id: 1, title: 'Q1演唱会策划会议', date: '2024-01-15', status: 'completed' },
      { id: 2, title: '动作捕捉排练安排', date: '2024-01-10', status: 'completed' },
      { id: 3, title: '歌单最终确认会', date: '2024-01-05', status: 'transcribed' },
      { id: 4, title: '舞台设计评审', date: '2024-01-02', status: 'processing' },
      { id: 5, title: '新年特别企划讨论', date: '2023-12-28', status: 'draft' }
    ]);
    
    setCharacters([
      { id: 1, name: '星瞳', description: '活力四射的虚拟偶像，擅长舞蹈', voice_actor: '张三' },
      { id: 2, name: '阿梓', description: '温柔治愈系歌手，声线优美', voice_actor: '李四' },
      { id: 3, name: '七海', description: '元气少女，擅长rap和电音', voice_actor: '王五' }
    ]);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'draft': { color: 'default', text: '草稿' },
      'processing': { color: 'processing', text: '处理中' },
      'transcribed': { color: 'blue', text: '已转写' },
      'completed': { color: 'success', text: '已完成' },
      'error': { color: 'error', text: '错误' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="会议总数"
              value={stats.meetings}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="角色数量"
              value={stats.characters}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="舞台设计"
              value={stats.stages}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title="最近会议" 
            className="card-shadow"
            extra={<Tag color="blue">最新动态</Tag>}
          >
            <List
              dataSource={recentMeetings}
              renderItem={(item) => (
                <List.Item
                  actions={[getStatusTag(item.status)]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        }}
                        icon={<CalendarOutlined />}
                      />
                    }
                    title={item.title}
                    description={item.date}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title="项目进度" 
            className="card-shadow"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>整体筹备进度</span>
                  <span style={{ color: '#722ed1' }}>75%</span>
                </div>
                <Progress percent={75} strokeColor={{ '0%': '#667eea', '100%': '#764ba2' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>动作捕捉</span>
                  <span style={{ color: '#52c41a' }}>90%</span>
                </div>
                <Progress percent={90} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>舞台设计</span>
                  <span style={{ color: '#1890ff' }}>60%</span>
                </div>
                <Progress percent={60} strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>歌单确认</span>
                  <span style={{ color: '#fa8c16' }}>85%</span>
                </div>
                <Progress percent={85} strokeColor="#fa8c16" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card 
        title="虚拟偶像阵容" 
        className="card-shadow"
      >
        <Row gutter={[16, 16]}>
          {characters.map((char) => (
            <Col xs={24} sm={12} md={8} key={char.id}>
              <Card 
                hoverable
                className="character-card"
                cover={
                  <div style={{ 
                    height: 200, 
                    background: `linear-gradient(135deg, ${getGradientColor(char.id)[0]} 0%, ${getGradientColor(char.id)[1]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '64px'
                  }}>
                    {getCharacterEmoji(char.id)}
                  </div>
                }
              >
                <Card.Meta
                  title={char.name}
                  description={char.description}
                />
                <div style={{ marginTop: 12, fontSize: '12px', color: '#888' }}>
                  中之人: {char.voice_actor}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  );
}

function getGradientColor(id) {
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe']
  ];
  return colors[(id - 1) % colors.length];
}

function getCharacterEmoji(id) {
  const emojis = ['🌟', '🎵', '💫'];
  return emojis[(id - 1) % emojis.length];
}

export default Dashboard;
