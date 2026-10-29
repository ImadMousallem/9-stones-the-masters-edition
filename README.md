* {
  box-sizing: border-box;
}

:root {
  color: #f5f5f5;
  background: #0a0f1f;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(58, 74, 124, 0.5), transparent 40%),
    #090d17;
}

button,
select {
  font: inherit;
}

#root {
  min-height: 100vh;
}

.app-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  color: #7bb7ff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
  margin-bottom: 6px;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  letter-spacing: -0.06em;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

select,
button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 10px;
  padding: 10px 12px;
}

button {
  cursor: pointer;
  transition: transform 0.15s ease;
}

button:hover,
select:hover {
  border-color: rgba(123, 183, 255, 0.6);
}

button:active {
  transform: translateY(1px);
}

.status-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.turn-pill,
.meta-pill {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.92rem;
}

.turn-pill.black {
  box-shadow: inset 0 0 0 1px rgba(194, 216, 255, 0.25);
}

.turn-pill.white {
  box-shadow: inset 0 0 0 1px rgba(255, 208, 151, 0.24);
}

.board-panel {
  background: rgba(10, 18, 32, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
}

.board-svg {
  width: min(78vw, 440px);
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 0 14px rgba(123, 183, 255, 0.18));
}

.mill-line {
  stroke: rgba(157, 183, 255, 0.85);
  stroke-width: 2.4;
}

.node {
  fill: rgba(255, 255, 255, 0.06);
  stroke: rgba(255, 255, 255, 0.32);
  stroke-width: 1.4;
  cursor: pointer;
  transition: transform 0.15s ease, fill 0.15s ease;
}

.node.legal {
  fill: rgba(118, 240, 180, 0.2);
  stroke: rgba(118, 240, 180, 0.9);
}

.node.selected {
  stroke: #fff;
  stroke-width: 2.2;
}

.node.mill {
  stroke: #ffeaa7;
}

.stone {
  stroke-width: 1;
  stroke: rgba(0, 0, 0, 0.25);
}

.stone.black {
  fill: #0d1323;
}

.stone.white {
  fill: #f5ead8;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px 18px 14px;
}

.panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.panel ul {
  margin: 0;
  padding-left: 18px;
}

.panel p {
  margin: 0;
}

.capture-warning {
  margin-top: 10px;
  color: #fed28d;
}

@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .board-panel {
    padding: 12px;
  }
}
