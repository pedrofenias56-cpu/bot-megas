const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

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
2.5GB - 80MT
5GB - 130MT
10GB - 220MT

🔥 *Movitel*
500MB - 30MT
1GB - 45MT
2.5GB - 80MT
5GB - 130MT

Digite *tabela* para ver de novo
`

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Bot-Megas', 'Chrome', '1.0.0']
    })

    if (!sock.authState.creds.registered) {
        const phoneNumber = '258841066314' // << TROCA AQUI PELO TEU NUMERO
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber)
                console.log(`SEU CODIGO DE PAREAMENTO: ${code}`)
            } catch (e) {
                console.log('Erro ao gerar codigo:', e)
            }
        }, 3000)
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('BOT MEGAS CONECTADO COM SUCESSO!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase()
        
        if (texto === 'tabela' || texto === 'menu' || texto === 'megas' || texto === 'oi' || texto === 'ola') {
            await sock.sendMessage(msg.key.remoteJid, { text: TABELA })
        }
        if (texto === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! Bot Megas on 🔥' })
        }
    })
}
startBot()
