import m from "mithril";
import state from "../state";

import Geocache from "./geocache";

const Detail = {
  view: vnode =>
    m(
      ".detail",
      {
        class: state.map.details.open ? "" : "detail--closed"
      },
      [
        m(".detail__anchor", vnode.children),
        m(".detail__wrapper", m(Geocache, { gc: state.map.details.gc }))
      ]
    )
};

export default Detail;
