import fs from 'node:fs';
import path from 'node:path';

const ebooksDir = path.resolve('public', 'ebooks');
if (!fs.existsSync(ebooksDir)) {
  fs.mkdirSync(ebooksDir, { recursive: true });
}

function createMinimalPdf(title, subtitle, pagesCount) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 280 >>
stream
BT
/F1 24 Tf
50 750 Td
(${title}) Tj
/F1 14 Tf
0 -40 Td
(${subtitle} - ${pagesCount} paginas) Tj
/F1 12 Tf
0 -40 Td
(Colo de Mae - Guia Exclusivo para Gestantes e Maes) Tj
0 -30 Td
(Conteudo acolhedor com dicas praticas para sua jornada de amor.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000557 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
628
%%EOF`;
  return content;
}

fs.writeFileSync(
  path.join(ebooksDir, 'ebook1.pdf'),
  createMinimalPdf('Gestacao Semana a Semana', 'Acompanhamento do Positivo ao Parto', 36)
);

fs.writeFileSync(
  path.join(ebooksDir, 'ebook2.pdf'),
  createMinimalPdf('Os Primeiros 90 Dias', 'Manual de Sobrevivencia do Puerperio', 32)
);

fs.writeFileSync(
  path.join(ebooksDir, 'ebook3.pdf'),
  createMinimalPdf('Amamentacao Sem Drama', 'Guia Pratico de Pega e Acolhimento', 28)
);

console.log('PDF eBooks generated successfully in public/ebooks/');
