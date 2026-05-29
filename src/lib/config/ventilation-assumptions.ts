export const ventilationAssumptions = {
  bathroomSourceId: 'hvi-bathroom',
  bathroomMinCfm: 50,
  smallBathroomCfmPerSqft: 1,
  fixtureCfm: {
    toilet: 50,
    shower: 50,
    tub: 50,
    jettedTub: 100
  },
  notes: 'Residential educational estimate only. Delivered airflow also depends on fan curve, duct length, bends, termination and local code.'
} as const;
