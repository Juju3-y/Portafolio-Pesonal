import { datos } from "./datos.js";

const app = document.getElementById("app");
const aviso = document.getElementById("aviso");
const { jsPDF } = window.jspdf;

const navItems = [
  ["#sobre-mi", "Sobre mí"],
  ["#experiencia", "Experiencia"],
  ["#proyectos", "Proyectos"],
  ["#educacion", "Educación"],
  ["#habilidades", "Habilidades"],
  ["#certificaciones", "Certificaciones"],
  ["#contacto", "Contacto"],
];

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") {
      n.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      n.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return n;
}

function grupoCV(compacto = false) {
  const claseDiseno = compacto ? "btn btn-cv" : "btn btn-principal";
  const claseATS = compacto ? "btn btn-cv btn-cv-alt" : "btn btn-secundario";
  return el(
    "div",
    {
      class: compacto ? "grupo-cv grupo-cv-barra" : "grupo-cv",
      role: "group",
      "aria-label": "Descargar currículum",
    },
    el(
      "button",
      {
        class: claseDiseno,
        type: "button",
        "aria-label": "Descargar CV diseño",
        onClick: generarCV,
      },
      el("span", { class: "largo", text: "CV diseño" }),
      compacto && el("span", { class: "corto", text: "Diseño" }),
    ),
    el(
      "button",
      {
        class: claseATS,
        type: "button",
        "aria-label": "Descargar CV simple ATS",
        onClick: generarCVATS,
      },
      el("span", { class: "largo", text: "CV simple (ATS)" }),
      compacto && el("span", { class: "corto", text: "ATS" }),
    ),
  );
}

const iconosInteres = {
  "soporte técnico": "soporte-tecnico",
  "desarrollo web": "desarrollo-web",
  redes: "redes",
  ciberseguridad: "ciberseguridad",
};

function iconSrc(id) {
  if (!id) return "";
  if (id.startsWith("img/") || id.startsWith("/") || id.startsWith("http")) return id;
  if (id.includes(".")) return `img/icons/${id}`;
  return `img/icons/${id}.svg`;
}

function esFoto(src) {
  return /\.(webp|png|jpe?g|gif)(\?|$)/i.test(src);
}

function chipIconos(nombres) {
  return (nombres || []).filter(Boolean).map((id) => {
    const src = iconSrc(id);
    const foto = esFoto(src);
    return el(
      "span",
      { class: foto ? "chip-icono chip-foto" : "chip-icono", "aria-hidden": "true" },
      el("img", { src, alt: "", width: foto ? "28" : "16", height: foto ? "28" : "16" }),
    );
  });
}

function chip(texto, iconos) {
  return el("li", { class: "chip" }, chipIconos(iconos), el("span", { class: "chip-texto", text: texto }));
}

function iconosDeItem(item) {
  if (item.icono) return [item.icono];
  return item.iconos || [];
}

function chipList(items) {
  return el(
    "ul",
    { class: "chips" },
    items.map((item) => {
      const t = item.detalle ? `${item.nombre} (${item.detalle})` : item.nombre;
      return chip(t, iconosDeItem(item));
    }),
  );
}


function redesActivas() {
  const redes = [];
  if (datos.github) {
    redes.push({
      href: datos.github,
      texto: datos.githubTexto || "GitHub",
      icono: "img/icons/github.svg",
      nombre: "GitHub",
    });
  }
  if (datos.linkedin) {
    redes.push({
      href: datos.linkedin,
      texto: datos.linkedinTexto || "LinkedIn",
      icono: "img/icons/linkedin.svg",
      nombre: "LinkedIn",
    });
  }
  return redes;
}


