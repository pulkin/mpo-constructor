import React from "react";
import { useDropdownMenu, useDropdownToggle, Dropdown } from "react-overlays";

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
  let classNames = "cell cell-dropdown";
  if (props.isLastRole) classNames += " cell-role-end";
  else if (props.isFirstRole) classNames += " cell-role-start";
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
      size: parseInt(this.props.boardSize, 10),
      board: this.emptyVMatrix(this.props.boardSize)
    };
    this.handlePlus = this.handlePlus.bind(this);
    this.handleMinus = this.handleMinus.bind(this);
  }

  emptyVMatrix(size) {
    let result = [];
    for (let i = 0; i < size; i++) {
      let r2 = [];
      result.push(r2);
      for (let j = 0; j < size; j++) {
        r2.push("");
      }
    }
    result[0][0] = "1";
    result[0][size - 1] = "A";
    result[size - 1][size - 1] = "1";
    return result;
  }

  handleUpdate(i, j, val) {
    let board = this.state.board;
    board[i][j] = val === "∅" ? null : val;
    this.setState({
      board: board
    });
    this.notifyListeners(board);
  }

  notifyListeners(board) {
    if (this.props.handleUpdate) {
      this.props.handleUpdate(board);
    }
  }

  componentDidMount() {
    this.notifyListeners(this.state.board);
  }

  handlePlus() {
    let size = this.state.size + 1;
    let board = this.state.board.map((row) => {
      row.splice(-1, 0, "");
      return row;
    });
    let lrow = Array(size);
    lrow.fill("");
    board.splice(-1, 0, lrow);
    this.setState({
      size: size,
      board: board
    });
    this.notifyListeners(board);
  }

  handleMinus() {
    let size = this.state.size - 1;
    if (size > 0) {
      let board = this.state.board.map((row) => {
        row.splice(-2, 1);
        return row;
      });
      board.splice(-2, 1);
      this.setState({
        size: size,
        board: board
      });
      this.notifyListeners(board);
    }
  }

  render() {
    let board_items = [];
    let size = this.state.size;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board_items.push(
          <Cell
            key={"c" + (i * size + j).toString()}
            onChange={this.handleUpdate.bind(this, j, i)}
            value={this.state.board[j][i]}
            isLastRole={i === size - 1}
            isFirstRole={j === 0}
            options={this.props.mTerms}
          />
        );
      }
      board_items.push(<div key={"eol" + i.toString()} className="clear" />);
    }
    this.boardItems = board_items;
    return (
      <div className="board-wrapper">
        <div className="board-title">
          <p>
            H<sub>i</sub> =
          </p>
        </div>
        <div className="board-size-controls">
          <button className="cell cell-small" onClick={this.handlePlus} key="+">
            +
          </button>
          <div className="clear" />
          <button
            className="cell cell-small"
            onClick={this.handleMinus}
            key="-"
          >
            -
          </button>
        </div>
        <div className="board-matrix-wrapper">
          <div className="board-lbracket" />
          <div className="board">{board_items}</div>
          <div className="board-rbracket" />
        </div>
      </div>
    );
  }
}
