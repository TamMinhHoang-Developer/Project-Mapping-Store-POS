const Excel = require("exceljs");
const fs = require("fs");
const path = require("path");

module.exports = async function mapExcel(inputPath, templatePath, mappingPath) {
  const inputWB = new Excel.Workbook();
  const templateWB = new Excel.Workbook();

  await inputWB.xlsx.readFile(inputPath);
  await templateWB.xlsx.readFile(templatePath);

  const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

  for (const sheetMap of mapping.sheets) {
    const { inputSheet, templateSheet, startRow, startColumn, columns } =
      sheetMap;

    const inputWS = inputWB.getWorksheet(inputSheet);
    const templateWS = templateWB.getWorksheet(templateSheet);

    if (!inputWS || !templateWS) continue;

    // Build input header map (key: header text, value: column index)
    const inputHeaderRow = inputWS.getRow(startRow - 1);
    const inputHeaderMap = {};
    inputHeaderRow.eachCell((cell, colNumber) => {
      if (cell.value) {
        inputHeaderMap[cell.value.toString().trim()] = colNumber;
      }
    });

    // Build template header map (header text -> column index at template)
    const templateHeaderRow = templateWS.getRow(startRow - 1);
    const templateHeaderMap = {};
    templateHeaderRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber >= startColumn && cell.value) {
        templateHeaderMap[cell.value.toString().trim()] = colNumber;
      }
    });

    // Write input data to template according to column mapping
    const inputDataStartRow = startRow;
    let currentOutputRow = startRow;

    for (let r = inputDataStartRow; r <= inputWS.rowCount; r++) {
      const inputRow = inputWS.getRow(r);
      const targetRow = templateWS.getRow(currentOutputRow++);

      for (const [inputColName, templateColName] of Object.entries(columns)) {
        const inputColIndex = inputHeaderMap[inputColName];
        const templateColIndex = templateHeaderMap[templateColName];

        if (!inputColIndex || !templateColIndex) continue;

        const inputCell = inputRow.getCell(inputColIndex);
        const targetCell = targetRow.getCell(templateColIndex);

        targetCell.value = inputCell.value;
        targetCell.style = { ...inputCell.style };
      }
    }
  }

  // Save output file
  const outputPath = path.join(__dirname, "Output.xlsx");
  await templateWB.xlsx.writeFile(outputPath);
  return outputPath;
};
