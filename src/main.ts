/**
 * 숫자 맞추기 게임 + 터미널풍 연출.
 *
 * 중요: 이 파일은 브라우저 안에서만 동작하는 순수 프론트엔드 코드입니다.
 * 아래에서 만들어지는 "터미널 창"은 텍스트와 CSS 애니메이션으로 구성된
 * 눈속임(연출)일 뿐이며, 실제 명령을 실행하거나 방문자의 장치에 있는
 * 파일/설정을 조회·수정·삭제하지 않습니다. 연출이 끝나면 반드시
 * "실행된 것이 없다"는 사실을 명확한 문구로 알립니다.
 */

type OsKind = "windows" | "mac" | "linux" | "ios" | "android" | "other";

interface OsProfile {
  kind: OsKind;
  windowTitle: string;
  prompt: string;
  scanTargets: string[];
  deleteCommand: string;
  chrome: "windows" | "mac" | "linux" | "mobile";
}

interface OutputLine {
  text: string;
  className?: string;
  delayAfter: number;
}

function detectOs(): OsKind {
  const ua = navigator.userAgent;
  const platform = navigator.platform || "";
  // iPadOS 13+의 Safari는 기본적으로 데스크톱 macOS와 같은 UA를 보내므로,
  // 터치 포인트 개수로 iPad를 macOS와 구분한다.
  const isTouchMac = /Mac/i.test(ua) && navigator.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/i.test(ua) || isTouchMac) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Win/i.test(ua) || /Win/i.test(platform)) return "windows";
  if (/Mac/i.test(ua) || /Mac/i.test(platform)) return "mac";
  if (/Linux/i.test(ua) || /Linux/i.test(platform)) return "linux";
  return "other";
}

function getOsProfile(kind: OsKind): OsProfile {
  switch (kind) {
    case "windows":
      return {
        kind,
        windowTitle: "명령 프롬프트",
        prompt: "C:\\Users\\Guest>",
        scanTargets: [
          "C:\\Windows\\System32",
          "C:\\Users\\Guest\\Documents",
          "C:\\Users\\Guest\\Desktop",
          "C:\\Users\\Guest\\AppData\\Local",
        ],
        deleteCommand: 'del /f /s /q "C:\\Windows\\System32\\*"',
        chrome: "windows",
      };
    case "mac":
      return {
        kind,
        windowTitle: "guest — zsh — 80x24",
        prompt: "guest@MacBook-Pro ~ %",
        scanTargets: [
          "/System/Library",
          "/Users/guest/Documents",
          "/Users/guest/Desktop",
          "/Library/Application Support",
        ],
        deleteCommand: "sudo rm -rf /System/Library",
        chrome: "mac",
      };
    case "linux":
      return {
        kind,
        windowTitle: "guest@ubuntu: ~",
        prompt: "guest@ubuntu:~$",
        scanTargets: ["/etc", "/home/guest/Documents", "/var/log", "/boot"],
        deleteCommand: "sudo rm -rf /etc",
        chrome: "linux",
      };
    case "android":
      return {
        kind,
        windowTitle: "Terminal",
        prompt: "u0_a123@android:~$",
        scanTargets: [
          "/storage/emulated/0/DCIM",
          "/storage/emulated/0/Download",
          "/data/data",
          "/sdcard/Android/data",
        ],
        deleteCommand: "rm -rf /storage/emulated/0/DCIM",
        chrome: "mobile",
      };
    case "ios":
      return {
        kind,
        windowTitle: "Terminal",
        prompt: "guest@iPhone ~ %",
        scanTargets: [
          "/var/mobile/Media/DCIM",
          "/private/var/mobile/Containers",
          "/var/mobile/Library",
        ],
        deleteCommand: "rm -rf /var/mobile/Media/DCIM",
        chrome: "mobile",
      };
    default:
      return {
        kind: "other",
        windowTitle: "guest@device: ~",
        prompt: "guest@device:~$",
        scanTargets: ["/home/guest", "/var/data", "/config"],
        deleteCommand: "rm -rf /config",
        chrome: "linux",
      };
  }
}

