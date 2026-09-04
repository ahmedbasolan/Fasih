// Centralized image imports — all app images must be imported from here.
// Never use require() directly inside components.
//
// The four character/mode PNGs that used to live here (foxy_male, foxy_girl,
// career_mode, social_mode) are gone with Sadaf — 4.6 MB for six renders.
// Character art now goes through `components/ui/Companion`, which is the one
// file to change if a character is ever reintroduced.

const scenarioOffice = require('../../assets/images/scenario_images/Office_morning.jpg');
const scenarioScene = require('../../assets/images/scenario_images/scene.jpg');

export const IMAGES = {
  scenarioOffice,
  scenarioScene,
};
