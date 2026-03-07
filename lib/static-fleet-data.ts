/**
 * @deprecated Fleet data now comes from Aiven (fleet_decisions_full_6).
 * This file is kept for backwards compatibility with generate scripts.
 * The app no longer uses this data.
 */
export const staticFleetData: any[] = []
export const staticFleetStats: any = {
  counts: { trucks: 0, gpsRecords: 0, sensorRecords: 0, decisionRecords: 0 },
  timeRange: {},
  averages: {},
}
