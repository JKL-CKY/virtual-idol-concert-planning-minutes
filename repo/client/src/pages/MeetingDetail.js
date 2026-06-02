import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Space, Tag, Avatar, List, Typography, Row, Col, Divider, Modal, Form, Input, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const { Title, Text } = Typography;

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [songs, setSongs] = useState([]);
  const [rundown, setRundown] = useState(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailForm] = Form.useForm();
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
  loadMeetingDetail();
}, [id]);

const loadMeetingDetail = async () => {
  try {
    const response = await axios.get(`/api/meetings/${id}`);
    setMeeting(response.data.meeting);
    setParticipants(response.data.participants);
    setTranscripts(response.data.transcripts);
    setSongs(response.data.songs);
    setRundown(response.data.rundown);
  } catch (error) {
    console.error('Failed to load meeting detail:', error);
    setMockData();
  }
};

const setMockData = () => {
  setMeeting({
    id: 1,
    title: 'Q1演唱会策划会议',
    date: '2024-01-15',
    description: '讨论Q1演唱会整体规划，包括歌单、舞台设计、互动环节等',
    status: 'completed',
    created_at: '2024-01-10T10:00:00'
  });

  setParticipants([
    { id: 1, name: '李明', role: '制作人' },
    { id: 2, name: '王芳', role: '技术美术' },
    { id: 3, name: '张丽', role: '星瞳中之人' },
    { id: 4, name: '刘芳', role: '阿梓中之人' },
    { id: 5, name: '陈静', role: '七海中之人' }
  ]);

  setTranscripts([
    { id: 1, speaker: '李明', role: '制作人', content: '大家好，欢迎来到本次虚拟偶像演唱会策划会议。今天我们主要讨论下季度的演唱会安排。', start_time: 0 },
    { id: 2, speaker: '李明', role: '制作人', content: '我是制作人李明，这次演唱会我们希望能够突破以往的形式，加入更多的互动元素。', start_time: 15 },
    { id: 3, speaker: '王芳', role: '技术美术', content: '大家好，我是技术美术王芳。关于舞台设计，我建议采用全息投影技术配合AR效果。', start_time: 30 },
    { id: 4, speaker: '张丽', role: '星瞳中之人', content: '我是星瞳的中之人张丽。星瞳这次准备了一首新歌，风格比较活泼，希望能有对应的编舞。', start_time: 45 },
    { id: 5, speaker: '刘芳', role: '阿梓中之人', content: '我是阿梓的中之人刘芳。阿梓的粉丝最近一直在呼吁演唱《月光奏鸣曲》，我们可以考虑加入歌单。', start_time: 60 },
    { id: 6, speaker: '陈静', role: '七海中之人', content: '我是七海的中之人陈静。七海想尝试一些rap和电音的结合，粉丝反应应该会很热烈。', start_time: 75 },
    { id: 7, speaker: '李明', role: '制作人', content: '关于歌单，我建议开场用《次元之门》，然后分三个篇章：星之序曲、梦之交响、未来之声。', start_time: 90 },
    { id: 8, speaker: '王芳', role: '技术美术', content: '动作捕捉方面，我们需要安排三次排练，分别在本月底、下月初和演唱会前一周。', start_time: 105 },
    { id: 9, speaker: '李明', role: '制作人', content: '互动环节设计两个：第一个是粉丝问答，第二个是游戏对决。可以增加粉丝参与感。', start_time: 120 },
    { id: 10, speaker: '李明', role: '制作人', content: '好的，那我们初步定下来，歌单包括《星光闪耀》、《月光奏鸣曲》、《电子精灵》、《梦想的翅膀》、《未来可期》和安可曲《永远的羁绊》。', start_time: 135 }
  ]);

  setSongs([
    { id: 1, title: '次元之门', artist: '虚拟偶像全员', duration: '4:30', notes: '开场主题曲' },
    { id: 2, title: '星光闪耀', artist: '星瞳', duration: '3:45', notes: '活力舞蹈solo' },
    { id: 3, title: '月光奏鸣曲', artist: '阿梓', duration: '4:15', notes: '治愈系ballad' },
    { id: 4, title: '电子精灵', artist: '七海', duration: '3:30', notes: '电音舞曲' },
    { id: 5, title: '梦想的翅膀', artist: '三人合唱', duration: '4:00', notes: '励志主题曲' },
    { id: 6, title: '未来可期', artist: '虚拟偶像全员', duration: '4:20', notes: '新歌首唱' },
    { id: 7, title: '永远的羁绊', artist: '虚拟偶像全员', duration: '5:00', notes: '安可曲' }
  ]);

  setRundown({
    content: JSON.stringify({
      sections: [
        { title: '开场秀 (Opening)', time: '19:00 - 19:10', items: ['灯光秀与倒计时', '虚拟偶像全员登场', '开场主题曲《次元之门》', '主持人介绍与欢迎致辞'] },
        { title: '第一篇章: 星之序曲', time: '19:10 - 19:30', items: ['星瞳 solo - 《星光闪耀》', '阿梓 solo - 《月光奏鸣曲》', '七海 solo - 《电子精灵》'] },
        { title: '互动环节一: 粉丝问答', time: '19:30 - 19:45', items: ['线上弹幕抽选问题', '虚拟偶像现场回答', '幸运粉丝连麦'] },
        { title: '第二篇章: 梦之交响', time: '19:45 - 20:10', items: ['三人合唱 - 《梦想的翅膀》', '舞蹈串烧表演', 'AR特效展示'] },
        { title: '互动环节二: 游戏对决', time: '20:10 - 20:25', items: ['你画我猜 - 虚拟偶像 vs 观众', '猜歌名游戏', '惩罚环节'] },
        { title: '第三篇章: 未来之声', time: '20:25 - 20:45', items: ['新歌首唱 - 《未来可期》', '粉丝应援大合唱', '感人时刻 VCR'] },
        { title: '安可与谢幕', time: '20:45 - 21:00', items: ['粉丝安可呼唤', '安可曲 - 《永远的羁绊》', '全体致谢', '约定下次再会'] }
      ],
      summary: '本次虚拟偶像演唱会以「跨越次元的约定」为主题，通过三个篇章展现虚拟偶像的成长与魅力。'
    }),
    interactive_scripts: JSON.stringify({
      segments: [
        { title: '粉丝问答环节脚本', description: '通过线上弹幕抽选粉丝问题，虚拟偶像现场回答', script: '主持人: 欢迎来到我们的第一个互动环节！' },
        { title: '游戏对决环节脚本', description: '虚拟偶像与线上粉丝进行游戏互动', script: '主持人: 欢迎来到「次元对决」游戏时间！' }
      ]
    })
  });
};

