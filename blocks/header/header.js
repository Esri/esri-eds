import {
  getMetadata,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';
import { link, script } from '../../scripts/dom-helpers.js';

/**
  * Use getMetadata to get the locale of the page
  * * Update the html lang attribute to the locale
  * If the language is Arabic, Hebrew or Kuwaiti Arabic, set the direction to rtl
  */
function setLocaleAndDirection() {
  const locale = getMetadata('og:locale') || 'en-us';
  const dir = (locale === 'ar-sa' || locale === 'he-il' || locale === 'ar-kw') ? 'rtl' : 'ltr';
  document.querySelector('html').setAttribute('dir', dir);

  const lang = (locale === 'en-us') ? 'en' : locale;
  document.querySelector('html').setAttribute('lang', lang);
}

/**
 * get all entries from the index
 * create alternate langauge links for each entry
 */
async function alternateHeaders() {
  // get current page url, parse and remove the protocol and domain
  const url = window.location.href;
  const origin = '/en-us';
  const path = url.replace(window.location.origin, '');
  // parse path to remove the /xx-xx/ from the beginning
  const pathArray = path.split('/');
  const pathArrayLength = pathArray.length;
  let pathArrayString = '';

  for (let i = 0; i < pathArrayLength; i += 1) {
    if (i !== 1 || !/^[a-z]{2}-[a-z]{2}$/.test(pathArray[i])) {
      if (pathArray[i] !== '') {
        pathArrayString += `/${pathArray[i]}`;
      }
    }
  }

  const entries = await ffetch('/query-index.json')
    .all();

  const head = document.querySelector('head');
  entries
    .map((entry) => {
      if (entry.path.includes(pathArrayString)) {
        const match = entry.path.match(/^\/([a-z]{2}-[a-z]{2})\//);
        if (match) {
          return [entry, match[1]];
        }
      }

      return null;
    })
    .filter((entry) => entry !== null)
    .forEach(([entry, hreflang]) => {
      // <link rel="alternate" hreflang="en" href="https://www.example.com/en/page.html" />
      // create alternate links for all matching entries
      head.appendChild(link({
        rel: 'alternate',
        hreflang,
        href: window.location.origin + entry.path,
      }));
    });

  // add x-default alternate link
  const xDefaultLink = document.createElement('link');
  xDefaultLink.rel = 'alternate';
  xDefaultLink.hreflang = 'x-default';
  xDefaultLink.setAttribute('href', window.location.origin + origin + pathArrayString);
  head.appendChild(xDefaultLink);
}

function createBreadcrumbs() {
  const breadcrumbsDictionary = {
    About: '/about/about-esri/overview',
    Capabilities: '/arcgis/geospatial-platform/overview',
    'Capabilities,3D GIS': '/capabilities/3d-gis/overview',
    'Capabilities,Field Operations': '/capabilities/field-operations/overview',
    'Capabilities,GeoAI': '/capabilities/geoai/overview',
    'Capabilities,Imagery and Remote Sensing': '/capabilities/imagery-remote-sensing/overview',
    'Capabilities,Indoor GIS': '/capabilities/indoor-gis/overview',
    'Capabilities,Mapping': '/capabilities/mapping/overview',
    'Capabilities,Real-Time Visualization and Analytics': '/capabilities/real-time/overview',
    'Capabilities,Spatial Analytics and Data Science': '/capabilities/spatial-analytics-data-science/overview',
    'Artificial Intelligence': '/artificial-intelligence/overview',
    'Digital Transformation': '/digital-transformation/overview',
    'Digital Twin': '/digital-twin/overview',
    'Location Intelligence': '/location-intelligence/overview',
    'About,À propos d’Esri,Europe': '/about/about-esri/europe',
    Fonctionnalités: '/arcgis/geospatial-platform/overview',
    'Fonctionnalités,SIG 3D': '/capabilities/3d-gis/overview',
    'Fonctionnalités,Opérations sur le terrain': '/capabilities/field-operations/overview',
    'Fonctionnalités,GeoAI': '/capabilities/geoai/overview',
    'Fonctionnalités,Imagerie et télédétection': '/capabilities/imagery-remote-sensing/overview',
    'Fonctionnalités,SIG Indoor': '/capabilities/indoor-gis/overview',
    'Fonctionnalités,Mapping': '/capabilities/mapping/overview',
    'Fonctionnalités,Visualisation et analyse en temps réel': '/capabilities/real-time/overview',
    'Fonctionnalités,Analyse spatiale et Data Science': '/capabilities/spatial-analytics-data-science/overview',
    'Intelligence artificielle': '/artificial-intelligence',
    'Transformation numérique': '/digital-transformation/overview',
    'Intelligence géographique': '/location-intelligence/overview',
    'About,关于 Esri,Europe': '/about/about-esri/europe',
    功能: '/arcgis/geospatial-platform/overview',
    '功能,3D GIS': '/capabilities/3d-gis/overview',
    '功能,外业操作': '/capabilities/field-operations/overview',
    '功能,GeoAI': '/capabilities/geoai/overview',
    '功能,影像和遥感': '/capabilities/imagery-remote-sensing/overview',
    '功能,室内 GIS': '/capabilities/indoor-gis/overview',
    '功能,制图': '/capabilities/mapping/overview',
    '功能,实时可视化和分析': '/capabilities/real-time/overview',
    '功能,空间分析和数据科学': '/capabilities/spatial-analytics-data-science/overview',
    人工智能: '/artificial-intelligence',
    数字化转型: '/digital-transformation/overview',
    位置智能: '/location-intelligence/overview',
    'About,Esri について,Europe': '/about/about-esri/europe',
    機能: '/arcgis/geospatial-platform/overview',
    '機能,3D GIS': '/capabilities/3d-gis/overview',
    '機能,現場作業': '/capabilities/field-operations/overview',
    '機能,GeoAI': '/capabilities/geoai/overview',
    '機能,画像およびリモート センシング': '/capabilities/imagery-remote-sensing/overview',
    '機能,Indoor GIS': '/capabilities/indoor-gis/overview',
    '機能,Mapping': '/capabilities/mapping/overview',
    '機能,リアルタイムのビジュアライゼーションと解析': '/capabilities/real-time/overview',
    '機能,空間解析とデータ サイエンス': '/capabilities/spatial-analytics-data-science/overview',
    '人工知能 (AI)': '/artificial-intelligence',
    'デジタル トランスフォーメーション': '/digital-transformation/overview',
    'ロケーション インテリジェンス': '/location-intelligence/overview',
    'About,Acerca de Esri,Europe': '/about/about-esri/europe',
    Capacidades: '/arcgis/geospatial-platform/overview',
    'Capacidades,SIG 3D': '/capabilities/3d-gis/overview',
    'Capacidades,Operaciones de campo': '/capabilities/field-operations/overview',
    'Capacidades,GeoAI': '/capabilities/geoai/overview',
    'Capacidades,Imágenes y teledetección': '/capabilities/imagery-remote-sensing/overview',
    'Capacidades,SIG en interiores': '/capabilities/indoor-gis/overview',
    'Capacidades,Representación cartográfica': '/capabilities/mapping/overview',
    'Capacidades,Visualización y análisis en tiempo real': '/capabilities/real-time/overview',
    'Capacidades,Análisis espacial y ciencia de datos': '/capabilities/spatial-analytics-data-science/overview',
    'Inteligencia artificial': '/artificial-intelligence',
    'Transformación digital': '/digital-transformation/overview',
    'Inteligencia de ubicación': '/location-intelligence/overview',
    'About,Об Esri': '/about/about-esri/overview',
    'About,Об Esri,Europe': '/about/about-esri/europe',
    Возможности: '/arcgis/geospatial-platform/overview',
    'Возможности,3D-ГИС': '/capabilities/3d-gis/overview',
    'Возможности,Полевые операции': '/capabilities/field-operations/overview',
    'Возможности,GeoAI': '/capabilities/geoai/overview',
    'Возможности,Данные дистанционного зондирования и изображения': '/capabilities/imagery-remote-sensing/overview',
    'Возможности,ГИС внутри помещений': '/capabilities/indoor-gis/overview',
    'Возможности,Картография': '/capabilities/mapping/overview',
    'Возможности,Визуализация данных в реальном времени и аналитика': '/capabilities/real-time/overview',
    'Возможности,Пространственная аналитика и Наука о данных': '/capabilities/spatial-analytics-data-science/overview',
    'Искусственный интеллект': '/artificial-intelligence',
    'Цифровое преобразование': '/digital-transformation/overview',
    'Аналитика, основанная на местоположении': '/location-intelligence/overview',
    'About,Über Esri,Europe': '/about/about-esri/europe',
    Funktionen: '/arcgis/geospatial-platform/overview',
    'Funktionen,3D-GIS': '/capabilities/3d-gis/overview',
    'Funktionen,Außendienst': '/capabilities/field-operations/overview',
    'Funktionen,GeoAI': '/capabilities/geoai/overview',
    'Funktionen,Bilddaten und Fernerkundung': '/capabilities/imagery-remote-sensing/overview',
    'Funktionen,Indoor-GIS': '/capabilities/indoor-gis/overview',
    'Funktionen,Kartenerstellung': '/capabilities/mapping/overview',
    'Funktionen,Visualisierung und Analysen in Echtzeit': '/capabilities/real-time/overview',
    'Funktionen,Räumliche Analyse und Data Science': '/capabilities/spatial-analytics-data-science/overview',
    'Künstliche Intelligenz': '/artificial-intelligence',
    'Digitale Transformation': '/digital-transformation/overview',
    'About,نبذة عن Esri,Europe': '/about/about-esri/europe',
    الإمكانات: '/arcgis/geospatial-platform/overview',
    'الإمكانات,نظم معلومات جغرافية ثلاثية الأبعاد': '/capabilities/3d-gis/overview',
    'الإمكانات,العمليات الميدانية': '/capabilities/field-operations/overview',
    'الإمكانات,GeoAI': '/capabilities/geoai/overview',
    'الإمكانات,الصور والاستشعار عن بعد': '/capabilities/imagery-remote-sensing/overview',
    'الإمكانات,Indoor GIS': '/capabilities/indoor-gis/overview',
    'الإمكانات,تخطيط': '/capabilities/mapping/overview',
    'الإمكانات,تصورات وتحليلات في الوقت الحقيقي': '/capabilities/real-time/overview',
    'الإمكانات,التحليلات المكانية وعلوم البيانات': '/capabilities/spatial-analytics-data-science/overview',
    'الذكاء الاصطناعي': '/artificial-intelligence/overview',
    'ذكاء الموقع': '/location-intelligence/overview',
    'About,Informazioni su Esri,Europa': '/about/about-esri/europe',
    Funzionalità: '/arcgis/geospatial-platform/overview',
    'Funzionalità,GIS 3D': '/capabilities/3d-gis/overview',
    'Funzionalità,Operazioni sul campo': '/capabilities/field-operations/overview',
    'Funzionalità,GeoAI': '/capabilities/geoai/overview',
    'Funzionalità,Immagini e telerilevamento': '/capabilities/imagery-remote-sensing/overview',
    'Funzionalità,GIS per spazi interni': '/capabilities/indoor-gis/overview',
    'Funzionalità,Mappatura': '/capabilities/mapping/overview',
    'Funzionalità,Visualizzazione in tempo reale a analisi': '/capabilities/real-time/overview',
    'Funzionalità,Analisi spaziale e scienza dei dati': '/capabilities/spatial-analytics-data-science/overview',
    'Intelligenza artificiale': '/artificial-intelligence/overview',
    'About,Esri 정보,Europe': '/about/about-esri/europe',
    기능: '/arcgis/geospatial-platform/overview',
    '기능,3D GIS': '/capabilities/3d-gis/overview',
    '기능,현장 작업': '/capabilities/field-operations/overview',
    '기능,GeoAI': '/capabilities/geoai/overview',
    '기능,영상 및 원격탐사': '/capabilities/imagery-remote-sensing/overview',
    '기능,Indoor GIS': '/capabilities/indoor-gis/overview',
    '기능,매핑': '/capabilities/mapping/overview',
    '기능,실시간 시각화 및 분석': '/capabilities/real-time/overview',
    '기능,공간 분석 및 데이터 사이언스': '/capabilities/spatial-analytics-data-science/overview',
    '인공 지능': '/artificial-intelligence/overview',
    '로케이션 인텔리전스': '/location-intelligence/overview',
    'About,O firmie Esri,Europe': '/about/about-esri/europe',
    Funkcje: '/arcgis/geospatial-platform/overview',
    'Funkcje,3D GIS': '/capabilities/3d-gis/overview',
    'Funkcje,Prace w terenie': '/capabilities/field-operations/overview',
    'Funkcje,GeoAI': '/capabilities/geoai/overview',
    'Funkcje,Zobrazowania i teledetekcja': '/capabilities/imagery-remote-sensing/overview',
    'Funkcje,System GIS dla wnętrz': '/capabilities/indoor-gis/overview',
    'Funkcje,Tworzenie map': '/capabilities/mapping/overview',
    'Funkcje,Analizy i wizualizacje w czasie rzeczywistym': '/capabilities/real-time/overview',
    'Funkcje,Analizy przestrzenne i naukowa analiza danych': '/capabilities/spatial-analytics-data-science/overview',
    'Sztuczna inteligencja': '/artificial-intelligence/overview',
    'Inteligentna geolokalizacja': '/location-intelligence/overview',
    'About,Sobre a Esri,Europa': '/about/about-esri/europe',
    Recursos: '/arcgis/geospatial-platform/overview',
    'Recursos,3D GIS': '/capabilities/3d-gis/overview',
    'Recursos,Operações de Campo': '/capabilities/field-operations/overview',
    'Recursos,GeoAI': '/capabilities/geoai/overview',
    'Recursos,Imagens e Sensoriamento Remoto': '/capabilities/imagery-remote-sensing/overview',
    'Recursos,Indoor GIS': '/capabilities/indoor-gis/overview',
    'Recursos,Mapeamento': '/capabilities/mapping/overview',
    'Recursos,Análise e Visualização em Tempo Real': '/capabilities/real-time/overview',
    'Recursos,Análise Espacial e Ciência de Dados': '/capabilities/spatial-analytics-data-science/overview',
    'Inteligência Artificial': '/artificial-intelligence/overview',
    'Inteligência de Localização': '/location-intelligence/overview',
  };

  const breadcrumbs = getMetadata('breadcrumbs')
    .split(',')
    .map((breadcrumb) => breadcrumb.trim());

  const urlSegments = window.location.pathname.split('/').slice(2);

  const language = getMetadata('og:locale');

  const urlPrefix = `/${language}`;
  let accUrl = '';
  const accBreadcrumbs = [];

  let lastBreadcrumbsDictionaryElement;
  const breadcrumbsSchema = breadcrumbs.map((breadcrumb, index) => {
    accUrl += `/${urlSegments[index]}`;
    accBreadcrumbs.push(breadcrumb);

    const breadcrumbsDictionaryElement = breadcrumbsDictionary[accBreadcrumbs.join(',')];

    let breadcrumbsSchemaUrl = accUrl;
    if (breadcrumbsDictionaryElement) {
      lastBreadcrumbsDictionaryElement = breadcrumbsDictionaryElement;
      breadcrumbsSchemaUrl = breadcrumbsDictionaryElement;
    } else if (lastBreadcrumbsDictionaryElement) {
      breadcrumbsSchemaUrl = lastBreadcrumbsDictionaryElement;
    }
    const position = index + 1;
    return {
      '@type': 'ListItem',
      position,
      name: breadcrumb,
      item: urlPrefix + breadcrumbsSchemaUrl,
    };
  });

  document.head.appendChild(script(
    {
      type: 'application/ld+json',
      id: 'breadcrumbs',
    },
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbsSchema,
    }),
  ));
}

function createSchema() {
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    name: document.title,
    sourceOrganization: {
      '@type': 'Organization',
      name: 'Esri',
    },
    url: document.querySelector('link[rel="canonical"]').href,
    image: getMetadata('og:image'),
    inLanguage: {
      '@type': 'Language',
      name: getMetadata('og:locale'),
    },
    description: document.querySelector('meta[name="description"]').content,
  };

  const jsonElement = document.createElement('script');
  jsonElement.type = 'application/ld+json';
  jsonElement.classList.add('schema-graph');

  jsonElement.innerHTML = JSON.stringify(schema);
  document.head.appendChild(jsonElement);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate() {
  createSchema();
  createBreadcrumbs();
  setLocaleAndDirection();
  await alternateHeaders()
    .then(async () => {
      window.gnav_jsonPath = '/2022-nav-config.25.json';
      await Promise.all([
        loadScript('https://webapps-cdn.esri.com/CDN/components/global-nav/js/gn.js'),
        loadCSS('https://webapps-cdn.esri.com/CDN/components/global-nav/css/gn.css'),
      ]);
    });
}
