import m from "mithril";
import { getInflightRequests } from "./tree";

const ProgressBar = {
  view: () =>
    m(
      ".map-requests.mdl-progress.mdl-js-progress.mdl-progress__indeterminate",
      getInflightRequests() === 0 ? { style: "display:none" } : {}
    )
};

export default ProgressBar;
