//LOOT TABLE: purely data, logic is in script.js dayo

// Multipliers
// Items without "multi" are never multiplied.
//   scalesWithObelisk   - × (1 + Obelisk × 0.08)
//   scalesWithAscension - × (Ascension + 1)
//   bonuses             - extra × once you reach that Obelisk (they STACK)

const MULTIPLIERS = {
  skillBit: {
    scalesWithObelisk: true,
    bonuses: [
      { obelisk: 60, times: 2 },
      { obelisk: 64, times: 2 },
      { obelisk: 70, times: 3 },
    ],
  },
  relic: {
    scalesWithObelisk: true,
    bonuses: [{ obelisk: 64, times: 3 }],
  },
  gem: {
    scalesWithObelisk: true,
    bonuses: [{ obelisk: 64, times: 5 }],
  },
  gemChest: {
    bonuses: [{ obelisk: 70, times: 2 }], // base ×1, so no scalesWithObelisk
  },
  t2: {
    bonuses: [{ obelisk: 64, times: 3 }],
  },
  idol: {
    scalesWithAscension: true,
  },
};

// Base slots: Picked at random, every slot has the same chance (1/12)
// name - minimum amount - max amount - image to picture
//Conditions - needs
const BASE_POOL = [
  {
    // 1
    name: "Relic Chests",
    min: 3,
    max: 5,
    multi: "relic",
    image: "images/relic-chests.png",
  },
  {
    name: "Relic Chests",
    min: 5,
    max: 10,
    multi: "relic",
    image: "images/relic-chests.png",
  }, // 2
  { name: "Gems", min: 20, max: 40, multi: "gem", image: "images/gems.png" }, //  3
  { name: "Gems", min: 35, max: 60, multi: "gem", image: "images/gems.png" }, //  4
  {
    // 5
    name: "Skill Bits",
    min: 2,
    max: 5,
    multi: "skillBit",
    image: "images/skill-bits.png",
  },
  {
    //6 Obelisk >= 30
    needs: { obelisk: 30 },
    yes: {
      name: "Minutes 5x Fragment Gain",
      min: 10,
      max: 15,
      image: "images/fragment-gain.png",
    },
    no: {
      name: "Chaos Totem",
      min: 10,
      max: 15,
      image: "images/chaos-totem.png",
    },
  },
  {
    // 7: Obelisk >= 37
    needs: { obelisk: 37 },
    yes: { name: "Sushi", min: 4, max: 6, image: "images/sushi.png" },
    no: {
      name: "Primal Meat",
      min: 6,
      max: 12,
      image: "images/primal-meat.png",
    },
  },
  {
    // 8: Obelisk >= 37
    needs: { obelisk: 37 },
    yes: {
      name: "Minutes 5x Tick Chance",
      min: 10,
      max: 15,
      image: "images/tick-chance.png",
    },
    no: {
      name: "Charge Magnets",
      min: 12,
      max: 20,
      image: "images/charge-magnets.png",
    },
  },
  {
    // 9: Fishing started = Obelisk >= 37
    needs: { obelisk: 37 },
    yes: {
      name: "Tier 2 Items",
      min: 3,
      max: 5,
      multi: "t2",
      image: "images/tier-2-items.png",
    },
    no: { name: "Blue Cow", min: 2, max: 4, image: "images/blue-cow.png" },
  },
  {
    // 10: World >= 3
    needs: { world: 3 },
    yes: {
      name: "Cherry Bomb Charges",
      min: 1500,
      max: 2750,
      image: "images/cherry-bomb.png",
    },
    no: {
      name: "Minutes 2x Game Speed",
      min: 20,
      max: 45,
      image: "images/game-speed.png",
    },
  },
  {
    // 11: Golden Ore Chance >= 3% = World >= 3 (usually cuz Orion, too lazy to code in another checkbox bleh)
    needs: { world: 3 },
    yes: {
      name: "Gold Flake Steaks",
      min: 1,
      max: 2,
      image: "images/gold-flake-steaks.png",
    },
    no: {
      name: "Item Chests",
      min: 25,
      max: 40,
      image: "images/item-chests.png",
    },
  },
  {
    // 12: Obelisk >= 60
    needs: { obelisk: 60 },
    yes: {
      name: "Gems",
      min: 90,
      max: 150,
      multi: "gem",
      image: "images/gems.png",
    },
    no: {
      name: "Minutes 2x Ore Income",
      min: 60,
      max: 120,
      image: "images/ore-income.png",
    },
  },
];

