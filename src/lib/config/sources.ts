export type Source = {
  id: string;
  name: string;
  url: string;
  lastCheckedAt: string;
  notes: string;
};

export const SOURCES: Source[] = [
  {
    id: 'doe-room-ac',
    name: 'DOE Room Air Conditioners',
    url: 'https://www.energy.gov/energysaver/room-air-conditioners',
    lastCheckedAt: '2026-05-22',
    notes: 'Used for room AC preliminary BTU rule, room-level sizing caveats and oversizing humidity cautions.'
  },
  {
    id: 'doe-portable-ac',
    name: 'DOE Portable Air Conditioners Test Procedure',
    url: 'https://www.energy.gov/eere/buildings/articles/energy-conservation-program-test-procedure-portable-air-conditioners',
    lastCheckedAt: '2026-05-22',
    notes: 'Used for portable AC SACC / label caveats.'
  },
  {
    id: 'energy-star-dehumidifier',
    name: 'ENERGY STAR Certified Dehumidifiers',
    url: 'https://www.energystar.gov/productfinder/product/certified-dehumidifiers/results',
    lastCheckedAt: '2026-05-22',
    notes: 'Used for pints/day and product rating caveats.'
  },
  {
    id: 'hvi-bathroom',
    name: 'HVI Bathroom Ventilation',
    url: 'https://www.hvi.org/resources/publications/bathroom-ventilation/',
    lastCheckedAt: '2026-05-22',
    notes: 'Used for residential bathroom fan CFM rules and fixture model.'
  },
  {
    id: 'acca-manuals',
    name: 'ACCA Technical Manuals',
    url: 'https://www.acca.org/standards/technical-manuals',
    lastCheckedAt: '2026-05-22',
    notes: 'Used to define Manual J, Manual S and Manual D boundaries.'
  },
  {
    id: 'epa-mold',
    name: 'EPA Mold and Indoor Air Guidance',
    url: 'https://www.epa.gov/mold',
    lastCheckedAt: '2026-05-22',
    notes: 'Used for mold and water intrusion disclaimers.'
  }
];

export const sourceById = (id: string) => SOURCES.find((source) => source.id === id);
