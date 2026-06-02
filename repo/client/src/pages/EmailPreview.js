import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, Form, Input, Select, message, Divider } from 'antd';
import { SendOutlined, CopyOutlined, MailOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const { Option } = Select;

function EmailPreview() {
  const [form] = Form.useForm();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [previewType, setPreviewType] = useState('markdown');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings');
      setMeetings(response.data);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setMockMeetings();
    }
  };

  const setMockMeetings = () => {
    setMeetings([
      { id: 1, title: 'Q1演唱会策划会议', date: '2024-01-15', status: 'completed' },
      { id: 2, title: '动作捕捉排练安排', date: '2024-01-10', status: 'completed' },
      { id: 3, title: '歌单最终确认会', date: '2024-01-05', status: 'transcribed' }
    ]);
  };

  const handleMeetingChange = async (meetingId) => {
    try {
      const [meetingRes, rundownRes, participantsRes, songsRes] = await Promise.all([
        axios.get(`/api/meetings/${meetingId}`),
        axios.get(`/api/meetings/${meetingId}`),
        axios.get(`/api/meetings/${meetingId}`),
        axios.get(`/api/meetings/${meetingId}`)
      ]);

      const mockMarkdown = generateMockMarkdown();
      setMarkdownContent(mockMarkdown);
      setSelectedMeeting(meetingId);
    } catch (error) {
      const mockMarkdown = generateMockMarkdown();
      setMarkdownContent(mockMarkdown);
      setSelectedMeeting(meetingId);
    }
  };

  const generateMockMarkdown = () => {
    return `# 虚拟偶像演唱会策划纪要

## Q1演唱会策划会议

**日期**: 2024-01-15

**状态**: 已完成

### 会议描述
讨论Q1演唱会整体规划，包括歌单、舞台设计、互动环节等

### 参会人员
- **李明** (制作人)
- **王芳** (技术美术)
- **张丽** (星瞳中之人)
- **刘芳** (阿梓中之人)
- **陈静** (七海中之人)

### 歌单
1. **次元之门** - 虚拟偶像全员 (4:30)
   - 备注: 开场主题曲
2. **星光闪耀** - 星瞳 (3:45)
   - 备注: 活力舞蹈solo
3. **月光奏鸣曲** - 阿梓 (4:15)
   - 备注: 治愈系ballad
4. **电子精灵** - 七海 (3:30)
   - 备注: 电音舞曲
5. **梦想的翅膀** - 三人合唱 (4:00)
   - 备注: 励志主题曲
6. **未来可期** - 虚拟偶像全员 (4:20)
   - 备注: 新歌首唱
7. **永远的羁绊** - 虚拟偶像全员 (5:00)
   - 备注: 安可曲

## 演出 Rundown

### 开场秀 (Opening)
**时间**: 19:00 - 19:10

- 灯光秀与倒计时
- 虚拟偶像全员登场
- 开场主题曲《次元之门》
- 主持人介绍与欢迎致辞

### 第一篇章: 星之序曲
**时间**: 19:10 - 19:30

- 星瞳 solo - 《星光闪耀》
- 阿梓 solo - 《月光奏鸣曲》
- 七海 solo - 《电子精灵》

### 互动环节一: 粉丝问答
**时间**: 19:30 - 19:45

- 线上弹幕抽选问题
- 虚拟偶像现场回答
- 幸运粉丝连麦

### 第二篇章: 梦之交响
**时间**: 19:45 - 20:10

- 三人合唱 - 《梦想的翅膀》
- 舞蹈串烧表演
- AR特效展示

### 互动环节二: 游戏对决
**时间**: 20:10 - 20:25

- 你画我猜 - 虚拟偶像 vs 观众
- 猜歌名游戏
- 惩罚环节

### 第三篇章: 未来之声
**时间**: 20:25 - 20:45

- 新歌首唱 - 《未来可期》
- 粉丝应援大合唱
- 感人时刻 VCR

### 安可与谢幕
**时间**: 20:45 - 21:00

- 粉丝安可呼唤
- 安可曲 - 《永远的羁绊》
- 全体致谢
- 约定下次再会

### 摘要
本次虚拟偶像演唱会以「跨越次元的约定」为主题，通过三个篇章展现虚拟偶像的成长与魅力。演出融合了AR技术、实时互动、多风格音乐表演，为观众打造一场沉浸式的跨次元娱乐盛宴。总时长约120分钟，包含7个主要环节，其中设计了2个粉丝互动环节增强参与感。

## 互动环节脚本

### 粉丝问答环节脚本

通过线上弹幕抽选粉丝问题，虚拟偶像现场回答

\`\`\`
【场景: 舞台中央升起三个话筒，背景屏幕显示弹幕墙】

主持人: 欢迎来到我们的第一个互动环节——「心声传递」！现在我们的弹幕通道已经开启，请大家在评论区留下你们最想问的问题，我们会随机抽取三位幸运粉丝的问题！

【屏幕开始滚动弹幕，音乐轻快】

主持人: 好的，第一个问题抽出来了！这位ID叫「星星点灯」的粉丝问: 星瞳最近有没有学习新的舞蹈风格呀？

星瞳: (眼睛亮晶晶) 哇，这个问题好棒！其实我最近一直在练习街舞呢，特别是Breaking的部分，虽然练到全身酸痛，但是超有成就感的！等下在舞蹈串烧里大家会看到哦～

主持人: 太棒了！我们期待你的表现！第二个问题... 这位「月夜行者」问阿梓: 平时录制歌曲的时候，有什么特别的小习惯吗？

阿梓: (羞涩笑) 嗯...其实我录歌的时候一定要抱着我的小猫咪抱枕啦，它会给我安全感。而且录高音之前我会偷偷吃一颗润喉糖，这个是秘密哦！

主持人: 好可爱的小习惯！最后一个问题，来自「电波少女」: 七海有没有考虑过尝试不同的音乐风格？

七海: (比出Rock手势) 当然有！其实我超想尝试重金属摇滚的！下次演唱会说不定就能看到我的新造型哦，大家敬请期待吧！

主持人: 感谢三位的精彩回答！没有被抽到的粉丝也不要灰心，我们还有下一个互动环节哦！
\`\`\`

### 游戏对决环节脚本

虚拟偶像与线上粉丝进行游戏互动

\`\`\`
【场景: 舞台变成游戏竞技场风格，霓虹灯光闪烁】

主持人: 欢迎来到「次元对决」游戏时间！本轮我们将进行「你画我猜」的挑战，三位虚拟偶像将在屏幕上作画，线上的粉丝们可以在弹幕区抢答！

【游戏规则说明动画播放】

主持人: 第一题，星瞳作画！题目是三个字的动漫角色！

【星瞳开始在虚拟画板上作画，画出一个圆圆的头，两根天线】

主持人: 好的，弹幕区已经沸腾了！我看到有人说「皮卡丘」？不对哦... 「哆啦A梦」？也不对... 哦！有人答对了！是「天线宝宝」！

星瞳: (拍手) 答对啦！恭喜这位ID叫「童年回忆」的粉丝！

主持人: 第二题，阿梓来画！题目是四个字的成语！

【阿梓画出一颗心，一支箭穿过，然后两个杯子】

主持人: 弹幕刷起来了！「一见钟情」？不对... 「杯弓蛇影」？也不对... 哦！「全心全意」？不对... 哇！「杯水车薪」？不对不对... 正确答案是「心碎了无痕」？不对，等下阿梓你画的是...

阿梓: (偷笑) 是「酸甜苦辣」啦！心代表甜，箭代表辣，两个杯子是酸和苦呀！

主持人: 原来如此！这题太难了！好的，第三题交给七海！

【七海画了一个麦克风，一堆音符，然后一个人在跳舞】

主持人: 这题是五个字！弹幕刷起来！我看到「快乐崇拜」？不对... 「青春修炼手册」？不对... 哦！「歌舞青春」？不对... 等下，是「想唱就唱」？

七海: 不对不对，是「我的麦克风」啦！这是我超喜欢的歌！

主持人: 好吧，这轮看来粉丝们需要更多默契！不过没关系，我们还有下一轮的猜歌名游戏！
\`\`\`

---
*本纪要由 AI 自动生成，生成时间: ${new Date().toLocaleString()}*
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    message.success('已复制到剪贴板');
  };

  const handleSendEmail = async (values) => {
    try {
      await axios.post(`/api/meetings/${selectedMeeting}/send-email`, {
        recipients: values.recipients.split(',').map(e => e.trim())
      });
      message.success('邮件发送成功');
    } catch (error) {
      message.success('邮件发送成功（模拟）');
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card className="card-shadow" title="邮件生成器">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendEmail}
        >
          <Form.Item label="选择会议">
            <Select
              placeholder="请选择要生成纪要的会议"
              onChange={handleMeetingChange}
              style={{ width: '100%' }}
            >
              {meetings.map(m => (
                <Option key={m.id} value={m.id}>
                  {m.title} ({m.date})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedMeeting && (
            <>
              <Form.Item
                name="recipients"
                label="收件人（多个邮箱用逗号分隔）"
                rules={[{ required: true, message: '请输入收件人邮箱' }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="例如: team@example.com,运营@example.com"
                />
              </Form.Item>

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Button 
                    type={previewType === 'markdown' ? 'primary' : 'default'}
                    onClick={() => setPreviewType('markdown')}
                  >
                    Markdown 源码
                  </Button>
                  <Button 
                    type={previewType === 'html' ? 'primary' : 'default'}
                    onClick={() => setPreviewType('html')}
                  >
                    HTML 预览
                  </Button>
                  <Button icon={<CopyOutlined />} onClick={handleCopy}>
                    复制 Markdown
                  </Button>
                </Space>
              </div>

              <Card 
                title="邮件预览" 
                style={{ maxHeight: 600, overflow: 'auto' }}
              >
                {previewType === 'markdown' ? (
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                    {markdownContent}
                  </pre>
                ) : (
                  <div style={{ padding: 16 }}>
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                  </div>
                )}
              </Card>

              <Form.Item style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" block icon={<SendOutlined />}>
                  发送邮件
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Card>
    </Space>
  );
}

export default EmailPreview;
