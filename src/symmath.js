export function matvec(v, M) {
  let result = [];
  for (let i = 0; i < M.length; i++) {
    let row = M[i];
    let terms = [];
    for (let j = 0; j < row.length; j++) {
      let M_item = row[j];
      let v_item = v[j];
      if (M_item && v_item) {
        for (let k = 0; k < v_item.length; k++) {
          terms.push(M_item + "·" + v_item[k]);
        }
      }
    }
    result.push(terms);
  }
  return result;
}

export function computeTT(board, num) {
  let lhs = [board[0]];
  let rhs = board.map((row) => {
    let last = row[row.length - 1];
    return last ? [last] : null;
  });
  let tt = Array(num).fill(board);
  tt[0] = rhs;
  tt[num - 1] = lhs;
  return tt.reduce(matvec)[0].map(simplify);
}

function simplify(term) {
  const separator = "·";
  const ignore = "1";
  let result = [];
  for (const [index, element] of term.split(separator).entries()) {
    if (element !== ignore) result.push(element + "<sub>" + index + "</sub>");
  }
  return result.join(separator);
}