const svgMonitor = `<svg viewBox="0 0 200 168" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 118L100 148L172 118L100 88L28 118Z" fill="#c5d4cb"/><path d="M28 118V130L100 160V148L28 118Z" fill="#9aafa3"/><path d="M172 118V130L100 160V148L172 118Z" fill="#7e9588"/><path d="M86 136L100 142V154L86 148V136Z" fill="#2a4a54"/><path d="M114 136L100 142V154L114 148V136Z" fill="#1d3840"/><path d="M40 28L100 52L160 28L100 4L40 28Z" fill="#2a4a54"/><path d="M40 28V104L100 128V52L40 28Z" fill="#1d3840"/><path d="M160 28V104L100 128V52L160 28Z" fill="#243036"/><path d="M48 34L100 54L152 34L100 14L48 34Z" fill="#e4eee8"/><path d="M48 34V96L100 116V54L48 34Z" fill="#d5e2da"/><path d="M152 34V96L100 116V54L152 34Z" fill="#c5d4cb"/><path d="M62 48L92 60" stroke="#2a4a54" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M62 58L86 68" stroke="#2a4a54" stroke-width="3" stroke-linecap="round" opacity=".4"/><path d="M62 68L96 82" stroke="#4a5b63" stroke-width="3" stroke-linecap="round" opacity=".35"/></svg>`;

const svgEngranaje = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 6h16l3 9 9-4 8 14-8 6 8 6-8 14-9-4-3 9H32l-3-9-9 4-8-14 8-6-8-6 8-14 9 4 3-9Z" fill="#c5d4cb"/><path d="M32 8h16l2.6 8.2 8.2-3.6 6.4 11.4-7 5.2 7 5.2-6.4 11.4-8.2-3.6L48 72H32l-2.6-8.2-8.2 3.6-6.4-11.4 7-5.2-7-5.2 6.4-11.4 8.2 3.6L32 8Z" fill="#9aafa3"/><circle cx="40" cy="40" r="13" fill="#e4eee8"/><circle cx="40" cy="40" r="7" fill="#2a4a54"/></svg>`;

const svgUsb = `<svg viewBox="0 0 90 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 20L38 8L82 20L52 32L8 20Z" fill="#2a4a54"/><path d="M8 20V32L52 44V32L8 20Z" fill="#1d3840"/><path d="M82 20V32L52 44V32L82 20Z" fill="#243036"/><path d="M52 8L82 20L82 12L52 0L52 8Z" fill="#4a5b63"/><path d="M58 12L62 10.5V16L58 17.5V12Z" fill="#e4eee8"/><path d="M66 14.5L70 13V18.5L66 20V14.5Z" fill="#e4eee8"/><path d="M8 20L22 14.5L22 22L8 27.5V20Z" fill="#c5d4cb"/><path d="M8 27.5L22 22V30.5L8 36V27.5Z" fill="#9aafa3"/></svg>`;

const svgCodigo = `<svg viewBox="0 0 100 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 28L50 12L82 28L50 44L18 28Z" fill="#e4eee8"/><path d="M18 28V60L50 76V44L18 28Z" fill="#c5d4cb"/><path d="M82 28V60L50 76V44L82 28Z" fill="#9aafa3"/><path d="M36 42L28 50L36 58" stroke="#2a4a54" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 42L72 50L64 58" stroke="#2a4a54" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M54 38L46 62" stroke="#4a5b63" stroke-width="4" stroke-linecap="round"/></svg>`;

const svgImpresora = `<svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 42L55 26L90 42L55 58L20 42Z" fill="#4a5b63"/><path d="M20 42V62L55 78V58L20 42Z" fill="#2a4a54"/><path d="M90 42V62L55 78V58L90 42Z" fill="#1d3840"/><path d="M34 22L55 12L76 22L55 32L34 22Z" fill="#f7faf8"/><path d="M34 22V40L55 50V32L34 22Z" fill="#e4eee8"/><path d="M76 22V40L55 50V32L76 22Z" fill="#d5e2da"/><path d="M42 28h8M42 33h12" stroke="#2a4a54" stroke-width="2" stroke-linecap="round" opacity=".45"/><circle cx="28" cy="50" r="3" fill="#e4eee8"/><circle cx="36" cy="54" r="3" fill="#c5d4cb"/></svg>`;

