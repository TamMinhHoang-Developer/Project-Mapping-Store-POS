// backend/mapExcel.js
import ExcelJS from 'exceljs';
import fs from 'fs/promises';

export async function mapExcel(inputPath, templatePath, configPath) {
  const inputWb = new ExcelJS.Workbook();
  const templateWb = new ExcelJS.Workbook();

  await inputWb.xlsx.readFile(inputPath);
  await templateWb.xlsx.readFile(templatePath);

  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

  for (const sheetMap of config.sheets) {
    const inputSheet = inputWb.getWorksheet(sheetMap.inputSheet);
    const templateSheet = templateWb.getWorksheet(sheetMap.templateSheet);

    if (!inputSheet || !templateSheet) continue;

    // Map header column name to column index
    const inputHeaderRow = inputSheet.getRow(sheetMap.startRow - 1);
    const templateHeaderRow = templateSheet.getRow(sheetMap.startRow - 1);

    const inputColumnMap = {};
    inputHeaderRow.eachCell((cell, colNumber) => {
      inputColumnMap[cell.text.trim()] = colNumber;
    });

    const templateColumnMap = {};
    templateHeaderRow.eachCell((cell, colNumber) => {
      templateColumnMap[cell.text.trim()] = colNumber;
    });

    // Copy data rows
    let rowIndex = sheetMap.startRow;
    while (true) {
      const inputRow = inputSheet.getRow(rowIndex);
      if (inputRow.actualCellCount === 0) break;

      const templateRow = templateSheet.getRow(rowIndex);
      for (const colMap of sheetMap.columns) {
        const inputCol = inputColumnMap[colMap.input];
        const templateCol = templateColumnMap[colMap.template];

        if (inputCol && templateCol) {
          const inputCell = inputRow.getCell(inputCol);
          const templateCell = templateRow.getCell(templateCol);

          templateCell.value = inputCell.value;

          // Copy style from template header (if exists)
          const styleRef = templateHeaderRow.getCell(templateCol).style;
          if (styleRef) {
            templateCell.style = styleRef;
          }
        }
      }

      rowIndex++;
    }
  }

  const buffer = await templateWb.xlsx.writeBuffer();
  return buffer;
}
