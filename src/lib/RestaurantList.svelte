<script>
  import { selectedAllergens, selectedPark, staleness, view } from '../stores/filters.js';
  import restaurantsData from '../data/restaurants.json';
  import parksData from '../data/parks.json';

  const restaurants = restaurantsData;
  const parks = parksData;

  function matchesAllergens(r, allergens) {
    if (allergens.size === 0) return true;
    // For each selected allergen, check the restaurant has a rating >= 4.0
    // (proxy for "this place can accommodate"). Real implementation would
    // use per-restaurant allergen matrix.
    for (const a of allergens) {
      const rating = r.ratings?.[a];
      if (rating == null) return false; // no data for this allergen
      if (rating < 4.0) return false;
    }
    return true;
  }

  $: filtered = restaurants.filter(r => {
    if ($selectedPark !== 'all' && r.park !== $selectedPark) return false;
    if (!matchesAllergens(r, $selectedAllergens)) return false;
    return true;
  });

  $: parkLookup = Object.fromEntries(parks.map(p => [p.id, p]));

  function openDetail(r) {
    view.set({ name: 'detail', params: { id: r.name, restaurant: r } });
  }

  function ratingLabel(r, allergenId) {
    const v = r.ratings?.[allergenId];
    if (v == null) return null;
    return `${v.toFixed(1)}/5`;
  }
</script>

<div class="results-meta">
  <span class="count">{filtered.length} restaurant{filtered.length === 1 ? '' : 's'}</span>
  {#if $selectedAllergens.size > 0 || $selectedPark !== 'all'}
    <span class="filter-summary">
      {#if $selectedPark !== 'all'}{parkLookup[$selectedPark]?.emoji} {$selectedPark}{/if}
      {#if $selectedAllergens.size > 0} · {$selectedAllergens.size} filter{$selectedAllergens.size === 1 ? '' : 's'}{/if}
    </span>
  {/if}
</div>

{#if filtered.length === 0}
  <div class="empty">
    <p>No restaurants match your filters yet.</p>
    <p class="hint">Try removing a filter, or check back as we expand our coverage. EPCOT has the most coverage today.</p>
  </div>
{:else}
  <ul class="restaurants">
    {#each filtered as r}
      {@const stale = staleness(r.lastVerified)}
      <li>
        <button class="card" on:click={() => openDetail(r)}>
          <div class="card-head">
            <div class="card-title">
              <h3>{r.name}</h3>
              <span class="park-tag">{parkLookup[r.park]?.emoji || ''} {parkLookup[r.park]?.name || r.park}</span>
            </div>
            <span class="type-tag type-{r.type}">{r.type === 'quick-service' ? 'Quick' : 'Table'}</span>
          </div>

          {#if r.location}
            <div class="location">{r.location}</div>
          {/if}

          {#if r.ratings && Object.keys(r.ratings).length}
            <div class="ratings">
              {#each Object.entries(r.ratings) as [key, val]}
                <span class="rating-pill">{key.replace('-', ' ')} <strong>{val.toFixed(1)}</strong></span>
              {/each}
            </div>
          {/if}

          {#if r.bestDish}
            <div class="best">⭐ Best: {r.bestDish}</div>
          {/if}

          {#if r.cost}
            <div class="cost">{r.cost}</div>
          {/if}

          <div class="card-foot">
            <span class="stale-badge {stale.level}">{stale.label}</span>
            {#if r.reservationRequired}
              <span class="res-tag">📅 Book ahead</span>
            {/if}
          </div>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .results-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
    color: var(--text-mute);
    font-size: 13px;
  }
  .count { font-weight: 600; color: var(--text); }
  .filter-summary { font-size: 12px; }

  .empty {
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 32px 16px;
    text-align: center;
    color: var(--text-mute);
  }
  .empty .hint { font-size: 13px; margin-top: 8px; }

  .restaurants {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .card {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 14px;
    box-shadow: var(--shadow);
    transition: transform 0.1s ease;
  }
  .card:active { transform: scale(0.99); }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;
  }
  .card-title h3 {
    font-size: 17px;
    margin-bottom: 2px;
  }
  .park-tag {
    font-size: 12px;
    color: var(--text-mute);
  }
  .type-tag {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }
  .type-quick-service { background: rgba(59, 130, 246, 0.15); color: var(--info); }
  .type-table-service { background: rgba(245, 158, 11, 0.15); color: var(--accent); }

  .location {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .ratings {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }
  .rating-pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--bg-elev2);
    font-size: 11px;
    color: var(--text-dim);
    text-transform: capitalize;
  }
  .rating-pill strong {
    color: var(--accent);
    margin-left: 4px;
  }

  .best {
    font-size: 13px;
    color: var(--text);
    margin-bottom: 4px;
  }
  .cost {
    font-size: 12px;
    color: var(--text-mute);
    margin-bottom: 8px;
  }

  .card-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
  .res-tag {
    font-size: 11px;
    color: var(--info);
    font-weight: 600;
  }
</style>