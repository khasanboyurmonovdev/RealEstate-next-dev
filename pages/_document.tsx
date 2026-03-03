import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap"
					rel="stylesheet"
				/>
				<title>Ijaraly — Uzbekistondagi ishonchli ko'chmas mulk platformasi</title>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/ijaraly_logo.svg" />
				<link rel="canonical" href="https://ijaraly.uz" />

				{/* Yandex.Metrica */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(${process.env.NEXT_PUBLIC_YANDEX_METRICA_ID || '99999999'}, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    `,
					}}
				/>

				{/* SEO */}
				<meta
					name="keyword"
					content="ijaraly, Tashkent, Uzbekistan, ijaraga uy, kvartira, ko'chmas mulk, недвижимость Ташкент, аренда квартир"
				/>
				<meta
					name="description"
					content="Ijaraly — Uzbekistan's most trusted property platform. Rent, buy and sell verified properties in Tashkent and across Uzbekistan. | Ijaraly — самая надёжная платформа недвижимости в Узбекистане. Аренда, покупка и продажа проверенных объектов в Ташкенте. | Ijaraly — O'zbekistondagi eng ishonchli ko'chmas mulk platformasi. Toshkent va butun O'zbekistonda tasdiqlangan mulklarni ijara oling, sotib oling."
				/>

				{/* Open Graph */}
				<meta property="og:title" content="Ijaraly — Uzbekistan's Trusted Property Platform" />
				<meta property="og:description" content="Rent, buy and sell verified properties in Uzbekistan" />
				<meta property="og:image" content="https://ijaraly.uz/img/logo/ijaraly2.png" />
				<meta property="og:url" content="https://ijaraly.uz" />
				<meta property="og:type" content="website" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
