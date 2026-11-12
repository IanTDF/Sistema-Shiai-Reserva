// ============================================================
// firebase-config.js — escolhe o projeto Firebase pela URL.
//
//   (sem parâmetro)          → Sistema Principal
//   ?sistema=principal       → Sistema Principal
//   ?sistema=secundario      → Sistema Secundário
//   qualquer outro valor     → erro na tela; nada é inicializado
//
// A URL é a única fonte de verdade: nada é guardado de forma global,
// então duas abas podem trabalhar em sistemas diferentes ao mesmo tempo.
// Cada aba inicializa UM projeto, e Auth, Firestore e persistência
// offline usam essa mesma instância.
//
// Expõe: firebase, db, SISTEMA_ID, SISTEMA_NOME, SISTEMA_NA_URL,
//        urlSistema(destino) e chaveLocal(nome).
// ============================================================

const SISTEMAS = {
  principal: {
    nome: "Sistema Principal",
    config: {
      apiKey: "AIzaSyBxr7iM-zVCG8bcHLPRZDfzJbbrx51hMks",
      authDomain: "sistema-sensei-ian.firebaseapp.com",
      projectId: "sistema-sensei-ian",
      storageBucket: "sistema-sensei-ian.firebasestorage.app",
      messagingSenderId: "803865605233",
      appId: "1:803865605233:web:e344d137057dfcf44d17d0"
    }
  },
  secundario: {
    nome: "Sistema Secundário",
    config: {
      apiKey: "AIzaSyAuhyYkSIq9JvztZOixG4pOvmxUzjIVYXA",
      authDomain: "shiai-secundario.firebaseapp.com",
      projectId: "shiai-secundario",
      storageBucket: "shiai-secundario.firebasestorage.app",
      messagingSenderId: "923933772134",
      appId: "1:923933772134:web:e7f37db567e1a05a8560a7"
    }
  }
};

// Mostra o erro, impede que o resto da página carregue e interrompe este script.
function _pararComErro(titulo, detalhe) {
  try { window.stop(); } catch (e) {}
  document.title = "Erro";
  document.body.innerHTML =
    '<div style="max-width:560px;margin:40px auto;padding:20px 22px;background:#fff;' +
    'border:2px solid #b3261e;border-radius:6px;color:#0f2a4d;' +
    'font-family:Barlow,\'Segoe UI\',Arial,sans-serif">' +
    '<h1 style="margin:0 0 10px;font-size:24px;color:#b3261e">' + titulo + '</h1>' +
    '<p style="margin:0;font-size:16px">' + detalhe + '</p></div>';
  throw new Error(titulo + " — " + detalhe);
}

const _sistemaParam = new URLSearchParams(location.search).get("sistema");
const SISTEMA_NA_URL = _sistemaParam !== null;
const SISTEMA_ID = SISTEMA_NA_URL ? _sistemaParam.trim().toLowerCase() : "principal";

if (!Object.prototype.hasOwnProperty.call(SISTEMAS, SISTEMA_ID)) {
  _pararComErro(
    "Sistema desconhecido",
    "O valor <b>sistema=" + String(_sistemaParam).replace(/[<>&"]/g, "") + "</b> não existe. " +
    "Use <b>sistema=principal</b>, <b>sistema=secundario</b> ou retire o parâmetro."
  );
}

const SISTEMA_NOME = SISTEMAS[SISTEMA_ID].nome;
const firebaseConfig = SISTEMAS[SISTEMA_ID].config;

if (/^COLE_AQUI/.test(firebaseConfig.apiKey)) {
  _pararComErro(
    "Configuração incompleta",
    "A apiKey do " + SISTEMA_NOME + " ainda não foi preenchida em firebase-config.js."
  );
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Opcional: o celular continua funcionando se o wi-fi do ginásio cair
// e sincroniza quando a conexão voltar.
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

// Devolve o endereço com o sistema da página atual preservado.
// Só acrescenta ?sistema=... quando ele estava na URL; os demais
// parâmetros (area, categoria...) são mantidos e nunca duplicados.
function urlSistema(destino) {
  if (!SISTEMA_NA_URL) return destino;
  const u = new URL(destino, location.href);
  u.searchParams.set("sistema", SISTEMA_ID);
  return u.href;
}

// Chave do localStorage separada por projeto Firebase: uma aba de um
// sistema nunca lê, grava ou apaga os dados locais do outro.
function chaveLocal(nome) {
  return firebaseConfig.projectId + ":" + nome;
}
