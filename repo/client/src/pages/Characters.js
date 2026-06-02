import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Space, Avatar, Tag, message } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

function Characters() {
  const [characters, setCharacters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const response = await axios.get('/api/characters');
      if (response.data.length > 0) {
        setCharacters(response.data);
      } else {
        setMockCharacters();
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      setMockCharacters();
    }
  };

  const setMockCharacters = () => {
    setCharacters([
      { id: 1, name: '星瞳', description: '活力四射的虚拟偶像，擅长舞蹈', voice_actor: '张三', model_path: '/models/xingtong.glb', color: '#667eea' },
      { id: 2, name: '阿梓', description: '温柔治愈系歌手，声线优美', voice_actor: '李四', model_path: '/models/azi.glb', color: '#f093fb' },
      { id: 3, name: '七海', description: '元气少女，擅长rap和电音', voice_actor: '王五', model_path: '/models/qihai.glb', color: '#4facfe' }
    ]);
  };

  const handleAddCharacter = async (values) => {
    try {
      await axios.post('/api/characters', values);
      message.success('角色添加成功');
      setIsModalOpen(false);
      form.resetFields();
      loadCharacters();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const getCharacterColor = (id) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#fa8c16', '#52c41a'];
    return colors[(id - 1) % colors.length];
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color="purple">共 {characters.length} 位虚拟偶像</Tag>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          添加角色
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {characters.map((char) => (
          <Col xs={24} md={12} lg={8} key={char.id}>
            <Card 
              hoverable
              className="character-card card-shadow"
              onClick={() => setSelectedCharacter(char)}
              cover={
                <div style={{ 
                  height: 300, 
                  background: `linear-gradient(180deg, ${getCharacterColor(char.id)}33 0%, ${getCharacterColor(char.id)}11 100%)`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CharacterModel color={getCharacterColor(char.id)} />
                  <div style={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    background: 'rgba(255,255,255,0.9)',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px'
                  }}>
                    点击查看详情
                  </div>
                </div>
              }
            >
              <Card.Meta
                avatar={
                  <Avatar 
                    size={48}
                    style={{ background: getCharacterColor(char.id) }}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <Space>
                    <span style={{ fontSize: 18, fontWeight: 'bold' }}>{char.name}</span>
                    <Tag color="blue">Vtuber</Tag>
                  </Space>
                }
                description={char.description}
              />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '12px', color: '#888' }}>中之人: {char.voice_actor}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="添加新角色"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCharacter}
        >
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item name="voice_actor" label="中之人">
            <Input placeholder="请输入中之人姓名" />
          </Form.Item>
          <Form.Item name="model_path" label="模型路径">
            <Input placeholder="请输入3D模型路径" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加角色
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <Avatar style={{ background: selectedCharacter ? getCharacterColor(selectedCharacter.id) : '#722ed1' }}>
              {selectedCharacter?.name?.charAt(0)}
            </Avatar>
            {selectedCharacter?.name} 角色详情
          </Space>
        }
        open={!!selectedCharacter}
        onCancel={() => setSelectedCharacter(null)}
        footer={null}
        width={800}
      >
        {selectedCharacter && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="model-viewer-container">
              <CharacterModel color={getCharacterColor(selectedCharacter.id)} detailed />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <p><strong>角色名称:</strong> {selectedCharacter.name}</p>
                  <p><strong>中之人:</strong> {selectedCharacter.voice_actor}</p>
                  <p><strong>描述:</strong> {selectedCharacter.description}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="技术参数">
                  <p><strong>模型路径:</strong> {selectedCharacter.model_path}</p>
                  <p><strong>角色ID:</strong> {selectedCharacter.id}</p>
                  <p><strong>状态:</strong> <Tag color="success">就绪</Tag></p>
                </Card>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
    </Space>
  );
}

function CharacterModel({ color = '#722ed1', detailed = false }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          
          <mesh position={[0, -0.8, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 1.2, 32]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          
          <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          
          <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          
          {detailed && (
            <>
              <mesh position={[-0.25, 0.8, 0.7]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="white" />
              </mesh>
              <mesh position={[0.25, 0.8, 0.7]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="white" />
              </mesh>
              <mesh position={[-0.25, 0.85, 0.78]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0.25, 0.85, 0.78]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="#333" />
              </mesh>
            </>
          )}
        </group>
      </Float>
      
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

export default Characters;
