/* =============================================
   JULIANO SANT'ANA — JavaScript Principal
   ============================================= */

// --- Navbar scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// --- Menu mobile ---
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
const navMobileClose = document.getElementById('navMobileClose');

hamburger?.addEventListener('click', () => {
  navMobile.classList.add('aberto');
  document.body.style.overflow = 'hidden';
});
navMobileClose?.addEventListener('click', fecharMenu);
navMobile?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', fecharMenu);
});
function fecharMenu() {
  navMobile.classList.remove('aberto');
  document.body.style.overflow = '';
}

// --- Animações de entrada (Intersection Observer) ---
const animados = document.querySelectorAll('.animar');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
animados.forEach(el => observer.observe(el));

// --- Contador animado nas stats ---
function animarContador(el) {
  const alvo = parseFloat(el.dataset.alvo);
  const sufixo = el.dataset.sufixo || '';
  const prefixo = el.dataset.prefixo || '';
  const duracao = 1800;
  const inicio = performance.now();

  function atualizar(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const easing = 1 - Math.pow(1 - progresso, 3);
    const atual = Math.floor(easing * alvo);
    el.textContent = prefixo + atual + sufixo;
    if (progresso < 1) requestAnimationFrame(atualizar);
    else el.textContent = prefixo + alvo + sufixo;
  }
  requestAnimationFrame(atualizar);
}

const contadores = document.querySelectorAll('[data-alvo]');
const contadorObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animarContador(entry.target);
      contadorObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
contadores.forEach(el => contadorObserver.observe(el));

// --- Chat Widget ---
const chatBtn = document.getElementById('chatBtn');
const chatPainel = document.getElementById('chatPainel');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMensagens = document.getElementById('chatMensagens');
const chatTooltip = document.getElementById('chatTooltip');

let chatAberto = false;
let primeiraAbertura = true;

chatBtn?.addEventListener('click', () => {
  chatAberto = !chatAberto;
  chatPainel.classList.toggle('aberto', chatAberto);
  chatTooltip.classList.remove('visivel');
  if (chatAberto && primeiraAbertura) {
    primeiraAbertura = false;
    setTimeout(() => adicionarMsgBot('Olá! Sou o Agente JS — treinado com a filosofia e experiência de Juliano Sant\'Ana. Como posso te ajudar hoje?'), 600);
    setTimeout(() => adicionarSugestoes(), 1200);
  }
});
chatClose?.addEventListener('click', () => {
  chatAberto = false;
  chatPainel.classList.remove('aberto');
});

// Tooltip aparece depois de 3s
setTimeout(() => {
  if (!chatAberto && chatTooltip) {
    chatTooltip.classList.add('visivel');
    setTimeout(() => chatTooltip.classList.remove('visivel'), 5000);
  }
}, 3000);

function adicionarMsgBot(texto) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<div class="chat-bolha">${texto}</div>`;
  chatMensagens.appendChild(msg);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function adicionarMsgUsuario(texto) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg usuario';
  msg.innerHTML = `<div class="chat-bolha">${texto}</div>`;
  chatMensagens.appendChild(msg);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function adicionarSugestoes() {
  const sugestoes = document.createElement('div');
  sugestoes.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;padding:0 0.2rem;';
  const opcoes = ['Quero uma mentoria', 'O que é o Mapa da Verdade?', 'Temas de palestras'];
  opcoes.forEach(op => {
    const btn = document.createElement('button');
    btn.textContent = op;
    btn.style.cssText = `
      background: rgba(127,176,105,0.15);
      border: 1px solid rgba(127,176,105,0.3);
      color: #7FB069;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s;
    `;
    btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(127,176,105,0.25)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(127,176,105,0.15)');
    btn.addEventListener('click', () => {
      sugestoes.remove();
      adicionarMsgUsuario(op);
      setTimeout(() => responderChat(op), 800);
    });
    sugestoes.appendChild(btn);
  });
  chatMensagens.appendChild(sugestoes);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function responderChat(msg) {
  const respostas = {
    'quero uma mentoria': 'A mentoria com Juliano é individual, com vagas limitadas. Você terá acesso ao Mapa da Verdade como ferramenta de acompanhamento. Quer agendar um diagnóstico gratuito? 👇',
    'o que é o mapa da verdade?': 'O Mapa da Verdade é a plataforma digital de Juliano — com IA treinada na filosofia Ação & Reação. Serve para acompanhar seus projetos, cobrar execução e apontar próximos passos. Quem fecha mentoria entra na plataforma.',
    'temas de palestras': 'Juliano fala sobre: posicionamento estratégico, comportamento do consumidor, marketing para MPMEs, empreendedorismo com verdade, e desenvolvimento sustentável em turismo. Quer saber mais sobre algum tema?',
  };

  const chave = msg.toLowerCase();
  let resposta = respostas[chave];

  if (!resposta) {
    resposta = 'Ótima pergunta! Para uma conversa mais aprofundada, o melhor caminho é agendar um diagnóstico estratégico gratuito com Juliano. Posso te direcionar para o WhatsApp dele?';
  }

  adicionarMsgBot(resposta);

  if (chave.includes('mentoria') || chave.includes('diagnóstico')) {
    setTimeout(() => {
      const link = document.createElement('div');
      link.className = 'chat-msg';
      link.innerHTML = `<div class="chat-bolha"><a href="https://wa.me/5547984079480?text=Olá%20Juliano!%20Quero%20saber%20mais%20sobre%20mentoria." target="_blank" style="color:#7FB069;font-weight:600;display:flex;align-items:center;gap:0.4rem;">📱 Falar no WhatsApp →</a></div>`;
      chatMensagens.appendChild(link);
      chatMensagens.scrollTop = chatMensagens.scrollHeight;
    }, 600);
  }
}

function enviarChat() {
  const texto = chatInput.value.trim();
  if (!texto) return;
  adicionarMsgUsuario(texto);
  chatInput.value = '';
  setTimeout(() => responderChat(texto), 900);
}

chatSend?.addEventListener('click', enviarChat);
chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enviarChat();
});

// --- Formulário de contato ---
const form = document.getElementById('formContato');
const formSucesso = document.getElementById('formSucesso');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.style.display = 'none';
      formSucesso.style.display = 'block';
    } else {
      btn.textContent = 'Erro ao enviar. Tente novamente.';
      btn.disabled = false;
    }
  } catch (err) {
    btn.textContent = 'Erro ao enviar. Tente novamente.';
    btn.disabled = false;
  }
});

// --- Smooth scroll nos links internos ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const alvo = document.querySelector(link.getAttribute('href'));
    if (alvo) {
      e.preventDefault();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
