// Neon teklifini bir canvas'a çizip PDF olarak indirir (Türkçe karakter sorunsuz).
import { jsPDF } from 'jspdf';

const tl = (n) => (n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

function roundRect(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

export function teklifPdf({ firma, design, previewCanvas, ozet, tarihStr }) {
  const W = 1240, H = 1754;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);

  // Üst bant
  x.fillStyle = '#0c0e16'; x.fillRect(0, 0, W, 150);
  x.textBaseline = 'middle';
  x.fillStyle = '#22e3c3'; x.font = 'bold 46px Arial';
  x.fillText(firma.ad || 'Firma', 60, 62);
  const iletisim = [firma.telefon, firma.web].filter(Boolean).join('   ·   ');
  if (iletisim) { x.fillStyle = '#cfd6ea'; x.font = '22px Arial'; x.fillText(iletisim, 60, 106); }
  x.textAlign = 'right';
  x.fillStyle = '#ffffff'; x.font = 'bold 38px Arial'; x.fillText('NEON TEKLİFİ', W - 60, 58);
  x.fillStyle = '#8b93b0'; x.font = '22px Arial'; x.fillText(tarihStr, W - 60, 104);
  x.textAlign = 'left';

  // Ürün görseli
  const ix = 60, iy = 200, iw = W - 120, ih = 640;
  x.fillStyle = '#0c0e16'; x.fillRect(ix, iy, iw, ih);
  if (previewCanvas) {
    const pr = previewCanvas.width / previewCanvas.height;
    const br = iw / ih;
    let dw, dh;
    if (pr > br) { dw = iw; dh = iw / pr; } else { dh = ih; dw = ih * pr; }
    x.drawImage(previewCanvas, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
  }

  // Tasarım başlığı
  let yy = iy + ih + 64;
  x.fillStyle = '#0c0e16'; x.font = 'bold 34px Arial';
  x.fillText('Tasarım: “' + (design.metin || '').replace(/\n/g, ' ') + '”', 60, yy);
  yy += 52;

  // Özellikler
  x.font = '24px Arial';
  const satirlar = [
    ['Ürün', 'LED Neon Tabela'],
    ['Yazı', (design.metin || '').replace(/\n/g, '  /  ')],
    ['Boyut (En × Boy)', `${ozet.enCm} × ${ozet.boyCm} cm`],
    ['LED Uzunluğu', `${ozet.ledCm} cm`],
    ['Renk', design.ledTipi === 'rgb' ? 'RGB (çok renkli)' : 'Tek renk'],
    ['Zemin', ozet.zeminAd],
    ['Mekan', design.disMekan ? 'Dış mekan' : 'İç mekan'],
  ];
  for (const [k, v] of satirlar) {
    x.fillStyle = '#8b93b0'; x.fillText(k, 60, yy);
    x.fillStyle = '#0c0e16'; x.fillText(String(v), 400, yy);
    yy += 42;
  }

  // Fiyat kutusu
  const fx = 60, fw = W - 120, fy = H - 270, fh = 150;
  x.fillStyle = '#f0fbf8'; roundRect(x, fx, fy, fw, fh, 16); x.fill();
  x.strokeStyle = '#22e3c3'; x.lineWidth = 2; roundRect(x, fx, fy, fw, fh, 16); x.stroke();
  x.fillStyle = '#0c0e16'; x.font = 'bold 30px Arial'; x.fillText('TEKLİF FİYATI', fx + 30, fy + 60);
  x.fillStyle = '#0f9c86'; x.font = 'bold 62px Arial'; x.textAlign = 'right';
  x.fillText(tl(ozet.satis), fx + fw - 30, fy + 92); x.textAlign = 'left';

  // Not
  x.fillStyle = '#8b93b0'; x.font = '20px Arial';
  x.fillText(firma.not || '', 60, H - 70);

  const doc = new jsPDF({ unit: 'px', format: [W, H], hotfixes: ['px_scaling'] });
  doc.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H);
  const dosya = ('Teklif_' + (design.metin || 'neon')).replace(/[\n\r]/g, ' ').replace(/[^\wğüşıöçĞÜŞİÖÇ .-]/g, '').trim().slice(0, 40) + '.pdf';
  doc.save(dosya);
}
