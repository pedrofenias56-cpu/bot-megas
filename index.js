require('http').createServer((req, res) => res.end('Bot Megas Pedro Online')).listen(process.env.PORT || 10000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

// === COLOCA AQUI O NUMERO DO BOT ===
const MEU_NUMERO = '258841066314';
const NUMERO_ADMIN = '258856150578';

const MENU = `👋 *BEM-VINDO A MEGAS PEDRO* 👋

*GRUPO ABERTO 24H - NÃO FECHAMOS!*

Escolhe uma opção:

1️⃣ - Ver *TABELA* Completa
2️⃣ - *COMPRAR* Megas
3️⃣ - Formas de *PAGAMENTO*
4️⃣ - Falar com *SUPORTE*

_Digita só o número. Ex: 1_`;

const TABELA = `*GRUPO ABERTO 24H – NÃO FECHAMOS!*

💎 SOLUÇÕES DE DADOS A PREÇOS IMBATÍVEIS 💎

🌐 512MB = 10MT
🌐 750MB = 15MT
🌐 1024MB = 20MT
🌐 1262MB = 25MT
🌐 1536MB = 30MT
🌐 1774MB = 35MT
🌐 2048MB = 40MT
🌐 2286MB = 45MT
🌐 2560MB = 50MT
🌐 2798MB = 55MT
🌐 3072MB = 60MT
🌐 3310MB = 65MT
🌐 3584MB = 70MT
🌐 3822MB = 75MT
🌐 4096MB = 80MT
🌐 4334MB = 85MT
🌐 4608MB = 90MT
🌐 4800MB = 100MT
🌐 5120MB = 100MT
🌐 6144MB = 120MT
🌐 7168MB = 140MT
🌐 8200MB = 160MT
🌐 9216MB = 180MT
🌐 10240MB = 200MT

🚨*O PACOTE SEMANAL, MENSAL e PACOTE DIAMANTE O CLIENTE NÃO DEVE TER TXUNA CRÉDITO*🚨

📅 PACOTE SEMANAL (7 DIAS):
857MB = 28 MT
1741MB = 46 MT
2970MB = 82 MT
3482MB = 93 MT
5325MB = 143 MT
7270MB = 185 MT

📱🌐MENSAL [30 Dias]⬇

🌐 2.8GB = 95MT 💠
🌐 5.8GB = 155MT 💠
🌐 6.8GB = 175MT 💠
🌐 7.8GB = 195MT 💠
🌐 9.8GB = 215MT 💠
🌐 10.8GB = 255MT 💠
🌐 12.8GB = 295MT

💎 PACOTES DIAMANTE MENSAIS
Chamadas + SMS ilimitadas + 11GB = 450MT 💵
Chamadas + SMS ilimitadas + 15GB = 510MT 💵
Chamadas + SMS ilimitadas + 21GB = 650MT 💵
Chamadas + SMS ilimitadas + 30GB = 830MT 💵
Chamadas + SMS ilimitadas + 50GB = 1230MT 💵
📍 NB: Válido apenas para Vodacom
📍 Para o Pacote Mensal e Diamante, não deve ter Txuna crédito ativo!

✅ Para comprar digita *2*`;

const PAGAMENTO = `FORMAS DE PAGAMENTO💰💶*

💵 M-Pesa: 856150578 (Fenias Eduardo Pedro)

💵 E-Mola 877114280 (Fenias Eduardo Pedro)

📮 Após a transferência enviei o comprovante em formato de texto junto com seu número.

> 1. 🚨Não mande comprovativo em formato de imagem 📸🚨

> 2. 🚨 Não mande valor que não tem na tabela🚨

🚀 O futuro é agora! Vamos? 🔥🛒`;

const COMPRAR = `🛒 *COMO COMPRAR*

1. Escolhe na tabela. Ex: *Quero 1024MB*
2. Faz pagamento para:
💵 M-Pesa: 856150578
💵 E-Mola: 877114280
Nome: Fenias Eduardo Pedro
3. Envia o comprovativo em *TEXTO* + teu número

⚠️ Não mandes comprovativo em imagem!
⚠️ Não mandes valor que não tem na tabela!

O teu pedido será processado rápido! ✅`;

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Megas Pedro', 'Chrome', '1.0']
    });

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(MEU_NUMERO);
                console.log('CODIGO DE PAREAMENTO: ' + code);
            } catch (e) { console.log('Erro pairing:', e.message); }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) start();
        } else if (connection === 'open') {
            console.log('BOT CONECTADO COM SUCESSO!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const texto = (m.message.conversation || m.message.extendedTextMessage?.text || '').toLowerCase().trim();
        const jid = m.key.remoteJid;
        if (jid.endsWith('@g.us')) return;

        let resposta = null;

        if (texto === 'menu' || texto === 'oi' || texto === 'ola' || texto === 'bom dia' || texto === 'boa tarde' || texto === 'boa noite') resposta = MENU;
        else if (texto === '1' || texto.includes('tabela') || texto.includes('preco') || texto.includes('megas') || texto.includes('pacote')) resposta = TABELA;
        else if (texto === '2' || texto.includes('comprar') || texto.includes('quero')) {
            resposta = COMPRAR;
            await sock.sendMessage(NUMERO_ADMIN + '@s.whatsapp.net', { text: `🔔 Novo cliente quer comprar!\nNumero: ${jid.split('@')[0]}\nMensagem: ${texto}` });
        }
        else if (texto === '3' || texto.includes('pagamento') || texto.includes('pagar') || texto.includes('mpesa') || texto.includes('m-pesa') || texto.includes('emola') || texto.includes('e-mola')) resposta = PAGAMENTO;
        else if (texto === '4' || texto.includes('suporte') || texto.includes('ajuda') || texto.includes('falar')) resposta = `👨‍💻 *SUPORTE*\nFala connosco aqui: wa.me/258856150578\nRespondemos rápido!`;

        if (resposta) await sock.sendMessage(jid, { text: resposta });
    });
}
start();
