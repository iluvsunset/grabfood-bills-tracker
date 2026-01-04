* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #0a0e27;
  color: white;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* Subtle Animated Grid Background */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  z-index: 0;
}

@keyframes gridMove {
  0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
}

/* Elegant Particles */
#particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ffff;
  animation: float 15s infinite ease-in-out;
  opacity: 0.6;
}

.particle:nth-child(2n) {
  background: #ff00ff;
  box-shadow: 0 0 8px #ff00ff;
}

.particle:nth-child(3n) {
  background: #00ff00;
  box-shadow: 0 0 8px #00ff00;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) translateX(0) scale(1); 
    opacity: 0; 
  }
  10% { opacity: 0.6; }
  50% { transform: translateY(-50vh) translateX(50px) scale(1.2); }
  90% { opacity: 0.6; }
  100% { 
    transform: translateY(-100vh) translateX(100px) scale(0.5); 
    opacity: 0; 
  }
}

/* Subtle Scanline Effect */
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.01) 50%
  );
  background-size: 100% 4px;
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 999;
  opacity: 0.5;
}

@keyframes scanline {
  0% { background-position: 0 0; }
  100% { background-position: 0 100%; }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Refined Header */
h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 3rem;
  font-weight: 800;
  color: #00ffff;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 0.5),
    0 0 20px rgba(0, 255, 255, 0.3);
  animation: subtleGlow 3s ease-in-out infinite;
  position: relative;
  letter-spacing: 2px;
}

@keyframes subtleGlow {
  0%, 100% { 
    text-shadow: 
      0 0 10px rgba(0, 255, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.3);
  }
  50% { 
    text-shadow: 
      0 0 15px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(0, 255, 255, 0.4),
      0 0 45px rgba(0, 255, 255, 0.2);
  }
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
}

.stat-card:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}



/* ============================================
   MONTH TIMELINE (Replaces Dropdown)
   ============================================ */

.timeline-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto 30px;
  max-width: 800px;
  background: rgba(0, 255, 255, 0.02);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 15px;
  backdrop-filter: blur(5px);
}

.month-timeline {
  flex: 1;
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 5px;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}

.month-timeline::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.month-chip {
  flex: 0 0 auto;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
}

.month-chip:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(0, 255, 255, 0.3);
  transform: translateY(-2px);
}

.month-chip.active {
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
  color: #0a0e27;
  border-color: transparent;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  transform: scale(1.05);
  font-weight: 800;
}

.scroll-nav-btn {
  background: rgba(10, 14, 39, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  z-index: 2;
}

.scroll-nav-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Search Bar */
.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
  position: relative;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-container.visible {
  opacity: 1;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 20px;
  background: rgba(10, 14, 39, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  color: #00ffff;
  font-size: 15px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  background: rgba(10, 14, 39, 0.8);
}

.search-input::placeholder {
  color: rgba(0, 255, 255, 0.4);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 255, 255, 0.6);
  pointer-events: none;
}

/* Bill List Container */
#billList, #billDetail {
  max-width: 800px;
  margin: 0 auto;
}

/* Refined Bill Cards */
.bill-entry {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 
    0 2px 10px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bill-entry::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.bill-entry:hover::before {
  left: 100%;
}

.bill-entry:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 
    0 5px 20px rgba(0, 255, 255, 0.25),
    inset 0 0 20px rgba(0, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.5);
}

@keyframes slideInRight {
  to { opacity: 1; transform: translateX(0); }
}

.bill-info {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(0, 255, 255, 0.9);
}

.bill-separator {
  color: rgba(0, 255, 255, 0.3);
}

.bill-entry button {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bill-entry button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
}

.bill-entry button:hover::before {
  width: 200px;
  height: 200px;
}

.bill-entry button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.5);
}

.bill-entry button:active {
  transform: scale(0.98);
}

/* Refined Detail Card */
#billDetail {
  display: none;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomIn {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

#billDetail h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  letter-spacing: 1px;
}

#billDetail p {
  font-size: 16px;
  margin-bottom: 14px;
  padding: 12px 16px;
  background: rgba(0, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 3px solid rgba(0, 255, 255, 0.5);
  transition: all 0.3s ease;
  color: #e0e0e0;
}

