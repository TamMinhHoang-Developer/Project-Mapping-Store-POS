import formidable from "formidable";
import fs from "fs";
import { mapExcel } from "../mapExcel.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = formidable({
    multiples: true,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parsing failed" });

    try {
      const inputPath = files.input[0].filepath;
      const templatePath = files.template[0].filepath;
      const mappingPath = files.mapping[0].filepath;

      const outputPath = await mapExcel(inputPath, templatePath, mappingPath);

      res.setHeader("Content-Disposition", "attachment; filename=Output.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      fs.createReadStream(outputPath).pipe(res);
    } catch (error) {
      console.error("Mapping failed:", error);
      res.status(500).json({ error: "Mapping failed" });
    }
  });
}
