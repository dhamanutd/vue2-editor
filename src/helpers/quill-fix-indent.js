/*
 * Quill 1.* cannot next block elements inside <li> including nested <ul>,<ol>.
 * To achieve nested lists it uses flat linear lists with CSS class `ql-indent-\d+` on <li>.
 * Nesting <ul> inside <ol> or vice-versa cause topmost list to break in two adjacent lists.
 *
 * There is the only solution: fix bad HTML after getting it from Quill and break it back before
 * passing to Quill again for editing.
 */

const mkNode = (tagName = "div") => document.createElement(tagName);

const IS_LI = {
  LI: true,
  li: true
};

function wrapContent(node, tagName = "div") {
  const container = mkNode(tagName);
  while (node.firstChild) {
    container.appendChild(node.firstChild);
  }
  node.appendChild(container);
}

function nextNode(node) {
  let current = node;
  do {
    current = current.nextSibling;
  } while (current && 1 !== current.nodeType);
  return current;
}

function firstNode(node) {
  let current = node.firstChild;
  while (current && 1 !== current.nodeType) {
    current = current.nextSibling;
  }
  return current;
}

function lastNode(node) {
  let current = node.lastChild;
  while (current && 1 !== current.nodeType) {
    current = current.previousSibling;
  }
  return current;
}

function parentNodes(node, filter = null) {
  const ret = [];
  let cur = node.parentNode;
  while (cur) {
    if (1 === cur.nodeType) {
      if (!filter || filter(cur)) {
        ret.push(cur);
      }
    }
    cur = cur.parentNode;
  }
  return ret;
}

function insertBefore(newNode, refNode) {
  refNode.parentNode.insertBefore(newNode, refNode);
}

function insertAfter(newNode, refNode) {
  const next = nextNode(refNode);
  if (next) {
    insertBefore(newNode, next);
  } else {
    refNode.parentNode.append(newNode);
  }
}

const reIndent = /^ql-indent-(\d+)$/;
const mkLevelClass = level => `ql-indent-${level}`;

const getItemLevel = li => {
  let level = 0;
  Array.from(li.classList).some(name => {
    const match = name.match(reIndent);
    if (match) {
      level = Number(match[1]);
      return true;
    }
  });
  return level;
};
const setItemLevel = (li, level) => {
  let changed = false;
  Array.from(li.classList).forEach(name => {
    if (reIndent.test(name)) {
      li.classList.remove(name);
      changed = true;
    }
  });

  if (!level) {
    return changed;
  }

  li.classList.add(mkLevelClass(level));
  return true;
};

const removeItemLevel = li => {
  let level = 0;
  Array.from(li.classList).some(name => {
    const match = name.match(reIndent);
    if (match) {
      li.classList.remove(name);
      if (!li.classList.length) {
        li.removeAttribute("class");
      }
      level = Number(match[1]);
      return true;
    }
  });
  return level;
};

const getListLevel = list => {
  const li = firstNode(list);
  return li && IS_LI[li.tagName] ? getItemLevel(li) : 0;
};

