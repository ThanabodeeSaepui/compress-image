import { createSignal, createEffect } from 'solid-js';
import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';

const App = () => {
  const [originalImage, setOriginalImage] = createSignal<string | null>(null);
  const [compressedImage, setCompressedImage] = createSignal<string | null>(null);
  const [originalSize, setOriginalSize] = createSignal<string | null>(null);
  const [compressedSize, setCompressedSize] = createSignal<string | null>(null);
  const [outputType, setOutputType] = createSignal<'jpeg' | 'webp' | 'png'>('jpeg');
  const [originalFile, setOriginalFile] = createSignal<File | null>(null);
  const [quality, setQuality] = createSignal(0.9);
  const [compressedImage2, setCompressedImage2] = createSignal<string | null>(null);
  const [compressedSize2, setCompressedSize2] = createSignal<string | null>(null);

  const compressImage = (file: File, type: 'jpeg' | 'webp' | 'png') => {
    new Compressor(file, {
      quality: quality(),
      mimeType: `image/${type}`,
      success(result) {
        setCompressedImage(URL.createObjectURL(result));
        setCompressedSize((result.size / 1024).toFixed(2));
      },
      error(err) {
        console.log(err.message);
      },
    });
  };

  const compressImageWithBIC = async (file: File, type: 'jpeg' | 'webp' | 'png') => {
    const options = {
      maxSizeMB: 8,
      initialQuality: quality(),
      fileType: `image/${type}`,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      setCompressedImage2(URL.createObjectURL(compressedFile));
      setCompressedSize2((compressedFile.size / 1024).toFixed(2));
    } catch (error) {
      console.error('Browser-Image-Compression Error:', error);
    }
  };

  const handleImageUpload = (event: Event & { target: HTMLInputElement }) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setOriginalFile(file);
    setOriginalImage(URL.createObjectURL(file));
    setOriginalSize((file.size / 1024).toFixed(2));
    compressImage(file, outputType());
    compressImageWithBIC(file, outputType());
  };

  createEffect(() => {
    const file = originalFile();
    if (file) {
      quality();
      compressImage(file, outputType());
      compressImageWithBIC(file, outputType());
    }
  });

  const styles = {
    app: {
      'background-color': '#282c34',
      'min-height': '100vh',
      padding: '20px',
      color: 'white',
      'font-family': 'sans-serif',
    },
    controlsContainer: {
      'background-color': '#f0f0f0',
      color: '#282c34',
      padding: '20px',
      'border-radius': '8px',
      'margin-bottom': '30px',
      'max-width': '1200px',
      margin: '0 auto 30px auto',
    },
    controlsSection: {
      display: 'flex',
      'flex-wrap': 'wrap',
      'justify-content': 'space-around',
      'align-items': 'center',
      gap: '20px',
    },
    gridContainer: {
      display: 'grid',
      'grid-template-columns': 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      'max-width': '1200px',
      margin: '0 auto',
    },
    card: {
      'background-color': '#ffffff',
      color: '#282c34',
      'border-radius': '8px',
      padding: '20px',
      'box-shadow': '0 4px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      'flex-direction': 'column',
    },
    image: {
      width: '100%',
      'flex-grow': '1',
      'object-fit': 'contain',
      'border-radius': '4px',
      'margin-bottom': '15px',
      'min-height': '300px',
    },
    h1: {
      'text-align': 'center',
      'margin-bottom': '20px',
    },
    h2: {
      'border-bottom': '2px solid #f0f0f0',
      'padding-bottom': '10px',
      'margin-top': '0',
    },
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.h1}>Image Compressor</h1>
      
      <div style={styles.controlsContainer}>
        <div style={styles.controlsSection}>
          <div>
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div>
            <h3>Output format</h3>
            <button onClick={() => setOutputType('jpeg')} disabled={outputType() === 'jpeg'}>JPG</button>
            <button onClick={() => setOutputType('webp')} disabled={outputType() === 'webp'}>WEBP</button>
            <button onClick={() => setOutputType('png')} disabled={outputType() === 'png'}>PNG</button>
          </div>
          <div>
            <h3>Quality: {quality().toFixed(2)}</h3>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={quality()}
              onInput={(e) => setQuality(parseFloat(e.currentTarget.value))}
            />
            {outputType() === 'png' && (
              <p style={{ "font-size": "small", color: "gray", "max-width": "200px" }}>
                Note: Quality may not affect PNGs in some libraries.
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Original Image</h2>
          {originalImage() ? <img src={originalImage()!} alt="Original" style={styles.image} /> : <div style={styles.image}></div>}
          {originalSize() && <p>Size: {originalSize()} KB</p>}
        </div>
        
        <div style={styles.card}>
          <h2 style={styles.h2}>Compressed (compressor.js)</h2>
          {compressedImage() ? <img src={compressedImage()!} alt="Compressed" style={styles.image} /> : <div style={styles.image}></div>}
          {compressedSize() && <p>Size: {compressedSize()} KB</p>}
          {originalSize() && compressedSize() && (
            <p>
              Reduction:{' '}
              {(
                100 -
                (parseFloat(compressedSize()!) / parseFloat(originalSize()!)) * 100
              ).toFixed(2)}
              %
            </p>
          )}
        </div>
        
        <div style={styles.card}>
          <h2 style={styles.h2}>Compressed (browser-image-compression)</h2>
          {compressedImage2() ? <img src={compressedImage2()!} alt="Compressed with BIC" style={styles.image} /> : <div style={styles.image}></div>}
          {compressedSize2() && <p>Size: {compressedSize2()} KB</p>}
          {originalSize() && compressedSize2() && (
            <p>
              Reduction:{' '}
              {(
                100 -
                (parseFloat(compressedSize2()!) / parseFloat(originalSize()!)) * 100
              ).toFixed(2)}
              %
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
