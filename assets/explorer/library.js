// I filter the visible cards without fetching another dataset.
const search = document.querySelector('#resource-search');
const cards = [...document.querySelectorAll('#resource-grid .mdx-card')];
function filterCards() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  for (const card of cards) {
    card.hidden = !card.dataset.search.includes(query);
    if (!card.hidden) count += 1;
  }
  document.querySelector('#resource-count').textContent = `${count} of ${cards.length} topics`;
  document.querySelector('#resource-empty').hidden = count !== 0;
}
search.addEventListener('input', filterCards);
filterCards();
