// Teste de regressão: um save antigo continua carregando E jogável depois de qualquer mudança?
//
// Rode com:  node testes/migracao-de-save.mjs
// Não instala nada: sobe um servidor local, abre o Chrome sem janela e joga sozinho.
//
// Por que existe: o jogo guarda o progresso como um JSON no navegador. Quando um campo novo
// aparece no jogo (uma construção, um bicho, um recurso), o save de quem já jogava não tem
// esse campo — e o jogo precisa preencher sozinho. Já quebrou uma vez: um save sem a chave
// "porco" fazia o botão "Avançar dia" morrer em silêncio.

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = 8731;
const PORTA_CDP = 9772;
const PERFIL = join(tmpdir(), "fazenda-teste-chrome-" + process.pid);

const CAMINHOS_CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

// ---- os saves que precisam continuar funcionando ----
// Cada um representa uma época do jogo, com os campos que existiam naquele momento.
const SAVES = {
  "so tinha galinha": {
    day: 5, cash: 300,
    plots: [{ locked: false, crop: "milho", plantedDay: 2 }],
    animals: { galinha: { count: 2, max: 3, fedToday: 2, missStreak: 0, pigs: [] } },
    warehouse: { milho: 10 }, priceMult: { milho: 1 }, prevPriceMult: { milho: 1 },
    player: { name: "Luiz", color: "#a3402c" }, log: [{ day: 1, text: "antigo", tip: false }],
  },
  "antes da agua e do poco": {
    day: 12, cash: 800,
    plots: [{ locked: false, crop: null, plantedDay: null }],
    animals: { vaca: { count: 1, max: 2, fedToday: 1, missStreak: 0, pigs: [] } },
    warehouse: { milho: 5, leite: 3 }, inventory: { madeira: 20, pedra: 10, minerio: 5 },
    built: { celeiro: true, casaReformada: false },
    priceMult: { milho: 1, leite: 1 }, prevPriceMult: { milho: 1, leite: 1 },
    player: { name: "Luiz", color: "#a3402c" }, log: [],
  },
  "fazenda avancada, antes do lobo": {
    day: 30, cash: 5000,
    plots: [{ locked: false, crop: "cafe", plantedDay: 28 }],
    animals: { porco: { count: 2, max: 2, fedToday: 2, missStreak: 0, pigs: [{ bornDay: 20 }] } },
    warehouse: { cafe: 40 }, inventory: { madeira: 60, pedra: 40, minerio: 20, agua: 5 },
    built: { celeiro: true, casaReformada: true, poco: true, espantalho: true, silo: true, moinho: true },
    wellLastCollectDay: 29,
    priceMult: { cafe: 1.2 }, prevPriceMult: { cafe: 1.1 },
    player: { name: "Luiz", color: "#a3402c", mascotName: "Bob" }, log: [],
  },
  "quase vazio": { day: 3, cash: 120, player: { name: "Luiz" } },
  "corrompido (campos nulos)": {
    day: 7, cash: 400, animals: null, plots: null, warehouse: null,
    priceMult: null, prevPriceMult: null, player: { name: "Luiz" }, log: null,
  },
};

const dorme = ms => new Promise(r => setTimeout(r, ms));

function acharChrome(){
  const encontrado = CAMINHOS_CHROME.find(p => existsSync(p));
  if (!encontrado) throw new Error("Chrome não encontrado. Instale o Google Chrome pra rodar este teste.");
  return encontrado;
}

