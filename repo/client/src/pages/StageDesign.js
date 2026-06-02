import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Upload, Space, Tag, message, Carousel } from 'antd';
import { PlusOutlined, UploadOutlined, BulbOutlined } from '@ant-design/icons';
import axios from 'axios';

function StageDesign() {
  const [designs, setDesigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const response = await axios.get('/api/stage-designs');
      if (response.data.length > 0) {
        setDesigns(response.data);
      } else {
        setMockDesigns();
      }
    } catch (error) {
      console.error('Failed to load designs:', error);
      setMockDesigns();
    }
  };

  const setMockDesigns = () => {
    setDesigns([
      { 
        id: 1, 
        name: '星空舞台', 
        description: '以星空为主题的梦幻舞台设计，采用全息投影技术配合AR效果，营造梦幻星空背景，可切换不同星座图案，配合动态流星效果。',
        image_path: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
      },
      { 
        id: 2, 
        name: '未来都市', 
        description: '赛博朋克风格的科技感舞台，霓虹灯光效果，全息屏幕环绕，机械臂舞者配合演出，充满未来科技感。',
        image_path: 'https://images.unsplash.com/photo-1470229722913-7c08044c62f0?w=800'
      },
      { 
        id: 3, 
        name: '樱花庭院', 
        description: '日系唯美风格，樱花飘落效果，传统与现代结合的日式庭院场景，适合抒情歌曲表演。',
        image_path: 'https://images.unsplash.com/photo-1522383225653-ed116e3b5003?w=800'
      }
    ]);
  };

  const handleUploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
    maxCount: 1
  };

  const handleAddDesign = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    if (fileList[0]?.originFileObj && formData.append('design', fileList[0].originFileObj);

    try {
      await axios.post('/api/stage-designs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('舞台设计添加成功');
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      loadDesigns();
    } catch (error) {
      message.error('添加失败');
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color="purple">共 {designs.length} 套舞台方案</Tag>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          添加舞台设计
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {designs.map((design) => (
          <Col xs={24} md={12} key={design.id}>
            <Card 
              hoverable
              className="stage-card card-shadow"
              cover={
                <div 
                  style={{ 
                    height: 250,
                    background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%),
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewImage(design.image_path)}
                >
                  <div style={{ 
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${design.image_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ 
                      background: 'rgba(0,0,0,0.5)',
                      padding: '8px 16px',
                      borderRadius: 4,
                      color: 'white'
                    }}>
                      <Space>
                        <BulbOutlined /> 点击预览
                      </Space>
                    </div>
                  </div>
                </div>
              }
              actions={[
                <span style={{ color: '#722ed1' }}>编辑</span>,
                <span style={{ color: '#722ed1' }}>使用此方案</span>
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{design.name}</span>
                    <Tag color="blue">方案 {design.id}</Tag>
                  </Space>
                }
                description={design.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="舞台效果展示" className="card-shadow">
        <Carousel autoplay>
          {designs.map((design) => (
            <div key={design.id}>
              <div style={{ 
                height: 400, 
                backgroundImage: `url(${design.image_path})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '30px'
              }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.7)',
                  padding: '20px 30px',
                  borderRadius: 8,
                  color: 'white'
                }}>
                  <h3 style={{ color: 'white', margin: 0 }}>{design.name}</h3>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>{design.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </Card>

      <Modal
        title="添加舞台设计"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDesign}
        >
          <Form.Item name="name" label="舞台名称" rules={[{ required: true }]}>
            <Input placeholder="请输入舞台设计名称" />
          </Form.Item>
          <Form.Item name="description" label="设计描述">
            <Input.TextArea rows={4} placeholder="请输入舞台设计描述" />
          </Form.Item>
          <Form.Item label="设计图">
            <Upload {...handleUploadProps}>
              <Button icon={<UploadOutlined />}>上传设计图</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加设计
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="舞台设计预览"
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={1000}
      >
        {previewImage && (
          <img 
            src={previewImage} 
            alt="Stage Design"
            style={{ width: '100%', borderRadius: 8 }}
          />
        )}
      </Modal>
    </Space>
  );
}

export default StageDesign;