//STICKERS!!!!!!
const STICKER_POOL = [
  // Default
  { name: "Gem Stickers", image: "images/sticker-gem.png" },
  { name: "Freebie Stickers", image: "images/sticker-freebie.png" },
  { name: "Lootbug Stickers", image: "images/sticker-lootbug.png" },
  { name: "Relic Stickers", image: "images/sticker-relic.png" },
  { name: "Skill Bit Stickers", image: "images/sticker-skill-bit.png" },
  { name: "Fuel Stickers", image: "images/sticker-fuel.png" },
  // Need unlocks
  {
    name: "Cherry Stickers",
    needs: { world: 3 },
    image: "images/sticker-cherry.png",
  },
  {
    name: "Sushi Stickers",
    needs: { obelisk: 37 },
    image: "images/sticker-sushi.png",
  },
  {
    name: "Steak Stickers",
    needs: { world: 3 },
    image: "images/sticker-steak.png",
  },
  {
    name: "Candy Stickers",
    needs: { obelisk: 60 },
    image: "images/sticker-candy.png",
  },
  {
    name: "Frogspawn Stickers",
    needs: { blackHole: true },
    image: "images/sticker-frogspawn.png",
  },
  {
    name: "Golden Frog Stickers",
    needs: { blackHole: true },
    image: "images/sticker-golden-frog.png",
  },
];

//Roll in order after the base roll.
// Has oneIn x chances, if it miss, move down the list.
// A hit replace the reward so far, lower row wins.
const RARE_POOL = [
  {
    name: "Minutes 2x Star Spawn Rate",
    min: 120,
    max: 180,
    oneIn: 35,
    needs: { obelisk: 30, maxObelisk: 59 },
    image: "images/star-spawn.png",
  },
  { name: "Gifts", min: 3, max: 3, oneIn: 40, image: "images/gift.png" },
  {
    name: "Gems",
    min: 80,
    max: 130,
    oneIn: 45,
    multi: "gem",
    image: "images/gems.png",
  },
  {
    name: "Tier 2 Items",
    min: 6,
    max: 12,
    oneIn: 37,
    needs: { obelisk: 37 },
    multi: "t2",
    image: "images/tier-2-items.png",
  },
  {
    name: "Drone Fuel",
    oneIn: 30,
    image: "images/drone-fuel.png",
    // the amount depends on Obelisk Level (wiki footnote 2 said so dont blame me blame the wikiers)
    // 41 + round((Obelisk − 18) × 2) +- 10, minimum 30
    rollAmount: (level) => {
      const center = 41 + Math.round((level - 18) * 2); // middle of the range
      const amount = randomInt(center - 10, center + 10); // +-10 around it
      return Math.max(30, amount); // never below 30
    },
  },
  {
    name: "Idol Tokens",
    min: 1,
    max: 3,
    oneIn: 33,
    needs: { obelisk: 30 },
    multi: "idol",
    image: "images/idol-tokens.png",
  },
  {
    name: "Sushi",
    min: 15,
    max: 24,
    oneIn: 45,
    needs: { obelisk: 37 },
    image: "images/sushi.png",
  },
  {
    name: "Mythic Chest",
    min: 1,
    max: 1,
    oneIn: 100,
    image: "images/mythic-chest.png",
  },
  {
    name: "Gems",
    min: 15000,
    max: 25000,
    oneIn: 25,
    needs: { obelisk: 60 },
    multi: "gemChest",
    image: "images/large-gem-chest.png",
  },
  {
    name: "Relic Chests",
    min: 1000,
    max: 2000,
    oneIn: 125,
    needs: { obelisk: 60 },
    image: "images/large-relic-chest.png",
  },
  {
    name: "Frogspawn",
    min: 1,
    max: 3,
    oneIn: 25,
    needs: { blackHole: true }, // needs the "Black Hole 1 unlocked" checkbox
    image: "images/frogspawn.png",
  },
  {
    name: "Cosmic Candy",
    min: 1,
    max: 2,
    oneIn: 30,
    needs: { obelisk: 60 },
    image: "images/cosmic-candy.png",
  },
  {
    name: "Stickers",
    min: 1,
    max: 2,
    oneIn: 85,
    needs: { obelisk: 3, stickerAvailable: true },
    pickFrom: STICKER_POOL, // on a hit, pick 1 unlocked sticker at equal chance
  },
  {
    name: "Buttery Lobster",
    min: 1,
    max: 2,
    oneIn: 250,
    image: "images/buttery-lobster.png",
    funnyName: "Luttery Bobster", //this took me a bit to code in im ngl im stupid as fuckkkk
    funnyNameOneIn: 25,
  },
  {
    name: "Sushi",
    min: 50,
    max: 60,
    oneIn: 175,
    needs: { obelisk: 37 },
    image: "images/sushi.png",
  },
  {
    name: "Gems",
    min: 200000,
    max: 300000,
    oneIn: 250,
    needs: { obelisk: 70 },
    image: "images/gemcano.png",
  },
  {
    name: "Forbidden Sushi",
    min: 1,
    max: 1,
    oneIn: 1000,
    needs: { obelisk: 60 },
    image: "images/forbidden-sushi.png",
  },
  {
    name: "Miner Skin",
    min: 1,
    max: 1,
    oneIn: 200,
    needs: { skinAvailable: true },
    noLuck: true,
    image: "images/miner-skin.png",
  },
  {
    name: "Miner Gilded Skin",
    min: 1,
    max: 1,
    oneIn: 2000,
    needs: { gildedAvailable: true },
    noLuck: true,
    image: "images/miner-gilded-skin.png",
  },
  {
    name: "Divine Chest",
    min: 1,
    max: 1,
    oneIn: 2500,
    image: "images/divine-chest.png",
  },
];

