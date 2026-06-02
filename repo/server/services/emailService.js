const nodemailer = require('nodemailer');
const { marked } = require('marked');

function generateMarkdownReport(meeting, rundown, participants, songs) {
  let md = `# 虚拟偶像演唱会策划纪要\n\n`;
  md += `## ${meeting.title}\n\n`;
  md += `**日期**: ${meeting.date || '待定'}\n\n`;
  md += `**状态**: ${getStatusText(meeting.status)}\n\n`;
  
  if (meeting.description) {
    md += `### 会议描述\n${meeting.description}\n\n`;
  }
  
  if (participants && participants.length > 0) {
    md += `### 参会人员\n`;
    participants.forEach(p => {
      md += `- **${p.name}** (${p.role || '未指定'})\n`;
    });
    md += '\n';
  }
  
  if (songs && songs.length > 0) {
    md += `### 歌单\n`;
    songs.forEach((song, index) => {
      md += `${index + 1}. **${song.title}** - ${song.artist || '未知'} (${song.duration || '待定'})\n`;
      if (song.notes) {
        md += `   - 备注: ${song.notes}\n`;
      }
    });
    md += '\n';
  }
  
  if (rundown && rundown.content) {
    const rundownData = JSON.parse(rundown.content);
    md += `## 演出 Rundown\n\n`;
    
    if (rundownData.sections) {
      rundownData.sections.forEach(section => {
        md += `### ${section.title}\n`;
        if (section.time) {
          md += `**时间**: ${section.time}\n\n`;
        }
        if (section.items) {
          section.items.forEach(item => {
            md += `- ${item}\n`;
          });
        }
        md += '\n';
      });
    }
    
    if (rundownData.summary) {
      md += `### 摘要\n${rundownData.summary}\n\n`;
    }
  }
  
  if (rundown && rundown.interactive_scripts) {
    const interactiveData = JSON.parse(rundown.interactive_scripts);
    md += `## 互动环节脚本\n\n`;
    
    if (interactiveData.segments) {
      interactiveData.segments.forEach(segment => {
        md += `### ${segment.title}\n\n`;
        if (segment.description) {
          md += `${segment.description}\n\n`;
        }
        if (segment.script) {
          md += `\`\`\`\n${segment.script}\n\`\`\`\n\n`;
        }
      });
    }
  }
  
  md += `---\n*本纪要由 AI 自动生成，生成时间: ${new Date().toLocaleString()}*\n`;
  
  return md;
}

function getStatusText(status) {
  const statusMap = {
    'draft': '草稿',
    'processing': '处理中',
    'transcribed': '已转写',
    'completed': '已完成',
    'error': '错误'
  };
  return statusMap[status] || status;
}

async function sendEmail(recipients, subject, markdownContent) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const htmlContent = marked(markdownContent);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(', '),
    subject: subject,
    text: markdownContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">✨ 虚拟偶像演唱会策划纪要 ✨</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          ${htmlContent}
        </div>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  generateMarkdownReport,
  sendEmail
};
