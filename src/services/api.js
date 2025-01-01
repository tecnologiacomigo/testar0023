import axios from 'axios';

const api = axios.create({
  baseURL: 'https://whatsapp.clube.ai',
  headers: {
    'Content-Type': 'application/json',
    'apikey': '96AD8196869A-4E92-BD1F-ECB7EE223A0F'
  }
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const prepareMessagesForAnalysis = (messages) => {
  const conversations = messages
    .filter(msg => msg.messageType === 'conversation')
    .slice(0, 500)
    .map(msg => ({
      name_user: msg.pushName || 'Anônimo',
      text: msg.message?.conversation || '',
      timestamp: msg.messageTimestamp,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Estatísticas por usuário
  const userStats = conversations.reduce((acc, msg) => {
    if (!acc[msg.name_user]) {
      acc[msg.name_user] = {
        messageCount: 0,
        wordCount: 0,
        firstMessage: msg.timestamp,
        lastMessage: msg.timestamp
      };
    }
    
    acc[msg.name_user].messageCount++;
    acc[msg.name_user].wordCount += msg.text.split(' ').length;
    acc[msg.name_user].lastMessage = msg.timestamp;
    
    return acc;
  }, {});

  return {
    messageCount: conversations.length,
    dateRange: conversations.length > 0 ? 
      `${formatDate(conversations[0].timestamp)} - ${formatDate(conversations[conversations.length - 1].timestamp)}` : '',
    userStats,
    rawConversations: conversations
  };
};

export const fetchAndProcessMessages = async ({ phone }) => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? 
      `${cleanPhone}@s.whatsapp.net` : 
      `55${cleanPhone}@s.whatsapp.net`;

    const response = await api.post('/chat/findMessages/numero02', {
      where: {
        key: {
          remoteJid: formattedPhone
        }
      }
    });

    if (!response.data?.messages?.records) {
      throw new Error('Nenhuma mensagem encontrada para este número');
    }

    return prepareMessagesForAnalysis(response.data.messages.records);

  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar mensagens');
  }
};
