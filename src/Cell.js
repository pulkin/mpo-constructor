import React from "react";
import { useDropdownMenu, useDropdownToggle, Dropdown } from "react-overlays";
import NumberScroll from "./NumberScroll.js";

function Menu({ operators, onItemChoose }) {
  const [props, { toggle }] = useDropdownMenu({
    flip: true,
    offset: [0, 8]
  });
  let blockCounter = 0;
  return (
    <div className="operator-panel" role="menu" {...props}>
      {operators.map((k, i) => {
        if (k)
          return (
            <button
              className={"operator-panel-item cell-group-" + blockCounter}
              onClick={() => {
                onItemChoose(k);
                toggle(false);
              }}
              dangerouslySetInnerHTML={{ __html: k }}
              key={i}
            />
          );
        else {
          blockCounter++;
          return <div className="clear" key={i} />;
        }
      })}
      <div className="operator-panel-item-free">
        <label>custom:</label>
        <input
          onChange={(e) => {
            onItemChoose(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

function Toggle({ value, className }) {
  const [props, { toggle }] = useDropdownToggle();
  return (
    <button
      type="button"
      className={className}
      {...props}
      onClick={toggle}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

const DropdownButton = ({
  show,
  onToggle,
  onChange,
  drop,
  alignEnd,
  value,
  options,
  className
}) => {
  return (
    <Dropdown
      show={show}
      onToggle={onToggle}
      drop={drop}
      alignEnd={alignEnd}
      itemSelector="button:not(:disabled)"
    >
      <span>
        <Toggle value={value} className={className} />
        <Menu operators={options} onItemChoose={onChange} />
      </span>
    </Dropdown>
  );
};

export function Cell(props) {
  let classNames = "cell cell-dropdown cell-matrix cell-no-role";
  return (
    <DropdownButton
      className={classNames}
      onChange={props.onChange}
      value={props.value}
      options={props.options}
    />
  );
}

export class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: this.props.board,
      site_len: parseInt(this.props.site_len, 10)
    };
    this.handleSiteLenUpdate = this.handleSiteLenUpdate.bind(this);
    this.handleSiteOffsetUpdate = this.handleSiteOffsetUpdate.bind(this);
  }

  handleUpdate(i, j, val) {
    let board = this.state.board;
    board[i][j] = val === "∅" ? "" : val;
    this.setState({
      board: board
    });
    this.notifyListeners(board, null);
  }

  notifyListeners(board, site_len) {
    if (this.props.handleUpdate) {
      if (board === null) board = this.state.board;
      if (site_len === null) site_len = this.state.site_len;
      this.props.handleUpdate(board, site_len);
    }
  }

  handleSiteLenUpdate(len) {
    this.setState({ site_len: len });
    this.notifyListeners(null, len);
  }

  handleSiteOffsetUpdate(offset) {
    this.setState({ site_offset: offset });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.board !== prevProps.board) {
      this.setState({ board: this.props.board });
    }
  }

  render() {
    let board_items = [];
    for (let i = 0; i < this.state.board.length; i++) {
      let row = this.state.board[i];
      for (let j = 0; j < row.length; j++) {
        board_items.push(
          <Cell
            key={"c" + i.toString() + "/" + j.toString()}
            onChange={this.handleUpdate.bind(this, i, j)}
            value={row[j]}
            options={this.props.mTerms}
          />
        );
      }
      board_items.push(<div key={"eol" + i.toString()} className="clear" />);
    }
    this.boardItems = board_items;
    return (
      <div className={"board-wrapper accent-" + this.props.accent}>
        <div className="board-wrapper-controls">
          <NumberScroll
            min="1"
            max="99"
            val={this.props.site_len}
            onChange={this.handleSiteLenUpdate}
            label="sites: "
          />
          <button
            className="cell cell-symbol push"
            title="Swap upwards"
            onClick={this.props.handleMoveUp}
            disabled={!this.props.canMoveUp}
          >
            ▲
          </button>
          <button
            className="cell cell-symbol"
            title="Swap downwards"
            onClick={this.props.handleMoveDown}
            disabled={!this.props.canMoveDown}
          >
            ▼
          </button>
          <button
            className="cell cell-symbol"
            title="Duplicate"
            onClick={this.props.handleClone}
          >
            ⎘
          </button>
          <button
            className="cell cell-caution cell-symbol"
            title="Remove"
            onClick={this.props.handleDelete}
            disabled={!this.props.deleteable}
          >
            🗑
          </button>
        </div>
        <div className="board-wrapper-equation">
          <div className="board-title">
            <p>
              H
              <sub>
                {this.props.site_offset}..
                {this.props.site_offset + this.state.site_len - 1}
              </sub>{" "}
              =
            </p>
          </div>
          <div className="board-wrapper-matrix">
            <div className="board-lbracket" />
            <div className="board">{board_items}</div>
            <div className="board-rbracket" />
          </div>
        </div>
      </div>
    );
  }
}
