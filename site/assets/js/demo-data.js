// Kinema in the Woods — unofficial redesign concept.
// Shared FICTIONAL demonstration data: sample films and sample screenings.
// This is not The Kinema in the Woods' programme and implies no real availability.
// Single source for the quick-booking panel now, and for film listings / booking later.
(() => {
  'use strict';

  const films = [
    {
      id: 'lantern-path',
      title: 'The Lantern Path',
      synopsis: 'A retired projectionist follows a trail of lanterns through the winter woods to return a long-lost reel.',
      artwork: 'assets/img/sample-film-lantern-path.svg',
      featured: true,
    },
    {
      id: 'midnight-paragon',
      title: 'Midnight at the Paragon',
      synopsis: 'On the last night of a 1930s picture palace, an usher and a stranded star untangle a mystery in the stalls.',
    },
    {
      id: 'salt-and-silver',
      title: 'Salt & Silver',
      synopsis: 'Two estranged sisters spend one bright, blustery summer restoring their grandmother’s seaside lido.',
    },
    {
      id: 'fern-night-train',
      title: 'Fern and the Night Train',
      synopsis: 'A curious hedgehog stows away on a moonlit train in this gentle animated adventure for all ages.',
    },
  ];

  // [filmId, ISO date, 24-hour time, soldOut?]
  const rows = [
    ['lantern-path', '2026-12-03', '14:00'], ['lantern-path', '2026-12-03', '18:00'],
    ['lantern-path', '2026-12-04', '17:30'], ['lantern-path', '2026-12-04', '20:15'],
    ['lantern-path', '2026-12-05', '11:00'], ['lantern-path', '2026-12-05', '19:30', true],
    ['lantern-path', '2026-12-06', '15:00'],

    ['midnight-paragon', '2026-12-03', '20:30'],
    ['midnight-paragon', '2026-12-04', '17:30'], ['midnight-paragon', '2026-12-04', '21:15'],
    ['midnight-paragon', '2026-12-06', '18:45'],

    ['salt-and-silver', '2026-12-04', '13:30'],
    ['salt-and-silver', '2026-12-05', '16:00'], ['salt-and-silver', '2026-12-05', '19:15'],
    ['salt-and-silver', '2026-12-06', '13:00'], ['salt-and-silver', '2026-12-06', '19:15'],

    ['fern-night-train', '2026-12-03', '10:30'],
    ['fern-night-train', '2026-12-05', '10:00'], ['fern-night-train', '2026-12-05', '13:15'],
    ['fern-night-train', '2026-12-06', '11:30', true],
  ];

  const screenings = rows.map(([filmId, date, time, soldOut = false]) => Object.freeze({
    id: `${filmId}_${date}_${time.replace(':', '')}`,
    filmId, date, time, soldOut,
  }));

  window.KINEMA_DEMO = Object.freeze({
    notice: 'Fictional sample films and screenings for an unofficial portfolio concept. Not a live programme.',
    films: Object.freeze(films.map((f) => Object.freeze(f))),
    screenings: Object.freeze(screenings),
  });
})();
