import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const noisePath = "C:/Users/Varun/Downloads/HYD_with_noise_db_filled.csv";
const aqiPath = "C:/Users/Varun/Downloads/UNIPS_DATASET INTERNSHIP.csv";
const outputDir = "H:/UNIPS-20260527T062616Z-3-001/UNIPS/unips-backend/outputs/powerbi_dataset";
const outputPath = `${outputDir}/UNIPS_PowerBI_Ready_Dataset.xlsx`;

const noiseCsv = await fs.readFile(noisePath, "utf8");
const aqiCsv = await fs.readFile(aqiPath, "utf8");
const noiseImport = await Workbook.fromCSV(noiseCsv, { sheetName: "Noise" });
const aqiImport = await Workbook.fromCSV(aqiCsv, { sheetName: "AQI" });
const noiseValues = noiseImport.worksheets.getItem("Noise").getUsedRange(true).values;
const aqiValues = aqiImport.worksheets.getItem("AQI").getUsedRange(true).values;

const noiseRows = noiseValues.slice(1).filter((r) => String(r[0] ?? "").trim() !== "");
const aqiRows = aqiValues.slice(1).filter((r) => String(r[0] ?? "").trim() !== "");

const workbook = Workbook.create();
const guide = workbook.worksheets.add("Power BI Guide");
const noise = workbook.worksheets.add("Noise_Data");
const aqi = workbook.worksheets.add("AQI_Forecast");
const dictionary = workbook.worksheets.add("Data_Dictionary");

guide.showGridLines = false;
guide.getRange("A1:H1").merge();
guide.getRange("A1").values = [["UNIPS Power BI Ready Dataset"]];
guide.getRange("A1:H1").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF", size: 18 },
  rowHeight: 32,
  verticalAlignment: "center",
};
guide.getRange("A3:B9").values = [
  ["Purpose", "Clean, analysis-ready noise and AQI forecast tables for Power BI."],
  ["Use both tables?", "Yes. Noise_Data supports historical/GIS analysis; AQI_Forecast supports forecast visuals."],
  ["Noise grain", "One station-month observation."],
  ["AQI grain", "One station and forecast-horizon prediction."],
  ["Recommended map", "Latitude + Longitude from Noise_Data; use Avg_Noise_dB for color/size."],
  ["Recommended relationship", "Keep tables separate unless a verified station mapping is supplied; their station identifiers differ."],
  ["Refresh", "Replace source rows with new data while preserving column names and types."],
];
guide.getRange("A11:B17").values = [
  ["Suggested Visual", "Fields"],
  ["Noise map", "Station_ID, Latitude, Longitude, Avg_Noise_dB, Noise_Risk"],
  ["Noise trend", "Record_Date, Avg_Noise_dB; legend: Station_ID"],
  ["Day vs night", "Station_ID, Day_dB, Night_dB"],
  ["AQI forecast line", "Forecast_Date, Predicted_AQI; legend: Station"],
  ["AQI category bars", "AQI_Category, count of Station"],
  ["KPI cards", "Average noise, maximum noise, average predicted AQI, high-risk record count"],
];
guide.getRange("A3:A9").format.font = { bold: true, color: "#17324D" };
guide.getRange("A11:B11").format = { fill: "#1D6F78", font: { bold: true, color: "#FFFFFF" } };
guide.getRange("A3:B9").format.borders = { preset: "inside", style: "thin", color: "#D7E0E7" };
guide.getRange("A11:B17").format.borders = { preset: "inside", style: "thin", color: "#D7E0E7" };
guide.getRange("A:B").format.columnWidth = 24;
guide.getRange("B:B").format.columnWidth = 78;
guide.getRange("B3:B17").format.wrapText = true;

