// api/upload.js
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

  const form = new IncomingForm({
    multiples: true,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing form" });

    try {
      const inputPath =
        files.inputFile?.[0]?.filepath || files.inputFile?.filepath;
      const templatePath =
        files.templateFile?.[0]?.filepath || files.templateFile?.filepath;
      const configPath =
        files.configFile?.[0]?.filepath || files.configFile?.filepath;

      if (!inputPath || !templatePath || !configPath) {
        return res.status(400).json({ error: "Missing one or more files" });
      }

      const buffer = await mapExcel(inputPath, templatePath, configPath);

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
      res.status(500).json({ error: "Processing failed: " + e.message });
    }
  });
}
