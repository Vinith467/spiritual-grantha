import sharp from 'sharp';

async function generateBanner() {
  const inputPath = 'C:\\Users\\Vinith Shetty\\.gemini\\antigravity\\brain\\57ccecb5-cc91-45d9-b3b8-e8af1ad6c458\\sdtv_feature_graphic_base_1783601332945.png';
  const outputPath = 'C:\\Users\\Vinith Shetty\\.gemini\\antigravity\\brain\\57ccecb5-cc91-45d9-b3b8-e8af1ad6c458\\sdtv_feature_graphic_1024x500.png';
  
  try {
    // Generate an SVG overlay for the text "SDTV"
    const svgText = `
      <svg width="1024" height="500">
        <style>
          .title {
            fill: #ffffff;
            font-size: 80px;
            font-family: sans-serif;
            font-weight: bold;
            text-anchor: middle;
            filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.8));
          }
          .subtitle {
            fill: #FF9933;
            font-size: 32px;
            font-family: sans-serif;
            font-weight: 500;
            text-anchor: middle;
            filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8));
          }
        </style>
        <text x="512" y="240" class="title">SDTV</text>
        <text x="512" y="300" class="subtitle">Spiritual Grantha</text>
      </svg>
    `;

    await sharp(inputPath)
      .resize(1024, 500, {
        fit: 'cover',
        position: 'center'
      })
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        }
      ])
      .png()
      .toFile(outputPath);
      
    console.log('Successfully created feature graphic: ' + outputPath);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generateBanner();
