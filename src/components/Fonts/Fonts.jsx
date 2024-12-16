export function Title({ textTitle, styles }) {
  return (
    <h1 className={`font-inter font-semibold text-greyTrans text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] ${styles}`}>
      {textTitle}
    </h1>
  );
}

export function Paragraph({ textParagraph, styles }) {
  return (
    <p className={`font-inter font-regular text-greyTrans text-[14px] sm:text-[16px] md:text-[18px]  ${styles}`}>
      {textParagraph}
    </p>
  );
}

export function ParagraphOrange({ textParagraph }) {
  return (
    <p className="font-inter font-semibold text-orangeTrans text-[14px] sm:text-[16px] md:text-[18px]">
      {textParagraph}
    </p>
  );
}

export function ParagraphTranscrito({ textParagraph }) {
  // Condicional para escolher a cor
  const textColor = textParagraph === 'Transcrito' ? 'text-greenG' : 'text-blueG';

  return (
    <p className={`font-inter font-semibold text-[14px] sm:text-[16px] md:text-[18px] ${textColor}`}>
      {textParagraph}
    </p>
  );
}

export function SubTitle({ textSubtitle,styles }) {
  return (
    <p className={`text-[13px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-roboto font-bold text-greyTrans ${styles}`}>
      {textSubtitle}
    </p>
  );
}