#billDetail p:hover {
  background: rgba(0, 255, 255, 0.08);
  transform: translateX(5px);
  border-left-color: #00ffff;
}

#billDetail a {
  color: #00ffff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

#billDetail a:hover {
  color: #ff00ff;
  text-decoration: underline;
}

#billDetail button {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
font-weight: 700;
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
box-shadow: 0 2px 10px rgba(0, 255, 255, 0.3);
text-transform: uppercase;
letter-spacing: 0.5px;
}
#billDetail button:hover {
transform: translateY(-2px) scale(1.05);
box-shadow: 0 4px 20px rgba(0, 255, 255, 0.5);
}

/* Refined Loading Animation - Orbital Reactor */
#loading {
  position: relative;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  perspective: 800px;
  gap: 0; /* Remove gap to control spacing manually */
}

.spinner-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 50px; /* Increased space between spinner and text */
  transform-style: preserve-3d;
}

/* Reactor Rings */
.reactor-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid transparent;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.ring-1 {
  border-top: 4px solid #00ffff;
  border-bottom: 4px solid #00ffff;
  animation: rotateX 2s linear infinite;
}

.ring-2 {
  border-left: 4px solid #ff00ff;
  border-right: 4px solid #ff00ff;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  animation: rotateY 2.5s linear infinite;
}

.ring-3 {
  border: 2px dashed #ffffff;
  width: 130%;
  height: 130%;
  top: -15%;
  left: -15%;
  opacity: 0.3;
  animation: rotateZ 10s linear infinite;
}

.ring-4 {
  border-top: 2px solid #00ffff;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  animation: rotateAll 4s linear infinite reverse;
}

/* Central Core - FIXED POSITIONING */
.reactor-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    0 0 60px #ff00ff;
  animation: coreFlicker 0.1s infinite alternate;
  z-index: 10;
  pointer-events: none;
}

@keyframes rotateX {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(0deg); }
}

@keyframes rotateY {
  0% { transform: rotateY(0deg) rotateX(0deg); }
  100% { transform: rotateY(360deg) rotateX(0deg); }
}

@keyframes rotateZ {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

@keyframes rotateAll {
  0% { transform: rotate3d(1, 1, 1, 0deg); }
  100% { transform: rotate3d(1, 1, 1, 360deg); }
}

@keyframes coreFlicker {
  0% { 
    opacity: 0.8; 
    transform: translate(-50%, -50%) scale(0.95); 
    box-shadow: 0 0 20px #00ffff; 
  }
  100% { 
    opacity: 1; 
    transform: translate(-50%, -50%) scale(1.05); 
    box-shadow: 0 0 40px #00ffff, 0 0 80px #ff00ff; 
  }
}

.loading-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 6px;
  position: relative;
  text-shadow: 0 0 10px #00ffff;
  margin-top: 0; /* Remove default margin */
}

.loading-text::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: scanLine 2s ease-in-out infinite;
}

@keyframes scanLine {
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(0); opacity: 0; }
}

/* Loading Overlay - Transparent Glass Context */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 7, 20, 0.6); /* More transparent */
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px) grayscale(0.5); /* Glass effect */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.loading-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

/* ============================================
   CYBERPUNK TAB TRANSITIONS
   ============================================ */

.tab-content {
  display: none;
  opacity: 0;
  transform-origin: top center;
}

