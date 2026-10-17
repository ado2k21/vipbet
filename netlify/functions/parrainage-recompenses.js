/* ============================================================
   VIP BETCOTE — Parrainage : recompenses (16/10, ADDITIF)
   ------------------------------------------------------------
   Toutes les 15 minutes : appelle traiter_parrainages() en base.
   Toute la regle vit en base (une seule source de verite) :
     - 1er paiement confirme du filleul -> jours au parrain selon le plan
       achete par le filleul (p1 2 j, p2 5 j, p3 7 j, p4 15 j) ;
     - les jours prolongent l'abonnement ACTIF du parrain (plan inchange),
       sinon ils attendent son prochain plan ;
     - idempotent : un second passage ne change rien.
   ============================================================ */
const config = { schedule: '*/15 * * * *' };

async function handler() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !cle) return { statusCode: 200, body: 'non configure' };
  const h = { apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' };
  try {
    const r = await fetch(`${url}/rest/v1/rpc/traiter_parrainages`, { method: 'POST', headers: h, body: '{}' });
    const corps = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status} ${corps.slice(0, 300)}`);
    console.log('[PARRAINAGE]', corps);
    // 17/10 : email au parrain pour chaque nouvelle recompense (jamais bloquant).
    let emails = { envoyes: 0, echecs: 0 };
    try { emails = await envoyerEmailsRecompense(url, h); } catch (e) { console.log('[PARRAINAGE] emails:', e.message); }
    return { statusCode: 200, body: JSON.stringify({ traitement: JSON.parse(corps || '{}'), emails }) };
  } catch (e) {
    console.log('[PARRAINAGE] erreur:', e.message);
    try {
      await fetch(`${url}/rest/v1/error_log`, { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, h),
        body: JSON.stringify({ context: 'parrainage_recompenses', message: String(e.message).slice(0, 500) }) });
    } catch (_) { /* jamais bloquant */ }
    return { statusCode: 200, body: 'erreur journalisee' };
  }
}

/* ============================================================
   17/10 — EMAIL DE RECOMPENSE AU PARRAIN (ADDITIF)
   Une seule fois par recompense : parrainages.email_recompense_at est
   marque apres envoi reussi. Un echec est retente au passage suivant
   (toutes les 15 min), pendant 2 jours au maximum.
   ============================================================ */
async function envoyerEmailsRecompense(url, h) {
  const RESEND = process.env.RESEND_API_KEY || '';
  const bilan = { envoyes: 0, echecs: 0 };
  if (!RESEND) return bilan;
  const depuis = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
  const r = await fetch(`${url}/rest/v1/parrainages?statut=eq.recompense&email_recompense_at=is.null` +
    `&recompense_at=gte.${encodeURIComponent(depuis)}&select=filleul_id,parrain_id,jours,applique,jours_restants,note&limit=50`, { headers: h });
  if (!r.ok) throw new Error(`lecture parrainages HTTP ${r.status}`);
  const lignes = await r.json();
  for (const pa of lignes) {
    try {
      const pr = await fetch(`${url}/rest/v1/profiles?id=in.(${pa.parrain_id},${pa.filleul_id})&select=id,email,username,suspended_at`, { headers: h });
      const profils = pr.ok ? await pr.json() : [];
      const parrain = profils.find(x => x.id === pa.parrain_id);
      const filleul = profils.find(x => x.id === pa.filleul_id);
      const marquer = () => fetch(`${url}/rest/v1/parrainages?filleul_id=eq.${pa.filleul_id}`, {
        method: 'PATCH', headers: Object.assign({ Prefer: 'return=minimal' }, h),
        body: JSON.stringify({ email_recompense_at: new Date().toISOString() })
      });
      if (!parrain || !parrain.email || parrain.suspended_at) { await marquer(); continue; }
      const cas = (pa.applique && /lifetime/i.test(pa.note || '')) ? 'lifetime'
        : (pa.applique && Number(pa.jours_restants) > 0) ? 'ajoute' : 'reserve';
      const envoi = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VipBetcote <contact@vipbetcote.com>',
          to: parrain.email,
          subject: cas === 'lifetime' ? 'Mèsi pou parennaj ou ! — VipBetcote' : `Ou genyen ${pa.jours} jou bonis ! — VipBetcote`,
          html: emailRecompense(parrain.username || '', (filleul && filleul.username) || '', Number(pa.jours) || 0, cas)
        })
      });
      if (envoi.ok) { await marquer(); bilan.envoyes++; } else { bilan.echecs++; console.log('[PARRAINAGE] resend', envoi.status, (await envoi.text()).slice(0, 200)); }
    } catch (e) { bilan.echecs++; console.log('[PARRAINAGE] email:', e.message); }
  }
  return bilan;
}

function echapper(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function emailRecompense(nom, ami, jours, cas) {
  const n = nom ? echapper(nom) : '';
  const a = ami ? `<strong style="color:#F4F3ED">${echapper(ami)}</strong>` : 'yon zanmi ou';
  const aFr = ami ? `<strong style="color:#F4F3ED">${echapper(ami)}</strong>` : 'un de vos amis';
  const titre = cas === 'lifetime' ? 'Mèsi pou parennaj ou !' : `+${jours} jou bonis 🎉`;
  const ht = cas === 'ajoute'
    ? `${a} fin peye premye plan li gras a lyen ou. <strong style="color:#E8CE8A">${jours} jou</strong> ajoute sou plan ou an kounye a.`
    : cas === 'reserve'
      ? `${a} fin peye premye plan li gras a lyen ou. Ou genyen <strong style="color:#E8CE8A">${jours} jou bonis</strong> : yo ap ajoute otomatikman sou pwochen plan ou.`
      : `${a} fin peye premye plan li gras a lyen ou. Ou gen plan Lifetime deja : aksè ou san limit.`;
  const fr = cas === 'ajoute'
    ? `${aFr} vient de payer son premier plan grâce à votre lien : ${jours} jours ont été ajoutés à votre plan.`
    : cas === 'reserve'
      ? `${aFr} vient de payer son premier plan grâce à votre lien : vous gagnez ${jours} jours bonus, ajoutés automatiquement à votre prochain plan.`
      : `${aFr} vient de payer son premier plan grâce à votre lien. Votre plan Lifetime vous donne déjà un accès illimité.`;
  return `<!DOCTYPE html><html lang="ht"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="dark"><title>${titre}</title></head>
<body style="margin:0;padding:0;background:#030617;font-family:Arial,Helvetica,sans-serif;color:#F4F3ED;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;background:#030617;padding:22px 12px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:540px;background:#081020;border:1px solid rgba(244,243,237,.09);border-radius:16px;overflow:hidden;">
<tr><td align="center" style="padding:25px 20px 20px;background:#030617;"><div style="font-size:18px;line-height:22px;font-weight:800;letter-spacing:1px;color:#F4F3ED;">VipBetcote</div>
<div style="margin-top:5px;font-size:11px;line-height:17px;font-weight:600;letter-spacing:1px;color:#C9A44C;">Genyen chak lèw jwe</div></td></tr>
<tr><td style="height:2px;padding:0;background:#C9A44C;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 26px;background:#081020;">
<h1 style="margin:0 0 12px;text-align:center;font-size:22px;line-height:29px;font-weight:800;color:#F4F3ED;">${titre}</h1>
<p style="margin:0 auto 14px;max-width:440px;text-align:center;font-size:14px;line-height:21px;color:#93A89B;">${n ? `Bonjou ${n},<br><br>` : ''}${ht}</p>
<p style="margin:0 auto 18px;max-width:440px;text-align:center;font-size:12px;line-height:18px;color:#6E8377;">${fr}</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;background:#0E1728;border:1px solid rgba(201,164,76,.38);border-radius:12px;"><tr><td align="center" style="padding:16px 12px;">
<div style="font-size:13px;line-height:19px;color:#E8CE8A;">Kontinye pataje lyen ou : chak zanmi ki peye = plis jou VIP pou ou.</div></td></tr></table>
</td></tr>
<tr><td align="center" style="padding:12px 15px 14px;background:#030617;border-top:1px solid rgba(244,243,237,.07);"><div style="font-size:9px;line-height:14px;color:#566A60;">© 2026 VipBetcote — Jwe ak kontwòl. 18+</div></td></tr>
</table></td></tr></table></body></html>`;
}

module.exports.handler = handler;
module.exports.config = config;
