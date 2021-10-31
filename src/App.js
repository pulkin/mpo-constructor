import React from "react";

import "./styles.css";
import { computeTT } from "./symmath.js";
import { Board } from "./Cell.js";
import NumberScroll from "./NumberScroll.js";

let default_operators = [
  "∅",
  null,
  "1",
  "n",
  null,
  "σ<sup>z</sup>",
  "σ<sup>y</sup>",
  "σ<sup>x</sup>",
  "σ<sup>+</sup>",
  "σ<sup>-</sup>",
  null,
  "a",
  "a<sup>†</sup>",
  "b",
  "b<sup>†</sup>",
  "c",
  "c<sup>†</sup>",
  null,
  "A",
  "B",
  "C",
  "D",
  null
];

function resizeBoard(board, new_size) {
  let size = board.length;

  if (size < new_size) {
    // Add more columns
    let new_board = board.map((row) => {
      for (let i = size; i < new_size; i++) row.splice(-1, 0, "");
      return row;
    });

    // Add more rows
    for (let i = size; i < new_size; i++) {
      let lrow = Array(new_size);
      lrow.fill("");
      new_board.splice(-1, 0, lrow);
    }

    return new_board;
  }

  if (size > new_size) {
    // Remove columns
    let new_board = board.map((row) => {
      for (let i = new_size; i < size; i++) row.splice(-2, 1);
      return row;
    });

    // Remove rows
    for (let i = new_size; i < size; i++) new_board.splice(-2, 1);

    return new_board;
  }

  // make a copy
  return board.map((row) => {
    return [...row];
  });
}

function encodeMPO(mpo) {
  return [
    mpo.mpo_size,
    ...mpo.mpo.map((item) => {
      return [
        item.copies,
        ...item.matrix.flat().map((x) => {
          return Buffer(x).toString("base64").replace(/=+$/, "");
        })
      ].join(".");
    })
  ].join("-");
}

function decodeMPO(str) {
  let mpo_size, mpo;
  [mpo_size, ...mpo] = str.split("-");
  mpo_size = parseInt(mpo_size, 10);
  mpo = mpo.map((item, item_index) => {
    let copies = 0,
      plain,
      matrix = [];
    [copies, ...plain] = item.split(".");
    copies = parseInt(copies, 10);
    plain = plain.map((x) => {
      return Buffer(x + "==", "base64").toString();
    });
    for (let i = 0; i < mpo_size; i++)
      matrix[i] = plain.slice(i * mpo_size, (i + 1) * mpo_size);
    return { copies: copies, matrix: matrix, uid: item_index };
  });
  return { mpo_size: mpo_size, mpo: mpo };
}

class MainPanel extends React.Component {
  constructor(props) {
    super(props);

    const queryParams = new URLSearchParams(window.location.search);
    try {
      this.state = decodeMPO(queryParams.get("mpo"));
    } catch (error) {
      this.state = {
        mpo_size: 2,
        mpo: [
          {
            matrix: [
              ["1", "A"],
              ["", "1"]
            ],
            copies: 1,
            uid: 0
          }
        ]
      };
    }
    this.handleMPOSizeUpdate = this.handleMPOSizeUpdate.bind(this);
  }

  handleUpdate(ix, board, len) {
    let new_mpo = [...this.state.mpo];
    new_mpo[ix].matrix = board;
    new_mpo[ix].copies = len;
    this.setState({ mpo: new_mpo });
  }

  handleClone(ix) {
    let new_mpo = [...this.state.mpo];

    // Determine unoccupied color
    let slots = [];
    new_mpo.forEach((mpo) => {
      slots[mpo.uid] = true;
    });
    let i = 0;
    for (i = 0; i < slots.length; i++) if (slots[i] === undefined) break;

    new_mpo.splice(ix + 1, 0, {
      copies: 1,
      matrix: resizeBoard(new_mpo[ix].matrix),
      uid: i
    });
    this.setState({ mpo: new_mpo });
  }

  handleDelete(ix) {
    let new_mpo = [...this.state.mpo];
    new_mpo.splice(ix, 1);
    this.setState({ mpo: new_mpo });
  }

  handleSwap(ix, ix2) {
    let new_mpo = [...this.state.mpo];
    [new_mpo[ix], new_mpo[ix2]] = [new_mpo[ix2], new_mpo[ix]];
    this.setState({ mpo: new_mpo });
  }

  handleMPOSizeUpdate(new_size) {
    this.setState({
      mpo: this.state.mpo.map((el) => {
        return {
          copies: el.copies,
          matrix: resizeBoard(el.matrix, new_size),
          uid: el.uid
        };
      }),
      mpo_size: new_size
    });
  }

  render() {
    const encodedMPO = encodeMPO(this.state);
    let terms = [];
    if (this.state.mpo)
      terms = computeTT(
        [].concat(
          ...this.state.mpo.map((el) => {
            return Array(el.copies).fill(el.matrix);
          })
        )
      );
    let terms_count = 0;
    return (
      <div className="main-panel">
        <NumberScroll
          min="2"
          max="20"
          val={this.state.mpo_size}
          onChange={this.handleMPOSizeUpdate}
          label="MPO size:"
        />
        <div className="clear" />
        {this.state.mpo.map((mpo, ix) => {
          terms_count += mpo.copies;
          return (
            <Board
              key={"board" + ix}
              board={mpo.matrix}
              site_offset={terms_count - mpo.copies}
              site_len={mpo.copies}
              handleUpdate={this.handleUpdate.bind(this, ix)}
              handleClone={this.handleClone.bind(this, ix)}
              handleDelete={this.handleDelete.bind(this, ix)}
              handleMoveUp={this.handleSwap.bind(this, ix, ix - 1)}
              handleMoveDown={this.handleSwap.bind(this, ix, ix + 1)}
              mTerms={default_operators}
              accent={mpo.uid}
              deleteable={this.state.mpo.length > 1}
              canMoveUp={ix > 0}
              canMoveDown={ix < this.state.mpo.length - 1}
            />
          );
        })}
        <div className="product">H =</div>
        <div className="product-block">
          {terms.map((value, index) => {
            return (
              <div
                key={index}
                className="product product-term"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            );
          })}
        </div>
        <div>
          <a href={"?mpo=" + encodedMPO}>
            <span role="img" aria-label="Permalink">
              🔗
            </span>{" "}
            Permalink to this MPO
          </a>
        </div>
      </div>
    );
  }
}

export default function App() {
  return <MainPanel />;
}
