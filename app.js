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

function btnCV(clase, compacto = false) {
  return el(
    "button",
    { class: clase, type: "button", "aria-label": "Descargar CV", onClick: generarCV },
    el("span", { class: "largo", text: "Descargar CV" }),
    compacto && el("span", { class: "corto", text: "CV" }),
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

function render() {
  const nav = el(
    "nav",
    { class: "nav", id: "nav", "aria-label": "Secciones" },
    navItems.map(([href, t]) => el("a", { href, text: t })),
  );

  const menuBtn = el("button", {
    class: "menu-btn",
    type: "button",
    "aria-expanded": "false",
    "aria-controls": "nav",
    text: "Menú",
  });

  const cerrarNav = () => {
    nav.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") cerrarNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarNav();
  });

  const header = el(
    "header",
    { class: "barra" },
    el(
      "div",
      { class: "envoltorio barra-dentro" },
      el("a", { class: "marca", href: "#inicio", text: datos.nombreCorto }),
      menuBtn,
      nav,
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
      btnCV("btn btn-cv", true),
    ),
  );

  const hero = el(
    "section",
    { class: "hero envoltorio", id: "inicio", "aria-label": "Presentación" },
    el(
      "div",
      { class: "hero-texto" },
      el("h1", { text: datos.nombre }),
      el("p", { class: "titulo", text: datos.titulo }),
      el("p", { class: "ciudad", text: datos.ciudad }),
      el(
        "div",
        { class: "acciones" },
        btnCV("btn btn-principal"),
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
    y += 8;
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
    writeLines(datos.linkedinTexto || datos.linkedin.replace(/^https?:\/\//, ""), rightX, y, { size: 9.5, color: ink, gap: 12, width: rightW });
  }

  doc.save(datos.cvArchivo);
  aviso.textContent = "El CV se descargó.";
}

render();
