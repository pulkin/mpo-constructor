export function matvec(v, M) {
  const tbc = "...";
  const max_terms = 100;
  let result = [];
  for (let i = 0; i < M.length; i++) {
    let row = M[i];
    let terms = [];
    for (let j = 0; j < row.length; j++) {
      let M_item = row[j];
      let v_item = v[j];
      let do_exit = false;
      if (M_item && v_item) {
        for (let k = 0; k < v_item.length; k++) {
          let v_item_term = v_item[k];
          if (v_item_term) {
            if (terms.length >= max_terms || v_item_term === tbc) {
              terms.push(tbc);
              do_exit = true;
              break;
            }
            terms.push(v_item_term + "·" + M_item);
          }
        }
      }
      if (do_exit) {
        break;
      }
    }
    result.push(terms);
  }
  return result;
}

export function computeTT(mpo_terms) {
  if (mpo_terms.length === 1) {
    let term = mpo_terms[0][0].slice(-1)[0];
    if (term) return [simplify(term)];
    return [];
  }
  let lhs = mpo_terms[0].map((item) => {
    return [item[0]];
  }); // the first column of the first MPO
  let rhs = [mpo_terms.slice(-1)[0].slice(-1)[0]];
  let tt = [lhs, ...mpo_terms.slice(1, -1), rhs];
  return tt.reduce(matvec)[0].map(simplify);
}

function simplify(term) {
  if (term === "...") return term;
  const separator = "·";
  const ignore = "1";
  let result = [];
  for (const [index, element] of term.split(separator).entries()) {
    if (element !== ignore) result.push(element + "<sub>" + index + "</sub>");
  }
  if (result.length === 0) return "1";
  else return result.join(separator);
}
