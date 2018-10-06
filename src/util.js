export function upgradeElement(vnode) {
  if (typeof componentHandler === "undefined") {
    return;
  }
  componentHandler.upgradeElement(vnode.dom);
}

export function j(...args) {
  return args.join(".");
}
