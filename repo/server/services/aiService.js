const axios = require('axios');

async function generateRundown(meeting, transcripts, participants, songs) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return generateMockRundown(meeting, transcripts, participants, songs);
  }
  
  const transcriptText = transcripts.map(t => 
    `[${formatTime(t.start_time)}] ${t.speaker || '未知'}: ${t.content}`
  ).join('\n');
  
  const participantList = participants.map(p => 
    `${p.name} (${p.role || '未指定'})`
  ).join(', ');
  
  const songList = songs.map(s => 
    `${s.title} - ${s.artist || '未知'} (${s.duration || '待定'})`
  ).join('\n');
  
  const prompt = `
你是一位专业的虚拟偶像演唱会策划总监。请根据以下会议内容，生成一份详细的演出 Rundown 和互动环节脚本。

会议信息:
标题: ${meeting.title}
日期: ${meeting.date || '待定'}
参会人员: ${participantList}

会议记录:
${transcriptText}

歌单:
${songList || '暂无歌单信息'}

请生成:
1. 结构化的演出 Rundown（包含开场、演唱环节、互动环节、结尾等）
2. 每个互动环节的详细脚本（包含主持人台词、角色台词、观众互动设计）

请以 JSON 格式返回，包含:
{
  "rundown": {
    "sections": [
      {
        "title": "环节名称",
        "time": "预计时长",
        "items": ["具体内容项1", "具体内容项2"]
      }
    ],
    "summary": "整体演出摘要"
  },
  "interactiveScripts": {
    "segments": [
      {
        "title": "互动环节名称",
        "description": "环节描述",
        "script": "详细脚本内容"
      }
    ]
  }
}
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一位专业的演唱会策划总监，擅长设计虚拟偶像演出流程和互动环节。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    const jsonStr = content.substring(jsonStart, jsonEnd);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return generateMockRundown(meeting, transcripts, participants, songs);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateMockRundown(meeting, transcripts, participants, songs) {
  return {
    rundown: {
      sections: [
        {
          title: "开场秀 (Opening)",
          time: "19:00 - 19:10",
          items: [
            "灯光秀与倒计时",
            "虚拟偶像全员登场",
            "开场主题曲《次元之门》",
            "主持人介绍与欢迎致辞"
          ]
        },
        {
          title: "第一篇章: 星之序曲",
          time: "19:10 - 19:30",
          items: [
            "星瞳 solo - 《星光闪耀》",
            "阿梓 solo - 《月光奏鸣曲》",
            "七海 solo - 《电子精灵》"
          ]
        },
        {
          title: "互动环节一: 粉丝问答",
          time: "19:30 - 19:45",
          items: [
            "线上弹幕抽选问题",
            "虚拟偶像现场回答",
            "幸运粉丝连麦"
          ]
        },
        {
          title: "第二篇章: 梦之交响",
          time: "19:45 - 20:10",
          items: [
            "三人合唱 - 《梦想的翅膀》",
            "舞蹈串烧表演",
            "AR特效展示"
          ]
        },
        {
          title: "互动环节二: 游戏对决",
          time: "20:10 - 20:25",
          items: [
            "你画我猜 - 虚拟偶像 vs 观众",
            "猜歌名游戏",
            "惩罚环节"
          ]
        },
        {
          title: "第三篇章: 未来之声",
          time: "20:25 - 20:45",
          items: [
            "新歌首唱 - 《未来可期》",
            "粉丝应援大合唱",
            "感人时刻 VCR"
          ]
        },
        {
          title: "安可与谢幕",
          time: "20:45 - 21:00",
          items: [
            "粉丝安可呼唤",
            "安可曲 - 《永远的羁绊》",
            "全体致谢",
            "约定下次再会"
          ]
        }
      ],
      summary: "本次虚拟偶像演唱会以「跨越次元的约定」为主题，通过三个篇章展现虚拟偶像的成长与魅力。演出融合了AR技术、实时互动、多风格音乐表演，为观众打造一场沉浸式的跨次元娱乐盛宴。总时长约120分钟，包含7个主要环节，其中设计了2个粉丝互动环节增强参与感。"
    },
    interactiveScripts: {
      segments: [
        {
          title: "粉丝问答环节脚本",
          description: "通过线上弹幕抽选粉丝问题，虚拟偶像现场回答",
          script: `【场景: 舞台中央升起三个话筒，背景屏幕显示弹幕墙】

主持人: 欢迎来到我们的第一个互动环节——「心声传递」！现在我们的弹幕通道已经开启，请大家在评论区留下你们最想问的问题，我们会随机抽取三位幸运粉丝的问题！

【屏幕开始滚动弹幕，音乐轻快】

主持人: 好的，第一个问题抽出来了！这位ID叫「星星点灯」的粉丝问: 星瞳最近有没有学习新的舞蹈风格呀？

星瞳: (眼睛亮晶晶) 哇，这个问题好棒！其实我最近一直在练习街舞呢，特别是Breaking的部分，虽然练到全身酸痛，但是超有成就感的！等下在舞蹈串烧里大家会看到哦～

主持人: 太棒了！我们期待你的表现！第二个问题... 这位「月夜行者」问阿梓: 平时录制歌曲的时候，有什么特别的小习惯吗？

阿梓: (羞涩笑) 嗯...其实我录歌的时候一定要抱着我的小猫咪抱枕啦，它会给我安全感。而且录高音之前我会偷偷吃一颗润喉糖，这个是秘密哦！

主持人: 好可爱的小习惯！最后一个问题，来自「电波少女」: 七海有没有考虑过尝试不同的音乐风格？

七海: (比出Rock手势) 当然有！其实我超想尝试重金属摇滚的！下次演唱会说不定就能看到我的新造型哦，大家敬请期待吧！

主持人: 感谢三位的精彩回答！没有被抽到的粉丝也不要灰心，我们还有下一个互动环节哦！`
        },
        {
          title: "游戏对决环节脚本",
          description: "虚拟偶像与线上粉丝进行游戏互动",
          script: `【场景: 舞台变成游戏竞技场风格，霓虹灯光闪烁】

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

主持人: 好吧，这轮看来粉丝们需要更多默契！不过没关系，我们还有下一轮的猜歌名游戏！`
        }
      ]
    }
  };
}

module.exports = {
  generateRundown
};