/* Active State - Entering */
.tab-content.active {
  display: block;
  animation: cyber-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Closing State - Exiting */
.tab-content.closing {
  display: block;
  animation: cyber-out 0.4s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards;
  pointer-events: none; /* Prevent clicks while exiting */
  position: absolute; /* Take out of flow to prevent jump */
  top: 100px; /* Adjust based on header height approx */
  left: 0;
  width: 100%;
  z-index: 0;
}

@keyframes cyber-in {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
    filter: blur(10px);
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
  }
  40% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes cyber-out {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  50% {
    transform: scale(1.02) skewX(-2deg);
    filter: blur(5px) hue-rotate(90deg);
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: scale(1.1) translateY(-20px);
    filter: blur(20px);
  }
}


/* Mobile Optimization */
@media screen and (max-width: 480px) {
  .spinner-container {
    width: 100px;
    height: 100px;
    margin-bottom: 40px;
  }
  
  .reactor-core {
    width: 24px;
    height: 24px;
  }
  
  .loading-text {
    font-size: 14px;
    letter-spacing: 4px;
  }
}

/* ============================================
   HOLO-CARDS (3D Interactive UI)
   ============================================ */
.bill-entry {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
  transform: perspective(1000px);
  transition: transform 0.1s ease, box-shadow 0.3s ease;
  margin-bottom: 15px;
  position: relative;
  overflow: visible; /* Allow glow to spill out */
}

.bill-entry::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 12px;
  background: linear-gradient(120deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.bill-entry:hover::after {
  opacity: 1;
  animation: shine 1.5s infinite linear;
}

.bill-entry:hover {
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 255, 0.1);
  z-index: 10;
}

@keyframes shine {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ============================================
   AI PREDICTOR (New Feature)
   ============================================ */
.ai-btn {
  background: linear-gradient(135deg, #7b2ff7, #2f5df7);
  color: white;
  border: none;
  box-shadow: 0 0 15px rgba(123, 47, 247, 0.4);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.ai-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 25px rgba(123, 47, 247, 0.6);
}

/* Predictor Modal Content */
.predictor-content {
  text-align: center;
  padding: 20px;
}

.predictor-scanner {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
  border-radius: 50%;
  border: 2px solid rgba(123, 47, 247, 0.3);
  box-shadow: 0 0 20px rgba(123, 47, 247, 0.2);
}

.scanner-beam {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 2px;
  background: #7b2ff7;
  box-shadow: 0 0 10px #7b2ff7;
  animation: scanBeam 1s infinite alternate;
}

@keyframes scanBeam {
  0% { top: 10%; width: 80%; opacity: 0.5; }
  100% { top: 90%; width: 80%; opacity: 1; }
}

.predictor-result {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 15px #7b2ff7;
  margin: 20px 0;
  min-height: 40px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.predictor-result.show {
  opacity: 1;
  transform: scale(1);
}

.prediction-details {
  font-size: 14px;
  color: #aaa;
  background: rgba(255,255,255,0.05);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #7b2ff7;
  text-align: left;
  margin-top: 20px;
  display: none; /* Hidden until result is ready */
  animation: fadeIn 0.5s ease;
}

/* Responsive Design */

/* Tablet & Smaller Laptops (max-width: 1024px) */
@media screen and (max-width: 1024px) {
  .content-wrapper {
    padding: 20px;
    max-width: 95%;
  }
  
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Tablets (max-width: 768px) */
@media screen and (max-width: 768px) {
  h1 {
    font-size: 2.2rem;
    margin-bottom: 25px;
  }
  
  .glass-dropdown {
    width: 100%;
  }
  
  .stats-bar {
    gap: 12px;
  }
  
  .stat-card {
    flex: 1 1 140px; /* Allow growing and shrinking, min 140px */
    padding: 15px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .bill-entry {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
  }
  
  .bill-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
  
  .bill-separator {
    display: none; /* Hide pipes on mobile */
  }
  
  .bill-entry button {
    width: 100%;
    margin-top: 5px;
  }
  
  /* Charts stack vertically */
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr 1fr; /* 2 columns on tablet */
  }
  
  /* Scrollable tabs */
  .nav-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 5px;
    -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
    scrollbar-width: none; /* Firefox */
  }
  
  .nav-tabs::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  .nav-tab {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

/* Mobile Phones (max-width: 480px) */
@media screen and (max-width: 480px) {
  h1 {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  .login-container, .sync-container {
    padding: 30px 20px;
    width: 90%;
  }

  .login-container h1 {
    font-size: 28px;
  }

  .stat-card {
    flex: 1 1 100%; /* Full width on mobile */
  }

  .analytics-grid {
    grid-template-columns: 1fr; /* 1 column on mobile */
  }
  
  .search-filter-bar {
    flex-direction: column;
  }
  
  .filter-btn, .export-btn {
    width: 100%;
    justify-content: center;
  }

  /* Optimize Loader Size */
  .spinner-container {
    width: 80px;
    height: 80px;
  }
  
  .spinner-core {
    width: 30px;
    height: 30px;
  }
  
  .loading-text {
    font-size: 12px;
    letter-spacing: 4px;
  }
  
  /* Modal optimization */
  .modal-content {
    width: 95%;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .export-options {
    flex-direction: column;
  }
}

/* ADD THESE TO YOUR EXISTING CSS */

/* ============================================
   AUTH SCREENS STYLING
   ============================================ */

/* Login Screen */
#loginScreen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  z-index: 10;
  position: relative;
  animation: fadeIn 0.6s ease;
}

.login-container {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(255, 0, 255, 0.08) 100%);
  backdrop-filter: blur(20px);
  padding: 60px 50px;
  border-radius: 24px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 
    0 20px 60px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.05);
  text-align: center;
  max-width: 450px;
  animation: slideUpScale 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.03), transparent);
  animation: hologramRotate 8s linear infinite;
}

@keyframes slideUpScale {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.login-container h1 {
  font-size: 42px;
  color: #00ffff;
  margin-bottom: 16px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3);
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
  animation: subtleGlow 3s ease-in-out infinite;
}

.login-container p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  font-size: 16px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

#googleSignInBtn {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(255, 0, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 255, 0.5);
  padding: 16px 36px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 auto;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  color: #00ffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

#googleSignInBtn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

#googleSignInBtn:hover::before {
  width: 300px;
  height: 300px;
}

#googleSignInBtn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
}

#googleSignInBtn svg,
#googleSignInBtn span {
  position: relative;
  z-index: 1;
}

