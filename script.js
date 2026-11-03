//oomf told me my comments looks like AI its fucking over
const gift = document.getElementById("gift");
const reward = document.getElementById("reward");
const skipAnimation = document.getElementById("skip-animation");

const rewardImg = document.getElementById("reward-img");
const rewardText = document.getElementById("reward-text");

const ascensionSelect = document.getElementById("ascension");

const MAX_SKINS = 13; // max skins of each kind you can get from Gifts
const skinsInput = document.getElementById("skins-owned");
const gildedInput = document.getElementById("gilded-owned"); //mf if you have 13 gilded ur LYING

const inventoryGrid = document.getElementById("inventory-grid");
const giftsOpenedText = document.getElementById("gifts-opened");
let giftsOpened = 0;
const inventory = {};

const MAX_STICKERS = 150; // max of each sticker
const stickerSettings = document.getElementById("sticker-settings");
const stickerInputs = {};

const rewardLuck = document.getElementById("reward-luck");

//Random whole number
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Compact big numbers into smaller notations 2,340,000,000 = 2.34b
function compactNumber(n) {
  const numericUnits = [
    { value: 1e12, suffix: "t" }, // trillion
    { value: 1e9, suffix: "b" }, // billion
    { value: 1e6, suffix: "m" }, // million
  ];

  for (const unit of numericUnits) {
    if (n >= unit.value) {
      const shortNum = Math.floor((n / unit.value) * 100) / 100; // round down and keep 2 decimal
      return shortNum + unit.suffix;
    }
  }
  return n.toLocaleString(); // normal number (comma)
}
function getAscension() {
  return parseInt(ascensionSelect.value);
}

function cleanSkinCount(input) {
  const n = parseInt(input.value);
  if (isNaN(n)) return 0;
  return Math.min(MAX_SKINS, Math.max(0, n));
}

function getSkinsOwned() {
  return cleanSkinCount(skinsInput);
}
function getGildedOwned() {
  return cleanSkinCount(gildedInput);
}

// Read a sticker's box as a number, 0-150
function getStickerCount(name) {
  const n = parseInt(stickerInputs[name].value);
  if (isNaN(n)) return 0;
  return Math.min(MAX_STICKERS, Math.max(0, n));
}
function getAvailableStickers() {
  return STICKER_POOL.filter(
    (s) => meetsNeeds(s.needs) && getStickerCount(s.name) < MAX_STICKERS,
  );
}

// Make one icon + number box for every sticker
function buildStickerSettings() {
  for (const sticker of STICKER_POOL) {
    const label = document.createElement("label"); // make a new <label> element
    label.className = "sticker-setting";
    label.title = sticker.name; // hover to see the name
    label.innerHTML = `
      <img src="${sticker.image}" alt="${sticker.name}">
      <input type="number" min="0" max="${MAX_STICKERS}" value="0">`;

    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      input.value = getStickerCount(sticker.name);
      renderInventory();
    });

    stickerInputs[sticker.name] = input;
    stickerSettings.appendChild(label);
  }
}

// Fill the inventory with all item from the loot table, all starting at 0x
function buildInventory() {
  const allItems = [];

  // Base Roll
  for (const slot of BASE_POOL) {
    if (slot.needs) {
      allItems.push(slot.yes, slot.no);
    } else {
      allItems.push(slot);
    }
  }

  // Rare Roll
  for (const rare of RARE_POOL) {
    if (!rare.pickFrom) allItems.push(rare);
  }
  allItems.push(...STICKER_POOL);
  // One entry per name
  for (const item of allItems) {
    if (!inventory[item.name]) {
      inventory[item.name] = { image: item.image, count: 0 };
    }
  }
}

// Add the opened gift's loot to the totals loot / inventory
function addToInventory(loot) {
  if (!inventory[loot.name]) {
    inventory[loot.name] = { image: loot.image, count: 0 };
  }
  inventory[loot.name].count += loot.amount;
  giftsOpened++;
  renderInventory();
}

// Draw the inventory on the page, category by category
function renderInventory() {
  // Skin amount match the Settings boxes
  inventory["Miner Skin"].count = getSkinsOwned();
  inventory["Miner Gilded Skin"].count = getGildedOwned();

  for (const name in stickerInputs) {
    inventory[name].count = getStickerCount(name);
  }

  giftsOpenedText.textContent = giftsOpened.toLocaleString();

  let html = "";
  for (const section of INVENTORY_LAYOUT) {
    // Category title (h3) + subcategory title (h4)
    if (section.title) {
      const tag = section.sub ? "h4" : "h3";
      html += `<${tag} class="inv-title">${section.title}</${tag}>`;
    }

    const style = section.columns
      ? `style="grid-template-columns: repeat(${section.columns}, minmax(0, 90px))"`
      : "";

    html += `<div class="inv-grid" ${style}>`;
    for (const name of section.items) {
      const item = inventory[name];
      if (!item) continue;

      const emptyClass = item.count === 0 ? "empty" : "";
      html += `
        <div class="inv-item ${emptyClass}" title="${name}: ${item.count.toLocaleString()}">
          <img src="${item.image}" alt="${name}">
          <span>x${compactNumber(item.count)}</span> 
        </div>`;
    } // this part is to show number compacted
    html += `</div>`;
  }

  inventoryGrid.innerHTML = html;
  //hi yes very important note here dont forget future Solar
  // This one replaces everything inside the inventory grid (loot table)
  // with the HTML text, the browser then turns that text into real elements on the page itself
}

