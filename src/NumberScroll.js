import React from "react";
import { scrollOn, scrollOff } from "./scroll.js";

function filterInt(value) {
  if (/^[0-9]+$/.test(value)) return Number(value);
  return NaN;
}

export default class NumberScroll extends React.Component {
  constructor(props) {
    super(props);
    let min = parseInt(props.min, 10);
    let max = parseInt(props.max, 10);
    let v = parseInt(props.val, 10);
    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 100;
    if (isNaN(v)) v = min;
    this.state = {
      min: min,
      max: max,
      visible_val: v,
      val: v
    };
    this.handleScroll = this.handleScroll.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  maybeUpdate(new_val) {
    if (!isNaN(new_val)) {
      if (this.state.min <= new_val && new_val <= this.state.max) {
        this.setState({
          visible_val: new_val,
          val: new_val
        });
        if (this.props.onChange) {
          this.props.onChange(new_val);
        }
        return true;
      }
    }
    return false;
  }

  componentDidMount() {
    if (this.props.onChange) {
      this.props.onChange(this.state.val);
    }
  }

  handleScroll(e) {
    this.maybeUpdate(this.state.val - Math.sign(e.deltaY));
  }

  handleChange(e) {
    let e_val = e.target.value;
    let new_val = filterInt(e_val);
    if (!this.maybeUpdate(new_val)) {
      this.setState({
        visible_val: e_val
      });
    }
  }

  handleEnter(e) {
    scrollOff();
  }

  handleLeave(e) {
    scrollOn();
  }

  render() {
    let classes = "cell cell-scroll cell-flex cell-special";
    if (this.state.val !== this.state.visible_val)
      classes = classes + " cell-invalid";
    return (
      <div
        className={classes}
        onWheel={this.handleScroll}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
      >
        <label>{this.props.label}</label>
        <input
          type="text"
          onChange={this.handleChange}
          value={this.state.visible_val}
        />
      </div>
    );
  }
}
