// Cálculo de valor esperado por participante/contato — fonte única usada tanto pela tela de
// Pagamentos quanto pelo link público de pagamento. Antes cada tela tinha sua própria cópia
// dessa lógica e elas foram divergindo (3 bugs diferentes encontrados nessa duplicação). A partir
// de agora qualquer mudança de regra de preço só precisa ser feita AQUI.

// Acha, entre as linhas do MESMO contato, uma parceira de pareamento "pacote" — duas cerimônias
// de 1 dia cada, com datas dentro de 29 dias uma da outra, contam como um pacote de 2 dias.
export function findPairPartner(p, allParticipants) {
  const candidates = allParticipants.filter(x =>
    x.contact_id === p.contact_id && x.event_id !== p.event_id && x.events?.active !== false
  );
  const thisDays = [];
  if (p.date1_confirmed && p.events?.date) thisDays.push(p.events.date);
  if (p.date2_confirmed && p.events?.date2) thisDays.push(p.events.date2);
  return candidates.find(x => {
    const otherDays = [];
    if (x.date1_confirmed && x.events?.date) otherDays.push(x.events.date);
    if (x.date2_confirmed && x.events?.date2) otherDays.push(x.events.date2);
    for (const d1 of thisDays) for (const d2 of otherDays) {
      if (Math.abs(new Date(d1) - new Date(d2)) / 86400000 <= 29) return true;
    }
    return false;
  });
}

// Preço "solo" de uma linha, sem pareamento — exige os DOIS dias confirmados na MESMA cerimônia
// pra cobrar o valor de 2 dias; confirmar só um dos dois (independente de qual) cobra 1 dia.
export function soloExpected(p) {
  if (!p.date1_confirmed && !p.date2_confirmed) return null;
  return (p.date1_confirmed && p.date2_confirmed && p.events?.price_2d != null)
    ? p.events.price_2d
    : (p.events?.price_1d ?? null);
}

// Valor esperado de UMA linha, considerando pareamento com outra cerimônia do mesmo contato.
export function computeExpected(p, allParticipants) {
  if (!p.date1_confirmed && !p.date2_confirmed) return null;
  const partner = findPairPartner(p, allParticipants);
  if (partner) {
    return p.events?.price_2d != null ? p.events.price_2d / 2 : (p.events?.price_1d ?? null);
  }
  return soloExpected(p);
}

// Soma o valor esperado de TODAS as linhas ativas de um contato — não conta a mesma dupla
// pareada duas vezes. É o número que tem que bater em qualquer tela que cobre alguém.
export function computeBasePriceForContact(allParticipantsSameContact) {
  const merged = new Set();
  let total = 0;
  let any = false;
  for (const p of allParticipantsSameContact) {
    if (merged.has(p.event_id)) continue;
    if (!p.date1_confirmed && !p.date2_confirmed) continue;
    any = true;
    const remaining = allParticipantsSameContact.filter(x => !merged.has(x.event_id));
    const partner = findPairPartner(p, remaining);
    if (partner) {
      merged.add(p.event_id);
      merged.add(partner.event_id);
      const price2d = p.events?.price_2d ?? partner.events?.price_2d ?? null;
      if (price2d != null) total += price2d;
    } else {
      const price = soloExpected(p);
      if (price != null) total += price;
    }
  }
  return any ? total : null;
}
