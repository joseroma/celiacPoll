"""
Idealista property scraper (Scrapy + rotating proxies + UA rotation)
====================================================================
Adaptado de David-Carrasco/Scrapy-Idealista para paginas individuales
(/inmueble/NNNNNNN/) en lugar de listados.

Uso:
    pip install -r requirements.txt
    python scrape_py.py https://www.idealista.com/inmueble/111008988/

Salida: property.json (mismo formato que el scraper Node)

Notas importantes:
- Desde IPs cloud (AWS/GCP/Docker) Idealista bloquea con DataDome (HTTP 403).
- Desde tu IP residencial suele pasar al primer intento.
- Si te bloquea, anyade proxies residenciales en proxies_list (formato
  http://user:pass@ip:puerto) o usa el scraper Node con captcha manual.
"""

import json
import re
import sys
import random
from pathlib import Path

import scrapy
from scrapy.crawler import CrawlerProcess


# ----------------------------------------------------------------------
# Configura aqui tus proxies residenciales si tienes (opcional)
# ----------------------------------------------------------------------
PROXIES_LIST = [
    # 'http://user:pass@proxy1.example.com:8000',
    # 'http://user:pass@proxy2.example.com:8000',
]

USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
]


def parse_int(text):
    if not text:
        return None
    m = re.search(r'[\d.]+', text.replace('.', ''))
    return int(m.group(0)) if m else None


def parse_float(text):
    if not text:
        return None
    cleaned = text.replace('.', '').replace(',', '.')
    m = re.search(r'\d+(?:\.\d+)?', cleaned)
    return float(m.group(0)) if m else None


