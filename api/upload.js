import { IncomingForm } from "formidable";
import fs from "fs/promises";
import { mapExcel } from "../backend/mapExcel.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });
  form.uploadDir = "/tmp";

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parse error" });

    try {
      const input = files.inputFile[0].filepath;
      const template = files.templateFile[0].filepath;
      const config = files.configFile[0].filepath;

      const buffer = await mapExcel(input, template, config);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="mapped.xlsx"'
      );
      res.send(buffer);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
