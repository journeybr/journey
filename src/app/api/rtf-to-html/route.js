import parser from 'rtf-parser';

function escape(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rtfDocToHtml(doc) {
  const paragraphs = doc.content || [];

  // Tamanho de fonte dominante do corpo (moda entre parágrafos com texto)
  const sizeCounts = {};
  for (const para of paragraphs) {
    const sz = para.style?.fontSize;
    if (sz && para.content?.some(s => s.value?.trim())) {
      sizeCounts[sz] = (sizeCounts[sz] || 0) + 1;
    }
  }
  const bodySize = Number(Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 24);

  function headingLevel(para) {
    const sz = para.style?.fontSize ?? bodySize;
    const ratio = sz / bodySize;
    const allBold = para.content?.length > 0 && para.content.every(s => !s.value?.trim() || s.style?.bold);
    if (ratio >= 1.6) return 1;
    if (ratio >= 1.3) return 2;
    if (ratio >= 1.1 || (allBold && ratio >= 0.95)) return 3;
    return 0;
  }

  // Converte os spans de um parágrafo em HTML
  function spansToHtml(spans) {
    let html = '';
    for (const span of spans) {
      if (span.value === '\n') { html += '<br>'; continue; }
      if (!span.value) continue;
      let text = escape(span.value);
      const ss = span.style || {};
      if (ss.bold) text = `<strong>${text}</strong>`;
      if (ss.italic) text = `<em>${text}</em>`;
      if (ss.underline) text = `<u>${text}</u>`;
      html += text;
    }
    return html;
  }

  // Detecta se um parágrafo é item de bullet (começa com •, -, *, ·)
  function bulletText(para) {
    const first = para.content?.find(s => s.value?.trim());
    if (!first) return null;
    const m = first.value.match(/^([•·\-\*])\s*/);
    if (!m) return null;
    // Reconstrói os spans sem o prefixo de bullet
    const spans = [...(para.content || [])];
    spans[spans.indexOf(first)] = { ...first, value: first.value.slice(m[0].length) };
    return spansToHtml(spans);
  }

  // Primeira passagem: monta blocos intermediários
  const blocks = []; // { type: 'p'|'h1'|'h2'|'h3'|'br'|'li', html, align }

  for (const para of paragraphs) {
    const st = para.style || {};
    const align = (st.align && st.align !== 'left') ? st.align : null;
    const hasText = para.content?.some(s => s.value?.trim());

    if (!hasText) continue; // parágrafos vazios removidos — o margin-bottom do CSS já espaça

    const li = bulletText(para);
    if (li !== null) {
      blocks.push({ type: 'li', html: li });
      continue;
    }

    const level = headingLevel(para);
    const html = spansToHtml(para.content || []);
    blocks.push({ type: level > 0 ? `h${level}` : 'p', html, align });
  }

  // Segunda passagem: colapsa múltiplos <br> consecutivos → no máximo 1
  // e agrupa <li> consecutivos em <ul>
  const lines = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    // Agrupa li consecutivos em <ul>
    if (b.type === 'li') {
      lines.push('<ul>');
      while (i < blocks.length && blocks[i].type === 'li') {
        lines.push(`  <li>${blocks[i].html}</li>`);
        i++;
      }
      lines.push('</ul>');
      continue;
    }

    const alignAttr = b.align ? ` style="text-align:${b.align}"` : '';
    lines.push(`<${b.type}${alignAttr}>${b.html}</${b.type}>`);
    i++;
  }

  return lines.join('\n');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const rtfText = Buffer.from(arrayBuffer).toString('binary');

    const doc = await new Promise((resolve, reject) => {
      parser.string(rtfText, (err, doc) => err ? reject(err) : resolve(doc));
    });

    const html = rtfDocToHtml(doc);
    return Response.json({ html });
  } catch (err) {
    console.error('RTF conversion error:', err);
    return Response.json({ error: 'Erro ao converter: ' + err.message }, { status: 500 });
  }
}
