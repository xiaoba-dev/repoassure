import {
  generateHardenReport,
  type HardenReportInput,
  type HardenReportResult
} from '../domain/reports/harden-report.js';

export async function runHardenReportTool(
  input: HardenReportInput
): Promise<HardenReportResult> {
  return generateHardenReport(input);
}