// Fix the box when the user finishes
skinsInput.addEventListener("change", () => {
  skinsInput.value = getSkinsOwned();
  renderInventory();
});
gildedInput.addEventListener("change", () => {
  gildedInput.value = getGildedOwned();
  renderInventory();
});

// Need Condition (True or False)
// No needs at all = meets it.
function meetsNeeds(needs) {
  if (!needs) return true;

  const level = getObeliskLevel();
  const world = getHighestWorld();

  if (level < (needs.obelisk || 0)) return false; // Obelisk too low
  if (needs.maxObelisk !== undefined && level > needs.maxObelisk) return false; // Obelisk too high
  if (world < (needs.world || 0)) return false; // World too low
  if (needs.blackHole && !hasBlackHole()) return false; // needs Black Hole, don't have it

  // Skins: skipped once the collection is full
  if (needs.skinAvailable && getSkinsOwned() >= MAX_SKINS) return false;
  // Gilded: skipped at 13, or if every owned skin is already gilded (LIAR)
  if (
    needs.gildedAvailable &&
    (getGildedOwned() >= MAX_SKINS || getGildedOwned() >= getSkinsOwned())
  )
    return false;

  if (needs.stickerAvailable && getAvailableStickers().length === 0)
    return false;
  return true; // passed every check
}

// Turn a roll slot into an actual reward
function resolveSlot(slot) {
  if (!slot.needs) return slot; // fixed slot
  return meetsNeeds(slot.needs) ? slot.yes : slot.no; // conditional slot
}

// Work out the total multiplier for a multi type
function getMultiplier(type) {
  const rule = MULTIPLIERS[type];
  if (!rule) return 1; // no multiplier type

  const level = getObeliskLevel();
  let multi = 1;

  if (rule.scalesWithObelisk) {
    multi *= 1 + level * 0.08;
  }
  if (rule.scalesWithAscension) {
    multi *= getAscension() + 1;
  }

  // Obelisk bonuses: it stacks!
  for (const bonus of rule.bonuses || []) {
    if (level >= bonus.obelisk) {
      multi *= bonus.times;
    }
  }

  return multi;
}

//Roll the RNG multipliers
function rollLuckMultiplier(itemName) {
  let multi = 1;
  const colors = []; //colors cosmetic

  for (const roll of LUCK_MULTIPLIERS) {
    let chance;

    if (roll.sticker) {
      const stickerName = STICKER_BOOST[itemName];
      if (!stickerName) continue; // no matching sticker
      chance = (getStickerCount(stickerName) * 0.5) / 100; // 150 stickers max (0.75)
    } else {
      chance = 1 / roll.oneIn; // ex: 1/20 = 0.05
    }

    if (Math.random() < chance) {
      multi *= roll.times; //  example: ×3 then ×10 = ×30
      colors.push(roll.color);
    }
  }

  return { multi: multi, colors: colors };
}

// Gift Reward Rolling (lets go gambling)
function rollGift() {
  // Base roll
  let result = resolveSlot(BASE_POOL[randomInt(0, BASE_POOL.length - 1)]);
  let isRare = false;

  // Rare roll
  for (const rare of RARE_POOL) {
    if (!meetsNeeds(rare.needs)) continue; // doesn't qualify

    if (Math.random() < 1 / rare.oneIn) {
      result = rare.swapTo && !meetsNeeds(rare.swapNeeds) ? rare.swapTo : rare; // replace if hit
      isRare = true;
    }
  }
  // Min Max and Drone Fuel
  let amount = result.rollAmount
    ? result.rollAmount(getObeliskLevel(), result)
    : randomInt(result.min, result.max);

  let name = result.name;
  let image = result.image;

  // Stickers
  if (result.pickFrom) {
    const unlocked = getAvailableStickers();
    const picked = unlocked[randomInt(0, unlocked.length - 1)];
    name = picked.name;
    image = picked.image;
  }

  //Drop type multipliers (obelisk / arch asc / rng multipliers)
  const luck = result.noLuck
    ? { multi: 1, colors: [] }
    : rollLuckMultiplier(name);
  amount = Math.round(amount * getMultiplier(result.multi) * luck.multi);

  // Lobster funni name
  let displayName = name;
  if (result.funnyName && Math.random() < 1 / result.funnyNameOneIn) {
    displayName = result.funnyName;
  }

  return {
    name: name,
    displayName: displayName,
    image: image,
    amount: amount,
    isRare: isRare,
    luckMulti: luck.multi,
    luckColors: luck.colors,
  };
}

