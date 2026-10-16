import React, { useEffect, useRef, useState } from 'react';
import { X, Share2, Download, Palette, Sparkles, Check, Heart } from 'lucide-react';
import { APP_NAME } from '../config/constants';

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMother: boolean;
  week: number;
  fruit?: string;
  emoji?: string;
  size?: string;
  daysRemaining?: number;
  babyName?: string;
  babyMilestone?: string;
}

type ColorTheme = 'rose' | 'sage' | 'night';

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  onClose,
  isMother,
  week,
  fruit = 'Maçã',
  emoji = '🍎',
  size = '10 cm',
  daysRemaining = 140,
  babyName = '',
  babyMilestone = 'Sorrisos e descobertas a cada olhar',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<ColorTheme>('rose');
  const [customName, setCustomName] = useState<string>(babyName || '');
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Render to 1080x1920 canvas
  const renderCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Palette themes
    let bgGradStart = '#FBF3EF';
    let bgGradEnd = '#F3D6CB';
    let circleBg = '#FFFFFF';
    let primaryText = '#8C4A3C';
    let secondaryText = '#3D3230';
    let accentBadge = '#8C4A3C';
    let badgeText = '#FFFFFF';
    let decorCircle1 = 'rgba(140, 74, 60, 0.08)';
    let decorCircle2 = 'rgba(243, 214, 203, 0.35)';

    if (theme === 'sage') {
      bgGradStart = '#F8FAF7';
      bgGradEnd = '#EEF3EA';
      circleBg = '#FFFFFF';
      primaryText = '#4A5B40';
      secondaryText = '#2C3527';
      accentBadge = '#6F7F62';
      badgeText = '#FFFFFF';
      decorCircle1 = 'rgba(111, 127, 98, 0.12)';
      decorCircle2 = 'rgba(238, 243, 234, 0.6)';
    } else if (theme === 'night') {
      bgGradStart = '#1D1716';
      bgGradEnd = '#2E2220';
      circleBg = '#362927';
      primaryText = '#F3D6CB';
      secondaryText = '#EADBDA';
      accentBadge = '#8C4A3C';
      badgeText = '#FFFFFF';
      decorCircle1 = 'rgba(243, 214, 203, 0.06)';
      decorCircle2 = 'rgba(140, 74, 60, 0.15)';
    }

    // 1. Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, bgGradStart);
    bgGrad.addColorStop(1, bgGradEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Organic Decorative Elements
    ctx.fillStyle = decorCircle2;
    ctx.beginPath();
    ctx.arc(150, 250, 420, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = decorCircle1;
    ctx.beginPath();
    ctx.arc(950, 1600, 520, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = decorCircle2;
    ctx.beginPath();
    ctx.arc(1000, 300, 300, 0, Math.PI * 2);
    ctx.fill();

    // 3. Top Decorative Tag
    const tagText = isMother ? 'NINHO DE AMOR' : 'A JORNADA DA VIDA';
    ctx.textAlign = 'center';
    ctx.font = '600 32px Inter, sans-serif';
    ctx.fillStyle = primaryText;
    ctx.letterSpacing = '6px';
    ctx.fillText(tagText, width / 2, 280);
    ctx.letterSpacing = '0px';

    // 4. Center Circle for Emoji
    const circleX = width / 2;
    const circleY = 620;
    const circleR = 210;

    // Outer soft ring
    ctx.strokeStyle = decorCircle1;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR + 24, 0, Math.PI * 2);
    ctx.stroke();

    // Solid inner circle
    ctx.fillStyle = circleBg;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Emoji in center
    ctx.font = '160px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isMother ? '👶' : emoji, circleX, circleY + 8);
    ctx.textBaseline = 'alphabetic';

    // 5. Week Title in Big Fraunces Font
    ctx.font = 'bold 118px Fraunces, Georgia, serif';
    ctx.fillStyle = primaryText;
    const weekTitle = `Semana ${week}`;
    ctx.fillText(weekTitle, width / 2, 980);

    // 6. Subtitle / Details
    if (!isMother) {
      // Pregnancy Content
      const displayName = customName.trim() ? customName.trim() : 'Meu bebê';
      ctx.font = '500 48px Inter, sans-serif';
      ctx.fillStyle = secondaryText;
      ctx.fillText(`${displayName} está do tamanho de`, width / 2, 1070);

      ctx.font = 'bold 58px Fraunces, Georgia, serif';
      ctx.fillStyle = primaryText;
      ctx.fillText(`uma ${fruit}`, width / 2, 1150);

      if (size) {
        ctx.font = '400 36px Inter, sans-serif';
        ctx.fillStyle = secondaryText;
        ctx.fillText(`(aprox. ${size})`, width / 2, 1215);
      }

      // Countdown Pill
      if (daysRemaining > 0) {
        const pillY = 1330;
        const pillW = 480;
        const pillH = 100;
        const pillX = (width - pillW) / 2;

        ctx.fillStyle = circleBg;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
        ctx.shadowBlur = 20;
        roundRect(ctx, pillX, pillY, pillW, pillH, 50);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.font = '600 40px Inter, sans-serif';
        ctx.fillStyle = primaryText;
        ctx.fillText(`⏳ Faltam ${daysRemaining} dias`, width / 2, pillY + 65);
      }
    } else {
      // Mother / Baby Content
      const displayName = customName.trim() ? customName.trim() : 'Meu pequeno amor';
      ctx.font = '500 52px Inter, sans-serif';
      ctx.fillStyle = secondaryText;
      ctx.fillText(`${displayName} tem`, width / 2, 1070);

      ctx.font = 'bold 70px Fraunces, Georgia, serif';
      ctx.fillStyle = primaryText;
      ctx.fillText(`${week} semanas`, width / 2, 1160);

      // Milestone Card
      const cardY = 1260;
      const cardW = 820;
      const cardH = 180;
      const cardX = (width - cardW) / 2;

      ctx.fillStyle = circleBg;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = 25;
      roundRect(ctx, cardX, cardY, cardW, cardH, 36);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.font = '400 36px Inter, sans-serif';
      ctx.fillStyle = secondaryText;
      wrapText(ctx, `✨ ${babyMilestone}`, width / 2, cardY + 75, 740, 48);
    }

    // 7. Footer Branding
    const footerY = 1750;
    // Tiny brand icon
    ctx.fillStyle = accentBadge;
    ctx.beginPath();
    ctx.arc(width / 2 - 160, footerY - 14, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 44px Fraunces, Georgia, serif';
    ctx.fillStyle = primaryText;
    ctx.textAlign = 'left';
    ctx.fillText(APP_NAME, width / 2 - 120, footerY);

    ctx.textAlign = 'center';
    ctx.font = '400 28px Inter, sans-serif';
    ctx.fillStyle = secondaryText;
    ctx.fillText('Comunidade e Acolhimento Materno', width / 2, footerY + 50);

    // Save image to state
    setGeneratedDataUrl(canvas.toDataURL('image/png'));
  };

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderCard();
      }, 50);
    }
  }, [isOpen, theme, customName, week, fruit, emoji, size, daysRemaining]);

  if (!isOpen) return null;

  // Actions
  const handleSaveImage = () => {
    if (!generatedDataUrl) return;
    const a = document.createElement('a');
    a.href = generatedDataUrl;
    a.download = `colo-de-mae-semana-${week}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          handleSaveImage();
          setIsSharing(false);
          return;
        }

        const file = new File([blob], `semana-${week}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Semana ${week} — ${APP_NAME}`,
            text: isMother
              ? `Celebrando ${week} semanas de vida com amor!`
              : `Meu bebê está na semana ${week} do tamanho de uma ${fruit}!`,
            files: [file],
          });
        } else {
          // Fallback to downloading image
          handleSaveImage();
        }
        setIsSharing(false);
      }, 'image/png');
    } catch {
      handleSaveImage();
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-5 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
              Cartão da Semana (Stories)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 dark:text-[#D1C2BE] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden high-res canvas (1080x1920) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview image */}
        <div className="relative mx-auto w-48 sm:w-56 aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-[#382C29] mb-4 bg-neutral-100 flex items-center justify-center">
          {generatedDataUrl ? (
            <img
              src={generatedDataUrl}
              alt="Prévia do Cartão da Semana"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-neutral-400">Gerando imagem...</span>
          )}
        </div>

        {/* Color Theme Selector (3 Styles: Rosé, Sálvia, Noite) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#8C4A3C]" />
            <span>Escolha o estilo de cor:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTheme('rose')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                theme === 'rose'
                  ? 'bg-[#FBEFEA] dark:bg-[#342421] border-[#8C4A3C] text-[#8C4A3C] dark:text-[#F3D6CB]'
                  : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230]/75 dark:text-[#D1C2BE]'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#8C4A3C]" />
              <span>Rosé</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('sage')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                theme === 'sage'
                  ? 'bg-[#EEF3EA] dark:bg-[#20291D] border-[#6F7F62] text-[#435139] dark:text-[#C5D6BF]'
                  : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230]/75 dark:text-[#D1C2BE]'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#6F7F62]" />
              <span>Sálvia</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('night')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                theme === 'night'
                  ? 'bg-[#251E1C] border-[#F3D6CB] text-[#F3D6CB]'
                  : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230]/75 dark:text-[#D1C2BE]'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#2E2220]" />
              <span>Noite</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Name (defaulting to anonymous) */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-[#3D3230]/80 dark:text-[#E0D0CC] mb-1">
            Nome no cartão (opcional, padrão anônimo):
          </label>
          <input
            type="text"
            maxLength={25}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={isMother ? 'Ex: Theo, Alice...' : 'Ex: Meu bebê, Nosso pacotinho...'}
            className="w-full px-3.5 py-2 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="py-3 px-3 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>

          <button
            type="button"
            onClick={handleSaveImage}
            className="py-3 px-3 rounded-2xl bg-white dark:bg-[#1E1817] hover:bg-[#FBEFEA] dark:hover:bg-[#2D2321] border border-[#F3D6CB] dark:border-[#422C28] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Salvar imagem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
