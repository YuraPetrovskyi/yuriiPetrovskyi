const castleIcon = L.icon({
  iconUrl: 'images/castle.png',
  iconSize: [32, 32], 
  iconAnchor: [16, 32], 
  popupAnchor: [0, -30]
});

const monumentIcon = L.icon({
  iconUrl: 'images/monument.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const museumIcon = L.icon({
  iconUrl: 'images/museum.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const cityIcon = L.icon({
  iconUrl: 'images/city.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const rivertIcon = L.icon({
  iconUrl: 'images/river.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const waterbodyIcon = L.icon({
  iconUrl: 'images/waterfall.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const mountainIcon = L.icon({
  iconUrl: 'images/mountain.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const bridgeIcon = L.icon({
  iconUrl: 'images/bridge.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const lodgeIcon = L.icon({
  iconUrl: 'images/lodge.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const chapelIcon = L.icon({
  iconUrl: 'images/chapel.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const golfIcon = L.icon({
  iconUrl: 'images/golf.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const trailIcon = L.icon({
  iconUrl: 'images/trail.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const airportIcon = L.icon({
  iconUrl: 'images/airport.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const schoolIcon = L.icon({
  iconUrl: 'images/school.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const roadIcon = L.icon({
  iconUrl: 'images/road.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const parkIcon = L.icon({
  iconUrl: 'images/park.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const woodIcon = L.icon({
  iconUrl: 'images/wood.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const railwayIcon = L.icon({
  iconUrl: 'images/railway.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const footballIcon = L.icon({
  iconUrl: 'images/football.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const stadiumIcon = L.icon({
  iconUrl: 'images/stadium.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const hillIcon = L.icon({
  iconUrl: 'images/hill.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const houseIcon = L.icon({
  iconUrl: 'images/house.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const marketIcon = L.icon({
  iconUrl: 'images/market.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});
const hospitalIcon = L.icon({
  iconUrl: 'images/hospital.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});
const innIcon = L.icon({
  iconUrl: 'images/inn.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});
const collegeIcon = L.icon({
  iconUrl: 'images/college.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

// A function for determining the icon by location type
export function getIconByTitle(feature = '', title) {
  switch (feature) {
      case 'city':
          return cityIcon;
      case 'river':
          return rivertIcon;
      case 'waterbody':
          return waterbodyIcon;
      case 'mountain':
          return mountainIcon;
      default:
          break; // If the feature does not fit, check the title
  }
  
  const lowerTitle = title.toLowerCase(); 
  
  if (/\bfootball\b/.test(lowerTitle) || /\bsoccer\b/.test(lowerTitle)) {
      return footballIcon;
  } else if (/\bstadium\b/.test(lowerTitle)) {
      return stadiumIcon;
  } else if (/\bmarket\b/.test(lowerTitle) || /\bfair\b/.test(lowerTitle)) {
      return marketIcon;
  } else if (/\bhospital\b/.test(lowerTitle)) {
      return hospitalIcon;
  } else if (/\binn\b/.test(lowerTitle) || /\bhotel\b/.test(lowerTitle) || /\bhostel\b/.test(lowerTitle) || /\bmotel\b/.test(lowerTitle)) {
      return innIcon;
  } else if (/\bcollege\b/.test(lowerTitle) || /\buniversity\b/.test(lowerTitle) || /\binstitute\b/.test(lowerTitle)) {
      return collegeIcon;
  } else if (/\bmonument\b/.test(lowerTitle)) {
      return monumentIcon;
  } else if (/\bcastle\b/.test(lowerTitle)) {
      return castleIcon;
  } else if (/\bcastle\b/.test(lowerTitle)) {
      return castleIcon;
  } else if (/\bmuseum\b/.test(lowerTitle)) {
      return museumIcon;
  } else if (/\bhill\b/.test(lowerTitle)) {
      return hillIcon;
  } else if (/\bcity\b/.test(lowerTitle)) {
      return cityIcon;
  } else if (/\briver\b/.test(lowerTitle)) {
      return rivertIcon;
  } else if (/\btrail\b/.test(lowerTitle)) {
      return trailIcon;
  } else if (/\bschool\b/.test(lowerTitle)) {
      return schoolIcon;
  } else if (/\bairport\b/.test(lowerTitle)) {
      return airportIcon;
  } else if (/\blodge\b/.test(lowerTitle)) {
      return lodgeIcon;
  } else if (/\broad\b/.test(lowerTitle)) {
      return roadIcon;
  } else if (/\bbridge\b/.test(lowerTitle)) {
      return bridgeIcon;
  } else if (/\bpark\b/.test(lowerTitle)) {
      return parkIcon;
  } else if (/\bhouse\b/.test(lowerTitle)) {
      return houseIcon;
  } else if (/\bgolf\b/.test(lowerTitle)) {
      return golfIcon;
  } else if (/\bwood\b/.test(lowerTitle)) {
      return woodIcon;
  } else if (/\brailway\b/.test(lowerTitle)) {
      return railwayIcon;
  } else if (/\bchapel\b/.test(lowerTitle) || /\bkirk\b/.test(lowerTitle) || /\bchurches\b/.test(lowerTitle) || /\bchurch\b/.test(lowerTitle)) {
      return chapelIcon;
  } else {
      return L.icon({
          iconUrl: 'images/default.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30]
      });
  }
}