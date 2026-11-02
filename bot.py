import os
import discord
from discord.ext import commands
import cv2
import numpy as np
from PIL import Image
import requests
from io import BytesIO
from dotenv import load_dotenv

# Memuat token dari file .env
load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Bot Python {bot.user.name} sudah online dan siap!')

@bot.command(name='hd', aliases=['edit'])
async def enhance_image(ctx):
    if not ctx.message.attachments:
        await ctx.send("Tolong lampirkan foto Roblox yang ingin diproses!")
        return

    attachment = ctx.message.attachments[0]
    loading_msg = await ctx.send("⏳ Sedang memproses peningkatan kualitas gambar secara presisi...")

    try:
        # Download gambar dari Discord
        response = requests.get(attachment.url)
        image_bytes = BytesIO(response.content)
        
        pil_img = Image.open(image_bytes).convert("RGB")
        img_np = np.array(pil_img)

        # Proses menggunakan OpenCV (Upscale & Sharpening lokal tanpa ubah bentuk)
        img_bgr = cv2.cvtColor(img_np, cv2.RGB2BGR)

        width = int(img_bgr.shape[1] * 2)
        height = int(img_bgr.shape[0] * 2)
        resized_img = cv2.resize(img_bgr, (width, height), interpolation=cv2.INTER_CUBIC)

        kernel = np.array([[0, -1, 0],
                           [-1, 5, -1],
                           [0, -1, 0]])
        sharpened = cv2.filter2D(resized_img, -1, kernel)

        # Penyesuaian kontras dan warna sinematik
        alpha = 1.25  
        beta = 10     
        cinematic_img = cv2.convertScaleAbs(sharpened, alpha=alpha, beta=beta)

        final_rgb = cv2.cvtColor(cinematic_img, cv2.BGR2RGB)
        result_pil = Image.fromarray(final_rgb)

        output_buffer = BytesIO()
        result_pil.save(output_buffer, format="PNG")
        output_buffer.seek(0)

        file = discord.File(output_buffer, filename="roblox-python-hd.png")
        await loading_msg.edit(content="✨ Selesai! Foto Roblox kamu berhasil diproses dengan tajam dan sinematik.")
        await ctx.send(file=file)

    except Exception as e:
        print(f"Error: {e}")
        await loading_msg.edit(content="❌ Terjadi kesalahan saat memproses gambar.")

bot.run(TOKEN)