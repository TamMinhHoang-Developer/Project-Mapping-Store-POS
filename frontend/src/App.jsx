// 📁 client/src/App.jsx

import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [inputFile, setInputFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [mappingFile, setMappingFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!inputFile || !templateFile || !mappingFile) {
      alert("Vui lòng chọn đầy đủ cả 3 file");
      return;
    }

    const formData = new FormData();
    formData.append("input", inputFile);
    formData.append("template", templateFile);
    formData.append("mapping", mappingFile);

    setStatus("Đang xử lý...");

    try {
      const res = await axios.post("/api/map", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Output.xlsx");
      document.body.appendChild(link);
      link.click();
      setStatus("✅ Đã xử lý xong! File đã được tải về.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Lỗi khi xử lý file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">Excel Mapper Tool</h1>
      <div className="space-y-4 w-full max-w-md">
        <input type="file" onChange={(e) => setInputFile(e.target.files[0])} />
        <input
          type="file"
          onChange={(e) => setTemplateFile(e.target.files[0])}
        />
        <input
          type="file"
          onChange={(e) => setMappingFile(e.target.files[0])}
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Process Files
        </button>
        <p className="text-sm text-gray-700 text-center">{status}</p>
      </div>
    </div>
  );
}