function randomSize(): string {
  const kb = Math.floor(Math.random() * 900_000) + 1_000;
  return `${kb.toLocaleString("en-US")} KB`;
}

function buildScript(profile: OsProfile): OutputLine[] {
  const lines: OutputLine[] = [];

  lines.push({ text: `${profile.prompt} verify --save-data`, delayAfter: 500 });
  lines.push({ text: "무결성 검사를 시작합니다...", delayAfter: 450 });

  for (const target of profile.scanTargets) {
    lines.push({
      text: `검사 중: ${target}  (${randomSize()})`,
      delayAfter: 220,
    });
  }

  lines.push({ text: "", delayAfter: 150 });
  lines.push({
    text: "검사 결과: 저장 데이터 불일치가 감지되었습니다.",
    className: "line-warn",
    delayAfter: 500,
  });
  lines.push({
    text: `${profile.prompt} ${profile.deleteCommand}`,
    className: "line-cmd",
    delayAfter: 700,
  });

  for (let pct = 0; pct <= 100; pct += 20) {
    lines.push({
      text: `정리 진행률: ${pct}%`,
      className: "line-progress",
      delayAfter: 160,
    });
  }

  lines.push({ text: "", delayAfter: 250 });
  lines.push({
    text: "----------------------------------------",
    delayAfter: 300,
  });
  lines.push({
    text: "이 화면의 모든 명령과 출력은 연출용 텍스트입니다.",
    className: "line-reveal",
    delayAfter: 400,
  });
  lines.push({
    text: "실제로는 어떤 명령도 실행되지 않았습니다.",
    className: "line-reveal",
    delayAfter: 400,
  });
  lines.push({
    text: "이 장치의 파일, 설정, 데이터는 전혀 변경되지 않았습니다.",
    className: "line-reveal",
    delayAfter: 0,
  });

  return lines;
}

const TERMINAL_STYLES = `
  :root {
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    background: #0c0c0c;
    font-family: "Cascadia Mono", "Consolas", "SF Mono", ui-monospace, monospace;
    overflow: hidden;
  }
  .titlebar {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 10px;
    font-size: 12.5px;
    color: #cfd3da;
    user-select: none;
  }
  .titlebar--windows {
    background: #1f1f1f;
    justify-content: space-between;
  }
  .titlebar--windows .buttons { display: flex; gap: 14px; color: #9a9a9a; }
  .titlebar--mac {
    background: #2b2b2b;
    gap: 8px;
  }
  .titlebar--mac .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .titlebar--mac .dot.red { background: #ff5f57; }
  .titlebar--mac .dot.yellow { background: #febc2e; }
  .titlebar--mac .dot.green { background: #28c840; }
  .titlebar--mac .label { margin-left: 8px; color: #b7b7b7; }
  .titlebar--linux {
    background: #303030;
    border-bottom: 1px solid #1a1a1a;
    justify-content: center;
    color: #c9c9c9;
  }
  .titlebar--mobile {
    background: #202020;
    justify-content: center;
    gap: 8px;
    color: #e4e4e4;
    font-weight: 600;
  }
  .titlebar--mobile .badge {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #39c5bb;
    display: inline-block;
  }
  #screen {
    height: calc(100% - 32px);
    padding: 14px 16px;
    color: #d4d4d4;
    font-size: 13.5px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .line-cmd { color: #ff7e00; }
  .line-warn { color: #ff0045; font-weight: 600; }
  .line-progress { color: #ffcc11; }
  .line-reveal { color: #ffffff; }
  .cursor {
    display: inline-block;
    width: 8px;
    height: 1em;
    background: #d4d4d4;
    vertical-align: text-bottom;
    animation: blink 1s steps(1) infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }
`;

