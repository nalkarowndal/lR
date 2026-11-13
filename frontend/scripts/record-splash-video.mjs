import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const docsDir = path.resolve('docs/splash');
const artifactDir = path.resolve('C:/Users/Administrator/.gemini/antigravity/brain/f15d06f1-f40a-4d5e-a6a5-9100540a5dd3');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

async function recordSplashVideo() {
  console.log('Launching browser to record video of splash screen...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture',
      '--auto-select-desktop-capture-source=Entire screen',
      '--use-fake-ui-for-media-stream',
      '--window-size=440,920'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920 });

  console.log('Navigating to http://localhost:5173/?splash=false to warm up page...');
  await page.goto('http://localhost:5173/?splash=false', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  console.log('Starting MediaRecorder inside Chrome...');
  const recordingPromise = page.evaluate(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser',
            frameRate: 60
          }
        });

        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, { 
          mimeType: mime,
          videoBitsPerSecond: 3000000 
        });
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: mime });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        };

        recorder.start(50);

        // Trigger splash screen 200ms after recorder starts
        setTimeout(() => {
          if (window.__lrTriggerSplash) {
            window.__lrTriggerSplash();
          }
        }, 200);

        // Record for 4.2 seconds (warmup + 1.2s splash + 0.4s slide exit + 2s main view showcase)
        setTimeout(() => {
          recorder.stop();
        }, 4200);

      } catch (err) {
        reject(err.message);
      }
    });
  });

  const base64Data = await recordingPromise;
  console.log('Video recorded! Encoding buffer...');
  const buffer = Buffer.from(base64Data, 'base64');

  const docsVideoPath = path.join(docsDir, 'splash_transition_verified.webm');
  const artifactVideoPath = path.join(artifactDir, 'splash_transition_verified.webm');

  fs.writeFileSync(docsVideoPath, buffer);
  fs.writeFileSync(artifactVideoPath, buffer);

  console.log(`Saved video to: ${docsVideoPath} (${buffer.length} bytes)`);
  console.log(`Saved video to: ${artifactVideoPath} (${buffer.length} bytes)`);

  await browser.close();
  console.log('Video capture completed successfully!');
}

recordSplashVideo().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