function showReward() {
  const loot = rollGift(); // roll!

  if (loot.name === "Miner Skin") {
    skinsInput.value = getSkinsOwned() + 1;
    saveSettings();
  }
  if (loot.name === "Miner Gilded Skin") {
    gildedInput.value = getGildedOwned() + 1;
    saveSettings();
  }
  if (stickerInputs[loot.name]) {
    stickerInputs[loot.name].value = Math.min(
      MAX_STICKERS,
      getStickerCount(loot.name) + loot.amount,
    );
    saveSettings();
  }

  addToInventory(loot); //count it in Loot Total / inventory

  rewardImg.src = loot.image; // swap the picture to rolled item
  rewardText.textContent = `${loot.amount.toLocaleString()} ${loot.displayName}`;
  rewardText.classList.toggle("rare", loot.isRare);

  const colors = loot.luckColors;
  rewardLuck.textContent = `×${loot.luckMulti}!`;
  rewardLuck.classList.toggle("hidden", colors.length === 0); // hide when there's no multiplier

  if (colors.length > 1) {
    // Stacked: gradient through every color
    rewardLuck.style.color = "";
    rewardLuck.style.backgroundImage = `linear-gradient(90deg, ${[...colors, colors[0]].join(", ")})`;
    rewardLuck.classList.add("stacked");
  } else {
    // Single multiplier : plain solid color
    rewardLuck.style.color = colors[0] || "";
    rewardLuck.style.backgroundImage = "";
    rewardLuck.classList.remove("stacked");
  }

  //Maybe TODO: maybe an animation of "shining particles" coming out. Maybe.
  gift.classList.add("hidden");
  reward.classList.remove("hidden");
}

gift.addEventListener("click", () => {
  if (skipAnimation.checked) {
    showReward();
  } else {
    gift.classList.add("opening"); // plays open-gift (CSS)
  }
});

// show reward hide gift
gift.addEventListener("animationend", () => {
  gift.classList.remove("opening");
  showReward();
});

// hide reward and bring gift back for a new roll
reward.addEventListener("click", () => {
  reward.classList.add("hidden");
  gift.classList.remove("hidden");
});

// Obelisk LV stuff
const obeliskInput = document.getElementById("obelisk-level");
const MAX_OBELISK = 75;

function getObeliskLevel() {
  const level = parseInt(obeliskInput.value); // "37" -> 37
  if (isNaN(level)) return 1; // empty or invalid goes to 1
  return Math.min(MAX_OBELISK, Math.max(1, level)); // 1 to 75
}
//test log
obeliskInput.addEventListener("change", () => {
  obeliskInput.value = getObeliskLevel(); //failsafe
  console.log("Obelisk Level:", getObeliskLevel());
});

//Highest World stuff
const worldSelect = document.getElementById("highest-world");
function getHighestWorld() {
  return parseInt(worldSelect.value);
}

//test log:
worldSelect.addEventListener("change", () => {
  console.log("Highest World:", getHighestWorld());
});

//Black Hole stuff
const blackHoleCheckbox = document.getElementById("black-hole");

function hasBlackHole() {
  return blackHoleCheckbox.checked;
}

//test log:
blackHoleCheckbox.addEventListener("change", () => {
  console.log("Black Hole unlocked:", hasBlackHole());
});

//Bomb cap stuff
const bombCapInput = document.getElementById("bomb-cap");

// bomb cap as a number - same rule for invalids = 0
function getBombCap() {
  const n = parseInt(bombCapInput.value);
  return isNaN(n) ? 0 : Math.max(0, n);
}

//clean up + test log
bombCapInput.addEventListener("change", () => {
  bombCapInput.value = getBombCap();
  console.log("Bomb Capped at", getBombCap());
});

// Saving Settings (localStorage)
const SETTINGS_KEY = "giftSimSettings";

// Save settings to browser
function saveSettings() {
  const stickers = {};
  for (const name in stickerInputs) {
    stickers[name] = getStickerCount(name);
  }
  const settings = {
    obelisk: getObeliskLevel(),
    world: getHighestWorld(),
    blackHole: hasBlackHole(),
    skipAnimation: skipAnimation.checked,
    ascension: getAscension(),
    skins: getSkinsOwned(),
    gilded: getGildedOwned(),
    stickers: stickers,
    bombCap: getBombCap(),
  };
  // Turn the object into text
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

// Load saved settings
function loadSettings() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)); // Text go back to object again
  } catch (e) {
    return;
  }
  if (!saved) return;
  obeliskInput.value = saved.obelisk;
  worldSelect.value = saved.world;
  blackHoleCheckbox.checked = saved.blackHole;
  skipAnimation.checked = saved.skipAnimation;

  if (saved.ascension !== undefined) {
    ascensionSelect.value = saved.ascension;
  }
  if (saved.skins !== undefined) skinsInput.value = saved.skins;
  if (saved.gilded !== undefined) gildedInput.value = saved.gilded;

  if (saved.stickers) {
    for (const name in saved.stickers) {
      if (stickerInputs[name]) stickerInputs[name].value = saved.stickers[name];
    }
  }
  if (saved.bombCap !== undefined) bombCapInput.value = saved.bombCap;

  obeliskInput.value = getObeliskLevel(); // clean up
}

//save when any setting changes
document.getElementById("settings").addEventListener("change", saveSettings);
buildStickerSettings();
loadSettings();

buildInventory();
renderInventory();