const svgChip = `<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 30L45 18L68 30L45 42L22 30Z" fill="#2a4a54"/><path d="M22 30V54L45 66V42L22 30Z" fill="#1d3840"/><path d="M68 30V54L45 66V42L68 30Z" fill="#243036"/><path d="M30 32L45 24L60 32L45 40L30 32Z" fill="#c5d4cb"/><path d="M16 34L22 31V37L16 40V34Z" fill="#9aafa3"/><path d="M16 42L22 39V45L16 48V42Z" fill="#9aafa3"/><path d="M16 50L22 47V53L16 56V50Z" fill="#9aafa3"/><path d="M74 34L68 31V37L74 40V34Z" fill="#c5d4cb"/><path d="M74 42L68 39V45L74 48V42Z" fill="#c5d4cb"/><path d="M74 50L68 47V53L74 56V50Z" fill="#c5d4cb"/></svg>`;

function figura(clase, markup) {
  const d = document.createElement("div");
  d.className = clase;
  d.setAttribute("aria-hidden", "true");
  d.innerHTML = markup;
  return d;
}

function capaDecor(claseCapa, piezas) {
  const capa = el("div", { class: claseCapa, "aria-hidden": "true" });
  for (const [clase, svg] of piezas) capa.append(figura(clase, svg));
  return capa;
}