const noiseHeaders = [
  "Station_ID", "Record_Date", "Year", "Month_Number", "Month_Name", "Quarter",
  "Day_dB", "Night_dB", "Avg_Noise_dB", "Day_Night_Gap_dB", "Data_Type",
  "Latitude", "Longitude", "Noise_Band", "Noise_Risk", "High_Noise_Flag", "Period_Key",
];
noise.getRangeByIndexes(0, 0, 1, noiseHeaders.length).values = [noiseHeaders];
const noiseBaseRows = noiseRows.map((r) => [
  String(r[0]), null, Number(r[1]), Number(r[2]), null, null,
  Number(r[3]), Number(r[4]), Number(r[8]), null, String(r[5]),
  Number(r[6]), Number(r[7]), null, null, null, null,
]);
noise.getRangeByIndexes(1, 0, noiseBaseRows.length, noiseHeaders.length).values = noiseBaseRows;
const noiseLast = noiseBaseRows.length + 1;
noise.getRange("B2").formulas = [["=DATE(C2,D2,1)"]];
noise.getRange(`B2:B${noiseLast}`).fillDown();
noise.getRange("E2").formulas = [['=TEXT(B2,"mmm")']];
noise.getRange(`E2:E${noiseLast}`).fillDown();
noise.getRange("F2").formulas = [['="Q"&ROUNDUP(D2/3,0)']];
noise.getRange(`F2:F${noiseLast}`).fillDown();
noise.getRange("J2").formulas = [["=G2-H2"]];
noise.getRange(`J2:J${noiseLast}`).fillDown();
noise.getRange("N2").formulas = [['=IF(I2>70,"70+ dB",IF(I2>55,"56-70 dB","41-55 dB"))']];
noise.getRange(`N2:N${noiseLast}`).fillDown();
noise.getRange("O2").formulas = [['=IF(I2>70,"High",IF(I2>55,"Moderate","Low"))']];
noise.getRange(`O2:O${noiseLast}`).fillDown();
noise.getRange("P2").formulas = [['=IF(I2>=70,"Yes","No")']];
noise.getRange(`P2:P${noiseLast}`).fillDown();
noise.getRange("Q2").formulas = [['=TEXT(B2,"yyyy-mm")']];
noise.getRange(`Q2:Q${noiseLast}`).fillDown();
noise.tables.add(`A1:Q${noiseLast}`, true, "NoiseDataTable").style = "TableStyleMedium2";
noise.freezePanes.freezeRows(1);
noise.showGridLines = false;
noise.getRange(`B2:B${noiseLast}`).format.numberFormat = "yyyy-mm-dd";
noise.getRange(`G2:J${noiseLast}`).format.numberFormat = "0.0";
noise.getRange(`L2:M${noiseLast}`).format.numberFormat = "0.0000";
noise.getRange(`A1:Q${Math.min(noiseLast, 100)}`).format.autofitColumns();
["A", "E", "F", "K", "N", "O", "P", "Q"].forEach((c) => noise.getRange(`${c}:${c}`).format.columnWidth = 16);

const aqiHeaders = [
  "Station", "Horizon_Months", "Forecast_Date", "Forecast_Year",
  "Forecast_Month_Number", "Forecast_Month_Name", "Quarter", "Predicted_AQI",
  "AQI_Category", "Health_Concern", "Severity_Rank", "Poor_Or_Worse_Flag", "Period_Key",
];
aqi.getRangeByIndexes(0, 0, 1, aqiHeaders.length).values = [aqiHeaders];
const aqiBaseRows = aqiRows.map((r) => {
  const [day, month, year] = String(r[2]).split("-").map(Number);
  return [String(r[0]), Number(r[1]), new Date(Date.UTC(year, month - 1, day)), null, null, null, null, Number(r[3]), null, null, null, null, null];
});
aqi.getRangeByIndexes(1, 0, aqiBaseRows.length, aqiHeaders.length).values = aqiBaseRows;
const aqiLast = aqiBaseRows.length + 1;
aqi.getRange("D2").formulas = [["=YEAR(C2)"]];
aqi.getRange(`D2:D${aqiLast}`).fillDown();
aqi.getRange("E2").formulas = [["=MONTH(C2)"]];
aqi.getRange(`E2:E${aqiLast}`).fillDown();
aqi.getRange("F2").formulas = [['=TEXT(C2,"mmm")']];
aqi.getRange(`F2:F${aqiLast}`).fillDown();
aqi.getRange("G2").formulas = [['="Q"&ROUNDUP(E2/3,0)']];
aqi.getRange(`G2:G${aqiLast}`).fillDown();
aqi.getRange("I2").formulas = [['=IF(H2<=50,"Good",IF(H2<=100,"Satisfactory",IF(H2<=200,"Moderate",IF(H2<=300,"Poor",IF(H2<=400,"Very Poor","Severe")))))']];
aqi.getRange(`I2:I${aqiLast}`).fillDown();
aqi.getRange("J2").formulas = [['=IF(H2<=50,"Minimal",IF(H2<=100,"Minor discomfort",IF(H2<=200,"Breathing discomfort for sensitive groups",IF(H2<=300,"Breathing discomfort on prolonged exposure",IF(H2<=400,"Respiratory illness risk","Serious health impact")))))']];
aqi.getRange(`J2:J${aqiLast}`).fillDown();
aqi.getRange("K2").formulas = [['=IF(H2<=50,1,IF(H2<=100,2,IF(H2<=200,3,IF(H2<=300,4,IF(H2<=400,5,6)))))']];
aqi.getRange(`K2:K${aqiLast}`).fillDown();
aqi.getRange("L2").formulas = [['=IF(H2>200,"Yes","No")']];
aqi.getRange(`L2:L${aqiLast}`).fillDown();
aqi.getRange("M2").formulas = [['=TEXT(C2,"yyyy-mm")']];
aqi.getRange(`M2:M${aqiLast}`).fillDown();
aqi.tables.add(`A1:M${aqiLast}`, true, "AQIForecastTable").style = "TableStyleMedium4";
aqi.freezePanes.freezeRows(1);
aqi.showGridLines = false;
aqi.getRange(`C2:C${aqiLast}`).format.numberFormat = "yyyy-mm-dd";
aqi.getRange(`H2:H${aqiLast}`).format.numberFormat = "0.00";
aqi.getRange(`A1:M${aqiLast}`).format.autofitColumns();
aqi.getRange("J:J").format.columnWidth = 42;
aqi.getRange("J2:J41").format.wrapText = true;

