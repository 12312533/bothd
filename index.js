require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot Cinematic Pro ${client.user.tag} siap online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!multi') || message.content.startsWith('!hd')) {
        const attachment = message.attachments.first();

        if (!attachment) {
            return message.reply('Tolong lampirkan foto Roblox yang ingin diproses dengan efek pencahayaan sinematik!');
        }

        const loadingMessage = await message.reply('🎬 Menerapkan multi-layer pipeline: Memperkuat pencahayaan malam, kontras, dan ketajaman sinematik...');

        try {
            // 1. Download gambar asli dari Discord
            const imageResponse = await fetch(attachment.url);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const inputBuffer = Buffer.from(arrayBuffer);

            // 2. MULTI-LAYER PROCESSING PIPELINE (Disesuaikan mirip atmosfer foto referensi)
            const processedBuffer = await sharp(inputBuffer)
                .resize({ width: 2560, fit: 'contain' }) // Resolusi tinggi agar detail tajam
                .sharpen({ sigma: 2.5, m1: 1.8, m2: 0.9 }) // Mempertajam detail 3D secara maksimal
                .modulate({
                    brightness: 0.95, // Membuat latar belakang malam terasa lebih pekat dan dramatis
                    saturation: 1.5,  // Membuat warna pakaian dan pendaran lampu kota sangat hidup
                })
                .linear(1.3, -30) // Kontras pekat ala film layar lebar (shadows gelap pekat, highlights berkilau)
                .png({ quality: 100 })
                .toBuffer();

            const resultAttachment = new AttachmentBuilder(processedBuffer, { name: 'roblox-cinematic-pro.png' });

            await loadingMessage.edit({ 
                content: `✨ **Selesai!** Karakter dan pose aslimu aman 100%, kini disempurnakan dengan pencahayaan malam dan kontras sinematik pekat ala foto referensi.`, 
                files: [resultAttachment] 
            });

        } catch (error) {
            console.error(error);
            loadingMessage.edit('❌ Terjadi kesalahan saat memproses pipeline gambar.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);