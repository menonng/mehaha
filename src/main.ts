/**
 * 숫자 맞추기 게임 + 터미널풍 연출.
 *
 * 중요: 이 파일은 브라우저 안에서만 동작하는 순수 프론트엔드 코드입니다.
 * 아래에서 만들어지는 "터미널 창"은 텍스트와 CSS 애니메이션으로 구성된
 * 눈속임(연출)일 뿐이며, 실제 명령을 실행하거나 방문자의 장치에 있는
 * 파일/설정을 조회·수정·삭제하지 않습니다. 화면 안에는 "이것은 장난"이라는
 * 문구를 넣지 않는 대신, 연출 마지막에 이 저장소로 연결되는 링크를 남겨
 * 궁금한 사람이 실제로 무슨 일이 있었는지(README) 확인할 수 있게 합니다.
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
  /** 지정하면 이 줄이 <a>로 렌더링됩니다. */
  href?: string;
}

const REPO_URL = "https://github.com/menonng/mehaha";

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

function randomHex(bytes: number): string {
  let out = "0x";
  for (let i = 0; i < bytes * 2; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ---- 아래부터는 OS별로 "실제 존재하는 크래시 리포트/로그 구조"를 흉내 낸
// 영어 텍스트를 대량으로 만들어내기 위한 어휘 사전이다. 모듈/심볼 이름은
// 실제 시스템에 있는 것들이고(ntdll.dll, libsystem_kernel.dylib 등), 포맷도
// WinDbg 스택 텍스트·Apple 크래시 리포터·리눅스 커널 oops·Android
// FATAL EXCEPTION 로그의 관례를 따른다. 물론 실제로 그 모듈을 호출하거나
// 뭔가를 실행하지는 않는다 — 전부 문자열이다. ----

interface CrashProfile {
  registers: string[];
  regGroupSize: number;
  modules: string[];
  symbols: string[];
  exceptionLabel: string;
  processName: string;
}

const X64_REGISTERS = [
  "rax", "rbx", "rcx", "rdx", "rsi", "rdi", "rbp", "rsp",
  "r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15", "rip", "eflags",
];

const ARM64_REGISTERS = [
  "x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8", "x9",
  "x10", "x11", "x12", "x13", "x14", "x15", "x16", "x17", "x18", "x19",
  "x20", "x21", "x22", "x23", "x24", "x25", "x26", "x27", "x28",
  "fp", "lr", "sp", "pc", "cpsr",
];

const WINDOWS_MODULES = [
  "ntdll.dll", "kernel32.dll", "KERNELBASE.dll", "user32.dll", "win32u.dll",
  "gdi32.dll", "gdi32full.dll", "msvcrt.dll", "combase.dll", "ucrtbase.dll",
  "ole32.dll", "rpcrt4.dll", "sechost.dll", "advapi32.dll", "shell32.dll",
  "shlwapi.dll", "ws2_32.dll", "bcrypt.dll", "bcryptprimitives.dll",
  "msvcp_win.dll", "oleaut32.dll", "setupapi.dll", "cfgmgr32.dll",
  "uxtheme.dll", "dwmapi.dll", "shcore.dll", "clbcatq.dll", "wldp.dll",
];

const WINDOWS_SYMBOLS = [
  "RtlAllocateHeap", "RtlFreeHeap", "HeapAlloc", "HeapFree",
  "NtWaitForSingleObject", "NtQuerySystemInformation", "CreateFileW",
  "ReadFile", "WriteFile", "CloseHandle", "VirtualAlloc", "VirtualProtect",
  "GetProcAddress", "LoadLibraryW", "RegOpenKeyExW", "RegQueryValueExW",
  "CoCreateInstance", "SendMessageW", "DispatchMessageW", "GetMessageW",
  "memcpy", "memset", "strlen", "malloc", "free",
];

const APPLE_MODULES = [
  "libsystem_kernel.dylib", "libsystem_platform.dylib",
  "libsystem_pthread.dylib", "libsystem_malloc.dylib", "libdyld.dylib",
  "libobjc.A.dylib", "libc++.1.dylib", "libc++abi.dylib", "CoreFoundation",
  "Foundation", "CoreGraphics", "QuartzCore", "CoreServices", "CoreAudio",
  "AudioToolbox", "Security", "CFNetwork", "JavaScriptCore", "WebKit",
  "IOKit", "libswiftCore.dylib", "libswiftFoundation.dylib",
  "libswiftDispatch.dylib", "libdispatch.dylib", "libxpc.dylib",
  "SystemConfiguration", "CoreText", "ImageIO",
];

const APPLE_SYMBOLS = [
  "objc_msgSend", "dispatch_async", "dispatch_sync", "CFRetain", "CFRelease",
  "NSLog", "__cxa_throw", "_platform_memmove", "_platform_memset",
  "pthread_mutex_lock", "pthread_mutex_unlock", "pthread_cond_wait",
  "mach_msg_trap", "vm_allocate", "vm_deallocate", "malloc", "free",
  "__pthread_kill", "os_unfair_lock_lock",
];

const LINUX_MODULES = [
  "ld-linux-x86-64.so.2", "libc.so.6", "libpthread.so.0", "libdl.so.2",
  "libm.so.6", "librt.so.1", "libstdc++.so.6", "libgcc_s.so.1",
  "libselinux.so.1", "libpcre2-8.so.0", "liblzma.so.5", "libz.so.1",
  "libzstd.so.1", "libcrypto.so.3", "libssl.so.3", "libsystemd.so.0",
  "libudev.so.1", "libcap.so.2", "libattr.so.1", "libblkid.so.1",
  "libmount.so.1", "libaudit.so.1", "libgcrypt.so.20",
];

const LINUX_SYMBOLS = [
  "kfree", "kmalloc", "vfs_read", "vfs_write", "do_sys_openat2", "schedule",
  "futex_wait", "copy_to_user", "copy_from_user", "handle_mm_fault",
  "__do_sys_unlink", "sys_clone", "exit_mmap", "tlb_finish_mmu",
  "pthread_mutex_lock", "malloc", "free", "memcpy",
];

const ANDROID_MODULES = [
  "libc.so", "libm.so", "libdl.so", "liblog.so", "libandroid_runtime.so",
  "libbinder.so", "libutils.so", "libcutils.so", "libnativehelper.so",
  "libart.so", "libopenjdkjvm.so", "libmedia.so", "libui.so", "libgui.so",
  "libEGL.so", "libGLESv2.so", "libvulkan.so", "libhardware.so",
];

const ANDROID_CLASSES = [
  "MainActivity", "SettingsFragment", "IntegrityMonitorService",
  "BackupManagerService", "FileScannerTask", "PermissionHelper",
  "SyncAdapterImpl", "NotificationHelper", "StorageVolumeInfo",
  "PackageInstallerSession",
];

const ANDROID_METHODS = [
  "onCreate", "onResume", "onClick", "run", "handleMessage",
  "dispatchMessage", "invoke", "execute", "call", "onDraw", "onMeasure",
  "bindView", "notifyDataSetChanged",
];

const CRASH_PROFILES: Record<OsKind, CrashProfile> = {
  windows: {
    registers: X64_REGISTERS,
    regGroupSize: 3,
    modules: WINDOWS_MODULES,
    symbols: WINDOWS_SYMBOLS,
    exceptionLabel: "0xC0000005 (EXCEPTION_ACCESS_VIOLATION)",
    processName: "IntegrityHelper.exe",
  },
  mac: {
    registers: ARM64_REGISTERS,
    regGroupSize: 4,
    modules: APPLE_MODULES,
    symbols: APPLE_SYMBOLS,
    exceptionLabel: "EXC_BAD_ACCESS (SIGSEGV)",
    processName: "com.apple.integrityd",
  },
  ios: {
    registers: ARM64_REGISTERS,
    regGroupSize: 4,
    modules: APPLE_MODULES,
    symbols: APPLE_SYMBOLS,
    exceptionLabel: "EXC_BAD_ACCESS (SIGSEGV)",
    processName: "com.apple.integrityd",
  },
  linux: {
    registers: X64_REGISTERS,
    regGroupSize: 3,
    modules: LINUX_MODULES,
    symbols: LINUX_SYMBOLS,
    exceptionLabel: "SIGSEGV (Segmentation fault)",
    processName: "integrityd",
  },
  android: {
    registers: ARM64_REGISTERS,
    regGroupSize: 4,
    modules: ANDROID_MODULES,
    symbols: LINUX_SYMBOLS,
    exceptionLabel: "SIGSEGV (Segmentation fault), code 1 (SEGV_MAPERR)",
    processName: "com.android.integrityservice",
  },
  other: {
    registers: X64_REGISTERS,
    regGroupSize: 3,
    modules: LINUX_MODULES,
    symbols: LINUX_SYMBOLS,
    exceptionLabel: "SIGSEGV (Segmentation fault)",
    processName: "integrityd",
  },
};

// 가끔 로그 사이에 끼워 넣을 농담. 전체 분량에 비하면 아주 가끔만 등장한다.
const JOKES = [
  "// TODO: figure out why this keeps happening",
  "// note to future me: do not touch this again",
  "// this bug has more seniority than the intern who filed it",
  "// Schrodinger's pointer: null and not-null until dereferenced",
  "// reviewed by a rubber duck; the duck had no comment",
  "// have you tried turning it off and on again?",
  "// it's not a bug, it's a feature request from entropy",
  "// 100% real stack trace, 0% real fix",
  "// this comment is now part of the codebase's folklore",
  "// filed under: Won't Fix (Works On My Machine)",
  "// error 42: ask again later",
  "// segfault: someone thought 'trust me' was a valid null check",
];

function randomHexShort(): string {
  return Math.floor(Math.random() * 0xfff).toString(16);
}

/** 한 줄짜리 가짜 스택 프레임을 OS 스타일에 맞는 포맷으로 만든다. */
function crashFrame(kind: OsKind, crash: CrashProfile, index: number): string {
  const module = pick(crash.modules);
  const symbol = pick(crash.symbols);

  switch (kind) {
    case "windows":
      // WinDbg의 STACK_TEXT 표기(하위 32비트`상위32비트 두 쌍 + 모듈!심볼+오프셋)를 흉내낸다.
      return `${randomHex(4)}\`${randomHex(4)} ${randomHex(4)}\`${randomHex(4)} ${module}!${symbol}+0x${randomHexShort()}`;
    case "mac":
    case "ios":
      // Apple 크래시 리포터의 "<index> <module> <address> <symbol> + <offset>" 표기.
      return `${String(index).padEnd(3)} ${module.padEnd(28)} ${randomHex(8)} ${symbol} + ${Math.floor(Math.random() * 900)}`;
    case "android": {
      const cls = pick(ANDROID_CLASSES);
      const method = pick(ANDROID_METHODS);
      return `E AndroidRuntime:     at com.integrity.monitor.${cls}.${method}(${cls}.java:${Math.floor(Math.random() * 900) + 10})`;
    }
    default:
      // 리눅스 커널 oops의 Call Trace 표기.
      return `[${(Math.random() * 99999).toFixed(6)}]  ? ${symbol}+0x${randomHexShort()}/0x${randomHexShort()}`;
  }
}

/** 레지스터 덤프를 실제 디버거처럼 여러 개씩 묶어 한 줄에 출력한다. */
function registerLines(crash: CrashProfile): OutputLine[] {
  const out: OutputLine[] = [];
  const regs = crash.registers;
  for (let i = 0; i < regs.length; i += crash.regGroupSize) {
    const group = regs.slice(i, i + crash.regGroupSize);
    const text = group.map((r) => `${r}: ${randomHex(8)}`).join("   ");
    out.push({ text, className: "line-trace", delayAfter: 0 });
  }
  if (out.length > 0) out[out.length - 1].delayAfter = 30;
  return out;
}

/**
 * 여러 줄을 "동시에 착착착" 쏟아지는 것처럼 2~6줄씩 묶어서 출력한다.
 * 묶음 안에서는 delayAfter를 0으로 둬서 사실상 동시에 나타나게 하고,
 * 묶음이 끝날 때만 짧은 텀을 준다. 아주 가끔(약 1.2%) 농담 한 줄을 끼워 넣는다.
 */
function pushBurst(
  lines: OutputLine[],
  count: number,
  factory: (i: number) => Omit<OutputLine, "delayAfter">,
): void {
  let i = 0;
  while (i < count) {
    const groupSize = Math.min(count - i, Math.floor(Math.random() * 5) + 2);
    for (let g = 0; g < groupSize; g++) {
      const isLast = g === groupSize - 1;
      lines.push({ ...factory(i), delayAfter: isLast ? Math.floor(Math.random() * 15) + 15 : 0 });
      i++;
    }
    if (Math.random() < 0.012) {
      lines.push({ text: pick(JOKES), className: "line-joke", delayAfter: 180 });
    }
  }
}

function buildScript(profile: OsProfile): OutputLine[] {
  const lines: OutputLine[] = [];

  // ---- 도입부: 여기까지는 사람이 읽을 수 있는 속도로, 총 2초를 넘기지 않는다. ----
  lines.push({ text: `${profile.prompt} verify --save-data`, delayAfter: 300 });
  lines.push({ text: "무결성 검사를 시작합니다...", delayAfter: 220 });

  for (const target of profile.scanTargets) {
    lines.push({
      text: `검사 중: ${target}  (${randomSize()})`,
      delayAfter: 110,
    });
  }

  lines.push({ text: "", delayAfter: 60 });
  lines.push({
    text: "검사 결과: 저장 데이터 불일치가 감지되었습니다.",
    className: "line-warn",
    delayAfter: 220,
  });
  lines.push({
    text: `${profile.prompt} ${profile.deleteCommand}`,
    className: "line-cmd",
    delayAfter: 260,
  });

  for (let pct = 0; pct <= 100; pct += 50) {
    lines.push({
      text: `정리 진행률: ${pct}%`,
      className: "line-progress",
      delayAfter: 90,
    });
  }

  // ---- 여기서부터 처리되지 않은 예외가 발생한 것처럼 보이는 대량(약
  // 700~1000줄)의 크래시 리포트가, 몇 줄씩 묶여 동시에 나타나듯 빠르게
  // 쏟아진다. 오류 메시지 자체는 실제 크래시 리포트/커널 로그의 관례를
  // 따르는 영어로 쓴다. 실제로는 아무 명령도 실행하지 않으며, 전부
  // 문자열을 화면에 출력할 뿐이다. ----
  const crash = CRASH_PROFILES[profile.kind];
  const pid = Math.floor(Math.random() * 90_000) + 1_000;

  lines.push({ text: "", delayAfter: 60 });
  lines.push({
    text: "치명적 오류: 정리 스레드에서 처리되지 않은 예외가 발생했습니다.",
    className: "line-warn",
    delayAfter: 60,
  });
  lines.push({ text: "", delayAfter: 60 });

  lines.push({ text: "==================== CRASH REPORT ====================", delayAfter: 30 });
  lines.push({ text: `Process:         ${crash.processName} [${pid}]`, delayAfter: 20 });
  lines.push({ text: `Date/Time:       ${new Date().toISOString()}`, delayAfter: 20 });
  lines.push({ text: `Exception Type:  ${crash.exceptionLabel}`, className: "line-warn", delayAfter: 20 });
  lines.push({ text: `Exception Note:  cleanup command flagged by sandbox policy`, delayAfter: 20 });
  lines.push({ text: `Faulting path:   ${pick(profile.scanTargets)}`, delayAfter: 20 });
  lines.push({
    text: `Triggered by:    ${profile.prompt} ${profile.deleteCommand}`,
    className: "line-cmd",
    delayAfter: 40,
  });
  lines.push({ text: "", delayAfter: 30 });

  lines.push({ text: "Register state:", delayAfter: 20 });
  for (const regLine of registerLines(crash)) lines.push(regLine);
  lines.push({ text: "", delayAfter: 40 });

  lines.push({
    text: `Thread 0 Crashed (${crash.processName}):`,
    className: "line-warn",
    delayAfter: 20,
  });
  pushBurst(lines, 45, (i) => ({
    text: crashFrame(profile.kind, crash, i),
    className: "line-trace",
  }));

  const threadCount = Math.floor(Math.random() * 11) + 20; // 20-30 threads
  for (let t = 1; t <= threadCount; t++) {
    lines.push({ text: "", delayAfter: 10 });
    lines.push({ text: `Thread ${t}:`, delayAfter: 10 });
    const frameCount = Math.floor(Math.random() * 8) + 6; // 6-13 frames
    pushBurst(lines, frameCount, (i) => ({
      text: crashFrame(profile.kind, crash, i),
      className: "line-trace",
    }));
  }

  lines.push({ text: "", delayAfter: 60 });
  lines.push({ text: "Loaded modules:", delayAfter: 30 });
  const moduleLineCount = Math.floor(Math.random() * 101) + 380; // 380-480 lines
  pushBurst(lines, moduleLineCount, () => ({
    text: `${randomHex(8)} - ${randomHex(8)}  ${pick(crash.modules)}  (build ${randomHex(2)})`,
    className: "line-trace",
  }));

  lines.push({ text: "", delayAfter: 60 });
  lines.push({ text: "-- System Information --", delayAfter: 30 });
  lines.push({
    text: `Device profile:  ${profile.windowTitle} (${profile.kind})`,
    className: "line-trace",
    delayAfter: 20,
  });
  lines.push({
    text: `Memory:          ${Math.floor(Math.random() * 900) + 100} MB / ${(Math.floor(Math.random() * 4) + 4) * 1024} MB`,
    className: "line-trace",
    delayAfter: 20,
  });
  lines.push({
    text: `Report ID:       ${randomHex(8)}-${randomHex(4)}`,
    className: "line-trace",
    delayAfter: 50,
  });

  lines.push({ text: "", delayAfter: 90 });
  lines.push({
    text: "이 예외의 원인, 코드 경로, 조치 방법에 대한 전체 보고서는 아래에서 확인할 수 있습니다.",
    delayAfter: 200,
  });
  lines.push({ text: REPO_URL, href: REPO_URL, className: "line-help", delayAfter: 0 });

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
    overflow-y: auto;
    color: #d4d4d4;
    font-size: 13.5px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .line-cmd { color: #ff7e00; }
  .line-warn { color: #ff0045; font-weight: 600; }
  .line-progress { color: #ffcc11; }
  .line-trace { color: #5d6b86; font-size: 12.5px; }
  .line-joke { color: #8a8fa3; font-style: italic; }
  .line-help a {
    color: #39c5bb;
    text-decoration: underline;
  }
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
  // \ud0c0\uc774\uba38\ub294 \ubc18\ub4dc\uc2dc \ud654\uba74\uc5d0 \uc2e4\uc81c\ub85c \uadf8\ub9ac\ub294 \ucc3d(doc)\uc758 setTimeout\uc73c\ub85c \uac78\uc5b4\uc57c \ud55c\ub2e4.
  // \uc774 \ud568\uc218\ub97c \ud638\ucd9c\ud558\ub294 \ucabd(\uc624\ud504\ub108 \ucc3d)\uc758 \uc804\uc5ed setTimeout\uc744 \uadf8\ub300\ub85c \uc4f0\uba74, \ubaa8\ubc14\uc77c
  // \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \ud31d\uc5c5\uc774 \uc0c8 \ud0ed\uc73c\ub85c \uc5f4\ub9ac\ub294 \uc21c\uac04 \uc624\ud504\ub108 \ud0ed\uc774 \ubc31\uadf8\ub77c\uc6b4\ub4dc\ub85c
  // \ubc00\ub824\ub098\uba74\uc11c \ud0c0\uc774\uba38\uac00 \ucd08 \ub2e8\uc704\ub85c \uc2a4\ub85c\ud2c0\ub9c1\ub418\uc5b4(\ubc30\ud130\ub9ac \uc808\uc57d \uc815\ucc45) \ud55c \uc904\uc5d0
  // 0.5\ucd08\uc529 \uac78\ub9ac\ub294 \uac83\ucc98\ub7fc \ubcf4\uc774\ub294 \ubb38\uc81c\uac00 \uc788\uc5c8\ub2e4.
  const win = doc.defaultView ?? window;
  let index = 0;

  const step = () => {
    if (isClosed() || index >= lines.length) return;

    const line = lines[index];
    const p = doc.createElement("div");
    if (line.className) p.className = line.className;

    if (line.href) {
      const a = doc.createElement("a");
      a.href = line.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = line.text;
      p.appendChild(a);
    } else {
      p.textContent = line.text.length > 0 ? line.text : "\u00a0";
    }

    screen.appendChild(p);
    screen.scrollTop = screen.scrollHeight;

    index += 1;
    if (index < lines.length) {
      win.setTimeout(step, line.delayAfter);
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
