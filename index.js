const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

const TABELA = `
📱 *TABELA MEGAS PEDRO* 📱

🔥 *VODACOM*
500MB - 25MT
1GB - 40MT
2.5GB - 70MT
5GB - 120MT
10GB - 200MT

🔥 *TMcel*
500MB - 30MT
1GB - 45MT

💳 Pagamento: M-Pesa / E-Mola
`

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: true })
  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const texto = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase()
    const from = m.key.remoteJid

    if (texto.includes('menu') || texto.includes('tabela') || texto === '1') {
      await sock.sendMessage(from, { text: TABELA })
    } else {
      await sock.sendMessage(from, { text: `Olá! 👋\n${TABELA}\n\nDigite *1* para menu` })
    }
  })

  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start()
    if (u.connection === 'open') console.log('Bot conectado!')
  })
}
start()