function render() {
  const nav = el(
    "nav",
    { class: "nav", id: "nav", "aria-label": "Secciones" },
    navItems.map(([href, t]) => el("a", { href, text: t })),
  );

  const header = el(
    "header",
    { class: "barra" },
    el(
      "div",
      { class: "envoltorio barra-dentro" },
      el(
        "div",
        { class: "barra-fila" },
        el("a", { class: "marca", href: "#inicio", text: datos.nombreCorto }),
        redesActivas().length &&
          el(
            "div",
            { class: "barra-redes", "aria-label": "Redes" },
            redesActivas().map((r) =>
              el(
                "a",
                {
                  class: "red-enlace red-enlace-barra",
                  href: r.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  "aria-label": r.nombre,
                },
                el("img", { src: r.icono, alt: "", width: "18", height: "18" }),
              ),
            ),
          ),
        grupoCV(true),
      ),
      nav,
    ),
  );

  const hero = el(
    "section",
    { class: "hero envoltorio", id: "inicio", "aria-label": "Presentación" },
    capaDecor("decor-capa hero-decor", [
      ["deco deco-monitor", svgMonitor],
      ["deco deco-engranaje", svgEngranaje],
      ["deco deco-usb", svgUsb],
      ["deco deco-codigo", svgCodigo],
    ]),
    el(
      "div",
      { class: "hero-texto" },
      el("h1", { text: datos.nombre }),
      el("p", { class: "titulo", text: datos.titulo }),
      el("p", { class: "ciudad", text: datos.ciudad }),
      el(
        "div",
        { class: "acciones" },
        grupoCV(false),
        el("a", { class: "btn btn-secundario", href: datos.whatsapp, target: "_blank", rel: "noopener noreferrer", text: "Escribir por WhatsApp" }),
      ),
      redesActivas().length &&
        el(
          "div",
          { class: "redes" },
          redesActivas().map((r) =>
            el(
              "a",
              {
                class: "red-enlace",
                href: r.href,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": r.nombre,
              },
              el("img", { src: r.icono, alt: "", width: "22", height: "22" }),
            ),
          ),
        ),
    ),
  );

  const sobre = el(
    "section",
    { class: "envoltorio", id: "sobre-mi" },
    el("h2", { text: "Sobre mí" }),
    el("p", { class: "lead", text: datos.perfil }),
    el(
      "ul",
      { class: "metas" },
      datos.idiomas.map((i) => el("li", { text: `${i.nombre} ${i.nivel}` })),
      datos.intereses.map((i) =>
        chip(i.charAt(0).toUpperCase() + i.slice(1), iconosInteres[i] ? [iconosInteres[i]] : []),
      ),
    ),
  );

  const experiencia = el(
    "section",
    { class: "envoltorio", id: "experiencia" },
    figura("deco seccion-decor", svgEngranaje),
    el("h2", { text: "Experiencia" }),
    el(
      "div",
      { class: "rejilla" },
      datos.experiencia.map((exp) =>
        el(
          "article",
          { class: "tarjeta" },
          el("h3", { text: exp.puesto }),
          exp.lugar && el("p", { class: "lugar", text: exp.lugar }),
          exp.periodo && el("p", { class: "fecha", text: exp.periodo }),
          exp.puntos.length
            ? el("ul", {}, exp.puntos.map((p) => el("li", { text: p })))
            : exp.descripcion && el("p", { text: exp.descripcion }),
        ),
      ),
    ),
  );

  const proyectos = el(
    "section",
    { class: "envoltorio", id: "proyectos" },
    figura("deco seccion-decor", svgImpresora),
    el("h2", { text: "Proyectos" }),
    el(
      "div",
      { class: "rejilla una" },
      datos.proyectos.map((p) =>
        el("article", { class: "tarjeta" }, el("h3", { text: p.titulo }), el("p", { text: p.descripcion })),
      ),
    ),
  );

  const educacion = el(
    "section",
    { class: "envoltorio", id: "educacion" },
    el("h2", { text: "Educación" }),
    el(
      "article",
      { class: "tarjeta" },
      datos.educacion.map((ed) =>
        el(
          "div",
          { class: "bloque" },
          el("h3", { text: ed.titulo }),
          el("p", { class: "lugar", text: [ed.lugar, ed.periodo].filter(Boolean).join(" · ") }),
        ),
      ),
    ),
  );

  const habilidades = el(
    "section",
    { class: "envoltorio", id: "habilidades" },
    figura("deco seccion-decor", svgCodigo),
    el("h2", { text: "Habilidades" }),
    el(
      "div",
      { class: "grupos" },
      datos.habilidades.map((g) => el("article", { class: "tarjeta" }, el("h3", { text: g.grupo }), chipList(g.items))),
    ),
  );

  const certificaciones = el(
    "section",
    { class: "envoltorio", id: "certificaciones" },
    figura("deco seccion-decor", svgChip),
    el("h2", { text: "Certificaciones" }),
    el(
      "div",
      { class: "tarjeta" },
      datos.certificaciones.map((c) =>
        el(
          "article",
          { class: "cert" },
          el(
            "div",
            {},
            el("h3", { text: c.nombre }),
            el("p", { class: "fecha", text: [c.emisor, c.fecha, c.detalle].filter(Boolean).join(" · ") }),
          ),
          c.archivo &&
            el("a", {
              class: "enlace-cert",
              href: c.archivo,
              target: "_blank",
              rel: "noopener noreferrer",
              text: "Ver certificado",
            }),
        ),
      ),
    ),
  );

  const contacto = el(
    "section",
    { class: "envoltorio", id: "contacto" },
    el("h2", { text: "Contacto" }),
    el("p", { class: "lead", text: "Si querés hablar sobre un proyecto, escribime." }),
    el(
      "div",
      { class: "tarjeta contacto-lista" },
      el("p", {}, "Correo: ", el("a", { href: datos.correoLink, text: datos.correo })),
      el("p", {}, "Teléfono: ", el("a", { href: datos.telefonoLink, text: datos.telefono })),
      el("p", {}, "WhatsApp: ", el("a", { href: datos.whatsapp, target: "_blank", rel: "noopener noreferrer", text: datos.telefono })),
      el("p", { text: datos.ciudad }),
      redesActivas().map((r) =>
        el(
          "p",
          { class: "contacto-red" },
          r.nombre + ": ",
          el(
            "a",
            { href: r.href, target: "_blank", rel: "noopener noreferrer" },
            el("img", { class: "icono-contacto", src: r.icono, alt: "", width: "16", height: "16" }),
            " " + r.texto,
          ),
        ),
      ),
    ),
  );

  const footer = el(
    "footer",
    { class: "pie" },
    el("div", { class: "envoltorio", text: `${datos.nombre} · ${datos.ciudad}` }),
  );

  app.replaceChildren(
    header,
    el("main", { id: "contenido" }, hero, sobre, experiencia, proyectos, educacion, habilidades, certificaciones, contacto),
    footer,
  );
}

