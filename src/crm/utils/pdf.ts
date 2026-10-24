/**
 * Helper to get the HTML content with required styles for printing.
 */
function getPrintableHtml(element: HTMLElement, title: string): string {
  const clone = element.cloneNode(true) as HTMLElement;

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join("\n");

  const isLandscape =
    element.getAttribute("data-orientation") === "landscape" ||
    element.classList.contains("landscape") ||
    clone.getAttribute("data-orientation") === "landscape" ||
    clone.classList.contains("landscape");

  const customPrintStyles = `
    <style>
      @media print {
        @page {
          size: ${isLandscape ? "A4 landscape" : "A4"};
          margin: ${isLandscape ? "6mm 8mm 6mm 8mm" : "10mm 10mm 12mm 10mm"};
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-color: white !important;
          margin: 0;
          padding: 0;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .avoid-break, table, tr, td, tbody {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
      @media screen {
        body {
          margin: 0;
          padding: 24px;
          background-color: #f5f5f5;
          display: flex;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${styles}
        ${customPrintStyles}
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `;
}

/**
 * Triggers native browser vector print using an invisible iframe.
 */
export async function printPdfFromElement(
  element: HTMLElement,
  fileName: string = "document"
): Promise<void> {
  const cleanTitle = fileName.replace(/\.pdf$/i, "");
  const htmlContent = getPrintableHtml(element, cleanTitle);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "-9999px";
  iframe.style.bottom = "-9999px";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print failed in iframe, opening in new tab", e);
          previewPdfInNewTab(element, fileName);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
      }, 400);
    };
  }
}

/**
 * Opens the document in a new browser tab for preview / direct PDF saving.
 */
export async function previewPdfInNewTab(
  element: HTMLElement,
  fileName: string = "document.pdf"
): Promise<void> {
  const cleanTitle = fileName.replace(/\.pdf$/i, "");
  const htmlContent = getPrintableHtml(element, cleanTitle);

  const previewWin = window.open("", "_blank");
  if (previewWin) {
    previewWin.document.open();
    previewWin.document.write(htmlContent);
    previewWin.document.close();
  }
}
