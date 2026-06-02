import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, DatePicker, Space, Tag, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

function Meetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings');
      if (response.data.length > 0) {
        setMeetings(response.data);
      } else {
        setMockMeetings();
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setMockMeetings();
    }
  };

  const setMockMeetings = () => {
    setMeetings([
      { id: 1, title: 'Q1演唱会策划会议', date: '2024-01-15', description: '讨论Q1演唱会整体规划', status: 'completed', created_at: '2024-01-10T10:00:00' },
      { id: 2, title: '动作捕捉排练安排', date: '2024-01-10', description: '确定动作捕捉排练时间表', status: 'completed', created_at: '2024-01-08T14:30:00' },
      { id: 3, title: '歌单最终确认会', date: '2024-01-05', description: '确定演唱会最终歌单', status: 'transcribed', created_at: '2024-01-05T09:00:00' },
      { id: 4, title: '舞台设计评审', date: '2024-01-02', description: '评审舞台设计方案', status: 'processing', created_at: '2024-01-02T11:00:00' },
      { id: 5, title: '新年特别企划讨论', date: '2023-12-28', description: '讨论新年特别活动', status: 'draft', created_at: '2023-12-28T15:00:00' }
    ]);
  };

  const handleCreateMeeting = async (values) => {
    try {
      await axios.post('/api/meetings', {
        title: values.title,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description
      });
      message.success('会议创建成功');
      setIsModalOpen(false);
      form.resetFields();
      loadMeetings();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleUploadAudio = async (id, file) => {
    setUploadingId(id);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      await axios.post(`/api/meetings/${id}/upload-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('音频上传成功，正在处理...');
      loadMeetings();
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploadingId(null);
    }
  };

  const handleGenerateRundown = async (id) => {
    try {
      await axios.post(`/api/meetings/${id}/generate-rundown`);
      message.success('Rundown 生成成功');
      loadMeetings();
    } catch (error) {
      message.error('生成失败');
    }
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

  const columns = [
    {
      title: '会议标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#722ed1' }} />
          <a onClick={() => navigate(`/meetings/${record.id}`)}>{text}</a>
        </Space>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/meetings/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'draft' && (
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleUploadAudio(record.id, file);
                return false;
              }}
            >
              <Button 
                type="link" 
                size="small"
                icon={<UploadOutlined />}
                loading={uploadingId === record.id}
              >
                上传音频
              </Button>
            </Upload>
          )}
          {record.status === 'transcribed' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleGenerateRundown(record.id)}
            >
              生成Rundown
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color="purple">共 {meetings.length} 场会议</Tag>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          创建会议
        </Button>
      </div>

      <Card className="card-shadow">
        <Table 
          columns={columns} 
          dataSource={meetings} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建新会议"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMeeting}
        >
          <Form.Item name="title" label="会议标题" rules={[{ required: true }]}>
            <Input placeholder="请输入会议标题" />
          </Form.Item>
          <Form.Item name="date" label="会议日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="会议描述">
            <Input.TextArea rows={3} placeholder="请输入会议描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建会议
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default Meetings;
