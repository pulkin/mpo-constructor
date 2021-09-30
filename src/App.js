import React from "react";

import "./styles.css";
import { computeTT } from "./symmath.js";
import { Board } from "./Cell.js";
import NumberScroll from "./NumberScroll.js";

class MainPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: undefined,
      len: undefined
    };
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleLenUpdate = this.handleLenUpdate.bind(this);
  }

  handleUpdate(board) {
    this.setState({ board: board });
  }

  handleLenUpdate(len) {
    this.setState({ len: len });
  }

  render() {
    let terms = [];
    if (this.state.len && this.state.board)
      terms = computeTT(this.state.board, this.state.len);
    return (
      <div className="main-panel">
        <Board
          boardSize="2"
          handleUpdate={this.handleUpdate}
          mTerms={[
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
          ]}
        />
        <div className="board-wrapper">
          <NumberScroll
            min="2"
            max="99"
            onChange={this.handleLenUpdate}
            label="sites: "
          />
        </div>
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
      </div>
    );
  }
}

export default function App() {
  return <MainPanel />;
}