class IdealistaPropertySpider(scrapy.Spider):
    name = "idealista_property"

    custom_settings = {
        'USER_AGENT': random.choice(USER_AGENTS),
        'DEFAULT_REQUEST_HEADERS': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        },
        'DOWNLOAD_DELAY': 2,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
        'CONCURRENT_REQUESTS': 1,
        'RETRY_TIMES': 3,
        'RETRY_HTTP_CODES': [403, 429, 500, 502, 503, 504],
        'LOG_LEVEL': 'INFO',
    }

    def __init__(self, url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not url or '/inmueble/' not in url:
            raise ValueError("Necesitas pasar una URL de /inmueble/")
        self.start_urls = [url]
        if PROXIES_LIST:
            self.custom_settings['ROTATING_PROXY_LIST'] = PROXIES_LIST
            self.custom_settings['DOWNLOADER_MIDDLEWARES'] = {
                'rotating_proxies.middlewares.RotatingProxyMiddleware': 610,
                'rotating_proxies.middlewares.BanDetectionMiddleware': 620,
            }

    def parse(self, response):
        if response.status == 403:
            self.logger.error("HTTP 403 — DataDome te ha bloqueado. Cambia de IP o usa proxy residencial.")
            return

        def t(sel):
            r = response.css(sel + '::text').get()
            return r.strip() if r else None

        def t_all(sel):
            return [x.strip() for x in response.css(sel + '::text').getall() if x.strip()]

        title = t('.main-info__title-main') or t('h1')
        location = t('.main-info__title-minor')
        price_txt = t('.info-data-price')
        price = parse_int(price_txt)

        features_main = t_all('.info-features span')
        features_all = t_all('.details-property-feature-one li')
        features_more = t_all('.details-property-feature-two li')
        bullets = features_main + features_all + features_more

        # Inicializar
        built = usable = plot = year = bedrooms = bathrooms = None
        pool = parking = terrace = storage = False
        energy = floor = None

        for s in bullets:
            lo = s.lower()
            if 'construidos' in lo:
                m = re.search(r'(\d[\d.]*)\s*m', s)
                if m: built = parse_float(m.group(1))
            elif ('útiles' in lo) or ('utiles' in lo):
                m = re.search(r'(\d[\d.]*)\s*m', s)
                if m: usable = parse_float(m.group(1))
            elif 'parcela' in lo or 'terreno' in lo:
                m = re.search(r'(\d[\d.]*)\s*m', s)
                if m: plot = parse_float(m.group(1))
            elif built is None:
                m = re.match(r'^(\d[\d.]*)\s*m²', s)
                if m: built = parse_float(m.group(1))

            m = re.search(r'(\d+)\s*habitaci', s, re.I)
            if m: bedrooms = int(m.group(1))
            m = re.search(r'(\d+)\s*baño', s, re.I)
            if m: bathrooms = int(m.group(1))
            m = re.search(r'construido en (\d{4})', s, re.I)
            if m: year = int(m.group(1))
            if not year:
                m = re.search(r'(\d{4})\s*año', s, re.I)
                if m: year = int(m.group(1))
            if re.search(r'garaje|parking|plaza', s, re.I): parking = True
            if re.search(r'piscina', s, re.I): pool = True
            if re.search(r'terraza|balcón|balcon', s, re.I): terrace = True
            if re.search(r'trastero', s, re.I): storage = True
            m = re.search(r'energético[:\s]*([A-G])', s, re.I)
            if m: energy = m.group(1)
            m = re.search(r'planta\s+(\d+|bajo|baja|ático|atico)', s, re.I)
            if m: floor = m.group(0)

        desc = ' '.join(t_all('.comment .adCommentsLanguage p')) or t('div.comment p')
        ref_txt = t('p.txt-ref')
        reference = re.sub(r'\D', '', ref_txt) if ref_txt else None

        type_txt = (title or '') + ' ' + ' '.join(bullets)
        type_txt_lo = type_txt.lower()
        if re.search(r'villa|chalet independiente', type_txt_lo): type_ = 'Chalet independiente / Villa'
        elif re.search(r'chalet adosado|chalet pareado', type_txt_lo): type_ = 'Chalet adosado/pareado'
        elif re.search(r'ático|atico', type_txt_lo): type_ = 'Ático'
        elif re.search(r'piso|apartamento', type_txt_lo): type_ = 'Piso/apartamento'
        elif re.search(r'casa', type_txt_lo): type_ = 'Casa'
        else: type_ = 'Desconocido'

        if re.search(r'a estrenar|obra nueva', type_txt_lo): state = 'Obra nueva / a estrenar'
        elif re.search(r'reformado|reformada', type_txt_lo): state = 'Buen estado / reformado'
        elif re.search(r'para reformar', type_txt_lo): state = 'A reformar'
        else: state = 'Buen estado'

        data = {
            'reference': reference,
            'url': response.url,
            'title': title,
            'location': location,
            'type': type_,
            'state': state,
            'price': price,
            'priceText': price_txt,
            'pricePerM2': round(price / built) if (price and built) else None,
            'builtArea': built,
            'usableArea': usable,
            'plotArea': plot,
            'bedrooms': bedrooms,
            'bathrooms': bathrooms,
            'yearBuilt': year,
            'pool': pool,
            'parking': parking,
            'terrace': terrace,
            'storage': storage,
            'energyCert': energy,
            'floor': floor,
            'features': bullets,
            'description': desc,
        }

        out = Path(__file__).parent / 'property.json'
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

        print("\n──────── RESUMEN ────────")
        print(f"  Tipo:       {type_}")
        print(f"  Estado:     {state}")
        print(f"  Precio:     {price:,} €" if price else "  Precio:     ?")
        print(f"  Construido: {built} m² (útiles {usable}, parcela {plot})")
        if price and built:
            print(f"  €/m²:       {round(price / built):,}")
        print(f"  Hab/Baños:  {bedrooms} / {bathrooms}")
        print(f"  Año:        {year}")
        extras = [x for x, ok in [('piscina', pool), ('garaje', parking),
                                  ('terraza', terrace), ('trastero', storage)] if ok]
        print(f"  Extras:     {', '.join(extras) or '—'}")
        print(f"  Cert. en.:  {energy}")
        print("─────────────────────────")
        print(f"→ Guardado en {out}\n")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python scrape_py.py https://www.idealista.com/inmueble/XXXXXXXX/")
        sys.exit(1)

    process = CrawlerProcess()
    process.crawl(IdealistaPropertySpider, url=sys.argv[1])
    process.start()
