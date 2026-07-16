import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getGeneralStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const format = request.nextUrl.searchParams.get("format") || "xlsx";
  const standings = await getGeneralStandings();

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Trofeo de Santiago";
    const ws = wb.addWorksheet("Clasificación General");

    ws.columns = [
      { header: "Posición", key: "pos", width: 10 },
      { header: "Equipo", key: "name", width: 28 },
      { header: "Cross", key: "cross", width: 10 },
      { header: "CrossFit", key: "crossfit", width: 10 },
      { header: "Paellas", key: "paellas", width: 10 },
      { header: "Ajuste", key: "ajuste", width: 10 },
      { header: "Total", key: "total", width: 10 },
      { header: "Observaciones", key: "obs", width: 30 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5332" } };
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    standings.forEach((t, i) => {
      ws.addRow({
        pos: i + 1,
        name: t.name,
        cross: t.breakdown.cross,
        crossfit: t.breakdown.crossfit,
        paellas: t.breakdown.paellas,
        ajuste: t.manualAdjust,
        total: t.totalPoints,
        obs: t.observations || "",
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="clasificacion-general.xlsx"',
      },
    });
  }

  // --- PDF (acta de clasificación general) ---
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.82, 0.66, 0.2);
  const dark = rgb(0.15, 0.15, 0.15);
  let y = 792;

  page.drawText("TROFEO DE SANTIAGO", { x: 40, y, size: 22, font: bold, color: dark });
  y -= 24;
  page.drawText("Acta de Clasificación General", { x: 40, y, size: 13, font, color: dark });
  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 2, color: gold });
  y -= 24;

  const cols = [
    { t: "Pos", x: 40 },
    { t: "Equipo", x: 90 },
    { t: "Total", x: 360 },
    { t: "Observaciones", x: 420 },
  ];
  cols.forEach((c) => page.drawText(c.t, { x: c.x, y, size: 10, font: bold, color: dark }));
  y -= 6;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: dark });
  y -= 18;

  standings.forEach((t, i) => {
    if (y < 60) {
      page = pdf.addPage([595, 842]);
      y = 792;
    }
    page.drawText(String(i + 1).padStart(2, "0"), { x: 40, y, size: 10, font, color: dark });
    page.drawText(t.name.slice(0, 40), { x: 90, y, size: 10, font, color: dark });
    page.drawText(`${t.totalPoints}`, { x: 360, y, size: 10, font: bold, color: dark });
    page.drawText((t.observations || "").slice(0, 28), { x: 420, y, size: 9, font, color: dark });
    y -= 18;
  });

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="clasificacion-general.pdf"',
    },
  });
}
