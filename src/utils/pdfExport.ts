// ─────────────────────────────────────────────────────────────────────────────
// pdfExport.ts
// Print-based PDF report generation (no external dependencies)
// ─────────────────────────────────────────────────────────────────────────────

export interface PrintReportData {
  scores: {
    cognitive: number;
    soft: number;
    professional: number;
    adaptability: number;
    average: number;
  };
  profileType: string;
  confidence: number;
  strengthAreas: string[];
  growthAreas: string[];
  recommendations: Record<string, string>;
  date: string;
  studentName: string;
  antiCheatPassed: boolean;
  categoryLabels: Record<string, string>;
  skillLevels?: Record<string, string>;
  translations: {
    reportTitle: string;
    totalScore: string;
    profileType: string;
    confidence: string;
    strengthAreas: string;
    growthAreas: string;
    antiCheatPassed: string;
    antiCheatFailed: string;
    generatedAt: string;
    recommendations?: string;
  };
}

export interface PrintBasicReportData {
  scores: {
    cognitive: number;
    soft: number;
    professional: number;
    adaptability: number;
    average: number;
  };
  date: string;
  studentName: string;
  categoryLabels: Record<string, string>;
  recommendations: Record<string, string>;
  translations: {
    reportTitle: string;
    totalScore: string;
    generatedAt: string;
  };
}

function getBarColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}

function getLevelText(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Work";
}

function buildCategoryRows(
  scores: Record<string, number>,
  categoryLabels: Record<string, string>,
  recommendations?: Record<string, string>
): string {
  const cats = ["cognitive", "soft", "professional", "adaptability"];
  return cats
    .map((cat) => {
      const score = scores[cat] ?? 0;
      const label = categoryLabels[cat] || cat;
      const color = getBarColor(score);
      const rec = recommendations?.[cat] || "";
      return `
        <div style="margin-bottom: 16px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafbfc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 600; font-size: 14px; color: #1e293b;">${label}</span>
            <span style="font-weight: 700; font-size: 14px; color: ${color};">${Math.round(score)}%</span>
          </div>
          <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${Math.round(score)}%; background: ${color}; border-radius: 5px;"></div>
          </div>
          ${rec ? `<p style="margin: 8px 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">${rec}</p>` : ""}
        </div>`;
    })
    .join("");
}

function openPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    // Fallback: use iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "800px";
    iframe.style.height = "900px";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    }
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SkillMap Report</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      padding: 32px;
      line-height: 1.5;
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

/**
 * Full report with all scoring data (used from DiagnosticsResults after completing a test).
 */
export function printReport(data: PrintReportData): void {
  const { scores, profileType, confidence, strengthAreas, growthAreas, recommendations, date, studentName, antiCheatPassed, categoryLabels, translations: tr } = data;

  const formattedDate = new Date(date).toLocaleString();
  const generatedAt = new Date().toLocaleString();

  const body = `
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
        SkillMap
      </h1>
      <p style="font-size: 15px; color: #64748b;">${tr.reportTitle}</p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${formattedDate}</p>
      ${studentName ? `<p style="font-size: 13px; color: #64748b; margin-top: 2px;">${studentName}</p>` : ""}
    </div>

    <!-- Overall Score -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 6px solid ${getBarColor(scores.average)}; line-height: 108px; font-size: 36px; font-weight: 800; color: ${getBarColor(scores.average)};">
        ${Math.round(scores.average)}%
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 8px;">${tr.totalScore}</p>
    </div>

    <!-- Profile Cards -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${tr.profileType}</div>
        <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${profileType}</div>
      </div>
      <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${tr.confidence}</div>
        <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${Math.round(confidence)}%</div>
      </div>
      <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${tr.strengthAreas}</div>
        <div style="font-size: 12px; font-weight: 600; color: #22c55e;">${strengthAreas.join(", ")}</div>
      </div>
      <div style="flex: 1; min-width: 140px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${tr.growthAreas}</div>
        <div style="font-size: 12px; font-weight: 600; color: #eab308;">${growthAreas.join(", ")}</div>
      </div>
    </div>

    <!-- Category Scores -->
    <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
      ${tr.totalScore}
    </h2>
    ${buildCategoryRows(scores, categoryLabels, recommendations)}

    <!-- Anti-cheat -->
    <div style="text-align: center; margin: 20px 0; padding: 10px; border-radius: 8px; background: ${antiCheatPassed ? "#f0fdf4" : "#fffbeb"}; border: 1px solid ${antiCheatPassed ? "#bbf7d0" : "#fde68a"};">
      <span style="font-size: 12px; color: ${antiCheatPassed ? "#16a34a" : "#d97706"};">
        ${antiCheatPassed ? tr.antiCheatPassed : tr.antiCheatFailed}
      </span>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #94a3b8;">${tr.generatedAt}: ${generatedAt}</p>
      <p style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">SkillMap Navigator</p>
    </div>
  `;

  openPrintWindow(wrapHtml(body));
}

/**
 * Basic report using only data from diagnostics_results DB row (no full scoring data needed).
 */
export function printBasicReport(data: PrintBasicReportData): void {
  const { scores, date, studentName, categoryLabels, recommendations, translations: tr } = data;

  const formattedDate = new Date(date).toLocaleString();
  const generatedAt = new Date().toLocaleString();

  const body = `
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
        SkillMap
      </h1>
      <p style="font-size: 15px; color: #64748b;">${tr.reportTitle}</p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${formattedDate}</p>
      ${studentName ? `<p style="font-size: 13px; color: #64748b; margin-top: 2px;">${studentName}</p>` : ""}
    </div>

    <!-- Overall Score -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 6px solid ${getBarColor(scores.average)}; line-height: 108px; font-size: 36px; font-weight: 800; color: ${getBarColor(scores.average)};">
        ${Math.round(scores.average)}%
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 8px;">${tr.totalScore}</p>
    </div>

    <!-- Category Scores -->
    ${buildCategoryRows(scores, categoryLabels, recommendations)}

    <!-- Footer -->
    <div style="text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #94a3b8;">${tr.generatedAt}: ${generatedAt}</p>
      <p style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">SkillMap Navigator</p>
    </div>
  `;

  openPrintWindow(wrapHtml(body));
}
