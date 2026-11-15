// Reproduit le cas reel du 12/11 : liste du jour REFUSEE par API-Sports (plage de dates du plan),
// match « Atletico Nacional — Once Caldas » reporte au 14/11. Attendu : match annule, fiche perdue.
// Cas 2 : liste refusee + relance par match SANS reponse -> rien n'est modifie (jamais invente).
// Cas 3 : liste OK (comportement d'avant inchange).
// Lancer : node tests/settle-report.test.js  (code de sortie 1 si un cas echoue)
process.env.SUPABASE_URL = 'https://sb.test'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'k'; process.env.API_SPORTS_KEY = 'x';
const S = require(require('path').join(__dirname, '..', 'netlify', 'functions', 'bot-settle-results.js'));
const T = { id: 't12', code: 'BOT-2026-11-12-FOOT-R1', play_date: '2026-11-12', sport: 'foot' };
const legsBase = () => [
  { id: 'l1', ticket_id: 't12', fixture_id: 1549864, market: 'mk_total_buts', pick: 'Plus de 1.5 buts', result: null, kickoff_at: '2026-11-12T21:00:00+00:00' },
  { id: 'l2', ticket_id: 't12', fixture_id: 222, market: 'mk_total_buts', pick: 'Plus de 2.5 buts', result: 'lost', kickoff_at: '2026-11-12T22:00:00+00:00' },
  { id: 'l3', ticket_id: 't12', fixture_id: 333, market: 'mk_total_buts', pick: 'Plus de 1.5 buts', result: 'won', kickoff_at: '2026-11-13T00:00:00+00:00' }
];
let echecs = 0;
async function scenario(nom, { listeRefusee, relanceRepond }, attendu) {
  const legs = legsBase(), ecrit = [], err = [];
  const rep = (b, status) => ({ ok: (status || 200) < 400, status: status || 200, json: async () => b, text: async () => JSON.stringify(b), headers: { get: () => null } });
  global.fetch = async (url, o) => {
    const u = String(url), m = (o && o.method) || 'GET';
    if (u.includes('/rest/v1/rpc/')) return rep(true);
    if (u.includes('/rest/v1/tickets?') && m === 'GET') return rep([T]);
    if (u.includes('/rest/v1/ticket_legs?') && m === 'GET') return rep(legs.map(l => Object.assign({}, l)));
    if (u.includes('/rest/v1/') && m === 'PATCH') { ecrit.push(u.split('/rest/v1/')[1].split('?')[0] + ' ' + o.body); const id = u.split('id=eq.')[1]; const l = legs.find(x => x.id === id); if (l) Object.assign(l, JSON.parse(o.body)); return rep(null); }
    if (u.includes('/rest/v1/') && m === 'POST') { if (u.includes('error_log')) err.push(o.body); return rep(null); }
    if (u.includes('/rest/v1/')) return rep([]);
    if (u.includes('api-sports.io/fixtures') && u.includes('date=')) {
      if (listeRefusee) return rep({ errors: { plan: 'Free plans do not have access to this date, try from 2026-11-14 to 2026-11-16.' }, response: [] });
      return rep({ errors: [], response: [] });
    }
    if (u.includes('api-sports.io/fixtures') && u.includes('id=1549864')) {
      if (!relanceRepond) return rep({}, 500);
      return rep({ errors: [], response: [{ fixture: { id: 1549864, date: '2026-11-14T20:30:00+00:00', status: { short: 'FT' } }, goals: { home: 2, away: 1 }, score: { fulltime: { home: 2, away: 1 } } }] });
    }
    return rep({ errors: [], response: [] });
  };
  const I = S._interne;
  I.stats.erreurs = []; I.stats.datesTraitees = []; I.stats.datesListeRefusee = [];
  I.stats.ticketsRegles = { won: 0, lost: 0 }; I.stats.legsMisAJour = { won: 0, lost: 0, void: 0 };
  I.stats.appelsApiSports = { foot: 0, basket: 0 }; I.stats.bsd = { legsExaminees: 0, legsResolues: 0 };
  console.log = () => {};
  await I.reglerDate('2026-11-12');
  const out = process.stdout;
  out.write(`\n=== ${nom}\n`);
  out.write('ecritures : ' + (ecrit.length ? '\n  ' + ecrit.join('\n  ') : 'aucune') + '\n');
  out.write('dates refusees notees : ' + JSON.stringify(I.stats.datesListeRefusee) + '\n');
  const leg = legs.find(l => l.id === 'l1').result || null;
  const ticket = (ecrit.find(e => e.startsWith('tickets ')) || '').includes('"lost"') ? 'lost' : 'pending';
  const ok = leg === attendu.leg && ticket === attendu.ticket;
  if (!ok) echecs++;
  out.write((ok ? 'OK' : 'ECHEC') + ` (match : ${leg}, fiche : ${ticket})\n`);
}
(async () => {
  await scenario('1. Liste du 12/11 REFUSEE, relance par match OK (cas reel)', { listeRefusee: true, relanceRepond: true }, { leg: 'void', ticket: 'lost' });
  await scenario('2. Liste refusee ET relance sans reponse', { listeRefusee: true, relanceRepond: false }, { leg: null, ticket: 'pending' });
  await scenario('3. Liste OK (match absent de la liste), relance OK', { listeRefusee: false, relanceRepond: true }, { leg: 'void', ticket: 'lost' });
  process.stdout.write(echecs ? `\n${echecs} cas en ECHEC\n` : '\nTous les cas OK\n');
  process.exit(echecs ? 1 : 0);
})();