/* Sync Screen */
#syncScreen {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  z-index: 10;
  position: relative;
}

.sync-container {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(255, 0, 255, 0.08) 100%);
  backdrop-filter: blur(20px);
  padding: 60px 50px;
  border-radius: 24px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.05);
  text-align: center;
  max-width: 450px;
  animation: slideUpScale 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.sync-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  position: relative;
}

.sync-spinner::before,
.sync-spinner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 4px solid transparent;
}

.sync-spinner::before {
  width: 100%;
  height: 100%;
  border-top-color: #00ffff;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.sync-spinner::after {
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  border-top-color: #ff00ff;
  animation: spin 1.5s linear infinite reverse;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sync-container h2 {
  font-size: 28px;
  color: #00ffff;
  margin-bottom: 16px;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  letter-spacing: 1px;
}

.sync-container p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* App Header */
.app-header {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  padding: 20px 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(0, 255, 255, 0.03);
  animation: slideInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(0, 255, 255, 0.9);
  font-weight: 600;
  font-size: 15px;
}

.user-info span:first-child {
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
}

#userEmail {
  letter-spacing: 0.5px;
}

#signOutBtn {
  background: linear-gradient(135deg, rgba(255, 0, 100, 0.8) 0%, rgba(255, 50, 150, 0.8) 100%);
  color: white;
  border: 2px solid rgba(255, 0, 100, 0.5);
  padding: 10px 26px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(255, 0, 100, 0.3);
}

#signOutBtn:hover {
  background: linear-gradient(135deg, rgba(255, 0, 100, 1) 0%, rgba(255, 50, 150, 1) 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 0, 100, 0.5);
  border-color: rgba(255, 0, 100, 0.8);
}

#mainApp {
  display: none;
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Auth Screens */
@media screen and (max-width: 768px) {
  .login-container,
  .sync-container {
    padding: 40px 30px;
    max-width: 90%;
  }

  .login-container h1 {
    font-size: 32px;
  }

  #googleSignInBtn {
    padding: 14px 28px;
    font-size: 14px;
  }

  .app-header {
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }

  #signOutBtn {
    width: 100%;
  }
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: rgba(10, 14, 39, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(0, 255, 255, 0.2);
}

.nav-tab {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.nav-tab:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.4);
}