const dictionaryRows = [
  ["Table", "Column", "Type", "Meaning / Power BI use"],
  ["Noise_Data", "Station_ID", "Text", "Noise station identifier; use as map legend or slicer."],
  ["Noise_Data", "Record_Date", "Date", "First day of the observation month; supports time intelligence."],
  ["Noise_Data", "Day_dB / Night_dB", "Decimal", "Measured or estimated daytime/nighttime noise levels."],
  ["Noise_Data", "Avg_Noise_dB", "Decimal", "Average noise value supplied in the raw dataset."],
  ["Noise_Data", "Day_Night_Gap_dB", "Decimal", "Day level minus night level."],
  ["Noise_Data", "Data_Type", "Text", "OBSERVED or HINDCAST; useful as a filter."],
  ["Noise_Data", "Latitude / Longitude", "Decimal", "GIS coordinates. Set Power BI data categories to Latitude and Longitude."],
  ["Noise_Data", "Noise_Risk", "Text", "Low <=55 dB; Moderate >55 to 70 dB; High >70 dB."],
  ["Noise_Data", "High_Noise_Flag", "Text", "Convenience flag for records at or above 70 dB; analytical threshold, not a legal compliance judgment."],
  ["AQI_Forecast", "Horizon_Months", "Whole number", "Forecast lead time in months."],
  ["AQI_Forecast", "Forecast_Date", "Date", "Date represented by the forecast."],
  ["AQI_Forecast", "Predicted_AQI", "Decimal", "Model-provided AQI prediction."],
  ["AQI_Forecast", "AQI_Category", "Text", "Indian AQI bands: Good, Satisfactory, Moderate, Poor, Very Poor, Severe."],
  ["AQI_Forecast", "Severity_Rank", "Whole number", "Sort AQI_Category by this column (1 best to 6 worst)."],
  ["AQI_Forecast", "Poor_Or_Worse_Flag", "Text", "Yes when Predicted_AQI is greater than 200."],
  ["Both", "Period_Key", "Text", "YYYY-MM key for grouping; do not directly relate tables unless station semantics are verified."],
];
dictionary.getRangeByIndexes(0, 0, dictionaryRows.length, 4).values = dictionaryRows;
dictionary.tables.add(`A1:D${dictionaryRows.length}`, true, "DataDictionaryTable").style = "TableStyleMedium2";
dictionary.freezePanes.freezeRows(1);
dictionary.showGridLines = false;
dictionary.getRange(`A1:D${dictionaryRows.length}`).format.autofitColumns();
dictionary.getRange("D:D").format.columnWidth = 72;
dictionary.getRange(`D2:D${dictionaryRows.length}`).format.wrapText = true;

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

const checks = {
  noise: (await workbook.inspect({ kind: "table", range: "Noise_Data!A1:Q8", include: "values,formulas", tableMaxRows: 8, tableMaxCols: 17 })).ndjson,
  aqi: (await workbook.inspect({ kind: "table", range: "AQI_Forecast!A1:M8", include: "values,formulas", tableMaxRows: 8, tableMaxCols: 13 })).ndjson,
  errors: (await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 50 }, summary: "formula error scan" })).ndjson,
};
await fs.writeFile(`${outputDir}/verification.json`, JSON.stringify(checks, null, 2));

const previewRanges = {
  "Power BI Guide": "A1:H18",
  "Noise_Data": "A1:Q25",
  "AQI_Forecast": "A1:M25",
  "Data_Dictionary": `A1:D${dictionaryRows.length}`,
};
for (const sheetName of ["Power BI Guide", "Noise_Data", "AQI_Forecast", "Data_Dictionary"]) {
  const preview = await workbook.render({ sheetName, range: previewRanges[sheetName], scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/${sheetName.replaceAll(" ", "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

console.log(JSON.stringify({ outputPath, noiseRows: noiseRows.length, aqiRows: aqiRows.length }));
