<script>
  import { view, staleness } from '../stores/filters.js';
  import parksData from '../data/parks.json';

  export let params = {};

  $: r = params.restaurant;
  $: park = parksData.find(p => p.id === r?.park);
  $: stale = staleness(r?.lastVerified);

  function back() {
    view.set({ name: 'list', params: {} });
  }

  function makeCard() {
    view.set({ name: 'chef-card', params: { restaurant: r } });
  }
</script>

{#if r}
  <button class="back" on:click={back}>← Back to results</button>

  <article>
    <header>
      <h1>{r.name}</h1>
      <div class="meta">
        {#if park}<span>{park.emoji} {park.name}</span>{/if}
        {#if r.location}<span>· {r.location}</span>{/if}
      </div>
      <div class="badges">
        <span class="type-tag type-{r.type}">{r.type === 'quick-service' ? 'Quick-Service' : 'Table-Service'}</span>
        <span class="stale-badge {stale.level}">{stale.label}</span>
        {#if r.reservationRequired}<span class="res-tag">📅 Book ahead</span>{/if}
      </div>
    </header>

    {#if r.ratings && Object.keys(r.ratings).length}
      <section class="ratings-section">
        <h2>How it rates for allergies</h2>
        <div class="ratings">
          {#each Object.entries(r.ratings) as [key, val]}
            <div class="rating-row">
              <span class="rating-label">{key.replace('-', ' ')}</span>
              <div class="rating-bar">
                <div class="rating-fill" style="width: {(val / 5) * 100}%"></div>
              </div>
              <span class="rating-value">{val.toFixed(1)}/5</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if r.cost || r.bestDish}
      <section>
        <h2>At a glance</h2>
        <dl>
          {#if r.cost}<dt>Cost</dt><dd>{r.cost}</dd>{/if}
          {#if r.bestDish}<dt>Best dish</dt><dd>{r.bestDish}</dd>{/if}
          {#if r.crossContaminationRisk}<dt>Cross-contamination risk</dt><dd>{r.crossContaminationRisk}</dd>{/if}
        </dl>
      </section>
    {/if}

    {#if r.dishes && r.dishes.length}
      <section>
        <h2>Verified dishes ({r.dishes.length})</h2>
        <ul class="dishes">
          {#each r.dishes as d}
            <li>
              <div class="dish-head">
                <strong>{d.name}</strong>
                {#if d.price}<span class="price">{d.price}</span>{/if}
              </div>
              {#if d.notes && d.notes.length}
                <ul class="dish-notes">
                  {#each d.notes.slice(0, 3) as note}
                    <li>{note}</li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if r.tips && r.tips.length}
      <section>
        <h2>Pro tips</h2>
        <ul class="tips">
          {#each r.tips as t}<li>{t}</li>{/each}
        </ul>
      </section>
    {/if}

    <section class="actions">
      <button class="primary" on:click={makeCard}>
        📋 Make a chef card for here
      </button>
    </section>

    <section class="verify">
      <h3>Verify before you go</h3>
      <p>Disney menus change. Cross-contamination procedures vary by Cast Member. Always confirm with staff.</p>
      <a href="mailto:specialdiets@disneyworld.com?subject=Question about {r.name}">
        ✉️ Email specialdiets@disneyworld.com
      </a>
      <a href="tel:4079393463">
        📞 Call 407-WDW-DINE
      </a>
    </section>
  </article>
{:else}
  <p>Restaurant not found.</p>
  <button class="back" on:click={back}>← Back</button>
{/if}

<style>
  .back {
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 12px;
    padding: 4px 0;
  }
  article { display: flex; flex-direction: column; gap: 20px; }
  header h1 { font-size: 24px; margin-bottom: 4px; }
  .meta { color: var(--text-mute); font-size: 14px; }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .type-tag, .res-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }
  .type-quick-service { background: rgba(59, 130, 246, 0.15); color: var(--info); }
  .type-table-service { background: rgba(245, 158, 11, 0.15); color: var(--accent); }
  .res-tag { background: rgba(59, 130, 246, 0.15); color: var(--info); }

  h2 {
    font-size: 16px;
    margin-bottom: 10px;
    color: var(--text);
  }

  .ratings { display: flex; flex-direction: column; gap: 8px; }
  .rating-row {
    display: grid;
    grid-template-columns: 110px 1fr 50px;
    align-items: center;
    gap: 8px;
  }
  .rating-label { font-size: 13px; text-transform: capitalize; color: var(--text-dim); }
  .rating-bar {
    height: 8px;
    background: var(--bg-elev2);
    border-radius: 4px;
    overflow: hidden;
  }
  .rating-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.3s ease;
  }
  .rating-value { font-size: 13px; font-weight: 600; text-align: right; }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 12px;
    font-size: 14px;
  }
  dt { color: var(--text-mute); font-weight: 500; }
  dd { color: var(--text); }

  .dishes, .tips {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .dishes li {
    background: var(--bg-elev);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }
  .dish-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }
  .price { color: var(--accent); font-weight: 600; font-size: 14px; }
  .dish-notes {
    list-style: none;
    font-size: 12px;
    color: var(--text-dim);
  }
  .dish-notes li + li { margin-top: 2px; }

  .tips li {
    padding-left: 16px;
    position: relative;
    font-size: 14px;
    color: var(--text-dim);
    line-height: 1.5;
  }
  .tips li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .actions {
    display: flex;
    gap: 8px;
  }
  .primary {
    flex: 1;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--accent);
    color: #1f2937;
    font-weight: 600;
    font-size: 15px;
  }

  .verify {
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 14px;
    border-left: 4px solid var(--info);
  }
  .verify h3 { font-size: 14px; margin-bottom: 6px; }
  .verify p { font-size: 13px; color: var(--text-dim); margin-bottom: 10px; line-height: 1.5; }
  .verify a {
    display: block;
    padding: 6px 0;
    font-size: 14px;
    font-weight: 500;
  }
</style>