export function fixUp(content) {
  const swap = mkNode();

  swap.innerHTML = content;

  // find all `ul,ol`
  const lists = Array.from(swap.querySelectorAll("ul,ol"));
  // if none then return content;
  if (!lists.length) {
    return content;
  }

  let changed = false;

  // check its indent level
  // nest lists and remember if anything was changed
  {
    let prevList = null;
    let prevListLevel = null;
    let prevLastLi = null;
    let prevLastLiLevel = null;
    const stack = [];
    lists.forEach((list, listIndex) => {
      const curLevel = getListLevel(list);
      const curLastLi = lastNode(list);
      const curLastLiLevel = getItemLevel(curLastLi);
      if (null === prevList) {
        prevList = list;
        prevListLevel = curLevel;
        prevLastLi = curLastLi;
        prevLastLiLevel = curLastLiLevel;
        return;
      }

      while (curLevel < prevLastLiLevel && stack.length) {
        [prevList, prevListLevel, prevLastLi, prevLastLiLevel] = stack.pop();
      }

      if (curLevel > prevLastLiLevel) {
        stack.push([prevList, prevListLevel, prevLastLi, prevLastLiLevel]);
        if (!firstNode(prevLastLi)) {
          wrapContent(prevLastLi);
        }
        prevLastLi.appendChild(list);
        changed = true;

        prevList = list;
        prevListLevel = curLevel;
        prevLastLi = curLastLi;
        prevLastLiLevel = curLastLiLevel;
        return;
      }

      if (list.tagName === prevList.tagName && nextNode(prevList) === list) {
        // merge lists
        while (list.firstChild) {
          prevList.appendChild(list.firstChild);
          changed = true;
        }
        // remove empty list from DOM
        list.remove();
        // remove it from array
        delete lists[listIndex];

        prevLastLi = lastNode(prevList);
        prevLastLiLevel = getItemLevel(prevLastLi);
        return;
      }

      prevList = list;
      prevListLevel = curLevel;
      prevLastLi = curLastLi;
      prevLastLiLevel = curLastLiLevel;
    });
  }

  // check all its `li`
  lists.forEach(list => {
    let li = firstNode(list);
    const baseLevel = removeItemLevel(li);

    let prevLi = li;
    let prevList = list;
    let prevLevel = baseLevel;
    const stack = [];
    let nextLi = nextNode(prevLi);
    while (nextLi) {
      const curLi = nextLi;
      nextLi = nextNode(nextLi);
      const curLevel = removeItemLevel(curLi);

      while (curLevel < prevLevel && curLevel >= baseLevel && stack.length) {
        [prevLi, prevList, prevLevel] = stack.pop();
      }

      if (curLevel > prevLevel) {
        if (!firstNode(prevLi)) {
          wrapContent(prevLi);
        }
        const curList = mkNode(prevList.tagName);
        curList.appendChild(curLi);
        prevLi.appendChild(curList);
        changed = true;
        stack.push([prevLi, prevList, prevLevel]);
        prevLi = curLi;
        prevList = curList;
        prevLevel = curLevel;
      } else {
        if (prevList !== list) {
          changed = true;
          prevList.appendChild(curLi);
        }
        prevLi = curLi;
      }
    }
  });

  // if nothing was changed then return content;
  if (!changed) {
    return content;
  }

  return swap.innerHTML;
}

export function breakDown(content) {
  const swap = mkNode();
  swap.innerHTML = content;

  let changed = false;

  // find all `ul,ol`
  const lists = Array.from(swap.querySelectorAll("ul,ol")).map(list => {
    const level = parentNodes(list, n => IS_LI[n.tagName]).length;

    if (level > 0) {
      for (let li = firstNode(list); li; li = nextNode(li)) {
        if (setItemLevel(li, level)) {
          changed = true;
        }
      }
    }

    return { list, level };
  });

  // if nothing changed then no nesting then return origin
  if (!changed) {
    return content;
  }

  //const
  lists.forEach(({ list, level }) => {
    if (!level) {
      return;
    }

    const topLi = parentNodes(list, n => IS_LI[n.tagName]).slice(-1)[0];
    const topList = topLi.parentNode;
    if (list.tagName === topList.tagName) {
      // move current <li>s after topLi in order
      while (list.lastChild) {
        insertAfter(list.lastChild, topLi);
      }
      list.remove();
    } else {
      // move next top <li>s into separate list
      let nextTopLi = nextNode(topLi);
      if (nextTopLi) {
        const nextTopList = mkNode(topList.tagName);
        insertAfter(nextTopList, topList);
        while (nextTopLi) {
          const next = nextNode(nextTopLi);
          nextTopList.appendChild(nextTopLi);
          nextTopLi = next;
        }
      }
      insertAfter(list, topList);
    }
  });

  return swap.innerHTML;
}
