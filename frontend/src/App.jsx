import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState({
    inputFile: null,
    templateFile: null,
    configFile: null,
  });

  const handleChange = (e) => {
    const { name, files: selected } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selected[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.inputFile || !files.templateFile || !files.configFile) {
      setStatus("❌ Vui lòng chọn đủ 3 file.");
      return;
    }

    setStatus("Đang xử lý...");

    const formData = new FormData();
    formData.append("inputFile", files.inputFile);
    formData.append("templateFile", files.templateFile);
    formData.append("configFile", files.configFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        setStatus(`❌ Lỗi: ${err.error}`);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mapped.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("✅ Thành công!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Đã xảy ra lỗi khi gửi request.");
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", textAlign: "center" }}>
      <h1>Excel Mapping Tool</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Input File (.xlsx)
          <input
            type="file"
            name="inputFile"
            accept=".xlsx"
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Template File (.xlsx)
          <input
            type="file"
            name="templateFile"
            accept=".xlsx"
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Config File (.json)
          <input
            type="file"
            name="configFile"
            accept=".json"
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">🛠 Xử lý Mapping</button>
      </form>
      <p>{status}</p>
    </main>
  );
}
