import debugSetup from "debug";
const debug = debugSetup("gc:map:cache");
import LRU from "lru-cache";

let saveTimer = null;
const cache = new LRU({
  max: 10000,
  length: n => n.length,
  maxAge: getMaxAge()
});

restore();

export async function lookup(key, loader) {
  let value = lookupWithShorterKeys(key);
  if (!value) {
    value = await loader(key);
    cache.set(key, value);

    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(save, 1000);
  }
  return value;
}

function lookupWithShorterKeys(key) {
  let value = cache.get(key);
  if (value) {
    return value;
  } else if (key.length > 1) {
    return lookupWithShorterKeys(key.substr(0, key.length - 1));
  } else {
    return null;
  }
}

function restore() {
  try {
    load();
  } catch (err) {
    debug("Cache restore failed: %o", err);
    localStorage.removeItem("cache");
  }
}

function load() {
  const data = JSON.parse(localStorage.getItem("cache"));
  if (data) {
    cache.load(data);
  }
}
function save() {
  debug("Cache saved");
  const data = JSON.stringify(cache.dump());
  localStorage.setItem("cache", data);
}

function getMaxAge() {
  const maxAgeMinutes = parseInt(localStorage.getItem("maxAge")) || 5;
  debug("Cache maxAge: %d minutes", maxAgeMinutes);
  return 1000 * 60 * maxAgeMinutes;
}
