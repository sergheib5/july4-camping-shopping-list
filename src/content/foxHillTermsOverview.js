/**
 * Short “at a glance” bullets — `parts` are strings or { strong } for bold spans.
 * Not a substitute for the full contract text.
 */

/** @typedef {string | { strong: string }} OverviewPart */

/** @type {{ parts: OverviewPart[] }[]} */
export const foxHillTermsOverviewItems = [
  {
    parts: [
      { strong: 'Check-in & check-out.' },
      ' Check-in ',
      { strong: '2:00 PM' },
      ' (earliest ',
      { strong: 'noon' },
      ', may cost extra). Cabins out ',
      { strong: '11:00 AM' },
      '; RV/tent ',
      { strong: 'noon' },
      '. Late check-out may run to ',
      { strong: '1:45 PM' },
      ' for a fee. If you arrive after ',
      { strong: '9:00 PM' },
      ', call the office.',
    ],
  },
  {
    parts: [
      { strong: 'Quiet hours.' },
      ' ',
      { strong: '11:00 PM–7:00 AM' },
      ' — keep noise down; serious rule-breaking can mean ',
      { strong: 'eviction without refund' },
      '.',
    ],
  },
  {
    parts: [
      { strong: 'Firewood.' },
      ' Outside wood only if it meets ',
      { strong: 'WI DNR' },
      ' rules; buy firewood at the office; ',
      { strong: "don't move fire rings" },
      ' (fee applies); never leave a fire unattended.',
    ],
  },
  {
    parts: [
      { strong: 'Fireworks & gear bans.' },
      ' ',
      { strong: 'Fireworks' },
      ' can mean a ',
      { strong: '$500' },
      ' fine and possible ',
      { strong: 'eviction' },
      '; also no weapons, illegal drugs, slip-n-slides, portable pools/hot tubs, and other listed items.',
    ],
  },
  {
    parts: [
      { strong: 'On-site rules.' },
      ' ',
      { strong: '5 MPH' },
      '; wear ',
      { strong: 'wristbands' },
      '; visitors register and pay for passes; leave by ',
      { strong: '10:00 PM' },
      ' unless staying overnight (see full text for fees).',
    ],
  },
];