// Inventory layout: which items show in which category, in what order.
const INVENTORY_LAYOUT = [
  {
    title: null,
    items: [
      "Gifts",
      "Gems",
      "Relic Chests",
      "Skill Bits",
      "Miner Skin",
      "Miner Gilded Skin",
      "Mythic Chest",
      "Divine Chest",
    ],
  },
  {
    title: "Items",
    items: ["Item Chests", "Tier 2 Items"],
  },
  {
    title: "Tier 1 Items",
    sub: true,
    items: ["Chaos Totem", "Primal Meat", "Charge Magnets", "Blue Cow"],
  },
  {
    title: "Special Items",
    sub: true,
    items: [
      "Sushi",
      "Forbidden Sushi",
      "Frogspawn",
      "Gold Flake Steaks",
      "Cosmic Candy",
      "Buttery Lobster",
    ],
  },
  {
    title: "Buffs",
    items: [
      "Minutes 5x Fragment Gain",
      "Minutes 5x Tick Chance",
      "Minutes 2x Game Speed",
      "Minutes 2x Ore Income",
      "Minutes 2x Star Spawn Rate",
    ],
  },
  {
    title: "Misc",
    items: ["Drone Fuel", "Cherry Bomb Charges", "Idol Tokens"],
  },
  {
    title: "Stickers",
    columns: 3,
    items: STICKER_POOL.map((s) => s.name), // every sticker name, in STICKER_POOL order
  },
];

//rng multipliers
const LUCK_MULTIPLIERS = [
  { times: 3, oneIn: 20, color: "#7dff7a" },
  { times: 10, sticker: true, color: "#8a5cff" }, // numStickers × 0.5% (150 stickers = 75%)
  { times: 50, oneIn: 2500, color: "#ffe14d" },
];

//sticker 10x
const STICKER_BOOST = {
  Gems: "Gem Stickers",
  "Relic Chests": "Relic Stickers",
  "Skill Bits": "Skill Bit Stickers",
  "Drone Fuel": "Fuel Stickers",
  "Cherry Bomb Charges": "Cherry Stickers",
  Sushi: "Sushi Stickers",
  "Gold Flake Steaks": "Steak Stickers",
  "Cosmic Candy": "Candy Stickers",
  Frogspawn: "Frogspawn Stickers",
};
//small note for future Solar, yeah the prettify addon  just remove the "" for some reason
