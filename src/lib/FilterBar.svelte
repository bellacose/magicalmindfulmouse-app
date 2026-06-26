<script>
  import { ALLERGENS, selectedAllergens, selectedPark, toggleAllergen } from '../stores/filters.js';
  import parksData from '../data/parks.json';

  const parks = parksData;

  function setPark(id) {
    selectedPark.set(id);
  }
</script>

<section class="filters" aria-label="Filters">
  <div class="row">
    <h3 class="row-title">Park</h3>
    <div class="chips">
      <button
        class="chip"
        class:active={$selectedPark === 'all'}
        on:click={() => setPark('all')}
      >All parks</button>
      {#each parks as p}
        <button
          class="chip"
          class:active={$selectedPark === p.id}
          on:click={() => setPark(p.id)}
        >{p.emoji} {p.name}</button>
      {/each}
    </div>
  </div>

  <div class="row">
    <h3 class="row-title">My allergens</h3>
    <div class="chips">
      {#each ALLERGENS as a}
        <button
          class="chip allergen"
          class:active={$selectedAllergens.has(a.id)}
          on:click={() => toggleAllergen(a.id)}
          aria-pressed={$selectedAllergens.has(a.id)}
        >
          <span aria-hidden="true">{a.icon}</span>
          <span>{a.label}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .filters {
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 14px;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
  }
  .row + .row { margin-top: 12px; }
  .row-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--bg-elev2);
    color: var(--text-dim);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s ease;
  }
  .chip:active { transform: scale(0.96); }
  .chip.active {
    background: var(--accent);
    color: #1f2937;
    font-weight: 600;
  }
  .chip.allergen { font-size: 13px; }
</style>