const TIPOS = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json" };
function servirJogo(){
  const servidor = createServer(async (req, res) => {
    const caminho = (req.url || "/").split("?")[0];
    const arquivo = join(RAIZ, caminho === "/" ? "index.html" : caminho.replace(/^\/+/, ""));
    if (!arquivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
    try {
      const conteudo = await readFile(arquivo);
      const ext = arquivo.slice(arquivo.lastIndexOf("."));
      res.writeHead(200, { "content-type": TIPOS[ext] || "application/octet-stream", "cache-control": "no-store" });
      res.end(conteudo);
    } catch { res.writeHead(404).end("não encontrado"); }
  });
  return new Promise(r => servidor.listen(PORTA, () => r(servidor)));
}

async function conectarCdp(){
  for (let i = 0; i < 80; i++){
    try {
      const abas = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json();
      const pagina = abas.find(a => a.type === "page");
      if (pagina?.webSocketDebuggerUrl) return pagina.webSocketDebuggerUrl;
    } catch {}
    await dorme(250);
  }
  throw new Error("O Chrome não respondeu.");
}

const servidor = await servirJogo();
const chrome = spawn(acharChrome(), [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--mute-audio",
  `--remote-debugging-port=${PORTA_CDP}`, `--user-data-dir=${PERFIL}`,
  "--window-size=1280,800", "about:blank",
], { stdio: "ignore" });

const ws = new WebSocket(await conectarCdp());
await new Promise(r => ws.addEventListener("open", r, { once: true }));

let seq = 0; const aguardando = new Map(); let excecoes = [];
ws.addEventListener("message", ev => {
  const msg = JSON.parse(ev.data);
  if (msg.method === "Runtime.exceptionThrown"){
    const d = msg.params.exceptionDetails;
    excecoes.push(((d.exception && d.exception.description) || d.text || "").split("\n")[0]);
  }
  if (msg.id && aguardando.has(msg.id)){ aguardando.get(msg.id)(msg); aguardando.delete(msg.id); }
});
const cdp = (metodo, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method: metodo, params }));
  return new Promise(r => aguardando.set(id, m => {
    if (m.error) throw new Error(metodo + ": " + JSON.stringify(m.error));
    r(m.result);
  }));
};
const naPagina = async expr => (await cdp("Runtime.evaluate", { returnByValue: true, expression: expr })).result.value;

await cdp("Page.enable"); await cdp("Runtime.enable");

const url = extra => `http://localhost:${PORTA}/index.html?t=${Date.now()}${extra || ""}`;
const resultados = [];

for (const [nome, save] of Object.entries(SAVES)){
  await cdp("Page.navigate", { url: url() }); await dorme(1200);
  await naPagina(`(function(){
    localStorage.clear();
    localStorage.setItem('fazenda-profiles-v1', JSON.stringify([{name:'Luiz',color:'#a3402c'}]));
    localStorage.setItem('fazenda-active-profile-v1','Luiz');
    localStorage.setItem('fazenda-save-v4-Luiz', ${JSON.stringify(JSON.stringify(save))});
  })()`);
  await cdp("Page.navigate", { url: url() }); await dorme(2300);

  excecoes = [];
  const entrou = await naPagina(`document.getElementById('loginOverlay').classList.contains('hidden')`);
  const caixaAntes = await naPagina(`document.getElementById('statCash').textContent`);
  const diaAntes = await naPagina(`document.getElementById('statDay').textContent`);
  await naPagina(`document.getElementById('advanceBtn').click()`);
  await dorme(1300);
  const diaDepois = await naPagina(`document.getElementById('statDay').textContent`);
  const desenhou = await naPagina(`(function(){
    var c=document.getElementById('gameCanvas'), g=c.getContext('2d');
    var d=g.getImageData(0,0,c.width,c.height).data, pintados=0;
    for(var i=3;i<d.length;i+=4*401){ if(d[i]>0) pintados++; }
    return pintados>0;
  })()`);

  const problemas = [];
  if (!entrou) problemas.push("não entrou no jogo (travou no login)");
  if (!desenhou) problemas.push("a fazenda não foi desenhada");
  if (diaDepois === diaAntes) problemas.push(`"Avançar dia" não funcionou (parou no dia ${diaAntes})`);
  if (excecoes.length) problemas.push("erro de JavaScript: " + excecoes[0]);

  resultados.push({ nome, ok: problemas.length === 0, problemas, detalhe: `dia ${diaAntes}→${diaDepois}, caixa ${caixaAntes}` });
}

ws.close(); chrome.kill(); servidor.close();
await rm(PERFIL, { recursive: true, force: true }).catch(() => {});

console.log("\nMigração de save — os saves antigos continuam jogáveis?\n");
for (const r of resultados){
  console.log(`  ${r.ok ? "OK  " : "FALHOU"}  ${r.nome}  (${r.detalhe})`);
  r.problemas.forEach(p => console.log(`         └─ ${p}`));
}
const falhas = resultados.filter(r => !r.ok).length;
console.log(falhas === 0
  ? `\nTodos os ${resultados.length} saves passaram.\n`
  : `\n${falhas} de ${resultados.length} saves quebraram — corrija normalizeState() antes de publicar.\n`);
process.exit(falhas === 0 ? 0 : 1);
