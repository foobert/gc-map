import m from "mithril";
import state, { save } from "../state";

import Geocache from "./geocache";
import { PlainButton as Button } from "../button";

const Detail = {
  view: vnode =>
    m(
      ".detail",
      {
        class: state.map.details.open ? "" : "detail--closed"
      },
      [
        m(".detail__anchor", vnode.children),
        m(".detail__wrapper", [
          m(
            Button,
            {
              class: "mdl-button--icon detail__close",
              onclick: () => {
                state.map.details.open = false;
                save();
              }
            },
            m("i.material-icons", "close")
          ),
          m(Geocache, { gc: state.map.details.gc })
        ])
      ]
    )
};

export default Detail;