function renderTitlebar(doc: Document, profile: OsProfile): HTMLElement {
  const bar = doc.createElement("div");

  if (profile.chrome === "windows") {
    bar.className = "titlebar titlebar--windows";
    const label = doc.createElement("span");
    label.textContent = profile.windowTitle;
    const buttons = doc.createElement("span");
    buttons.className = "buttons";
    buttons.textContent = "\u2212  \u25A1  \u2715";
    bar.append(label, buttons);
  } else if (profile.chrome === "mac") {
    bar.className = "titlebar titlebar--mac";
    for (const color of ["red", "yellow", "green"]) {
      const dot = doc.createElement("span");
      dot.className = `dot ${color}`;
      bar.appendChild(dot);
    }
    const label = doc.createElement("span");
    label.className = "label";
    label.textContent = profile.windowTitle;
    bar.appendChild(label);
  } else if (profile.chrome === "linux") {
    bar.className = "titlebar titlebar--linux";
    bar.textContent = profile.windowTitle;
  } else {
    bar.className = "titlebar titlebar--mobile";
    const badge = doc.createElement("span");
    badge.className = "badge";
    const label = doc.createElement("span");
    label.textContent = profile.windowTitle;
    bar.append(badge, label);
  }

  return bar;
}

function playScript(
  doc: Document,
  screen: HTMLElement,
  lines: OutputLine[],
  isClosed: () => boolean,
): void {
  let index = 0;

  const step = () => {
    if (isClosed() || index >= lines.length) return;

    const line = lines[index];
    const p = doc.createElement("div");
    if (line.className) p.className = line.className;
    p.textContent = line.text.length > 0 ? line.text : "\u00a0";
    screen.appendChild(p);
    screen.scrollTop = screen.scrollHeight;

    index += 1;
    if (index < lines.length) {
      setTimeout(step, line.delayAfter);
    }
  };

  step();
}

function openTerminal(profile: OsProfile): void {
  const popup = window.open(
    "",
    "_blank",
    "width=760,height=480,left=160,top=120",
  );

  const lines = buildScript(profile);

  if (!popup) {
    // 팝업이 차단된 경우, 현재 페이지 위에 같은 연출을 오버레이로 표시합니다.
    renderInline(profile, lines);
    return;
  }

  const doc = popup.document;
  doc.open();
  doc.title = profile.windowTitle;
  doc.close();

  const style = doc.createElement("style");
  style.textContent = TERMINAL_STYLES;
  doc.head.appendChild(style);

  const titlebar = renderTitlebar(doc, profile);
  const screen = doc.createElement("div");
  screen.id = "screen";

  doc.body.append(titlebar, screen);

  playScript(doc, screen, lines, () => popup.closed);
}

function renderInline(profile: OsProfile, lines: OutputLine[]): void {
  const style = document.createElement("style");
  style.textContent = TERMINAL_STYLES.replace(/html, body/g, ".overlay-window");
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.55)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999";

  const win = document.createElement("div");
  win.className = "overlay-window";
  win.style.width = "min(760px, 92vw)";
  win.style.height = "min(480px, 80vh)";
  win.style.borderRadius = "8px";
  win.style.overflow = "hidden";
  win.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";

  const titlebar = renderTitlebar(document, profile);
  const screen = document.createElement("div");
  screen.id = "screen";

  win.append(titlebar, screen);
  overlay.appendChild(win);
  document.body.appendChild(overlay);

  let closed = false;
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closed = true;
      overlay.remove();
    }
  });

  playScript(document, screen, lines, () => closed);
}

function main(): void {
  const form = document.querySelector<HTMLFormElement>("#guess-form");
  const input = document.querySelector<HTMLInputElement>("#guess-input");
  const result = document.querySelector<HTMLParagraphElement>("#result");

  if (!form || !input || !result) return;

  const answer = Math.floor(Math.random() * 10) + 1;
  const profile = getOsProfile(detectOs());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = Number(input.value);

    if (guess === answer) {
      result.textContent = "정답입니다.";
      result.className = "result win";
      form.querySelector("button")?.setAttribute("disabled", "true");
      input.setAttribute("disabled", "true");
      return;
    }

    result.textContent = "틀렸습니다. 다른 창을 확인해 주세요.";
    result.className = "result lose";
    openTerminal(profile);
  });
}

document.addEventListener("DOMContentLoaded", main);
