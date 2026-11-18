// Centralized Player Photography Registry
// Authentic player photography sourced from Rajasthan Royals official media, IPL, and official cricket archives.

export const PLAYER_PHOTOS = {
  // Top 10 Batters Under Pressure
  'babar azam': '/images/players/babar-azam.jpg',
  'naman dhir': '/images/players/naman-dhir.png',
  'shashank singh': '/images/players/shashank-singh.png',
  'suryakumar yadav': '/images/players/suryakumar-yadav.jpg',
  'phil salt': '/images/players/phil-salt.jpg',
  'shikhar dhawan': '/images/players/shikhar-dhawan.jpg',
  'rishabh pant': '/images/players/rishabh-pant.jpg',
  'virat kohli': '/images/players/virat-kohli.jpg',
  'ryan rickelton': '/images/players/ryan-rickelton.jpg',
  'yashasvi jaiswal': '/images/rr/players/yashasvi-jaiswal.png',

  // Top 10 Bowlers Under Pressure
  'mohammad nawaz': '/images/players/mohammad-nawaz.jpg',
  'sufiyan muqeem': '/images/players/sufiyan-muqeem.jpg',
  'abrar ahmed': '/images/players/abrar-ahmed.jpg',
  'sunil narine': '/images/players/sunil-narine.jpg',
  'mitchell santner': '/images/players/mitchell-santner.jpg',
  'rashid khan': '/images/players/rashid-khan.jpg',
  'mahedi hasan': '/images/players/mahedi-hasan.jpg',
  'jasprit bumrah': '/images/players/jasprit-bumrah.jpg',
  'hasan mahmud': '/images/players/hasan-mahmud.jpg',
  'mujeeb ur rahman': '/images/players/mujeeb-ur-rahman.jpg',

  // Other Star Players (International / IPL)
  'sanju samson': '/images/players/sanju-samson.jpg',

  // Rajasthan Royals Marquee Stars (IPL 2027 Roster)
  'mohammed shami': '/images/rr/players/mohammed-shami.png',
  'vaibhav suryavanshi': '/images/rr/players/vaibhav-special.png',
  'vaibhav sooryavanshi': '/images/rr/players/vaibhav-special.png',
  'ravindra jadeja': '/images/rr/players/ravindra-jadeja.png',
  'riyan parag': '/images/rr/players/riyan-parag.png',
  'dhruv jurel': '/images/rr/players/dhruv-jurel.png',
  'jofra archer': '/images/rr/players/jofra-archer.png',
  'ravi bishnoi': '/images/rr/players/ravi-bishnoi.png',
  'sandeep sharma': '/images/rr/players/sandeep-sharma.png'
};

export function getPlayerPhoto(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  return PLAYER_PHOTOS[key] || null;
}

export function getPlayerInitials(name) {
  if (!name) return 'RR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
