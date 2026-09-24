/* FUORISEDE — finestra "Scrivici" (2026-09-24)
 * Molti computer (soprattutto Windows) non hanno un programma di posta predefinito: i link mailto:
 * in quel caso non fanno nulla. Ogni link mailto: del sito apre invece questa finestra, nello stile di
 * "Avvisami sugli aggiornamenti", con due strade che funzionano sempre: Gmail nel browser oppure
 * il programma di posta. In più si può copiare l'indirizzo.
 */
(function () {
  'use strict';

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function parseMailto(href) {
    const raw = href.replace(/^mailto:/i, '');
    const [to, query = ''] = raw.split('?');
    const q = new URLSearchParams(query);
    return { to: decodeURIComponent(to || ''), subject: q.get('subject') || '', body: q.get('body') || '' };
  }

  const gmailUrl = m => 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(m.to) + '&su=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);
  const mailtoUrl = m => 'mailto:' + m.to + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);

  function copy(text, button, done) {
    const ok = () => { button.textContent = done; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, ok);
    else {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      t.remove(); ok();
    }
  }

  // opts: { to, subject, body, title, intro, bodyLabel, allowRecipient }
  function open(opts) {
    document.getElementById('fs-cm')?.remove();
    const m = { to: opts.to || '', subject: opts.subject || '', body: opts.body || '' };
    const overlay = document.createElement('div');
    overlay.id = 'fs-cm';
    overlay.className = 'fs-cm-overlay';
    overlay.innerHTML = `<div class="fs-cm-card" role="dialog" aria-modal="true" aria-labelledby="fs-cm-title">
      <button class="fs-cm-close" type="button" aria-label="Chiudi">×</button>
      <div class="fs-cm-eyebrow">FUORISEDE · ${esc(opts.eyebrow || 'SCRIVICI')}</div>
      <h2 id="fs-cm-title">${esc(opts.title || m.subject || 'Scrivici')}</h2>
      ${opts.intro ? `<p class="fs-cm-intro">${opts.intro}</p>` : ''}
      <form>
        ${opts.allowRecipient ? `<label>Email di chi deve riceverlo<input name="to" type="email" autocomplete="email" placeholder="es. mamma@email.it" value="${esc(m.to)}"></label>` : ''}
        <label>${esc(opts.bodyLabel || 'Il tuo messaggio')}<textarea name="body" rows="${opts.rows || 6}" placeholder="Scrivi qui…">${esc(m.body)}</textarea></label>
        <button class="fs-cm-primary" type="submit" data-way="gmail">Invia con Gmail</button>
        <button class="fs-cm-secondary" type="button" data-way="mailto">Usa il programma di posta</button>
        <div class="fs-cm-alt">${opts.allowRecipient
          ? '<button type="button" data-way="copy-body">Copia il messaggio</button>'
          : `Oppure scrivi a <b>${esc(m.to)}</b> <button type="button" data-way="copy-to">Copia indirizzo</button>`}</div>
      </form></div>`;
    document.body.appendChild(overlay);
    const card = overlay.querySelector('.fs-cm-card');
    const form = overlay.querySelector('form');
    const close = () => overlay.remove();
    overlay.querySelector('.fs-cm-close').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } });
    const current = () => ({ to: form.to ? form.to.value.trim() : m.to, subject: m.subject, body: form.body.value });
    const sent = how => {
      card.innerHTML = `<div class="fs-cm-success"><b>Messaggio pronto ✓</b><p>${how === 'gmail'
        ? 'Si è aperto Gmail in una nuova scheda con il messaggio già compilato: controlla e premi Invia.'
        : 'Si è aperto il tuo programma di posta con il messaggio già compilato: controlla e premi Invia. Se non si è aperto nulla, usa “Invia con Gmail”.'}</p><button type="button">Chiudi</button></div>`;
      card.querySelector('button').onclick = close;
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const cur = current();
      if (opts.allowRecipient && !cur.to) { form.to.focus(); form.to.reportValidity && form.to.reportValidity(); return; }
      window.open(gmailUrl(cur), '_blank', 'noopener');
      if (opts.onSend) try { opts.onSend('gmail'); } catch (_) {}
      sent('gmail');
    });
    form.querySelector('[data-way=mailto]').onclick = () => {
      const cur = current();
      location.href = mailtoUrl(cur);
      if (opts.onSend) try { opts.onSend('mailto'); } catch (_) {}
      sent('mailto');
    };
    const copyTo = form.querySelector('[data-way=copy-to]');
    if (copyTo) copyTo.onclick = () => copy(m.to, copyTo, 'Indirizzo copiato ✓');
    const copyBody = form.querySelector('[data-way=copy-body]');
    if (copyBody) copyBody.onclick = () => copy(form.body.value, copyBody, 'Messaggio copiato ✓');
    (form.to && !form.to.value ? form.to : form.body).focus();
  }
  window.FuorisedeContact = { open };

  // Tutti i link mailto: del sito aprono la finestra.
  const TITLES = [
    [/idee|suggeriment/i, 'Idee e suggerimenti', 'Qualcosa non funziona o potrebbe essere migliore? Scrivici, leggiamo tutto.'],
    [/pubblicare|pubblica/i, 'Pubblica un alloggio', 'Raccontaci l’alloggio (zona, tipo di stanza, prezzo, da quando è libero): lo pubblichiamo gratis, solo con la tua autorizzazione.'],
    [/privacy/i, 'Richiesta privacy', ''],
    [/./, 'Scrivici', 'Una domanda su FUORISEDE o su un alloggio? Ti rispondiamo noi.']
  ];
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    e.preventDefault();
    const m = parseMailto(a.getAttribute('href'));
    const [, title, intro] = TITLES.find(([re]) => re.test(m.subject || 'x'));
    open({ to: m.to, subject: m.subject || 'Messaggio da FUORISEDE', body: m.body, title, intro });
  });

  const css = `.fs-cm-overlay{position:fixed;inset:0;z-index:10050;background:#17171599;display:grid;place-items:center;padding:18px}
.fs-cm-card{position:relative;box-sizing:border-box;width:min(520px,100%);max-height:calc(100dvh - 36px);overflow:auto;background:#fff;color:#171715;border-radius:22px;padding:25px;box-shadow:0 22px 70px #0005;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.fs-cm-eyebrow{font-size:10px;font-weight:850;letter-spacing:.075em;text-transform:uppercase;color:#6f6b67}
.fs-cm-card h2{margin:6px 34px 8px 0;font-size:25px;letter-spacing:-.02em}
.fs-cm-close{position:absolute;right:14px;top:12px;border:0;background:transparent;font-size:30px;line-height:1;cursor:pointer;color:#171715}
.fs-cm-intro{font-size:13px;line-height:1.5;color:#3c3a37;margin:0 0 6px}
.fs-cm-card label{display:block;margin:12px 0;font-size:12px;font-weight:850}
.fs-cm-card input,.fs-cm-card textarea{display:block;box-sizing:border-box;width:100%;margin-top:5px;padding:11px 12px;border:1px solid #e5ddd2;border-radius:11px;background:#fff;font-family:inherit;font-size:13px;line-height:1.45;color:#171715}
.fs-cm-card textarea{resize:vertical}
.fs-cm-primary,.fs-cm-secondary,.fs-cm-success button{display:block;width:100%;border:1px solid #171715;border-radius:999px;padding:12px 16px;font:inherit;font-weight:850;font-size:14px;cursor:pointer}
.fs-cm-primary,.fs-cm-success button{background:#171715;color:#fff}
.fs-cm-secondary{background:#fff;color:#171715;margin-top:8px}
.fs-cm-alt{margin-top:12px;font-size:12px;color:#6f6b67;text-align:center;line-height:1.6}
.fs-cm-alt button{border:0;background:none;color:#873c31;text-decoration:underline;font:inherit;font-weight:750;cursor:pointer;padding:0 0 0 4px}
.fs-cm-success{text-align:center;padding:18px 4px}.fs-cm-success b{font-size:21px}.fs-cm-success p{line-height:1.5;color:#6f6b67}
@media(max-width:600px){.fs-cm-card{padding:18px;border-radius:18px}.fs-cm-card h2{font-size:20px}.fs-cm-card input,.fs-cm-card textarea{font-size:16px}}`;
  const style = document.createElement('style');
  style.id = 'fs-cm-style';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();
