import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const inputVideoPath = path.resolve('docs/splash/splash_transition_verified.webm');
const docsGifPath = path.resolve('docs/splash/splash_transition_verified.gif');
const artifactGifPath = path.resolve('C:/Users/Administrator/.gemini/antigravity/brain/f15d06f1-f40a-4d5e-a6a5-9100540a5dd3/splash_transition_verified.gif');
const gifencScriptPath = path.resolve('frontend/node_modules/gifenc/dist/gifenc.js');

async function convertWebmToGif() {
  if (!fs.existsSync(inputVideoPath)) {
    throw new Error(`Input video not found: ${inputVideoPath}`);
  }

  console.log('Reading WebM video...');
  const videoBuffer = fs.readFileSync(inputVideoPath);
  const videoBase64 = videoBuffer.toString('base64');
  const videoDataUrl = `data:video/webm;base64,${videoBase64}`;

  console.log('Launching headless Chrome for in-browser high-speed GIF rendering...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('[Browser]', msg.text()));

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script>var exports = {};</script>
      </head>
      <body style="margin: 0; background: black;">
        <video id="v" muted playsinline></video>
        <canvas id="c"></canvas>
      </body>
    </html>
  `);

  console.log('Injecting gifenc library into Chrome...');
  await page.addScriptTag({ path: gifencScriptPath });
  await page.evaluate(() => {
    window.gifenc = exports;
  });

  console.log('Encoding GIF directly in Chrome V8 with optimized frame range...');
  const base64Gif = await page.evaluate(async (dataUrl) => {
    const { GIFEncoder, quantize, applyPalette } = window.gifenc;
    const v = document.getElementById('v');
    const c = document.getElementById('c');

    await new Promise((resolve, reject) => {
      v.onloadedmetadata = resolve;
      v.onerror = () => reject('Video failed to load');
      v.src = dataUrl;
      v.load();
    });

    const targetWidth = 320;
    const targetHeight = Math.round((v.videoHeight / v.videoWidth) * targetWidth);
    c.width = targetWidth;
    c.height = targetHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true });

    // Clip from 0.25s (exact moment splash mounts) to 3.5s (main view showcased)
    const startTime = 0.25;
    const endTime = 3.5;
    const fps = 10; // 10 fps
    const frameInterval = 1 / fps;
    const delayMs = Math.round(frameInterval * 1000);
    const totalFrames = Math.floor((endTime - startTime) * fps);

    console.log(`Starting frame extraction: totalFrames = ${totalFrames}, from ${startTime}s to ${endTime}s`);

    const gif = GIFEncoder();

    for (let i = 0; i < totalFrames; i++) {
      const timestamp = startTime + (i * frameInterval);
      v.currentTime = timestamp;
      await new Promise(r => {
        v.onseeked = r;
        setTimeout(r, 60);
      });

      ctx.drawImage(v, 0, 0, targetWidth, targetHeight);
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const rgba = imgData.data;

      const palette = quantize(rgba, 256);
      const index = applyPalette(rgba, palette);

      gif.writeFrame(index, targetWidth, targetHeight, {
        palette,
        delay: delayMs,
        repeat: 0
      });

      if ((i + 1) % 5 === 0 || i + 1 === totalFrames) {
        console.log(`Encoded frame ${i + 1}/${totalFrames}`);
      }
    }

    gif.finish();
    const bytes = gif.bytes();
    
    // Convert Uint8Array to base64
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, videoDataUrl);

  console.log('GIF encoded! Writing to disk...');
  const gifBuffer = Buffer.from(base64Gif, 'base64');

  fs.writeFileSync(docsGifPath, gifBuffer);
  fs.writeFileSync(artifactGifPath, gifBuffer);

  console.log(`Saved to docs: ${docsGifPath} (${gifBuffer.length} bytes)`);
  console.log(`Saved to artifact: ${artifactGifPath} (${gifBuffer.length} bytes)`);

  await browser.close();
  console.log('GIF generation complete!');
}

convertWebmToGif().catch(err => {
  console.error('GIF generation failed:', err);
  process.exit(1);
});