.nav-tab.active {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border-color: transparent;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Buttons */
.sync-btn, .sign-out-btn {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.sign-out-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Search & Filter Bar */
.search-filter-bar {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.search-input {
  flex: 1;
}

.filter-btn, .export-btn {
  padding: 12px 20px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #00ffff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-btn:hover, .export-btn:hover {
  background: rgba(0, 255, 255, 0.2);
}

/* Filters Panel */
.filters-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.filters-panel h3 {
  color: #00ffff;
  margin-bottom: 15px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filter-item label {
  display: block;
  color: #fff;
  margin-bottom: 5px;
  font-size: 13px;
}

.filter-item input, .filter-item select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
}

.price-range, .date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range input, .date-range input {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.apply-btn, .clear-btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.apply-btn {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border: none;
}

.clear-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* Analytics Grid */
.period-selector {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.period-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 600;
}

.period-btn:hover {
  background: rgba(0, 255, 255, 0.1);
}

.period-btn.active {
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border-color: transparent;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.analytics-card {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-label {
  color: #888;
  font-size: 13px;
  margin-bottom: 5px;
}

.card-value {
  color: #00ffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 3px;
}

.card-change {
  font-size: 12px;
  color: #4ade80;
}

.card-change.negative {
  color: #f87171;
}

.card-subtext {
  font-size: 12px;
  color: #888;
}

/* Spending Heatmap */
.heatmap-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 25px;
  margin: 20px 0;
}

.heatmap-section h3 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 18px;
}

.heatmap-wrapper {
  display: flex;
  gap: 8px;
}

.heatmap-days {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 25px; /* Align with cells (skip month row) */
  padding-bottom: 5px; /* Align with bottom */
  font-size: 10px;
  color: #666;
  height: 116px; /* 7 cells * (12px + 4px gap) approx */
}

.heatmap-content {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #00ffff rgba(0, 0, 0, 0.3);
}

.heatmap-months {
  display: flex;
  margin-bottom: 5px;
  font-size: 10px;
  color: #888;
  position: relative;
  height: 15px;
}

.month-label {
  position: absolute;
  top: 0;
}

.heatmap-scroll {
  display: grid;
  grid-template-rows: repeat(7, 12px); /* 7 days */
  grid-auto-flow: column;
  gap: 4px;
  width: max-content;
  padding-bottom: 5px;
}

.day-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-cell:hover {
  transform: scale(1.4);
  z-index: 10;
  border: 1px solid #fff;
}

/* Heatmap Colors */
.day-cell.l-0 { background: rgba(255, 255, 255, 0.05); }
.day-cell.l-1 { background: rgba(0, 255, 255, 0.2); }
.day-cell.l-2 { background: rgba(0, 255, 255, 0.5); }
.day-cell.l-3 { background: rgba(0, 255, 255, 0.8); box-shadow: 0 0 5px #00ffff; }
.day-cell.l-4 { background: #ff00ff; box-shadow: 0 0 10px #ff00ff; }

/* Legend */
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  font-size: 12px;
  color: #888;
  justify-content: flex-end;
}

.legend-scale {
  display: flex;
  gap: 4px;
}

.legend-scale div {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.l-0 { background: rgba(255, 255, 255, 0.05); }
.l-1 { background: rgba(0, 255, 255, 0.2); }
.l-2 { background: rgba(0, 255, 255, 0.5); }
.l-3 { background: rgba(0, 255, 255, 0.8); }
.l-4 { background: #ff00ff; }

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.chart-container h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 16px;
}

.chart-container canvas {
  max-height: 300px;
}

/* Insights */
.insights-section, .top-items-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.insights-section h3, .top-items-section h3 {
  color: #00ffff;
  margin-bottom: 15px;
}

.insights-list, .top-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insight-item, .top-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #00ffff;
}

.insight-item {
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
}

.top-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-item-name {
  color: #fff;
  font-weight: 600;
}

.top-item-count {
  color: #00ffff;
  font-size: 13px;
}

/* Favorites */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.favorite-card {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.favorite-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.favorite-star {
  font-size: 24px;
  cursor: pointer;
}

.favorite-name {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.favorite-stats {
  color: #888;
  font-size: 13px;
  line-height: 1.6;
}

/* Budget */
.budget-setup {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.budget-input-group {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.budget-input-group input {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
}

.set-budget-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
  color: #0a0e27;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.budget-progress-card {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
}

.budget-visual {
  margin: 20px 0;
}

.budget-bar {
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 10px;
}

.budget-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80 0%, #00ffff 50%, #f87171 100%);
  transition: width 0.5s ease;
  border-radius: 15px;
}

.budget-numbers {
  display: flex;
  justify-content: center;
  gap: 5px;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.budget-percentage {
  text-align: center;
  color: #00ffff;
  font-size: 18px;
  font-weight: 600;
}

.budget-remaining {
  text-align: center;
  color: #fff;
  font-size: 16px;
  margin-top: 15px;
}

.budget-projection {
  text-align: center;
  color: #888;
  font-size: 13px;
  margin-top: 10px;
}

.budget-alerts {
  margin: 20px 0;
}

.budget-alert {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  padding: 15px;
  color: #f87171;
  margin-bottom: 10px;
}

.budget-alert.warning {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.budget-alert.success {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

/* Modal */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 24, 49, 0.95) 100%);
border: 2px solid rgba(0, 255, 255, 0.3);
border-radius: 16px;
padding: 30px;
max-width: 500px;
width: 90%;
}
.modal-content h2 {
color: #00ffff;
margin-bottom: 20px;
}
.modal-content input {
width: 100%;
padding: 12px;
background: rgba(0, 0, 0, 0.3);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 8px;
color: #fff;
font-size: 16px;
margin: 10px 0;
}
.export-options {
display: flex;
gap: 15px;
margin: 20px 0;
}
.export-option-btn {
flex: 1;
padding: 20px;
background: rgba(0, 255, 255, 0.1);
border: 2px solid rgba(0, 255, 255, 0.3);
border-radius: 12px;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
flex-direction: column;
align-items: center;
gap: 10px;
color: #fff;
font-weight: 600;
}
.export-option-btn:hover {
background: rgba(0, 255, 255, 0.2);
border-color: rgba(0, 255, 255, 0.5);
}
.export-option-btn span:first-child {
font-size: 36px;
}
.modal-actions {
display: flex;
gap: 10px;
margin-top: 20px;
}
.modal-close {
padding: 12px 24px;
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 8px;
color: #fff;
cursor: pointer;
font-weight: 600;
}
.primary-btn {
padding: 12px 24px;
background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
color: #0a0e27;
border: none;
border-radius: 8px;
cursor: pointer;
font-weight: 700;
flex: 1;
}
/* Lists */
.lists-section {
margin: 20px 0;
}
.create-list-btn {
width: 100%;
padding: 15px;
background: rgba(0, 255, 255, 0.1);
border: 2px dashed rgba(0, 255, 255, 0.3);
border-radius: 12px;
color: #00ffff;
cursor: pointer;
font-size: 16px;
font-weight: 600;
transition: all 0.3s ease;
margin-bottom: 20px;
}
.create-list-btn:hover {
background: rgba(0, 255, 255, 0.2);
border-color: rgba(0, 255, 255, 0.5);
}
.custom-lists {
display: flex;
flex-direction: column;
gap: 15px;
}
.custom-list-card {
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(0, 255, 255, 0.2);
border-radius: 12px;
padding: 20px;
}
.custom-list-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 15px;
}
.custom-list-name {
color: #fff;
font-size: 18px;
font-weight: 700;
}
.custom-list-count {
color: #00ffff;
font-size: 14px;
}
/* Responsive */
@media (max-width: 768px) {
.charts-grid {
grid-template-columns: 1fr;
}
.analytics-grid {
grid-template-columns: 1fr;
}
.nav-tabs {
overflow-x: auto;
flex-wrap: nowrap;
}
.period-selector {
overflow-x: auto;
flex-wrap: nowrap;
}
}

.favorite-btn, .favorite-btn-detail {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s ease;
}

.favorite-btn:hover, .favorite-btn-detail:hover {
  transform: scale(1.2);
}
/* Toast Notification */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #00ffff, #00cccc);
  color: #0a0e27;
  padding: 16px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  z-index: 10000;
  opacity: 0;
  transform: translateX(400px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 20px rgba(0, 255, 255, 0.4);
  pointer-events: none;
}

.toast.show {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.toast.error {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  box-shadow: 0 8px 20px rgba(248, 113, 113, 0.4);
}

.toast.success {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #0a0e27;
  box-shadow: 0 8px 20px rgba(74, 222, 128, 0.4);
}

.toast.warning {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0a0e27;
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    font-size: 14px;
    padding: 14px 20px;
  }
}