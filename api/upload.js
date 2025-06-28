import nextConnect from "next-connect";
import multer from "multer";
import fs from "fs/promises";
import { mapExcel } from "../backend/mapExcel.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const apiRoute = nextConnect();

apiRoute.use(
  upload.fields([
    { name: "inputFile", maxCount: 1 },
    { name: "templateFile", maxCount: 1 },
    { name: "configFile", maxCount: 1 },
  ])
);

apiRoute.post(async (req, res) => {
  try {
    const input = req.files["inputFile"]?.[0]?.path;
    const template = req.files["templateFile"]?.[0]?.path;
    const config = req.files["configFile"]?.[0]?.path;

    if (!input || !template || !config) {
      return res.status(400).json({ error: "Missing required files." });
    }

    const buffer = await mapExcel(input, template, config);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="mapped.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error("❌ Lỗi xử lý:", err.message);
    res.status(500).json({ error: "Server failed: " + err.message });
  }
});

export default apiRoute;
