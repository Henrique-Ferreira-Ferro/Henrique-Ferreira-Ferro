#!/usr/bin/env node
/**
 * Generates an animated terminal SVG for the GitHub profile README.
 * Run: node scripts/generate-terminal.js
 * Output: dist/terminal.svg
 *
 * The commands and results below are illustrative lab/profile content.
 * They are not executed against real systems.
 */

const fs = require("fs");
const path = require("path");

const W = 640;
const PAD_X = 20;
const TOP = 58;
const LINE_H = 23;
const FONT = 13;
const PROMPT = "henrique@offsec:~$ ";

const C = {
  bg: "#050a05",
  chrome: "#0d1a0d",
  border: "#1c3a1c",
  green: "#39FF14",
  cyan: "#00FFFF",
  yellow: "#FFE900",
  text: "#b8d8b8",
  white: "#e0e8e0",
  dim: "#5b875b"
};

const blocks = [
  {
    cmd: "whoami",
    out: [
      { text: "Henrique Ferro", color: C.green },
      { text: "Infraestrutura de TI | Segurança da Informação", color: C.text },
      { text: "Direcionamento: Segurança Ofensiva", color: C.cyan }
    ]
  },
  {
    cmd: "ls ~/areas-of-interest",
    out: [
      { text: "active-directory/  web-security/  reconnaissance/", color: C.text },
      { text: "privilege-escalation/  bug-bounty/  pentest/", color: C.text }
    ]
  },
  {
    cmd: "nmap -sV -sC 10.10.10.15",
    out: [
      { text: "[LAB] Starting service enumeration...", color: C.cyan },
      { text: "22/tcp open  ssh", color: C.text },
      { text: "80/tcp open  http", color: C.text },
      { text: "[+] Enumeration is the first step.", color: C.green }
    ]
  },
  {
    cmd: "bloodhound-python -d lab.local",
    out: [
      { text: "[LAB] Active Directory data collection", color: C.cyan },
      { text: "[+] Users, groups and relationships mapped", color: C.green }
    ]
  },
  {
    cmd: "cat ~/mission.txt",
    out: [
      { text: "Learn. Enumerate. Understand.", color: C.yellow }
    ]
  }
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timing(start, duration, total) {
  const a = (start / total).toFixed(4);
  const b = ((start + duration) / total).toFixed(4);
  return { a, b };
}

function generate() {
  const events = [];
  let y = TOP;
  let t = 0.5;

  for (const block of blocks) {
    const commandDuration = Math.max(1.0, block.cmd.length * 0.055);
    events.push({
      text: PROMPT + block.cmd,
      color: C.green,
      y,
      start: t,
      duration: commandDuration,
      command: true
    });
    y += LINE_H;
    t += commandDuration + 0.35;

    for (const line of block.out) {
      events.push({
        text: line.text,
        color: line.color,
        y,
        start: t,
        duration: 0.25,
        command: false
      });
      y += LINE_H;
      t += 0.24;
    }
    y += 8;
    t += 0.75;
  }

  const loopGap = 1.2;
  const total = t + loopGap;
  const H = Math.max(210, y + 16);

  const textElements = events.map((ev, i) => {
    const { a, b } = timing(ev.start, ev.duration, total);
    const x = PAD_X;
    const opacity = `0;0;1;1;0`;
    const times = `0;${a};${a};${b};1`;
    const cursor = ev.command
      ? `<rect x="${x}" y="${ev.y - FONT + 1}" width="7" height="${FONT + 2}" fill="${C.green}">
           <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${a};${a};${b};${b};1" dur="${total.toFixed(2)}s" repeatCount="indefinite"/>
         </rect>`
      : "";

    return `
      <text x="${x}" y="${ev.y}" font-family="monospace" font-size="${FONT}"
            font-weight="${ev.command ? "600" : "400"}" fill="${ev.command ? C.white : ev.color}" opacity="0">
        ${esc(ev.text)}
        <animate attributeName="opacity" values="${opacity}" keyTimes="${times}"
                 dur="${total.toFixed(2)}s" repeatCount="indefinite"/>
      </text>
      ${cursor}`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Animated terminal showing Henrique Ferro's offensive security learning profile">
  <rect width="${W}" height="${H}" rx="7" fill="${C.bg}"/>
  <rect width="${W}" height="34" rx="7" fill="${C.chrome}"/>
  <rect y="27" width="${W}" height="7" fill="${C.chrome}"/>
  <line x1="0" y1="34" x2="${W}" y2="34" stroke="${C.border}"/>
  <circle cx="17" cy="17" r="5" fill="#ff5f56"/>
  <circle cx="34" cy="17" r="5" fill="#ffbd2e"/>
  <circle cx="51" cy="17" r="5" fill="#27c93f"/>
  <text x="${W/2}" y="21" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">henrique@offsec: ~</text>
  ${textElements}
  <rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="7" fill="none" stroke="${C.border}"/>
</svg>`;
}

const outputDir = path.join(process.cwd(), "dist");
fs.mkdirSync(outputDir, { recursive: true });
const output = path.join(outputDir, "terminal.svg");
fs.writeFileSync(output, generate(), "utf8");
console.log(`[TERMINAL] Generated ${output}`);