const getRoleColor = (role) => {
  if (role?.includes('制作人')) return '#722ed1';
  if (role?.includes('技术')) return '#1890ff';
  if (role?.includes('中之人')) return '#52c41a';
  return '#888';
};

const handleSendEmail = async (values) => {
  try {
    await axios.post(`/api/meetings/${id}/send-email`, {
      recipients: values.recipients.split(',').map(e => e.trim())
    });
    message.success('邮件发送成功');
    setEmailModalVisible(false);
  } catch (error) {
    message.error('发送失败');
  }
};

const rundownData = rundown?.content ? JSON.parse(rundown.content) : null;
const scriptsData = rundown?.interactive_scripts ? JSON.parse(rundown.interactive_scripts) : null;

const tabItems = [
  {
    key: 'overview',
    label: '会议概览',
    children: (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="会议信息">
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>会议标题:</strong> {meeting?.title}</p>
              <p><strong>会议日期:</strong> {meeting?.date}</p>
              <p><strong>状态:</strong> <Tag color="success">{meeting?.status === 'completed' ? '已完成' : meeting?.status}</Tag></p>
            </Col>
            <Col span={12}>
              <p><strong>描述:</strong> {meeting?.description}</p>
              <p><strong>创建时间:</strong> {new Date(meeting?.created_at).toLocaleString()}</p>
            </Col>
          </Row>
        </Card>

        <Card title="参会人员">
          <Row gutter={[16, 16]}>
            {participants.map(p => (
              <Col xs={24} sm={12} md={8} key={p.id}>
              <Card size="small">
                <Space>
                  <Avatar style={{ backgroundColor: getRoleColor(p.role) }} icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                    <Text type="secondary">{p.role}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Card>

        <Card title="歌单">
          <List
            dataSource={songs}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Tag color="purple">{index + 1}</Tag>}
                  title={item.title}
                  description={`${item.artist} - ${item.duration}`}
                />
                {item.notes && <Tag color="blue">{item.notes}</Tag>}
              </List.Item>
            )}
          />
        </Card>
      </Space>
    )
  },
  {
    key: 'transcript',
    label: '会议记录',
    children: (
      <Card title="语音转写记录">
        {transcripts.map((t, index) => (
          <div key={t.id} className="transcript-item">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <Tag color={getRoleColor(t.role)}>{t.speaker}</Tag>
              <Tag color="default">{t.role}</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>[{formatTime(t.start_time)}]</Text>
            </div>
            <p style={{ margin: 0 }}>{t.content}</p>
            {index < transcripts.length - 1 && <Divider style={{ margin: '12px 0' }} />
          </div>
        ))}
      </Card>
    )
  },
  {
    key: 'rundown',
    label: '演出 Rundown',
    children: (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {rundownData && (
          <>
            <Card title="演出流程">
              {rundownData.sections.map((section, index) => (
              <div key={index} className="timeline-item">
                <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                  {section.title}
                </div>
                <Tag color="blue">{section.time}</Tag>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            </Card>

            <Card title="演出摘要">
              <p>{rundownData.summary}</p>
            </Card>
          </>
        )}
      </Space>
    )
  },
  {
    key: 'scripts',
    label: '互动脚本',
    children: (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {scriptsData?.segments?.map((segment, index) => (
          <Card key={index} title={segment.title}>
            <p style={{ color: '#666', marginBottom: 16 }}>{segment.description}</p>
            <div className="script-box">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{segment.script}</pre>
            </div>
          </Card>
        ))}
      </Space>
    )
  }
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

return (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/meetings')}>
          返回列表
        </Button>
        <Title level={4} style={{ margin: 0 }}>{meeting?.title}</Title>
        <Tag color="purple">{meeting?.date}</Tag>
      </Space>
      <Button 
        type="primary" 
        icon={<MailOutlined />} 
        onClick={() => setEmailModalVisible(true)}
      >
        发送邮件
      </Button>
    </div>

    <Card className="card-shadow">
      <Tabs items={tabItems} />
    </Card>

    <Modal
      title="发送邮件"
      open={emailModalVisible}
      onCancel={() => setEmailModalVisible(false)}
      footer={null}
      width={600}
    >
      <Form
        form={emailForm}
        layout="vertical"
        onFinish={handleSendEmail}
      >
        <Form.Item 
          name="recipients" 
          label="收件人（多个邮箱用逗号分隔"
          rules={[{ required: true, message: '请输入收件人邮箱' }]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="例如: team@example.com,运营@example.com"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block icon={<SendOutlined />}>
            发送邮件
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  </Space>
);
}

export default MeetingDetail;
