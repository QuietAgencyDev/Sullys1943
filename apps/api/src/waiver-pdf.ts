import PDFDocument from "pdfkit";

export type WaiverPdfInput = {
  gymName: string;
  templateName: string;
  body: string;
  subjectName: string;
  subjectEmail: string;
  signerName: string;
  signedAt: Date | null;
  packetId: string;
  status: string;
};

export function buildWaiverPdf(input: WaiverPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fillColor("#C82026")
      .fontSize(11)
      .text("SULLY'S BOXING GYM · EST 1943", { align: "left" });
    doc
      .fillColor("#3A2418")
      .fontSize(20)
      .text(input.templateName, { align: "left" });
    doc.moveDown(0.4);
    doc
      .fillColor("#666666")
      .fontSize(9)
      .text(
        "Boxing is the engine. People are the purpose. Character is the legacy.",
      );
    doc.moveDown();

    doc
      .fillColor("#111111")
      .fontSize(10)
      .text(`Member: ${input.subjectName} (${input.subjectEmail})`);
    doc.text(`Packet ID: ${input.packetId}`);
    doc.text(`Status: ${input.status.toUpperCase()}`);
    if (input.signedAt) {
      doc.text(`Signed at: ${input.signedAt.toISOString()}`);
      doc.text(`Signed by: ${input.signerName}`);
    }
    doc.moveDown();

    doc
      .fillColor("#111111")
      .fontSize(11)
      .text("Agreement", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(input.body, { align: "left", lineGap: 3 });

    doc.moveDown(1.5);
    doc
      .fontSize(9)
      .fillColor("#444444")
      .text(
        "This document is an electronic record of the liability waiver on file with Sully's Recreation & Athletic Centre. It is not a substitute for independent legal advice. Contact danielle@sullysboxinggym.com for official records requests.",
        { align: "left" },
      );

    if (input.signedAt) {
      doc.moveDown(1.2);
      doc
        .fillColor("#111111")
        .fontSize(10)
        .text("Electronic signature", { underline: true });
      doc.moveDown(0.4);
      doc.text(`Typed name: ${input.signerName}`);
      doc.text(`Timestamp: ${input.signedAt.toLocaleString()}`);
      doc.text("Method: in-app electronic acknowledgment");
    }

    doc.end();
  });
}
