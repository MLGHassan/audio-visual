import { useRef, useState, useEffect } from 'react';

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const audioURL = URL.createObjectURL(file);
    audioRef.current.src = audioURL;

    const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = newAudioContext.createMediaElementSource(audioRef.current);
    const analyserNode = newAudioContext.createAnalyser();

    source.connect(analyserNode);
    analyserNode.connect(newAudioContext.destination);

    analyserNode.fftSize = 256;
    setAudioContext(newAudioContext);
    setAnalyser(analyserNode);
  };

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 150;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  }, [analyser]);

  return (
    <div style={{ background: '#0a0a0a', height: '100vh', padding: '2rem', color: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>🎧 Audio Visualizer</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <audio ref={audioRef} controls style={{ display: 'block', margin: '1rem 0' }} />
      <canvas ref={canvasRef} style={{ display: 'block', background: '#111', borderRadius: '8px' }} />
    </div>
  );
}

export default App;