function skillLabel(item) {
  return item.detalle ? `${item.nombre} (${item.detalle})` : item.nombre;
}

function generarCV() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const ink = [36, 48, 54];
  const suave = [74, 91, 99];
  const acento = [42, 74, 84];
  const menta = [228, 238, 232];
  const mentaClara = [242, 245, 243];

  const colX = 336;
  const leftX = 50;
  const leftW = colX - leftX - 16;
  const rightX = colX + 24;
  const rightW = pageW - rightX - 22;
  const midX = colX + (pageW - colX) / 2;
  const tipX = 292;

  const font = (size, style = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  const clean = (s) => String(s).replace(/[–—]/g, "-");

  const fillPolygon = (points) => {
    const [x, y] = points[0];
    const segs = [];
    for (let i = 1; i < points.length; i++) {
      segs.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
    }
    doc.lines(segs, x, y, [1, 1], "F", true);
  };

  const writeLines = (text, x, y, { size = 9.5, style = "normal", color = ink, gap = 12, width } = {}) => {
    font(size, style);
    doc.setTextColor(...color);
    const rows = doc.splitTextToSize(clean(text), width);
    for (const row of rows) {
      doc.text(row, x, y);
      y += gap;
    }
    return y;
  };

  const heading = (text, x, y, { size = 11.5 } = {}) => {
    font(size, "bold");
    doc.setTextColor(...ink);
    doc.text(clean(text).toUpperCase(), x, y);
    return y + 16;
  };

  const measureRight = (startY) => {
    let y = startY;
    font(11.5, "bold");
    y += 18;
    font(9.2, "normal");
    y += doc.splitTextToSize(clean(datos.perfil), rightW).length * 11.5 + 18;
    font(11.5, "bold");
    y += 16 + 16 + 4;
    for (const g of datos.habilidades) {
      font(9, "bold");
      y += 13;
      const items = g.items.map(skillLabel).join(", ");
      font(8.8, "normal");
      y += doc.splitTextToSize("•  " + items, rightW).length * 11 + 5;
    }
    y += 12;
    font(11.5, "bold");
    y += 16;
    y += datos.idiomas.length * 12 + 6;
    return y;
  };

  // Name then title; ribbon sits beside the title, like the template
  const nameY = 48;
  const nameLines = clean(datos.nombre).toUpperCase().split(/\s+/);
  const nameGap = 26;
  const titleY = nameY + nameGap * Math.max(nameLines.length, 1) + 10;
  const ribbonH = 50;
  const ribbonY = titleY - 16;

  const rightTextStart = ribbonY + ribbonH + 36;
  let chevronTop = Math.max(measureRight(rightTextStart) + 6, 530);
  const contactMin = 148;
  if (chevronTop > pageH - contactMin) chevronTop = pageH - contactMin;
  const chevronDepth = 36;
  const chevronGap = 15;

  // ----- SHAPES FIRST -----
  doc.setFillColor(...menta);
  fillPolygon([
    [colX, 0],
    [pageW, 0],
    [pageW, chevronTop],
    [midX, chevronTop + chevronDepth],
    [colX, chevronTop],
  ]);

  doc.setFillColor(...mentaClara);
  fillPolygon([
    [colX, chevronTop + chevronGap],
    [midX, chevronTop + chevronDepth + chevronGap],
    [pageW, chevronTop + chevronGap],
    [pageW, pageH],
    [colX, pageH],
  ]);

  doc.setFillColor(...acento);
  fillPolygon([
    [tipX, ribbonY + ribbonH / 2],
    [colX, ribbonY],
    [pageW, ribbonY],
    [pageW, ribbonY + ribbonH],
    [colX, ribbonY + ribbonH],
  ]);

  // ----- LEFT COLUMN TEXT -----
  let y = nameY;
  font(nameLines.length > 2 ? 20 : 24, "bold");
  doc.setTextColor(...ink);
  for (const line of nameLines) {
    doc.text(line, leftX, y);
    y += nameGap;
  }

  y = titleY;
  font(11, "normal");
  doc.setTextColor(...acento);
  const titleLines = ["ESTUDIANTE TÉCNICO EN", "DESARROLLO WEB", "SOPORTE TÉCNICO Y HARDWARE"];
  for (const line of titleLines) {
    doc.text(line, leftX, y);
    y += 14;
  }

  y += 18;
  y = heading("EXPERIENCIA", leftX, y, { size: 12 });
  y += 2;
  for (const exp of datos.experiencia) {
    const org = exp.lugar || exp.puesto;
    font(10, "bolditalic");
    doc.setTextColor(...ink);
    const orgLines = doc.splitTextToSize(clean(org).toUpperCase(), leftW);
    for (const row of orgLines) {
      doc.text(row, leftX, y);
      y += 13;
    }
    if (exp.periodo) {
      y = writeLines(exp.periodo, leftX, y, { size: 9, color: suave, gap: 11, width: leftW });
    }
    if (exp.lugar) {
      y = writeLines("Cargo: " + exp.puesto, leftX, y, { size: 9.5, color: ink, gap: 11, width: leftW });
    } else if (exp.descripcion) {
      y = writeLines(exp.descripcion, leftX, y, { size: 9.5, color: ink, gap: 11, width: leftW });
    }
    for (const p of exp.puntos || []) {
      y = writeLines("•  " + p, leftX + 6, y, { size: 9, color: suave, gap: 11, width: leftW - 6 });
    }
    y += 9;
  }

  y += 2;
  y = heading("EDUCACIÓN", leftX, y, { size: 12 });
  y += 2;
  for (const ed of datos.educacion) {
    font(10, "bolditalic");
    doc.setTextColor(...ink);
    const head = clean(ed.lugar || ed.titulo).toUpperCase();
    for (const row of doc.splitTextToSize(head, leftW)) {
      doc.text(row, leftX, y);
      y += 12;
    }
    if (ed.lugar) {
      y = writeLines(ed.titulo, leftX, y, { size: 9.3, color: ink, gap: 11, width: leftW });
    }
    y = writeLines(ed.periodo, leftX, y, { size: 9, color: suave, gap: 11, width: leftW });
    y += 11;
  }

  y += 2;
  y = heading("CERTIFICACIONES", leftX, y, { size: 12 });
  y += 2;
  for (const c of datos.certificaciones) {
    font(9.2, "bolditalic");
    doc.setTextColor(...ink);
    const nameRows = doc.splitTextToSize(clean(c.nombre).toUpperCase(), leftW);
    for (const row of nameRows) {
      doc.text(row, leftX, y);
      y += 11.5;
    }
    const extra = [c.emisor, c.fecha, c.detalle].filter(Boolean).join("  ·  ");
    if (extra) y = writeLines(extra, leftX, y, { size: 8.3, color: suave, gap: 10.5, width: leftW });
    y += 4;
  }

  // ----- RIGHT COLUMN TEXT -----
  y = rightTextStart;
  y = heading("SOBRE MÍ", rightX, y, { size: 12 });
  y += 3;
  y = writeLines(datos.perfil, rightX, y, { size: 9.2, color: ink, gap: 11.5, width: rightW });

  y += 18;
  y = heading("HABILIDADES", rightX, y, { size: 12 });
  y = heading("Y HERRAMIENTAS", rightX, y, { size: 12 });
  y += 3;
  for (const g of datos.habilidades) {
    font(8.8, "bold");
    doc.setTextColor(...acento);
    doc.text(g.grupo, rightX, y);
    y += 12;
    const items = g.items.map(skillLabel).join(", ");
    y = writeLines("•  " + items, rightX, y, { size: 8.8, color: ink, gap: 11, width: rightW });
    y += 6;
  }

  y += 10;
  y = heading("IDIOMAS", rightX, y, { size: 12 });
  y += 2;
  for (const i of datos.idiomas) {
    y = writeLines(`•  ${i.nombre}, ${i.nivel}`, rightX, y, { size: 9.2, color: ink, gap: 12, width: rightW });
  }

  y = chevronTop + chevronDepth + chevronGap + 28;
  y = heading("CONTACTO", rightX, y, { size: 12 });
  y += 6;
  y = writeLines("Teléfono:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  y = writeLines(datos.telefono, rightX, y, { size: 9.5, color: ink, gap: 16, width: rightW });
  y = writeLines("Correo:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  y = writeLines(datos.correo, rightX, y, { size: 9.5, color: ink, gap: 16, width: rightW });
  y = writeLines("WhatsApp:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  y = writeLines(datos.telefono, rightX, y, { size: 9.5, color: ink, gap: 16, width: rightW });
  y = writeLines("Dirección:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  y = writeLines(datos.ciudad, rightX, y, { size: 9.5, color: ink, gap: 16, width: rightW });
  if (datos.github) {
    y = writeLines("GitHub:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
    y = writeLines(datos.githubTexto || datos.github.replace(/^https?:\/\//, ""), rightX, y, { size: 9.5, color: ink, gap: 16, width: rightW });
  }
  if (datos.linkedin) {
    y = writeLines("LinkedIn:", rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
    writeLines(datos.linkedin.replace(/^https?:\/\//, "").replace(/^www\./, ""), rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  }

  doc.save(datos.cvArchivo);
  aviso.textContent = "El CV diseño se descargó.";
}
function puntosParaATS(item) {
  if (item.puntosATS && item.puntosATS.length) return item.puntosATS;
  if (item.descripcionATS) return [item.descripcionATS];
  if (item.puntos && item.puntos.length) return item.puntos;
  if (item.descripcion) return [item.descripcion];
  return [];
}

function generarCVATS() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const ink = [36, 48, 54];
  const suave = [74, 91, 99];
  const acento = [42, 74, 84];
  const menta = [228, 238, 232];
  const salvia = [197, 212, 203];
  const margenX = 48;
  const margenDer = pageW - 48;
  const ancho = margenDer - margenX;

  const font = (size, style = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  const clean = (s) => String(s).replace(/[–—]/g, "-");

  const writeLines = (text, x, y, { size = 9.5, style = "normal", color = ink, gap = 11, width = ancho, align } = {}) => {
    font(size, style);
    doc.setTextColor(...color);
    const rows = doc.splitTextToSize(clean(text), width);
    for (const row of rows) {
      if (align === "right") doc.text(row, x, y, { align: "right" });
      else doc.text(row, x, y);
      y += gap;
    }
    return y;
  };

  const seccion = (titulo, y) => {
    y += 8;
    font(10, "bold");
    doc.setTextColor(...acento);
    const label = clean(titulo).toUpperCase();
    doc.text(label, margenX, y);
    const tw = doc.getTextWidth(label);
    doc.setDrawColor(...acento);
    doc.setLineWidth(1.15);
    doc.line(margenX, y + 3.5, margenX + Math.max(tw, 44), y + 3.5);
    doc.setDrawColor(...salvia);
    doc.setLineWidth(0.6);
    doc.line(margenX + Math.max(tw, 44) + 8, y + 3.5, margenDer, y + 3.5);
    return y + 16;
  };

  const tituloConFecha = (titulo, fecha, y) => {
    const linea = fecha ? `${titulo}  ·  ${fecha}` : titulo;
    return writeLines(linea, margenX, y, { size: 10, style: "bold", color: ink, gap: 12, width: ancho });
  };

  const linkLimpio = (url, texto) => {
    if (!url) return "";
    if (texto && !/^https?:\/\//i.test(texto) && texto !== "LinkedIn" && texto !== "GitHub") return texto;
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  };

  const contacto1 = [datos.ciudad, datos.telefono, datos.correo].filter(Boolean).join("   ·   ");
  const contacto2 = [linkLimpio(datos.linkedin, datos.linkedinTexto), linkLimpio(datos.github, datos.githubTexto)]
    .filter(Boolean)
    .join("   ·   ");

  // Formas primero, luego el texto, para no tapar el orden de lectura
  const headerH = 100;
  doc.setFillColor(...menta);
  doc.rect(0, 0, pageW, headerH, "F");
  doc.setFillColor(...acento);
  doc.rect(0, 0, pageW, 8, "F");
  doc.setFillColor(...salvia);
  doc.rect(0, headerH - 2, pageW, 2, "F");
  doc.setFillColor(...acento);
  doc.rect(0, pageH - 8, pageW, 8, "F");

  let y = 32;
  font(22, "bold");
  doc.setTextColor(...ink);
  doc.text(clean(datos.nombre).toUpperCase(), margenX, y);

  y += 16;
  y = writeLines(datos.titulo, margenX, y, { size: 10, color: acento, gap: 12, width: ancho });

  y += 4;
  y = writeLines(contacto1, margenX, y, { size: 9, color: suave, gap: 11, width: ancho });
  if (contacto2) y = writeLines(contacto2, margenX, y, { size: 9, color: suave, gap: 11, width: ancho });

  y = headerH + 18;
  y = seccion("Perfil profesional", y);
  y = writeLines(datos.perfil, margenX, y, { size: 9.4, color: ink, gap: 12, width: ancho });

  y = seccion("Experiencia", y);
  for (const exp of datos.experiencia) {
    const cabeza = exp.lugar ? `${exp.puesto}  |  ${exp.lugar}` : exp.puesto;
    y = tituloConFecha(cabeza, exp.periodo, y);
    for (const p of puntosParaATS(exp)) {
      y = writeLines("•  " + p, margenX + 8, y, { size: 9.2, color: ink, gap: 11, width: ancho - 8 });
    }
    y += 4;
  }

  if (datos.proyectos && datos.proyectos.length) {
    y = seccion("Proyectos", y);
    for (const proy of datos.proyectos) {
      y = writeLines(proy.titulo, margenX, y, { size: 10, style: "bold", color: ink, gap: 12, width: ancho });
      for (const p of puntosParaATS(proy)) {
        y = writeLines("•  " + p, margenX + 8, y, { size: 9.2, color: ink, gap: 11, width: ancho - 8 });
      }
      y += 4;
    }
  }

  y = seccion("Educación", y);
  for (const ed of datos.educacion) {
    const cabeza = ed.lugar ? `${ed.titulo}  |  ${ed.lugar}` : ed.titulo;
    y = tituloConFecha(cabeza, ed.periodo, y);
    y += 3;
  }

  y = seccion("Certificaciones", y);
  for (const c of datos.certificaciones) {
    y = writeLines(c.nombre, margenX, y, { size: 9.3, style: "bold", color: ink, gap: 11, width: ancho });
    const extra = [c.emisor, c.fecha, c.detalle].filter(Boolean).join("  ·  ");
    if (extra) y = writeLines(extra, margenX, y, { size: 8.7, color: suave, gap: 11, width: ancho });
    y += 3;
  }

  y = seccion("Habilidades", y);
  for (const g of datos.habilidades) {
    const items = g.items.map(skillLabel).join(", ");
    y = writeLines(`${g.grupo}: ${items}`, margenX, y, { size: 9.2, color: ink, gap: 12.5, width: ancho });
  }

  y = seccion("Idiomas", y);
  const idiomas = datos.idiomas.map((i) => `${i.nombre}, ${i.nivel}`).join("   ·   ");
  y = writeLines(idiomas, margenX, y, { size: 9.2, color: ink, gap: 11, width: ancho });

  doc.save(datos.cvArchivoATS || "CV-Joseph-Lacayo-ATS.pdf");
  aviso.textContent = "El CV simple (ATS) se descargó.";
}

render();
