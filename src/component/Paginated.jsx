import { useState } from 'react';

// A list with Prev/Next paging. render(item, index) must return an <li> with a key.
function Paginated({ items, pageSize, render, className }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  // items can shrink on a live refresh
  const current = Math.min(page, pages - 1);
  const start = current * pageSize;

  return (
    <>
      <ol className={className}>
        {items.slice(start, start + pageSize).map((item, i) => render(item, start + i))}
      </ol>
      {pages > 1 && (
        <div className="pager">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 0}>
            ‹ Prev
          </button>
          <span>{current + 1} / {pages}</span>
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages - 1}>
            Next ›
          </button>
        </div>
      )}
    </>
  );
}

export default Paginated;
