<script>
  import { view } from '../stores/filters.js';
  import { ALLERGENS } from '../stores/filters.js';

  export let params = {};
  $: restaurant = params.restaurant || null;

  let allergies = new Set();
  let severity = 'allergy'; // 'allergy' | 'intolerance' | 'preference'
  let name = '';
  let partySize = 1;
  let notes = '';

  function toggle(id) {
    if (allergies.has(id)) allergies.delete(id);
    else allergies.add(id);
    allergies = new Set(allergies);
  }

  function back() {
    if (restaurant) {
      view.set({ name: 'detail', params: { restaurant } });
    } else {
      view.set({ name: 'list', params: {} });
    }
  }

  function printCard() {
    window.print();
  }

  $: hasAllergies = allergies.size > 0;
</script>

<button class="back no-print" on:click={back}>← Back</button>

<div class="card-page" id="chef-card">
  <div class="card-header">
    <h1>Chef Card</h1>
    <div class="subtitle">Disney World Dining Accommodation Request</div>
  </div>

  <section class="block">
    <div class="row">
      <div class="field">
        <label for="cc-name">My name</label>
        <input id="cc-name" type="text" bind:value={name} placeholder="Guest name" />
      </div>
      <div class="field">
        <label for="cc-party">Party size</label>
        <input id="cc-party" type="number" bind:value={partySize} min="1" max="20" />
      </div>
    </div>

    {#if restaurant}
      <div class="field">
        <span class="field-label">Restaurant</span>
        <div class="readonly">{restaurant.name}{#if restaurant.location} — {restaurant.location}{/if}</div>
      </div>
    {/if}
  </section>

  <section class="block">
    <h2>I have the following allergies/restrictions:</h2>
    <div class="allergy-grid">
      {#each ALLERGENS as a}
        <button
          type="button"
          class="allergy-btn"
          class:active={allergies.has(a.id)}
          on:click={() => toggle(a.id)}
        >
          <span class="icon">{a.icon}</span>
          <span>{a.label}</span>
        </button>
      {/each}
    </div>

    <div class="severity">
      <span class="field-label">Severity:</span>
      <label class="radio">
        <input type="radio" bind:group={severity} value="allergy" />
        <span>Medical allergy (anaphylaxis risk)</span>
      </label>
      <label class="radio">
        <input type="radio" bind:group={severity} value="intolerance" />
        <span>Intolerance / celiac</span>
      </label>
      <label class="radio">
        <input type="radio" bind:group={severity} value="preference" />
        <span>Preference / lifestyle</span>
      </label>
    </div>
  </section>

  <section class="block">
    <label for="notes">Additional notes for the chef</label>
    <textarea id="notes" bind:value={notes} rows="4" placeholder="e.g. Please prepare in dedicated area. Shared fryer concerns. Severe peanut/tree nut allergy with cross-contact reaction."></textarea>
  </section>

  <section class="block request">
    <h2>What I'm asking the chef:</h2>
    <ul>
      <li>Please confirm which menu items I can safely eat with my restrictions above.</li>
      <li>Please prepare my dish in a dedicated area with clean utensils if possible.</li>
      <li>Please tell me about any cross-contamination risks (shared fryer, shared prep surface, etc.).</li>
      <li>Please flag any hidden ingredients (soy sauce, thickeners, marinades, broths).</li>
    </ul>
  </section>

  <section class="block thanks">
    <p>Thank you for taking the time to keep me safe. I appreciate your help.</p>
    {#if hasAllergies}
      <div class="signature">
        <div class="sig-line">— {name || 'Guest'}</div>
        <div class="sig-date">{new Date().toLocaleDateString()}</div>
      </div>
    {/if}
  </section>

  <button class="primary no-print" on:click={printCard} disabled={!hasAllergies}>
    🖨️ Print this card
  </button>
  {#if !hasAllergies}
    <p class="hint no-print">Select at least one allergy to enable print.</p>
  {/if}
</div>

<style>
  .back {
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 12px;
    padding: 4px 0;
  }
  .no-print { display: block; }

  .card-page {
    background: var(--bg-elev);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow);
  }

  .card-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--accent);
  }
  .card-header h1 { font-size: 26px; }
  .subtitle { font-size: 13px; color: var(--text-mute); margin-top: 4px; }

  .block + .block { margin-top: 18px; }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }
  label, .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input[type="text"],
  input[type="number"],
  textarea {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    color: var(--text);
    font-family: inherit;
    font-size: 15px;
  }
  input:focus, textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  .readonly {
    padding: 10px 12px;
    background: var(--bg-elev2);
    border-radius: var(--radius-sm);
    font-size: 15px;
  }

  .allergy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 10px 0;
  }
  .allergy-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--radius-sm);
    background: var(--bg);
    border: 1px solid var(--border);
    font-size: 14px;
    color: var(--text-dim);
  }
  .allergy-btn:active { transform: scale(0.98); }
  .allergy-btn.active {
    background: var(--accent);
    color: #1f2937;
    border-color: var(--accent);
    font-weight: 600;
  }
  .allergy-btn .icon { font-size: 18px; }

  .severity {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .severity > .field-label {
    font-size: 13px;
    color: var(--text-dim);
    text-transform: none;
    letter-spacing: 0;
    margin-bottom: 4px;
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    cursor: pointer;
  }
  .radio input { width: 18px; height: 18px; accent-color: var(--accent); }

  textarea {
    width: 100%;
    resize: vertical;
    font-size: 14px;
  }

  .request h2 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-mute);
    margin-bottom: 8px;
  }
  .request ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .request li {
    padding-left: 20px;
    position: relative;
    font-size: 14px;
    color: var(--text);
    line-height: 1.5;
  }
  .request li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--safe);
    font-weight: 700;
  }

  .thanks {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .thanks p {
    font-size: 14px;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 12px;
  }
  .signature {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: var(--text);
    font-size: 14px;
  }
  .sig-date { color: var(--text-mute); font-size: 12px; }

  .primary {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--accent);
    color: #1f2937;
    font-weight: 600;
    font-size: 15px;
    margin-top: 16px;
  }
  .primary:disabled {
    background: var(--bg-elev2);
    color: var(--text-mute);
    cursor: not-allowed;
  }
  .hint {
    text-align: center;
    font-size: 12px;
    color: var(--text-mute);
    margin-top: 8px;
  }

  @media print {
    .no-print { display: none !important; }
    :global(body) { background: white; color: black; }
    .card-page {
      background: white;
      color: black;
      box-shadow: none;
      padding: 0;
    }
    .card-header h1 { color: black; }
    .subtitle, label, .thanks p, .thanks .sig-date { color: #555; }
    input[type="text"], input[type="number"], textarea, .readonly {
      background: white;
      color: black;
      border: 1px solid #ccc;
    }
    .allergy-btn {
      background: white;
      color: black;
      border: 1px solid #ccc;
    }
    .allergy-btn.active {
      background: #fef3c7;
      color: black;
      border-color: #f59e0b;
    }
    .primary { display: none; }
  }
</style>